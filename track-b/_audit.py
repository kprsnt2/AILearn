import re, os, glob

TB = r"C:\Users\hplap\Desktop\Projects_rash\AILearn\track-b"
files = [f for f in sorted(glob.glob(os.path.join(TB, "*.html"))) if os.path.basename(f)[:2].isdigit()]

print("=== artifacts / banned patterns ===")
bad_pat = [
    (r'\bdelve\b', "banned word"),
    (r"in today's fast-paced", "banned phrase"),
    (r'&lt;\s*span', "broken span"),
    (r'<span class="fn">[^<]* [^<]*</span>', "space in fn span"),
    (r'<div class="table"', "div used as table"),
    (r'<table class="table">.*?<table class="table">', "nested table"),
    (r'\$\d+[.,]\d+\s*[Bb]\b', "dollar-billions claim (check source)"),
    (r'NaN|None|inf ', "python artifact"),
]
for f in files:
    s = open(f, encoding="utf-8").read()
    for pat, label in bad_pat:
        for m in re.finditer(pat, s, re.S):
            frag = s[max(0, m.start()-40):m.end()+40].replace("\n", " ")
            print(f"  {os.path.basename(f):32s} {label:28s} ...{frag[:90]}...")
            break

print("\n=== links to sibling tracks that do not exist yet ===")
import collections
missing = collections.defaultdict(list)
for f in files:
    s = open(f, encoding="utf-8").read()
    for h in set(re.findall(r'href="(\.\./[a-z]+/[^"#]+)"', s)):
        if not os.path.exists(os.path.normpath(os.path.join(TB, h))):
            missing[h].append(os.path.basename(f))
for h, who in sorted(missing.items()):
    print(f"  {h:50s} <- {len(who)} page(s): {who[0]}{' ...' if len(who)>1 else ''}")

print("\n=== per-page stats ===")
for f in files:
    s = open(f, encoding="utf-8").read()
    txt = re.sub(r'<[^>]+>', ' ', s)
    txt = re.sub(r'&[a-z]+;|&#\d+;', ' ', txt)
    words = len(txt.split())
    formulas = s.count('class="formula"')
    codes = s.count('class="code"')
    labs = s.count('class="lab"')
    fails = s.count('<li>', s.find('class="fail"'), s.find('</ul>', s.find('class="fail"'))) if 'class="fail"' in s else 0
    pager = len(re.findall(r'<nav class="pager">', s))
    print(f"  {os.path.basename(f):32s} words={words:5d} formula={formulas} code={codes} labs={labs} failitems={fails} pager={pager}")
