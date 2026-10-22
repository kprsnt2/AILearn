/* AILearn — index page renderer: lesson grid, search, progress. */
(function () {
  'use strict';
  var D = window.AILearnData;
  var host = document.getElementById('tracks');
  if (!D || !host) return;

  var done = (window.AILearn ? window.AILearn.store.get('done', {}) : {}) || {};
  var total = D.total;

  function esc(s) { return s; } /* titles in _data.js are authored HTML-safe */

  /* ---------- build lesson url ---------- */
  function url(track, file) { return track.dir + '/' + file + '.html'; }

  /* ---------- render tracks ---------- */
  var html = '';
  var flat = [];
  D.tracks.forEach(function (t) {
    var first = t.lessons[0][0];
    html += '<section class="track" data-track="' + t.id + '">';
    html += '<div class="track-head"><span class="track-letter" style="color:' + t.color + '">TRACK ' + t.id.toUpperCase() + '</span>';
    html += '<h2>' + t.name + '</h2></div>';
    html += '<p class="tagline">' + t.tagline + ' &nbsp;·&nbsp; <a href="' + t.dir + '/index.html" style="color:' + t.color + ';text-decoration:none;border-bottom:1px solid rgba(255,255,255,.15);">track overview →</a></p>';
    html += '<div class="lessons">';
    t.lessons.forEach(function (l, i) {
      var n = String(D.tracks.slice(0, D.tracks.indexOf(t)).reduce(function (a, x) { return a + x.lessons.length; }, 0) + i + 1).padStart(2, '0');
      var file = l[0], title = l[1], href = url(t, file);
      var isDone = !!done[href] || !!done['/' + href];
      flat.push({ n: n, title: title, href: href, track: t.id, color: t.color });
      html += '<a class="lesson' + (isDone ? ' done' : '') + '" href="' + href + '" data-search="' +
        (n + ' ' + title + ' ' + t.name + ' ' + file.replace(/-/g, ' ')).toLowerCase().replace(/"/g, '') + '">' +
        '<span class="num" style="color:' + t.color + '">' + n + '</span>' +
        '<span class="ttl">' + title + '</span></a>';
    });
    html += '</div></section>';
  });
  host.innerHTML = html;

  /* ---------- progress ---------- */
  function refreshProgress() {
    var d = window.AILearn.store.get('done', {}) || {};
    var count = Object.keys(d).filter(function (k) { return k.indexOf('/track-') > -1; }).length;
    var pct = Math.round((count / total) * 100);
    var dc = document.getElementById('done-count');
    var pb = document.getElementById('main-pbar');
    var nu = document.getElementById('next-up');
    if (dc) dc.textContent = count;
    if (pb) pb.style.width = pct + '%';
    if (nu) {
      var next = flat.filter(function (f) { return !d[f.href] && !d['/' + f.href]; })[0];
      nu.textContent = next ? ('Next up: L' + next.n + ' · ' + next.title.replace(/<[^>]+>/g, ''))
        : 'All 100 lessons opened. Now do the build artifacts.';
    }
    /* re-tick chips */
    [].slice.call(document.querySelectorAll('.lesson')).forEach(function (a) {
      var href = a.getAttribute('href');
      a.classList.toggle('done', !!d[href] || !!d['/' + href]);
    });
  }
  refreshProgress();
  window.addEventListener('focus', refreshProgress);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) refreshProgress(); });

  /* ---------- search ---------- */
  var input = document.getElementById('search');
  if (input) {
    var apply = function () {
      var q = input.value.trim().toLowerCase();
      var terms = q ? q.split(/\s+/) : [];
      [].slice.call(document.querySelectorAll('.lesson')).forEach(function (a) {
        var hay = a.getAttribute('data-search') || '';
        var ok = terms.every(function (t) { return hay.indexOf(t) > -1; });
        a.hidden = !ok;
      });
      [].slice.call(document.querySelectorAll('.track')).forEach(function (s) {
        var any = s.querySelectorAll('.lesson:not([hidden])').length > 0;
        s.hidden = !any;
      });
    };
    input.addEventListener('input', apply);
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== input) { e.preventDefault(); input.focus(); }
    });
  }

  /* ---------- reset ---------- */
  var rb = document.getElementById('reset-btn');
  if (rb) rb.addEventListener('click', function () {
    if (confirm('Reset all lesson progress in this browser?')) {
      window.AILearn.reset();
      refreshProgress();
    }
  });
})();
