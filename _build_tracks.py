#!/usr/bin/env python3
"""
AILearn - generate the four track overview pages (track-a/index.html ... track-d/index.html)

Each track page is a real landing page: the arc of the track, its lessons with status,
what you build by the end, and the prerequisite/exit conditions. Kept in sync with
_MANIFEST data embedded below (same source as _data.js).

Run:  python _build_tracks.py
"""
import os
import html

ROOT = os.path.dirname(os.path.abspath(__file__))

TRACKS = [
    {
        "dir": "track-a", "id": "a", "num": "A", "name": "Foundations",
        "color": "#38bdf8", "grad": "linear-gradient(135deg,#0ea5e9,#38bdf8)",
        "tagline": "The machine underneath. Build every block of a transformer yourself.",
        "thesis": (
            "You can already orchestrate models. What you cannot yet do is rebuild one. "
            "This track closes that gap block by block: tokenizer, embedding, gradient, norm, "
            "attention, position, cache, sampler, full training loop. By lesson 25 you will have "
            "trained a small transformer from scratch and know exactly where every number in its "
            "loss curve came from."
        ),
        "why": [
            ("Every scaling decision becomes legible", "You cannot judge MLA vs GQA vs MQA until you have computed a KV cache by hand."),
            ("Debugging stops being guessing", "Most 'the model is broken' bugs are tensor-shape or masking bugs. You will have made all of them yourself in a sandbox."),
            ("Cost intuition becomes arithmetic", "Token counts, cache bytes, FLOPs. You will be able to estimate a serving bill on a napkin."),
        ],
        "build": "A working tiny transformer trained on a corpus, with a hand-written sampler, attention and training loop.",
        "exit": [
            "Explain the variance argument for dividing attention by sqrt(d_k) without notes",
            "Compute KV-cache bytes for any config and say which tensor dominates at 128k context",
            "Get a clean training run with an LR schedule and no loss spikes",
            "Read a model repo (nanoGPT / HF) and know what every line does",
        ],
        "prereq": "Python, and a willingness to run things. No deep-learning maths assumed.",
        "lessons": [
            ("01-tokenization", "Tokenization: the physics of the text interface", "cost meter + tokenizer round-trip"),
            ("02-embeddings", "Embeddings: meaning as geometry", "cosine search over a neighbour table"),
            ("03-backprop-autograd", "Backprop &amp; autograd: credit assignment", "hand-written micro autodiff"),
            ("04-gradient-descent", "Gradient descent, SGD, momentum, AdamW", "1-D optimizer race"),
            ("05-layernorm-rmsnorm", "Normalization: LayerNorm, RMSNorm, residual stream", "train with and without norm"),
            ("06-attention-core", "Self-attention from first principles", "numpy attention with masks"),
            ("07-multihead", "Multi-head and why heads", "head-slicing experiment"),
            ("08-positional", "Positional encoding to RoPE, ALiBi, NoPE", "RoPE rotation check"),
            ("09-kv-cache", "KV cache: the true cost of memory", "prefill vs decode model"),
            ("10-gqa-mqa", "MQA / GQA / MLA: the KV compression wars", "GQA mapper + memory table"),
            ("11-activations", "Activations: ReLU to GeLU to SwiGLU", "ablation on a toy MLP"),
            ("12-init", "Initialization and stability", "activation variance vs depth"),
            ("13-regularization", "Overfitting, dropout, weight decay", "train/val curve lab"),
            ("14-lr-schedules", "Learning-rate schedules and warmup", "cosine vs WSD"),
            ("15-batching-seqpack", "Batching, packing and attention masks", "mask unit tests"),
            ("16-loss-perplexity", "Cross-entropy, perplexity, bits-per-byte", "compute PPL by hand"),
            ("17-samplers", "Sampling: temperature, top-k, top-p, min-p", "sampler playground"),
            ("18-decoding-strategies", "Beam search, speculative, constrained decoding", "speculative decode model"),
            ("19-full-transformer", "The full transformer, assembled", "train a tiny GPT"),
            ("20-training-loop", "Training loop: checkpoints, accumulation, AMP", "resumable harness"),
            ("21-gpus-numerics", "GPUs, numerics, bf16/fp8, memory math", "VRAM estimator"),
            ("22-vector-search", "Cosine to ANN: IVF, HNSW, recall@k", "brute-force vs HNSW recall"),
            ("23-data-corpora", "Crawl, dedup, quality filters, mixtures", "dedup a toy corpus"),
            ("24-reading-code", "Reading a real model repo", "annotated source walkthrough"),
            ("25-foundations-capstone", "Capstone: GPT-2 scale truth check", "reproduce a GPT-2-small curve"),
        ],
    },
    {
        "dir": "track-b", "id": "b", "num": "B", "name": "Scaling &amp; Architecture",
        "color": "#8b5cf6", "grad": "linear-gradient(135deg,#7c3aed,#8b5cf6)",
        "tagline": "Big-iron physics. Why DeepSeek made huge models affordable, on a napkin.",
        "thesis": (
            "This is the track written for your blind spot, and it is the one that pays immediately. "
            "Every lesson turns an architecture choice into arithmetic you can do in a review: "
            "parameters, FLOPs, bytes, dollars, tokens per second. By the end you can look at any "
            "model announcement and independently reconstruct what it costs, why it was built that way, "
            "and what its serving economics must be."
        ),
        "why": [
            ("You will stop taking architecture claims on faith", "Scaling laws, Chinchilla and the over-training reversal explain why models look the way they do in 2026."),
            ("DeepSeek's specific bets become legible", "MLA, DeepSeekMoE, DSA, multi-token prediction and the V4.1 asymmetric encoder-decoder each solve one arithmetic problem."),
            ("Cost modelling becomes a deliverable", "This is the single most valuable skill for someone applying for AI systems roles. Almost nobody can do it."),
        ],
        "build": "A cost model that, given an architecture and a workload, predicts training cost, serving cost and the binding constraint.",
        "exit": [
            "Derive the compute-optimal N and D for a given budget from a scaling law",
            "Explain why inference volume moves the optimum away from Chinchilla",
            "Compute the KV-cache bytes for MHA, GQA and MLA and pick one for a stated workload",
            "Estimate a training run's GPU-hours and dollars with defensible assumptions",
        ],
        "prereq": "Track A lessons 06, 09, 10 at minimum. Basic algebra. This track is arithmetic-heavy on purpose.",
        "lessons": [
            ("26-scaling-laws", "Kaplan scaling laws: loss is a power law", "fit your own tiny law"),
            ("27-chinchilla", "Chinchilla: compute-optimal data vs params", "compute-optimal calculator"),
            ("28-over-training", "Overtraining and inference-aware scaling", "cost-per-query optimizer"),
            ("29-emergence", "Emergence, and why it is partly a metric artifact", "continuity study"),
            ("30-moe", "Mixture of Experts: sparse activation", "toy MoE with load stats"),
            ("31-moe-routing", "Router design, balancing, aux-loss-free", "router collapse and fix"),
            ("32-deepseek-moe", "DeepSeekMoE: fine-grained + shared experts", "expert capacity model"),
            ("33-mla", "MLA: KV compression as a low-rank cache", "MLA vs GQA memory math"),
            ("34-dsa", "DeepSeek Sparse Attention", "sparse pattern simulation"),
            ("35-long-context", "What 1M tokens actually costs", "context cost model"),
            ("36-mtp", "Multi-token prediction", "2-token prediction toy"),
            ("37-encoder-decoder", "Encoder-decoder and the V4.1 asymmetric split", "prefill/decode economics"),
            ("38-flash-attention", "FlashAttention and IO-awareness", "bandwidth model"),
            ("39-kernels", "CUDA / Triton / TileLang in practice", "fused softmax"),
            ("40-precision-quant", "Quantization: PTQ, QAT, FP8, AWQ/GPTQ, KV quant", "quantize a small model"),
            ("41-distillation", "Distillation: teacher to student", "distill a tiny teacher"),
            ("42-parallelism", "DP, TP, PP, EP, ZeRO/FSDP", "pick a parallel config"),
            ("43-training-cost", "Training cost: FLOPs, MFU, dollars", "full run cost model"),
            ("44-inference-serving", "Continuous batching, PagedAttention, prefill/decode", "throughput calculator"),
            ("45-caching", "Context caching and cache-aware pricing", "cache-hit cost model"),
            ("46-ssm-hybrids", "Alternatives: SSMs, RWKV, hybrids", "recurrence vs attention"),
            ("47-multimodal", "Native multimodal: vision into the token stream", "patchify an image"),
            ("48-residual-stream", "The residual stream as shared memory", "logit lens"),
            ("49-components-circuits", "Induction heads, circuits, reliability", "induction-head detector"),
            ("50-conditioning", "Conditioning and why prompts work", "in-context task with distractors"),
        ],
    },
    {
        "dir": "track-c", "id": "c", "num": "C", "name": "Post-training &amp; Reasoning",
        "color": "#f59e0b", "grad": "linear-gradient(135deg,#d97706,#f59e0b)",
        "tagline": "How behaviour is manufactured: SFT, preferences, RL, and reasoning.",
        "thesis": (
            "A pretrained model is a predictor. Everything you actually interact with is a product of "
            "post-training. This track covers how behaviour is manufactured: supervised fine-tuning, "
            "preference learning, RL with verifiable rewards, the reasoning-model recipe, and the "
            "failure modes that make all of it fragile. Every objective is implemented, not described."
        ),
        "why": [
            ("You will implement the losses, not cite them", "DPO, GRPO and PPO clipped surrogate in numpy, so the equations stop being incantations."),
            ("Reward hacking becomes a design problem", "You already gate promotions. This track generalises the gate into an RL training discipline."),
            ("Reasoning becomes an engineering budget", "Chain-of-thought, test-time compute, and reasoning effort are all the same tradeoff viewed from different angles."),
        ],
        "build": "A toy RL post-training loop with a verifiable reward, a reward-hacking test suite, and a measured before/after.",
        "exit": [
            "Write the DPO and GRPO objectives from memory and explain the group baseline",
            "Design a verifiable reward function and then attack it yourself",
            "Explain when reasoning distillation beats RL and when it merely imitates",
            "Detect reward hacking with a concrete invariant rather than a vibe",
        ],
        "prereq": "Track A lessons 03-04 (gradients), and Track B lessons 26-28. Probability helps.",
        "lessons": [
            ("51-post-training", "Post-training map: SFT, preferences, RL, RLVR", "decision tree for tuning"),
            ("52-sft", "SFT: data quality, format, masking", "clean SFT JSONL"),
            ("53-standard-pipeline", "The standard pipeline and its gates", "gate checklist"),
            ("54-preference-learning", "Preference data and annotator bias", "build a preference set"),
            ("55-dpo", "RLHF without RL: DPO, IPO, KTO, ORPO", "DPO loss in numpy"),
            ("56-grpo", "GRPO: group-relative policy optimization", "GRPO on a toy bandit"),
            ("57-ppo", "PPO for LLMs: clipping, critic, KL leash", "PPO vs GRPO analysis"),
            ("58-reward-modeling", "Reward models: Bradley-Terry and calibration", "tiny reward model"),
            ("59-process-reward", "Outcome vs process rewards", "process verifier"),
            ("60-chain-of-thought", "Chain-of-thought: why tokens buy compute", "CoT vs no-CoT study"),
            ("61-test-time-compute", "Test-time compute and budget allocation", "budget allocator"),
            ("62-long-cot-r1", "Long CoT and R1-Zero", "reasoning-length curves"),
            ("63-verifiable-rewards", "Verifiable rewards and their limits", "reward design + attack"),
            ("64-rlvr-vs-rlhf", "RLVR vs RLHF: capability boundaries", "boundary table"),
            ("65-self-play-dialectic", "Self-play, debate, dialectic improvement", "debate harness"),
            ("66-distilling-reasoning", "Distilling reasoning models", "rejection-sampling loop"),
            ("67-data-synthesis", "Synthetic data and environment synthesis", "env generator"),
            ("68-self-feedback", "RL with self-feedback and its failure modes", "stop-rule critique loop"),
            ("69-reasoning-effort", "Thinking mode and effort budgets", "effort router"),
            ("70-tool-use-training", "Training tool use", "tool-call-from-execution"),
            ("71-agentic-rl", "Agentic RL and long-horizon credit", "credit assignment sim"),
            ("72-constitutional", "Constitutional AI and rubric critics", "rubric critic"),
            ("73-continual-learning", "Continual learning and forgetting", "measure forgetting"),
            ("74-eval-contamination", "Contamination and honest measurement", "contamination detector"),
            ("75-reward-hacking", "Reward hacking: taxonomy and hard gates", "adversarial reward suite"),
        ],
    },
    {
        "dir": "track-d", "id": "d", "num": "D", "name": "Agents, RAG, Evals, Production",
        "color": "#10b981", "grad": "linear-gradient(135deg,#059669,#10b981)",
        "tagline": "Where the money and the risk live. Systems that run unattended and can be audited.",
        "thesis": (
            "You already ship agents. This track is deliberately written one level below what you do: "
            "the measurement, the invariant, the failure math, the economic model. It treats every "
            "agent system as a control system with a budget and an audit trail, and it ends with the "
            "one artifact almost nobody produces: a run whose record proves it was correct."
        ),
        "why": [
            ("Your existing systems get a measurement layer", "JobAgents, BugAgents and AgentSwarm become instruments, not just deployments."),
            ("Evals stop being a demo", "Statistical power, confidence intervals, pass@k vs pass^k, and judge calibration that survives review."),
            ("The audit moat becomes a product", "The RAKE harness and the production checklist are the deliverables an enterprise would actually buy."),
        ],
        "build": "An audited autonomous agent: verifiable evidence bundle, independent oracle, promotion gates, cost attribution, and a run you can hand to a stranger.",
        "exit": [
            "Design an eval with adequate statistical power and state the CI on your result",
            "Build an evidence bundle a stranger can recompute without asking you anything",
            "State your blast radius in one sentence and defend each of the three controls",
            "Run the FABLE auditability rubric on your own systems and publish the honest score",
        ],
        "prereq": "Track C lessons 60-63 for the reasoning/verifier half. Everything else assumes you build agents already.",
        "lessons": [
            ("76-agents", "What an agent actually is: a budgeted control loop", "minimal ReAct loop"),
            ("77-tool-calling", "Tool calling and MCP: schemas as the product", "schema linter"),
            ("78-planning", "Planning, decomposition, replanning", "plan executor"),
            ("79-context-engineering", "Context budgets, compaction, summarization", "context planner"),
            ("80-memory", "Memory: working, episodic, semantic, procedural", "memory store with decay"),
            ("81-subagents", "Subagents and orchestration", "orchestrator with scopes"),
            ("82-long-horizon", "Long-horizon autonomy and failure compounding", "compounding model"),
            ("83-swarms", "Swarms, roles, consensus", "role-selection experiment"),
            ("84-safety-sandboxing", "Sandboxing and the blast-radius question", "scope guard"),
            ("85-rag-retrieval", "Retrieval: hybrid search and chunking", "hybrid retriever"),
            ("86-rag-reranking", "Reranking, query expansion, multi-hop", "reranker eval"),
            ("87-rag-evaluation", "RAG evaluation: recall, faithfulness, A/B", "RAG eval harness"),
            ("88-evals", "Evals: golden sets and statistical power", "eval harness with CIs"),
            ("89-llm-as-judge", "LLM-as-judge and arbiters", "judge calibration report"),
            ("90-observability", "Observability and tracing", "trace schema + cost attribution"),
            ("91-cost-latency", "Cost and latency budgets, cascades", "cascade router"),
            ("92-reliability", "Retries, idempotency, degradation", "failure-injection tests"),
            ("93-safety-alignment", "Jailbreaks, injection, containment", "injection defense suite"),
            ("94-determinism", "Determinism and reproducibility", "seeded reproducibility audit"),
            ("95-rake-reporting-harness", "The RAKE reporting harness", "full harness spec"),
            ("96-production-checklist", "Production checklist for autonomous agents", "go/no-go checklist"),
            ("97-rag-in-production", "RAG in production: freshness and drift", "index lifecycle plan"),
            ("98-finetune-vs-rag", "Fine-tune vs RAG vs prompting", "decision matrix"),
            ("99-capstone", "Capstone: ship an audited autonomous agent", "acceptance criteria"),
            ("100-annual-plan", "The 12-month plan to level 100", "week-by-week schedule"),
        ],
    },
]


