# AILearn — Shared Brief (READ FULLY BEFORE WRITING)

This is a static, self-contained HTML course. **No build step, no server, no framework.**
Open any `.html` file directly in the browser and it must work perfectly.

---

## 1. Who this is for

**Prashanth Kumar Kadasi** (`kprsnt.in`) — AI Systems Engineer, Hyderabad.

| Fact | Evidence (from kprsnt.in) |
|---|---|
| 2014–2023 Optum / UnitedHealth : CMS compliance & enrollment quality auditor | 7+ years regulated federal audit discipline |
| 2023–2026 Pi Datametrics : Data Analyst (BigQuery, Apps Script, Tableau, ARIMA/LSTM, sentiment) | 15+ dashboards, 30+ reports |
| 2026– Black Piano : Data Analyst → building autonomous AI systems | GCP migration |
| JobAgents | 7,613 roles ingested, 5-factor deterministic scoring, **0 LLM calls** in the scoring path |
| BugAgents | 2 autonomous agents, dual-LLM arbiter, 4-point promotion gate, 15,317 tool calls, $0.067 spend, zero false positives |
| AgentSwarm | hash-chained forensic ledger **32/32 intact**, adversarial oracle, 0 overclaims across 1,254 tool calls |
| Project Awakening | 1,441 turns, 1,553 commits, 330-turn API quota blackout survived |
| Agent Cosmos | 100 epochs multi-agent evolution |
| BrandXY | fine-tuned GPT-OSS-20B, 76.47% vs 25.49% baseline |
| MyLocalCLI | 26 tools, 5 subagents, 6 providers |
| pRash | 6-way AI coding CLI controlled benchmark |

**Teaching consequences — obey these:**

1. **He ships fast and measures obsessively.** He already builds agent swarms, hash-chained
   ledgers, promotion gates, zero-LLM cost gates. Never explain "what an agent is" — explain
   **why the thing he already built is right or wrong at the level below it.**
2. **He is stronger on code than on math derivations.** Always give the formula *and*
   a 5-line Python/numpy version that prints numbers. Never leave a math idea un-simulated.
3. **Boss framing.** Each page must open with the *problem that exists in the world* that forced
   this idea to be invented. Not "what is X" but "here is the failure X was invented to stop."
4. **His moat is audit.** Every page should land somewhere near: *how do you prove this is true?*
   Determinism, reproducibility, falsifiability, tamper-evidence.
5. **No flattery, no filler.** Every sentence must carry information. If a paragraph could be
   deleted without loss, delete it.

## 2. Hard rules

- **NO invented numbers, benchmarks, model names, or citations.** If unsure, say "commonly
  reported" or omit. Do not fabricate arXiv IDs. Verified anchors you MAY use:
  - Attention Is All You Need — arXiv:1706.03762
  - GPT-3 "Language Models are Few-Shot Learners" — arXiv:2005.14165
  - Kaplan et al. "Scaling Laws for Neural Language Models" — arXiv:2001.08361
  - Hoffmann et al. "Training Compute-Optimal LLMs" (Chinchilla) — arXiv:2203.15556
  - BERT — arXiv:1810.04805 ; T5 — arXiv:1910.10683
  - Switch Transformer — arXiv:2101.03961 ; GShard — arXiv:2006.16668
  - InstructGPT — arXiv:2203.02155
  - Chain-of-Thought — arXiv:2201.11903 ; Self-Consistency — arXiv:2203.11171 ; ToT — arXiv:2305.10601
  - ReAct — arXiv:2210.03629 ; Reflexion — arXiv:2303.11366 ; Toolformer — arXiv:2302.04761
  - Generative Agents — arXiv:2304.03442 ; Voyager — arXiv:2305.16291
  - LoRA — arXiv:2106.09685 ; QLoRA — arXiv:2305.14314 ; DPO — arXiv:2305.18290
  - PPO — arXiv:1707.06347 ; GRPO introduced in DeepSeekMath — arXiv:2402.03300
  - FlashAttention — arXiv:2205.14135 ; FlashAttention-2 — arXiv:2307.08691
  - RoPE — arXiv:2104.09864 ; GQA — arXiv:2305.13245
  - RAG (Lewis et al.) — arXiv:2005.11401
  - Constitutional AI — arXiv:2212.08073
  - MMLU — arXiv:2009.03300 ; HELM — arXiv:2211.09110 ; SWE-bench — arXiv:2310.06770
  - GAIA — arXiv:2311.12983 ; AgentBench — arXiv:2308.03688
  - DeepSeek-V2 (MLA) — arXiv:2405.04434 ; DeepSeek-V3 — arXiv:2412.19437 ; DeepSeek-R1 — arXiv:2501.12948
  - DeepSeek-V3.2-Exp introduces **DSA (DeepSeek Sparse Attention)**; V3.2 adds mass agent data
    synthesis over 1,800+ environments and "thinking in tool-use".
