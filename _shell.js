/* ==========================================================================
   AILearn — shared shell JS
   TOC build + scroll-spy, reading progress, theme, localStorage progress,
   quiz completion, copy buttons. Zero dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var ROOT = 'AILearn::';
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(ROOT + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(ROOT + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------------- theme ---------------- */
  var root = document.documentElement;
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    store.set('theme', t);
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = t === 'light' ? '\u25D1' : '\u25D0';
  }
  applyTheme(store.get('theme', 'dark'));

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });

    /* ---------------- reading progress bar ---------------- */
    var bar = document.getElementById('progress-bar');
    if (bar) {
      var onScroll = function () {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
        bar.style.width = Math.min(100, Math.max(0, p)) + '%';
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* ---------------- mini progress (lessons done) ---------------- */
    var mini = document.getElementById('progress-mini');
    if (mini) {
      var done = (store.get('done', {}) || {});
      var total = window.AILEARN_TOTAL || 100;
      var n = Object.keys(done).length;
      mini.textContent = Math.round((n / total) * 100) + '%';
      mini.title = n + ' / ' + total + ' lessons marked complete';
    }

    /* ---------------- build TOC from .sec ---------------- */
    var toc = document.getElementById('toc');
    var secs = [].slice.call(document.querySelectorAll('article.prose section.sec'));
    if (toc && secs.length) {
      var html = '<div class="toc-title">On this page</div>';
      secs.forEach(function (s, i) {
        var h2 = s.querySelector('h2');
        var id = h2 && h2.id ? h2.id : 'sec-' + (i + 1);
        if (h2 && !h2.id) h2.id = id;
        var title = s.getAttribute('data-title') || (h2 ? h2.textContent.replace('#', '').trim() : 'Section ' + (i + 1));
        html += '<a href="#' + id + '">' + title + '</a>';
      });
      toc.innerHTML = html;

      /* scroll-spy */
      var links = [].slice.call(toc.querySelectorAll('a'));
      var spy = function () {
        var y = window.scrollY + 120, active = 0;
        secs.forEach(function (s, i) { if (s.offsetTop <= y) active = i; });
        links.forEach(function (a, i) { a.classList.toggle('on', i === active); });
      };
      window.addEventListener('scroll', spy, { passive: true });
      spy();
    }

    /* ---------------- reveal on scroll ---------------- */
    var revs = [].slice.call(document.querySelectorAll('.reveal'));
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
      revs.forEach(function (r) { io.observe(r); });
    } else {
      revs.forEach(function (r) { r.classList.add('in'); });
    }

    /* ---------------- quiz completion ---------------- */
    [].slice.call(document.querySelectorAll('.quiz-q details')).forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) window.AILearn.onQuizAnswer(location.pathname);
      });
    });

    /* ---------------- copy buttons on code blocks ---------------- */
    [].slice.call(document.querySelectorAll('.code')).forEach(function (el) {
      if (!el.querySelector('pre')) {
        var pre = document.createElement('pre');
        pre.innerHTML = el.innerHTML;
        el.innerHTML = '';
        el.appendChild(pre);
      }
      var b = document.createElement('button');
      b.className = 'copy-btn';
      b.textContent = 'copy';
      b.addEventListener('click', function () {
        var txt = el.querySelector('pre').innerText;
        navigator.clipboard.writeText(txt).then(function () {
          b.textContent = 'copied \u2713';
          setTimeout(function () { b.textContent = 'copy'; }, 1400);
        });
      });
      el.appendChild(b);
    });

    /* ---------------- mark nav active ---------------- */
    var page = root.getAttribute('data-page') || '';
    [].slice.call(document.querySelectorAll('.nav-links a')).forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (page && (href.indexOf(page) > -1)) a.classList.add('on');
    });

    /* ---------------- pager keyboard nav ---------------- */
    document.addEventListener('keydown', function (e) {
      if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var prev = document.querySelector('.pager a.prev:not(.disabled)');
      var next = document.querySelector('.pager a.next:not(.disabled)');
      if (e.key === 'ArrowLeft' && prev) location.href = prev.getAttribute('href');
      if (e.key === 'ArrowRight' && next) location.href = next.getAttribute('href');
    });
  });

  /* ---------------- public API ---------------- */
  window.AILearn = {
    store: store,
    copy: function (btn, text) {
      navigator.clipboard.writeText(text).then(function () {
        if (btn) { var o = btn.textContent; btn.textContent = 'copied \u2713'; setTimeout(function () { btn.textContent = o; }, 1400); }
      });
    },
    onQuizAnswer: function (key) {
      var done = store.get('done', {}) || {};
      if (!done[key]) { done[key] = Date.now(); store.set('done', done); }
    },
    markDone: function (key) {
      var done = store.get('done', {}) || {};
      done[key] = Date.now(); store.set('done', done);
      return Object.keys(done).length;
    },
    isDone: function (key) {
      var done = store.get('done', {}) || {};
      return !!done[key];
    },
    reset: function () { store.set('done', {}); store.set('quiz', {}); }
  };

  /* ---------------- opportunistic cloud sync ----------------
     Loaded lazily and only if a sync code exists. Never blocks the page,
     never throws, and is a no-op when the site is used purely offline. */
  window.addEventListener('load', function () {
    var hasCode = false;
    try { hasCode = !!localStorage.getItem('AILearn::sync-code'); } catch (e) {}
    if (!hasCode) return;
    var s = document.createElement('script');
    s.src = (location.pathname.indexOf('/track-') > -1 ||
             location.pathname.indexOf('/resources/') > -1 ||
             location.pathname.indexOf('/about/') > -1 ||
             location.pathname.indexOf('/agi/') > -1 ||
             location.pathname.indexOf('/tools/') > -1) ? '../_sync.js' : '_sync.js';
    s.onload = function () {
      try { if (window.AILearnSync) window.AILearnSync.autoSync(); } catch (e) {}
    };
    s.onerror = function () {};
    document.head.appendChild(s);
  });
})();