PAGE = """<!DOCTYPE html>
<html lang="en" data-theme="dark" data-page="{dir}/index">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Track {num} - {name_plain} - AILearn</title>
<meta name="description" content="{tagline_plain}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../_shell.css">
<style>
  .hero {{ padding: 44px 0 8px; max-width: 92ch; }}
  .hero h1 {{ font-size: clamp(1.9rem, 4.4vw, 2.9rem); letter-spacing: -1.4px; line-height: 1.1; }}
  .thesis {{ border-left: 3px solid {color}; padding-left: 20px; margin: 26px 0; font-size: 1.04rem;
    color: var(--txt-2); line-height: 1.75; max-width: 88ch; }}
  .sec {{ margin: 46px 0; }}
  .sec h2 {{ font-size: 1.32rem; letter-spacing: -.5px; margin: 0 0 14px; color: var(--txt); }}
  .lesson-list {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(340px,1fr)); gap: 10px; }}
  .L {{ display: flex; gap: 12px; text-decoration: none; background: var(--card); border: 1px solid var(--line);
    border-radius: 11px; padding: 12px 14px; transition: .16s; align-items: flex-start; }}
  .L:hover {{ border-color: {color}66; transform: translateY(-2px); background: var(--card-2); }}
  .L .n {{ font-family: var(--mono); font-size: .72rem; font-weight: 700; color: {color}; min-width: 26px; padding-top: 2px; }}
  .L .t {{ color: var(--txt); font-size: .89rem; font-weight: 550; line-height: 1.4; }}
  .L .b {{ color: var(--txt-3); font-size: .74rem; font-family: var(--mono); margin-top: 3px; }}
  .grid3 {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 14px; }}
  .card h4 {{ margin: 0 0 7px !important; color: {color}; font-size: .8rem; letter-spacing: .6px;
    text-transform: uppercase; font-family: var(--mono); }}
  .card p {{ margin: 0; font-size: .87rem; }}
  ul.check {{ list-style: none; padding: 0; margin: 0; }}
  ul.check li {{ position: relative; padding-left: 26px; margin-bottom: 9px; font-size: .9rem; color: var(--txt-2); }}
  ul.check li::before {{ content: "\\2713"; position: absolute; left: 0; color: {color}; font-weight: 700; }}
</style>
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
      <a href="../about/prashanth.html">Profile</a>
      <a href="../agi/index.html">AGI Lab</a>
      <a href="../tools/index.html">Tools</a>
    </div>
    <div class="nav-tools">
      <span class="progress-mini" id="progress-mini">0%</span>
      <button class="icon-btn" id="theme-toggle" title="Toggle theme">&#9686;</button>
    </div>
  </div>
  <div class="nav-progress"><i id="progress-bar"></i></div>
</nav>

<main class="wrap">
<header class="hero">
  <div class="track-tag" style="color:{color};border-color:{color}55;background:{color}14;">TRACK {num} &middot; {name_plain_upper}</div>
  <h1>{name} - {lessons_n} lessons</h1>
  <p class="lede">{tagline}</p>
  <p class="thesis">{thesis}</p>
  <div class="chips">
    <span class="chip">{first} &rarr; {last}</span>
    <span class="chip">{build_h}</span>
    <span class="chip">prereq: {prereq_h}</span>
  </div>
</header>

<div class="sec">
  <h2>Why this track exists</h2>
  <div class="grid3">
    {why_cards}
  </div>
</div>

<div class="sec">
  <h2>By the end you can</h2>
  <ul class="check">{exit_items}</ul>
</div>

<div class="sec">
  <h2>Prerequisites</h2>
  <p style="color:var(--txt-2);">{prereq}</p>
  <p style="color:var(--txt-2);"><strong>The artifact:</strong> {build}</p>
</div>

<div class="sec">
  <h2>Lessons</h2>
  <div class="lesson-list">
    {lesson_items}
  </div>
</div>

{next_prev}

</main>

<footer>AILearn &middot; <a href="../about/calibration.html">level calibration</a> &middot; <a href="../tools/flashcards.html">flashcards</a></footer>
<script src="../_shell.js"></script>
</body>
</html>
"""


