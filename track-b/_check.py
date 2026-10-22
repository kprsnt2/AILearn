import re, os, sys, glob

D = r"C:\Users\hplap\Desktop\Projects_rash\AILearn"
TB = os.path.join(D, "track-b")
MANIFEST = {}
for line in open(os.path.join(D, "_MANIFEST.md"), encoding="utf-8"):
    m = re.match(r'\|\s*(\d\d)\s*\|\s*`([^`]+\.html)`', line)
    if m:
        MANIFEST[m.group(1)] = m.group(2)

# track-b expected files
expected = {k: v for k, v in MANIFEST.items() if 26 <= int(k) <= 50}
missing = [v for v in expected.values() if not os.path.exists(os.path.join(TB, v))]
print("missing files:", missing if missing else "none", "(of %d)" % len(expected))

problem = 0
SOON = []
files = [f for f in sorted(glob.glob(os.path.join(TB, "*.html"))) if os.path.basename(f)[:2].isdigit()]
tot = 0
for f in files:
    base = os.path.basename(f)
    num = base.split("-")[0]
    s = open(f, encoding="utf-8").read()
    errs = []
    secs = re.findall(r'data-n="(\d)"\s+data-title="', s)
    if secs != [str(i) for i in range(1, 8)]:
        errs.append("SECTIONS:%s" % secs)
    hooks = re.findall(r'id="(b\d\d-s\d)"', s)
    want = ["b%s-s%d" % (num, i) for i in range(1, 8)]
    if hooks != want:
        errs.append("HOOKS:%s" % hooks)
    ids = set(re.findall(r'id="([^"]+)"', s))
    for h in set(re.findall(r'href="#([^"]+)"', s)):
        if h not in ids:
            errs.append("DEADHASH:" + h)
    # only pager links are our structural responsibility
    pager = re.search(r'<nav class="pager">(.*?)</nav>', s, re.S)
    if not pager:
        errs.append("NOPAGER")
    else:
        links = re.findall(r'href="([^"]+)"', pager.group(1))
        if len(links) != 2:
            errs.append("PAGERLINKS")
        for h in links:
            p = os.path.normpath(os.path.join(TB, h))
            if not os.path.exists(p):
                tgt = os.path.basename(h)
                num2 = tgt.split('-')[0]
                written = {os.path.basename(x).split('-')[0] for x in glob.glob(os.path.join(TB, '*.html'))}
                # provisionally missing only if the target's own writer has already produced later pages
                if num2.isdigit() and int(num2) < 50 and any(int(w) > int(num2) for w in written if w.isdigit()):
                    errs.append("PAGERBROKEN:" + h)
                else:
                    SOON.append(h)
        # prev/next must be manifest siblings
        n = int(num)
        if links:
            prev_ok = (os.path.basename(links[0]) == MANIFEST["%02d" % (n - 1)]) if n > 1 else True
            next_ok = (os.path.basename(links[1]) == MANIFEST["%02d" % (n + 1)]) if n < 100 else True
            if not prev_ok:
                errs.append("PREVWRONG")
            if not next_ok:
                errs.append("NEXTWRONG")
    pillblock = re.search(r'<div class="concept-pills">(.*?)</div>', s, re.S)
    npills = len(re.findall(r'<span class="pill">', pillblock.group(1))) if pillblock else 0
    if not (4 <= npills <= 8):
        errs.append("PILLS:%d" % npills)
    for cls, n in (('formula', 1), ('code', 2), ('lab', 2), ('fail', 1), ('quiz-q', 5), ('callout boss', 1)):
        c = len(re.findall(r'class="%s"' % re.escape(cls), s))
        if c < n:
            errs.append("%s:%d<%d" % (cls.replace(' ', '_'), c, n))
    if s.count('<details><summary>Reveal answer</summary>') < 5:
        errs.append("REVEALS")
    if 'href="../_shell.css"' not in s or 'src="../_shell.js"' not in s:
        errs.append("SHELL")
    if 'data-page="b%s"' % num not in s:
        errs.append("DATAPAGE")
    if "asof" not in s:
        errs.append("NOASOF")
    if chr(0xc3)+chr(0x82) in s or chr(0xc3)+chr(0xa2) in s or chr(0xfffd) in s:
        errs.append("MOJIBAKE")
    if s.count('<div') != s.count('</div>'):
        errs.append("DIVS:%d/%d" % (s.count('<div'), s.count('</div>')))
    if s.count('<section') != s.count('</section>'):
        errs.append("SECTIONS_UNBALANCED")
    kb = len(s.encode("utf-8")) / 1024
    tot += kb
    status = "OK " if not errs else "ERR"
    print("%s %-32s %7.1f KB pills=%d %s" % (status, base, kb, npills, ",".join(errs)))
    if errs:
        problem += 1
print("problem files: %d   total: %.1f KB" % (problem, tot))
print("pending (not yet written by others):", sorted(set(SOON)) if SOON else "none")
