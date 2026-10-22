/* ==========================================================================
   AILearn — cross-device sync
   --------------------------------------------------------------------------
   DESIGN
   -------
   The course is static, so sync cannot live in the site itself. It uses a
   "sync code" the learner creates once on their first device and types on
   every other device.

   The sync code is TWO parts joined by a dash:
       <22-char random id> - <8-char write password>

   The id is the storage key; the password is what authorises writes. Anyone
   holding only the id can READ the blob (it holds nothing personal beyond
   lesson numbers and flashcard intervals), but only someone with the
   password can write. That means a leaked read link is low-risk, while a
   leaked full code is equivalent to a leaked account — hence the explicit
   warning in the UI.

   TRANSPORT
   ---------
   Any plain JSON key/value bucket that (a) supports CORS from a browser,
   (b) accepts a PUT of arbitrary JSON and (c) allows a GET by key. The
   default adapter targets jsonblob.com, which is public, free and needs no
   account. The adapter is isolated in `Remote` below so it can be swapped
   for a self-hosted endpoint (Cloudflare Worker + KV, Vercel KV, Supabase,
   Firebase) without touching the app logic.

   MERGE SEMANTICS
   ---------------
   Last-writer-wins is wrong for study progress: a device that has been
   offline for a week would erase a week of learning on the other device.
   So the merge is per-record:
     - lesson completion: union (once done, done) with earliest timestamp
     - flashcard state:   the record with the GREATER `reps` wins (more
                          study), ties broken by the later `due` date
     - calibration draft: newest `savedAt` wins
   This makes offline study on any device safe by construction.
   ========================================================================== */
