# AILearn

A 100-lesson, build-first AI curriculum written for one specific engineer — plus a research
program for auditing autonomy.

Open **[`index.html`](index.html)** in a browser. No build step, no server, no dependencies.
Everything is static, everything runs locally, nothing phones home.

---

## What is in here

| Part | What it is | Start at |
|---|---|---|
| **The course** | 100 lessons in 4 tracks, ~300 self-check questions, ~200 runnable experiments | [`index.html`](index.html) |
| **Track A — Foundations** | Tokenizer to full transformer. Every block built by hand. | [`track-a/index.html`](track-a/index.html) |
| **Track B — Scaling & Architecture** | Scaling laws, MoE, MLA, sparse attention, serving economics. All arithmetic. | [`track-b/index.html`](track-b/index.html) |
| **Track C — Post-training & Reasoning** | SFT, DPO, GRPO, PPO, verifiable rewards, reasoning models, reward hacking. | [`track-c/index.html`](track-c/index.html) |
| **Track D — Agents, RAG, Evals, Production** | Evals with statistical power, auditors, reliability, the RAKE harness. | [`track-d/index.html`](track-d/index.html) |
| **The reading list** | Papers, blogs and talks with read/skim/skip verdicts | [`resources/papers.html`](resources/papers.html) |
| **Your profile** | Who this was written for, with an honest blind-spot map and a prescribed reading order | [`about/prashanth.html`](about/prashanth.html) |
| **The level formula** | A non-gameable rubric that computes your level from evidence, with a working widget | [`about/calibration.html`](about/calibration.html) |
| **The AGI lab** *(part two)* | SKILLA — a design for autonomy that can be audited | [`agi/index.html`](agi/index.html) |
| **The tools** | Flashcards, concept drill, KV-cache calculator, scaling-law explorer, swarm simulator | [`tools/index.html`](tools/index.html) |

## The five things worth doing first

1. **Read your profile** — [`about/prashanth.html`](about/prashanth.html). It names four blind
   spots and a five-phase reading order that front-loads them. Start with Track B 26 → 27 → 28 → 33.
2. **Score yourself honestly** — [`about/calibration.html`](about/calibration.html). Baseline before
   you start, so you can prove progress later.
3. **Run the swarm simulator for 40 cycles with "No falsification" on, then again with "Balanced"** —
   [`tools/agi-sim.html`](tools/agi-sim.html). The difference between the two value curves is the
   entire argument of the AGI lab, in about two minutes.
4. **Read SKILLA and the FABLE benchmark** — [`agi/index.html`](agi/index.html),
   [`agi/benchmark.html`](agi/benchmark.html). Then look at the kill-switch theorem.
5. **Set up flashcards** — [`tools/flashcards.html`](tools/flashcards.html). Ten minutes a day beats
   a weekend of reading, and this is the only part that should be habitual.

## How lessons are structured

Every lesson has the same seven sections, in this order:

1. **Why it exists** — the production failure that forced the idea into existence.
2. **The mental model** — the smallest correct model, with an explicit statement of where any analogy breaks.
3. **The mechanism** — the real math, pseudocode and data flow.
4. **Your hands** — runnable experiments with an expected result and a falsifier.
5. **Failure modes** — how it breaks in production, with observable symptoms.
6. **Connects to** — explicit in/out links to other lessons.
7. **Self-check** — five questions; at least two quantitative or diagnostic.

Lessons marked with a ✓ are ones whose self-checks you have opened. Progress is stored in your
browser's localStorage — no account, no server, and it never leaves the machine.

## Conventions

- **`state as of 2026-10`** marks anything that could age: model versions, prices, benchmark
  positions. Correct these against the vendor docs before citing them.
- **No invented numbers.** Every quantitative claim is either definitional, computable from a
  printed formula, or a worked example whose arithmetic you can redo by hand.
- **DeepSeek facts** in Tracks B and C are sourced from `api-docs.deepseek.com` release notes and
  Hugging Face model cards as of October 2026, not from memory.

## Maintenance

Two scripts keep the site consistent. Both are stdlib-only Python.

```bash
python _build_tracks.py     # regenerate track-*/index.html after editing the lesson lists
python _validate.py         # check every link, section, hook id, duplicate id and page weight
python _validate.py --verbose
```

`_validate.py` exits non-zero on hard errors, so it can gate a commit. It checks that:

- every relative `href`/`src` resolves to a real file
- all 100 manifest lessons exist
- every lesson has its 7 sections and its `TNN-s1..7` hook ids
- every lesson has concept pills and a pager
- no page has duplicate ids or unbalanced `<details>`
- no page is orphaned (nothing links to it)
- no lesson is thin (< 6000 characters of real text)

## Files

```
index.html              course hub: lesson grid, search, progress
_shell.css / _shell.js  shared design system and behaviour (TOC, scroll-spy, theme, storage)
_data.js / _index.js    course data and the hub renderer
_build_tracks.py        track page generator
_validate.py            site validator
_SHARED_BRIEF.md        the authoring spec every lesson follows
_MANIFEST.md            the canonical 100-lesson list
_TEMPLATE.html          the lesson skeleton
track-a|b|c|d/          100 lessons
resources/              papers.html, blogs.html, videos.html
about/                  prashanth.html, calibration.html
agi/                    index.html (SKILLA), benchmark.html (FABLE), killswitch.html
tools/                  flashcards, concept-lab, kv-calc, scaling-lab, agi-sim
```

## Design

The visual language is ported from the kprsnt.in "2026 AI Systems Lab" theme: near-black canvas,
indigo → violet → cyan accent gradient, glass cards, JetBrains Mono for anything numeric.
Dark by default, light mode available, keyboard navigable (`←`/`→` move between lessons, `/` searches
on the hub page, `Space` + `1`–`4` drive the flashcards).
