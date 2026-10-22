// Minimal CDP driver over raw WebSocket (Node's built-in WebSocket in v22+).
// Usage: node _cdptest.js <file-path> [actions...]
const http = require('http');

function get(p) {
  return new Promise((res, rej) => {
    http.get('http://127.0.0.1:9222' + p, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => res(JSON.parse(d)));
    }).on('error', rej);
  });
}

async function main() {
  const target = process.argv[2] || 'agi-sim';
  const list = await get('/json');
  const t = list.find(x => x.url.includes(target));
  if (!t) { console.log('target not found among:', list.map(x => x.url)); process.exit(1); }

  const ws = new WebSocket(t.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const logs = [];

  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.consoleAPICalled') {
      logs.push(msg.params.type + ': ' + msg.params.args.map(a => a.value ?? a.description ?? a.type).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      logs.push('EXCEPTION: ' + (msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text));
    }
  });

  await new Promise(r => ws.addEventListener('open', r));

  function send(method, params = {}) {
    return new Promise(res => {
      const i = ++id;
      pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
  }

  async function evaluate(expr) {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result?.exceptionDetails) return 'EXPR_ERROR: ' + r.result.exceptionDetails.text;
    return r.result?.result?.value;
  }

  await send('Runtime.enable');
  await send('Page.enable');

  const script = await evaluate(process.argv[3] || 'document.title');
  console.log('RESULT:', typeof script === 'object' ? JSON.stringify(script, null, 2) : script);

  if (logs.length) {
    console.log('\nCONSOLE:');
    logs.forEach(l => console.log('  ' + l));
  } else {
    console.log('\nCONSOLE: clean (no errors, no exceptions)');
  }
  ws.close();
  process.exit(0);
}
main();