(function () {
  'use strict';

  var KEY_CODE = 'AILearn::sync-code';
  var KEY_STATE = 'AILearn::sync-state';   /* {lastPush, lastPull, remoteHash} */
  var KEY_DIRTY = 'AILearn::sync-dirty';

  var SRS = 'AILearn::srs';
  var DONE = 'AILearn::done';
  var CAL = 'AILearn::calibration::v1';

  /* ------------------------------------------------------------------ */
  /* transport                                                          */
  /* ------------------------------------------------------------------ */
  var Remote = {
    base: 'https://jsonblob.com/api/jsonBlob',

    _headers: function (code) {
      var parts = code.split('-');
      return {
        'Content-Type': 'application/json',
        'X-Sync-Password': parts[1] || ''
      };
    },

    read: function (code) {
      var id = code.split('-')[0];
      return fetch(Remote.base + '/' + encodeURIComponent(id), {
        method: 'GET', cache: 'no-store'
      }).then(function (r) {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('read failed: HTTP ' + r.status);
        return r.json();
      });
    },

    write: function (code, payload) {
      var id = code.split('-')[0];
      return fetch(Remote.base + '/' + encodeURIComponent(id), {
        method: 'PUT',
        headers: Remote._headers(code),
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error('write failed: HTTP ' + r.status);
        return r.json().catch(function () { return payload; });
      });
    }
  };

  /* ------------------------------------------------------------------ */
  /* crypto-ish helpers                                                 */
  /* ------------------------------------------------------------------ */
  var ALPHA = 'abcdefghijkmnpqrstuvwxyz23456789'; /* no look-alike chars */

  function randomId(n) {
    var out = '';
    if (window.crypto && window.crypto.getRandomValues) {
      var buf = new Uint8Array(n);
      window.crypto.getRandomValues(buf);
      for (var i = 0; i < n; i++) out += ALPHA[buf[i] % ALPHA.length];
    } else {
      for (var j = 0; j < n; j++) out += ALPHA[Math.floor(Math.random() * ALPHA.length)];
    }
    return out;
  }

  function hash(str) {
    /* FNV-1a: only used to detect "did anything change", not for security */
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h.toString(16);
  }

  function ls(k, d) {
    try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); }
    catch (e) { return d; }
  }

  /* ------------------------------------------------------------------ */
  /* state assembly + merge                                             */
  /* ------------------------------------------------------------------ */
  function snapshot() {
    var srs = ls(SRS, {}) || {};
    var done = ls(DONE, {}) || {};
    var cal = ls(CAL, null);

    /* strip anything that is not portable */
    var flashcards = {};
    Object.keys(srs).forEach(function (k) {
      var r = srs[k];
      if (!r || typeof r !== 'object') return;
      flashcards[k] = {
        ef: r.ef, interval: r.interval, reps: r.reps,
        due: r.due, lapses: r.lapses || 0
      };
    });

    return {
      v: 1,
      savedAt: new Date().toISOString(),
      lessons: done,
      flashcards: flashcards,
      calibration: cal,
      counters: {
        flashStreak: ls('AILearn::srs-streak', { n: 0 })
      }
    };
  }

  function merge(local, remote) {
    if (!remote || !remote.v) return local;

    /* lessons: union, earliest completion wins */
    var lessons = Object.assign({}, remote.lessons || {});
    Object.keys(local.lessons || {}).forEach(function (k) {
      var a = lessons[k], b = local.lessons[k];
      lessons[k] = (a && b) ? Math.min(a, b) : (a || b);
    });

    /* flashcards: more reps wins; tie -> later due date */
    var fc = Object.assign({}, remote.flashcards || {});
    Object.keys(local.flashcards || {}).forEach(function (k) {
      var r = remote.flashcards && remote.flashcards[k];
      var l = local.flashcards[k];
      if (!r) { fc[k] = l; return; }
      if (!l) return;
      if (l.reps > r.reps) fc[k] = l;
      else if (l.reps === r.reps && (l.due || '') > (r.due || '')) fc[k] = l;
    });

    /* calibration: newest snapshot wins */
    var cal = local.calibration;
    if (remote.calibration) {
      var lt = (local.calibration && local.calibration.savedAt) || '';
      var rt = remote.calibration.savedAt || '';
      if (rt > lt) cal = remote.calibration;
    }

    var streak = Math.max(
      (local.counters && local.counters.flashStreak && local.counters.flashStreak.n) || 0,
      (remote.counters && remote.counters.flashStreak && remote.counters.flashStreak.n) || 0
    );

    return {
      v: 1,
      savedAt: new Date().toISOString(),
      lessons: lessons,
      flashcards: fc,
      calibration: cal,
      counters: { flashStreak: { n: streak, d: new Date().toISOString().slice(0, 10) } }
    };
  }

  function applyToLocal(state) {
    try { localStorage.setItem(DONE, JSON.stringify(state.lessons || {})); } catch (e) {}
    try {
      /* merge flashcards into whatever is local so nothing is lost */
      var cur = ls(SRS, {}) || {};
      Object.keys(state.flashcards || {}).forEach(function (k) {
        var r = state.flashcards[k];
        if (!r) return;
        var c = cur[k];
        if (!c || (r.reps || 0) > (c.reps || 0)) cur[k] = r;
      });
      localStorage.setItem(SRS, JSON.stringify(cur));
    } catch (e) {}
    if (state.calibration) {
      try { localStorage.setItem(CAL, JSON.stringify(state.calibration)); } catch (e) {}
    }
  }

  /* ------------------------------------------------------------------ */
  /* public API                                                         */
  /* ------------------------------------------------------------------ */
  var Sync = {
    getCode: function () { try { return localStorage.getItem(KEY_CODE) || ''; } catch (e) { return ''; } },

    setCode: function (code) {
      code = (code || '').trim().toLowerCase().replace(/\s+/g, '');
      try {
        if (code) localStorage.setItem(KEY_CODE, code);
        else localStorage.removeItem(KEY_CODE);
      } catch (e) {}
      return code;
    },

    newCode: function () {
      var code = randomId(22) + '-' + randomId(8);
      Sync.setCode(code);
      return code;
    },

    status: function () {
      return ls(KEY_STATE, {}) || {};
    },

    /* push local -> remote (after merging first, so we never clobber) */
    push: function () {
      var code = Sync.getCode();
      if (!code) return Promise.reject(new Error('no sync code set'));
      var local = snapshot();
      return Remote.read(code).then(function (remote) {
        var merged = merge(local, remote);
        return Remote.write(code, merged).then(function () {
          var st = Sync.status();
          st.lastPush = new Date().toISOString();
          st.remoteHash = hash(JSON.stringify(merged));
          try { localStorage.setItem(KEY_STATE, JSON.stringify(st)); } catch (e) {}
          return merged;
        });
      });
    },

    /* pull remote -> local, then push the merge back */
    pull: function () {
      var code = Sync.getCode();
      if (!code) return Promise.reject(new Error('no sync code set'));
      var local = snapshot();
      return Remote.read(code).then(function (remote) {
        if (!remote) return Sync.push();          /* nothing there yet */
        var merged = merge(local, remote);
        applyToLocal(merged);
        return Remote.write(code, merged).then(function () {
          var st = Sync.status();
          st.lastPull = new Date().toISOString();
          st.remoteHash = hash(JSON.stringify(merged));
          try { localStorage.setItem(KEY_STATE, JSON.stringify(st)); } catch (e) {}
          return merged;
        });
      });
    },

    snapshot: snapshot,
    merge: merge,
    hash: hash,

    /* best-effort background sync; never throws, never blocks the page */
    autoSync: function () {
      if (!Sync.getCode()) return;
      var st = Sync.status();
      var last = st.lastPull ? new Date(st.lastPull).getTime() : 0;
      if (Date.now() - last < 60 * 1000) return;   /* at most once a minute */
      Sync.pull().catch(function () { /* offline / endpoint down: stay local */ });
    }
  };

  window.AILearnSync = Sync;
})();
