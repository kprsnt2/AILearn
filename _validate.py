#!/usr/bin/env python3
"""
AILearn site validator.

Checks, across every HTML file in the project:
  1. every relative href/src target exists on disk
  2. every lesson page has all 7 required sections with matching hook ids
  3. every lesson page has concept pills + a pager
  4. no page is orphaned (something links to it)
  5. duplicate ids within a page
  6. unclosed <details>/<section> balance heuristics
  7. reports page size (text weight) so thin pages stand out

Usage:  python validate.py            # summary
        python validate.py --verbose  # every problem listed
Exit code 1 if any hard error.
"""
import os
import re
import sys
import json
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
VERBOSE = "--verbose" in sys.argv

SKIP_DIRS = {".git", "node_modules", "__pycache__", ".pytest_cache"}

errors = []
warnings = []
info = []


def walk_html():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for f in filenames:
            if f.endswith(".html") and not f.startswith("_"):
                yield os.path.join(dirpath, f)


def rel(p):
    return os.path.relpath(p, ROOT).replace("\\", "/")


def strip_scripts(s):
    s = re.sub(r"<script\b[\s\S]*?</script>", "", s)
    s = re.sub(r"<style\b[\s\S]*?</style>", "", s)
    s = re.sub(r"<!--[\s\S]*?-->", "", s)
    return s


def text_weight(s):
    t = strip_scripts(s)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"\s+", " ", t)
    return len(t)


LESSON_RE = re.compile(r"^(track-[abcd])/(\d{2,3})-.+\.html$")

files = sorted(walk_html())
all_rels = set(rel(f) for f in files)

# ---------------- collect link targets ----------------
link_targets = set()
link_re = re.compile(r'(?:href|src)\s*=\s*"([^"#]+)(?:#[^"]*)?"')
for f in files:
    s = open(f, encoding="utf-8", errors="replace").read()
    base = os.path.dirname(f)
    for m in link_re.finditer(s):
        t = m.group(1).strip()
        if not t or t.startswith(("http://", "https://", "mailto:", "data:", "javascript:", "//")):
            continue
        target = os.path.normpath(os.path.join(base, t))
        link_targets.add(rel(target))

# ---------------- per-file checks ----------------
stats = {"lessons": 0, "lesson_ok": 0, "total_kb": 0.0, "text_chars": 0}
missing_sections = []
missing_hooks = []
no_pills = []
no_pager = []
dup_ids = []
thin = []
broken = defaultdict(list)
lessons_seen = set()

for f in files:
    r = rel(f)
    s = open(f, encoding="utf-8", errors="replace").read()
    base = os.path.dirname(f)
    stats["total_kb"] += os.path.getsize(f) / 1024.0

    # 1. broken relative links
    for m in link_re.finditer(s):
        t = m.group(1).strip()
        if not t or t.startswith(("http://", "https://", "mailto:", "data:", "javascript:", "//")):
            continue
        # skip JS string-concatenation fragments, which are not static links
        if "' +" in t or '\"' in t or "${{" in t or t.endswith("+"):
            continue
        target = os.path.normpath(os.path.join(base, t))
        if not os.path.exists(target):
            broken[r].append(t)

    # 2. duplicate ids
    ids = re.findall(r'\sid="([^"]+)"', s)
    seen = set()
    for i in ids:
        if i in seen:
            dup_ids.append((r, i))
        seen.add(i)

    # 3. tags balance
    if s.count("<details") != s.count("</details>"):
        errors.append(f"{r}: <details> unbalanced ({s.count('<details')} open, {s.count('</details>')} close)")

    m = LESSON_RE.match(r)
    if not m:
        continue
    stats["lessons"] += 1
    lessons_seen.add(r)
    track_dir, num = m.group(1), m.group(2)
    prefix = m.group(1).split("-")[1] + num  # a01, b26, ...

    # required sections: the standard lesson has exactly 7; a few capstones
    # legitimately add more, so require >= 7 rather than == 7.
    secs = re.findall(r'<section class="sec[^"]*"[^>]*data-title="([^"]+)"', s)
    if len(secs) < 7:
        missing_sections.append((r, len(secs)))

    hooks = re.findall(r'id="(' + prefix + r'-s\d+)"', s)
    if len(hooks) < 7:
        missing_hooks.append((r, len(hooks), prefix))

    # pills
    if 'class="concept-pills"' not in s:
        no_pills.append(r)

    # pager
    if 'class="pager"' not in s:
        no_pager.append(r)

    # shell css/js
    if "../_shell.css" not in s:
        errors.append(f"{r}: missing ../_shell.css")
    if "../_shell.js" not in s:
        errors.append(f"{r}: missing ../_shell.js")

    tw = text_weight(s)
    stats["text_chars"] += tw
    if tw < 6000:
        thin.append((r, tw))
    else:
        stats["lesson_ok"] += 1