- **Current 2026 state (verified from api-docs.deepseek.com and HF, use it):**
  - DeepSeek-V4 (Apr 2026): V4-Pro 1.6T total / 49B active; V4-Flash 284B total / 13B active;
    **1M context standard**; token-wise compression + DSA.
  - DeepSeek-V4.1-Flash (Sep 2026): **552B MoE**, new **Causal Encoder–Decoder** architecture,
    **8B active params for input, 16B for output**, KV cache 1/4 HBM and 1/8 SSD vs prior gen,
    native multimodal, ahead of V4-Pro on performance/cost/speed.
  - V4.1-Flash-1017 (Oct 2026): RL with self-feedback for end-to-end project building
    ("wish-driven programming"); Search & Fetch APIs opened.
  - Serving: `deepseek-flash` model id, thinking mode + `reasoning_effort` (low/high/max),
    peak vs off-peak pricing (off-peak = 50%), OpenAI + Anthropic compatible endpoints.
- **No external CSS/JS files.** One Google Fonts link + one `<style>` block is allowed, but
  **prefer the shared shell** (`../_shell.css` + `../_shell.js`) and add only page-local
  `<style>` for special widgets.
- Escape `<`, `>`, `&` inside `<code>` blocks where needed. Keep `<script>` blocks real and working.
- Prefer stdlib-only Python in examples (numpy ok). Note when something needs `pip install`.

## 3. The shared shell (REQUIRED on every page)

Copy this exact skeleton, only filling the marked regions:

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark" data-page="a01">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>L01 · Tokenization — AILearn</title>
<meta name="description" content="one-line description">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../_shell.css">
</head>
<body>
<div class="bg-aurora" aria-hidden="true"></div>

<nav class="nav">
  <div class="nav-inner">
    <a class="brand" href="../index.html">AILearn<span class="dot"></span></a>
    <div class="nav-links">
      <a href="../index.html">Course</a>
      <a href="index.html">Track</a>
      <a href="../resources/papers.html">Papers</a>
      <a href="../resources/blogs.html">Blogs</a>
      <a href="../resources/videos.html">Videos</a>
      <a href="../about/prashanth.html">Profile</a>
    </div>
    <div class="nav-tools">
      <span class="progress-mini" id="progress-mini" title="Lessons completed">0%</span>
      <button class="icon-btn" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme">◐</button>
    </div>
  </div>
  <div class="nav-progress"><i id="progress-bar"></i></div>
</nav>

<main class="wrap">

<!-- ====== PAGE HEADER ====== -->
<header class="page-head reveal">
  <div class="crumb"><a href="../index.html">AILearn</a> <span>/</span> <a href="index.html">Track A — Foundations</a> <span>/</span> <span>L01</span></div>
  <div class="track-tag">TRACK A · FOUNDATIONS</div>
  <h1>L01 · Tokenization: The Physics of the Text Interface</h1>
  <p class="lede">One or two sentences that tell the boss why this page costs him money if he skips it.</p>
  <div class="chips">
    <span class="chip">~25 min</span><span class="chip">difficulty ●●○○○</span><span class="chip">build: token cost meter</span>
  </div>
