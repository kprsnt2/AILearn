// Probe candidate anonymous JSON-storage endpoints for AILearn sync.
// We need: browser-CORS-friendly, anonymous create, PUT by key, GET by key.

const tests = [
  {
    name: 'kvdb.io',
    url: 'https://kvdb.io/dV9Kq2mTz8pR4wXc/aillearn-probe',
    write: true
  },
  {
    name: 'jsonblob.com',
    url: 'https://jsonblob.com/api/jsonBlob',
    write: true,
    method: 'POST'
  },
  {
    name: 'httpbin.org/put',
    url: 'https://httpbin.org/put',
    write: true,
    method: 'PUT'
  }
];

async function probe(t) {
  const body = JSON.stringify({ probe: Date.now() });
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const r = await fetch(t.url, {
      method: t.method || 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: ctrl.signal
    });
    clearTimeout(timer);
    const text = await r.text();
    return `${t.name}: HTTP ${r.status}  loc=${r.headers.get('location') || r.headers.get('Location') || '-'}  body=${text.slice(0, 90)}`;
  } catch (e) {
    return `${t.name}: FAIL ${e.name}: ${e.message}`;
  }
}

(async () => {
  for (const t of tests) {
    console.log(await probe(t));
  }
})();
