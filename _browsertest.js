/**
 * AILearn — headless browser sweep.
 *
 * Opens every HTML page in Chrome via CDP and records:
 *   - console errors / uncaught exceptions
 *   - failed network requests (missing css/js/fonts)
 *   - whether the shared shell applied (body background is the dark canvas)
 *   - whether the TOC was built on lesson pages
 *   - page title
 *
 * Requires Chrome started with --remote-debugging-port=9222.
 * Usage: node _browsertest.js [--all]
 */
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;

function get(p) {
  return new Promise((res, rej) => {
    http.get('http://127.0.0.1:9222' + p, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

async function newTab(url) {
  return new Promise((res, rej) => {
    http.request({ host: '127.0.0.1', port: 9222, path: '/json/new?' + encodeURIComponent(url), method: 'PUT' }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej).end();
  });
}

async function closeTab(id) {
  return new Promise(res => {
    http.request({ host: '127.0.0.1', port: 9222, path: '/json/close/' + id }, r => {
      r.resume(); r.on('end', res);
    }).on('error', res).end();
  });
}

function collectPages() {
  const out = [];
  const dirs = ['', 'track-a', 'track-b', 'track-c', 'track-d', 'resources', 'about', 'agi', 'tools'];
  for (const d of dirs) {
    const abs = path.join(ROOT, d);
    if (!fs.existsSync(abs)) continue;
    for (const f of fs.readdirSync(abs)) {
      if (f.endsWith('.html') && !f.startsWith('_')) {
        out.push(path.join(d, f).replace(/\\/g, '/'));
      }
    }
  }
  return out.sort();
}

async function inspect(page, wsUrl) {
  const ws = new WebSocket(wsUrl);
  const logs = [];
  const failed = [];
  let id = 0;
  const pending = new Map();

  await new Promise(r => ws.addEventListener('open', r));

  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      logs.push('EXCEPTION: ' + (d.exception?.description || d.text).split('\n')[0]);
    }
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      logs.push('console.error: ' + m.params.args.map(a => a.value ?? a.description ?? '').join(' '));
    }
    if (m.method === 'Network.loadingFailed' && !m.params.errorText.includes('ERR_ABORTED')) {
      failed.push(m.params.errorText);
    }
  });

  const send = (method, params = {}) => new Promise(res => {
    const i = ++id; pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

  await send('Runtime.enable');
  await send('Network.enable');
  // reload so Network events fire
  await send('Page.enable');
  await send('Page.reload', { ignoreCache: false });
  await new Promise(r => setTimeout(r, 900));

  const ev = await send('Runtime.evaluate', {
    expression: `(function(){
      var b = getComputedStyle(document.body).backgroundColor;
      var toc = document.getElementById('toc');
      var isLesson = /\\/track-[abcd]\\/\\d/.test(location.pathname) && !location.pathname.endsWith('/index.html');
      return {
        title: document.title.slice(0, 70),
        bg: b,
        shell: (b === 'rgb(8, 11, 17)' || b === 'rgb(247, 248, 252)'),
        h1: (document.querySelector('h1')||{}).innerText ? document.querySelector('h1').innerText.slice(0,60) : null,
        tocCount: toc ? toc.querySelectorAll('a').length : -1,
        isLesson: isLesson,
        navLinks: document.querySelectorAll('.nav-links a').length,
        brokenImgs: [].slice.call(document.images).filter(function(i){return i.complete && i.naturalWidth===0;}).length,
        ready: document.readyState
      };
    })()`,
    returnByValue: true
  });

  ws.close();
  const v = ev.result?.result?.value || {};
  return { ...v, logs, failed, page };
}

async function main() {
  const pages = collectPages();
  console.log(`sweeping ${pages.length} pages...\n`);
  const bad = [];
  let ok = 0;

  for (const p of pages) {
    const url = 'file:///' + path.join(ROOT, p).replace(/\\/g, '/');
    let tab;
    try {
      tab = await newTab('about:blank');
      const wsUrl = tab.webSocketDebuggerUrl;
      // navigate
      await new Promise((res) => {
        const ws = new WebSocket(wsUrl);
        ws.addEventListener('open', () => {
          ws.send(JSON.stringify({ id: 1, method: 'Page.enable' }));
          ws.send(JSON.stringify({ id: 2, method: 'Page.navigate', params: { url } }));
          setTimeout(() => { ws.close(); res(); }, 700);
        });
      });
      const r = await inspect(p, tab.webSocketDebuggerUrl);
      const problems = [];
      if (!r.shell) problems.push(`shell css not applied (bg=${r.bg})`);
      if (r.logs.length) problems.push(...r.logs);
      if (r.failed.length) problems.push('load failures: ' + [...new Set(r.failed)].join(','));
      if (r.isLesson && r.tocCount < 7) problems.push(`TOC has ${r.tocCount} entries`);
      if (!r.h1) problems.push('no h1');
      if (r.brokenImgs) problems.push(`${r.brokenImgs} broken img`);

      if (problems.length) { bad.push({ p, problems }); console.log('  ✗ ' + p); problems.forEach(x => console.log('      ' + x)); }
      else { ok++; }
    } catch (e) {
      bad.push({ p, problems: ['driver error: ' + e.message] });
      console.log('  ✗ ' + p + ' (driver error)');
    } finally {
      if (tab && tab.id) await closeTab(tab.id);
    }
  }

  console.log(`\n${'-'.repeat(70)}`);
  console.log(`clean: ${ok}/${pages.length}`);
  if (bad.length) {
    console.log(`problems on ${bad.length} page(s)`);
    process.exitCode = 1;
  } else {
    console.log('ALL PAGES CLEAN');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
