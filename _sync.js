/* ==========================================================================
   AILearn — cross-device sync
   --------------------------------------------------------------------------
   The course is static, so sync needs a small endpoint. This one is hosted by
   the learner's own app (kprsnt.in on Vercel, backed by Vercel KV), which
   means no third party ever holds the data.

   SYNC CODE
   ---------
   Two parts joined by a dash:   <22-char id> - <8-char password>
   The id addresses the record; the password authorises writes and is checked
   server-side (only its hash is stored). Losing the code loses the ability to
   write to that record — but local progress is never touched, so nothing is
   actually lost, only unsynced.

   MERGE SEMANTICS
   ---------------
   Last-writer-wins is wrong for study progress: a device offline for a week
   would erase a week of learning done elsewhere. So merge is per-record:
     lessons      union, earliest completion timestamp wins
     flashcards   the record with MORE reps wins; ties -> later due date
     calibration  newest savedAt wins
     streak       max
   That makes studying offline on any device safe by construction.

   FAILURE BEHAVIOUR
   -----------------
   Every network path is best-effort. If the endpoint is down, offline, or
   unconfigured, the course keeps working entirely on localStorage and sync
   retries later. The learner is never blocked and never shown an error they
   cannot act on.
   ========================================================================== */
(function () {
  'use strict';

  var KEY_CODE = 'AILearn::sync-code';
  var KEY_STATE = 'AILearn::sync-state';   /* {lastPush, lastPull, remoteHash} */

  var SRS = 'AILearn::srs';
  var DONE = 'AILearn::done';
  var CAL = 'AILearn::calibration::v1';
  var STREAK = 'AILearn::srs-streak';

  /* ------------------------------------------------------------------ */
  /* transport — swap `endpoint` to self-host elsewhere                  */
  /* ------------------------------------------------------------------ */
  var Remote = {
    endpoint: 'https://kprsnt.in/api/ailearn/sync',

    read: function (code) {
      var url = Remote.endpoint + '?code=' + encodeURIComponent(code) + '&t=' + Date.now();
      return fetch(url, { method: 'GET', cache: 'no-store' }).then(function (r) {
        if (r.status === 404) return null;                 /* never written yet */
        if (!r.ok) throw new Error('read HTTP ' + r.status);
        return r.json().then(function (j) {
          if (!j || !j.ok) throw new Error((j && j.error) || 'read failed');
          return j.doc;
        });
      });
    },

    write: function (code, data) {
      return fetch(Remote.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code, data: data })
      }).then(function (r) {
        return r.json().then(function (j) {
          if (!r.ok || !j || !j.ok) throw new Error((j && j.error) || ('write HTTP ' + r.status));
          return j.doc;
        });
      });
    }
  };

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
  function snapshot() {
    var srs = ls(SRS, {}) || {};
    var done = ls(DONE, {}) || {};
    var cal = ls(CAL, null);
    var streak = ls(STREAK, { n: 0 });

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
      counters: { flashStreak: { n: (streak && streak.n) || 0, d: (streak && streak.d) || '' } }
    };
  }

  function merge(local, remote) {
    if (!remote || !remote.v) return local;

    var lessons = Object.assign({}, remote.lessons || {});
    Object.keys(local.lessons || {}).forEach(function (k) {
      var a = lessons[k], b = local.lessons[k];
      lessons[k] = (a && b) ? Math.min(a, b) : (a || b);
    });

    var fc = Object.assign({}, remote.flashcards || {});
    Object.keys(local.flashcards || {}).forEach(function (k) {
      var r = remote.flashcards && remote.flashcards[k];
      var l = local.flashcards[k];
      if (!r) { fc[k] = l; return; }
      if (!l) return;
      if (l.reps > r.reps) fc[k] = l;
      else if (l.reps === r.reps && (l.due || '') > (r.due || '')) fc[k] = l;
    });

    var cal = local.calibration;
    if (remote.calibration) {
      var lt = (local.calibration && local.calibration.savedAt) || '';
      var rt = remote.calibration.savedAt || '';
      if (rt > lt) cal = remote.calibration;
    }

    var ln = (local.counters && local.counters.flashStreak) || { n: 0, d: '' };
    var rn = (remote.counters && remote.counters.flashStreak) || { n: 0, d: '' };
    var best = (ln.n || 0) >= (rn.n || 0) ? ln : rn;

    return {
      v: 1,
      savedAt: new Date().toISOString(),
      lessons: lessons,
      flashcards: fc,
      calibration: cal,
      counters: { flashStreak: { n: best.n || 0, d: best.d || '' } }
    };
  }

  function applyToLocal(state) {
    try { localStorage.setItem(DONE, JSON.stringify(state.lessons || {})); } catch (e) {}
    try {
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
    if (state.counters && state.counters.flashStreak) {
      try { localStorage.setItem(STREAK, JSON.stringify(state.counters.flashStreak)); } catch (e) {}
    }
  }

  function stamp(patch) {
    var st = ls(KEY_STATE, {}) || {};
    Object.assign(st, patch);
    try { localStorage.setItem(KEY_STATE, JSON.stringify(st)); } catch (e) {}
  }

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
      synced = false;
      return code;
    },

    status: function () { return ls(KEY_STATE, {}) || {}; },

    /* push local -> remote, merging remote first so nothing is clobbered */
    push: function () {
      var code = Sync.getCode();
      if (!code) return Promise.reject(new Error('no sync code set'));
      var local = snapshot();
      return Remote.read(code).then(function (remote) {
        var merged = merge(local, remote);
        return Remote.write(code, merged).then(function () {
          stamp({ lastPush: new Date().toISOString(), remoteHash: hash(JSON.stringify(merged)) });
          synced = true;
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
        if (!remote) return Sync.push();               /* first device */
        var merged = merge(local, remote);
        applyToLocal(merged);
        return Remote.write(code, merged).then(function () {
          stamp({ lastPull: new Date().toISOString(), remoteHash: hash(JSON.stringify(merged)) });
          synced = true;
          return merged;
        });
      });
    },

    snapshot: snapshot,
    merge: merge,
    hash: hash,

    /* opportunistic background sync: at most once a minute, swallows errors */
    autoSync: function () {
      if (!Sync.getCode()) return;
      var st = Sync.status();
      var last = st.lastPull ? new Date(st.lastPull).getTime() : 0;
      if (Date.now() - last < 60 * 1000) return;
      Sync.pull().catch(function () { /* offline or endpoint down: stay local */ });
    }
  };

  /* a page that loads after a sync may need a refresh to show the new state */
  var synced = false;
  Object.defineProperty(Sync, 'justSynced', { get: function () { return synced; } });

  window.AILearnSync = Sync;
})();