</header>

<div class="layout">
  <aside class="toc" id="toc"></aside>
  <article class="prose">

  <!-- ====== SECTION TEMPLATE ====== -->
  <section class="sec reveal" data-n="1" data-title="Why it exists">
    <h2>1 · Why it exists <a class="hook" href="#HOOKID" title="copy link">#</a></h2>
    ...
  </section>
  ...
  </article>
</div>
</main>
<footer>...</footer>
<script src="../_shell.js"></script>
</body>
</html>
```

> **IMPORTANT** — every `<section class="sec">` needs `data-n` and `data-title`; the shell builds the
> Table of Contents from them automatically. Put `id="HOOKID"` on the `<h2>` where HOOKID is unique
> per page (e.g. `a01-s1`) so shared links work.

## 4. Required page structure — 7 sections, in this order

| # | Section | What it must contain |
|---|---|---|
| 1 | **Why it exists** | The concrete failure in the real world that forced this concept into existence. State it as a problem statement. No history-tourism. |
| 2 | **The mental model** | The smallest correct model of the mechanism. An analogy is allowed but must be labelled as an analogy and must state exactly where the analogy breaks. |
| 3 | **The mechanism** | The actual math / pseudocode / data flow. At least one formula in a `.formula` block and one `.code` block. No hand-waving. |
| 4 | **Your hands** | 2–3 runnable experiments. At least one must be copy-paste runnable (python or browser console). Each has an *instruction*, *what to run*, and *what you should observe / what would falsify it*. Use `.lab` blocks. |
| 5 | **Failure modes** | Bullet list of how this breaks in production. Each failure must name the observable symptom. Use a `.fail` block. |
| 6 | **Connects to** | Explicit in/out links to other lesson numbers or tracks (`26 · Scaling laws`, `56 · GRPO`). This is what makes it a curriculum and not a list. |
| 7 | **Self-check** | Exactly 5 questions. Use `.quiz` with `<details><summary>Reveal answer</summary>…</details>`. At least 2 must be quantitative or diagnostic. |

Also required, right after the header and before section 1:

- `<div class="concept-pills">` — 4–8 pills naming the concrete concepts (e.g. `BPE`, `byte fallback`,
  `greedy merges`, `vocab size tradeoff`). These power the global concept search on the home page.

And at the bottom, before `</article>`:

- `<nav class="pager">` with prev/next lesson links.

## 5. Style primitives available from `_shell.css`

`.wrap` `.page-head` `.crumb` `.track-tag` `.lede` `.chips` `.chip` `.layout` `.toc` `.prose`
`.sec` `.formula` `.code` `.lab` `.fail` `.quiz` `.quiz-q` `.callout` (`.callout.warn` `.callout.boss` `.callout.audit`)
`.concept-pills` `.pill` `.pager` `.grid2` `.card` `.kpi` `.kpi-val` `.kpi-lab` `.table` `.reveal` `.hook` `.copy-btn` `.asof`
`.mermaid-ish` `.cmp` (comparison table) `.tag-a` `.tag-b` `.tag-c` `.tag-d`

Global JS helpers (from `_shell.js`):
- Automatic TOC + scroll-spy + reading progress.
- `AILearn.copy(buttonEl, text)` — copy to clipboard.
- `AILearn.onQuizAnswer(key)` — increments completion for the page when a quiz is opened.
- `<span class="asof">state as of 2026-10</span>` — required wherever a fact could age.

## 6. Quality bar (this is graded)

- **12–20 KB of real content per page** (text, not markup).
- Every claim either is definitional, has a runnable check, or is marked `class="asof"`.
- Every page answers three questions in the learner's head:
  1. *What breaks without this?* 2. *How do I prove it works?* 3. *Where does it fail?*
- Write as a senior engineer briefing a peer — not a textbook, not a hype blog.
- Nobody says "delve". Nobody says "in today's fast-paced world".