# ---------------- orphan check ----------------
orphans = []
for r in sorted(all_rels):
    if r in ("index.html",):
        continue
    if r.startswith(("_",)) or "/_" in r:
        continue
    if r not in link_targets:
        orphans.append(r)

# ---------------- expected lesson manifest ----------------
MANIFEST = {
    "track-a": ["01-tokenization", "02-embeddings", "03-backprop-autograd", "04-gradient-descent",
                "05-layernorm-rmsnorm", "06-attention-core", "07-multihead", "08-positional",
                "09-kv-cache", "10-gqa-mqa", "11-activations", "12-init", "13-regularization",
                "14-lr-schedules", "15-batching-seqpack", "16-loss-perplexity", "17-samplers",
                "18-decoding-strategies", "19-full-transformer", "20-training-loop", "21-gpus-numerics",
                "22-vector-search", "23-data-corpora", "24-reading-code", "25-foundations-capstone"],
    "track-b": ["26-scaling-laws", "27-chinchilla", "28-over-training", "29-emergence", "30-moe",
                "31-moe-routing", "32-deepseek-moe", "33-mla", "34-dsa", "35-long-context", "36-mtp",
                "37-encoder-decoder", "38-flash-attention", "39-kernels", "40-precision-quant",
                "41-distillation", "42-parallelism", "43-training-cost", "44-inference-serving",
                "45-caching", "46-ssm-hybrids", "47-multimodal", "48-residual-stream",
                "49-components-circuits", "50-conditioning"],
    "track-c": ["51-post-training", "52-sft", "53-standard-pipeline", "54-preference-learning", "55-dpo",
                "56-grpo", "57-ppo", "58-reward-modeling", "59-process-reward", "60-chain-of-thought",
                "61-test-time-compute", "62-long-cot-r1", "63-verifiable-rewards", "64-rlvr-vs-rlhf",
                "65-self-play-dialectic", "66-distilling-reasoning", "67-data-synthesis",
                "68-self-feedback", "69-reasoning-effort", "70-tool-use-training", "71-agentic-rl",
                "72-constitutional", "73-continual-learning", "74-eval-contamination", "75-reward-hacking"],
    "track-d": ["76-agents", "77-tool-calling", "78-planning", "79-context-engineering", "80-memory",
                "81-subagents", "82-long-horizon", "83-swarms", "84-safety-sandboxing", "85-rag-retrieval",
                "86-rag-reranking", "87-rag-evaluation", "88-evals", "89-llm-as-judge", "90-observability",
                "91-cost-latency", "92-reliability", "93-safety-alignment", "94-determinism",
                "95-rake-reporting-harness", "96-production-checklist", "97-rag-in-production",
                "98-finetune-vs-rag", "99-capstone", "100-annual-plan"],
}
expected = set()
for d, names in MANIFEST.items():
    for n in names:
        expected.add(f"{d}/{n}.html")
missing_files = sorted(expected - all_rels)

# ---------------- report ----------------
def show(title, items, limit=40):
    if not items:
        return
    print(f"\n{title}: {len(items)}")
    if VERBOSE:
        for it in items[:limit]:
            print("   ", it)
        if len(items) > limit:
            print(f"    ... and {len(items)-limit} more")
    else:
        for it in items[:8]:
            print("   ", it)
        if len(items) > 8:
            print(f"    ... and {len(items)-8} more (use --verbose)")


print("=" * 72)
print("AILearn validation")
print("=" * 72)
print(f"html files           : {len(files)}")
print(f"lessons found        : {stats['lessons']} / 100")
print(f"lessons >= 6k chars  : {stats['lesson_ok']}")
print(f"total size           : {stats['total_kb']/1024:.2f} MB")
print(f"total lesson text    : {stats['text_chars']:,} chars")

show("MISSING LESSON FILES", missing_files)
show("BROKEN RELATIVE LINKS", [f"{k} -> {v}" for k, vs in broken.items() for v in vs])
show("INCOMPLETE SECTION SET (expected 7)", [f"{r} ({n})" for r, n in missing_sections])
show("MISSING HOOK IDS", [f"{r} ({n} of 7, prefix {p})" for r, n, p in missing_hooks])
show("NO CONCEPT PILLS", no_pills)
show("NO PAGER", no_pager)
show("DUPLICATE IDS", [f"{r}#{i}" for r, i in dup_ids])
show("ORPHANED PAGES (nothing links to them)", orphans)
show("THIN PAGES (< 6000 chars of text)", [f"{r} ({t})" for r, t in thin])
show("TAG BALANCE ERRORS", errors)

hard = len(missing_files) + len(broken) + len(missing_sections) + len(missing_hooks) + len(errors)
print("\n" + "-" * 72)
if hard == 0:
    print("STATUS: no hard errors")
else:
    print(f"STATUS: {hard} hard issue(s)")
print("-" * 72)
sys.exit(1 if hard else 0)