def build():
    for i, t in enumerate(TRACKS):
        name_plain = t["name"].replace("&amp;", "&")
        why_cards = "\n".join(
            f'<div class="card"><h4>0{j+1}</h4><h4>{html_h(title)}</h4><p>{desc}</p></div>'
            for j, (title, desc) in enumerate(t["why"])
        )
        exit_items = "\n    ".join(f"<li>{e}</li>" for e in t["exit"])
        lesson_items = "\n    ".join(
            f'<a class="L" href="{slug}.html"><span class="n">{slug[:2]}</span>'
            f'<span><span class="t">{title}</span><span class="b">{build_txt}</span></span></a>'
            for slug, title, build_txt in t["lessons"]
        )
        first = t["lessons"][0][0][:2]
        last = t["lessons"][-1][0][:2]

        # prev / next track navigation
        prev_link = ('<a class="prev" href="../index.html"><span class="dir">&larr; PREVIOUS</span>'
                     '<span class="ttl">Course overview</span></a>')
        if i > 0:
            pt = TRACKS[i - 1]
            prev_link = (f'<a class="prev" href="../{pt["dir"]}/index.html"><span class="dir">&larr; PREVIOUS TRACK</span>'
                         f'<span class="ttl">Track {pt["num"]} &middot; {pt["name"]}</span></a>')
        if i < len(TRACKS) - 1:
            nt = TRACKS[i + 1]
            next_link = (f'<a class="next" href="../{nt["dir"]}/index.html"><span class="dir">NEXT TRACK &rarr;</span>'
                         f'<span class="ttl">Track {nt["num"]} &middot; {nt["name"]}</span></a>')
        else:
            next_link = ('<a class="next" href="../about/calibration.html"><span class="dir">NEXT &rarr;</span>'
                         '<span class="ttl">Level calibration</span></a>')
        nav = f'<nav class="pager">\n  {prev_link}\n  {next_link}\n</nav>'

        out = PAGE.format(
            dir=t["dir"], num=t["num"], name=t["name"], name_plain=name_plain,
            name_plain_upper=name_plain.upper(), tagline=t["tagline"],
            tagline_plain=t["tagline"], color=t["color"], thesis=t["thesis"],
            lessons_n=len(t["lessons"]), first=f"L{first}", last=f"L{last}",
            build=t["build"], build_h="build: " + t["build"].split(",")[0][:60],
            prereq=t["prereq"], prereq_h=html.escape(t["prereq"].split(".")[0])[:70],
            why_cards=why_cards, exit_items=exit_items, lesson_items=lesson_items,
            next_prev=nav,
        )
        path = os.path.join(ROOT, t["dir"], "index.html")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(out)
        print(f"wrote {t['dir']}/index.html  ({len(out)/1024:.1f} KB, {len(t['lessons'])} lessons)")


def html_h(s):
    return s


if __name__ == "__main__":
    build()
