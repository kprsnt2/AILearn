# AILearn — Lesson Manifest (100 lessons, 4 tracks)

Filenames are **exact**. Create each file in its track folder with this name.
Hook prefix per page: Track A `aNN`, B `bNN`, C `cNN`, D `dNN` (e.g. `a07-s3`).

---

## TRACK A — FOUNDATIONS (the machine underneath) — `track-a/`
> Goal: by the end, you can implement each block of a transformer from scratch and explain
> why it is there and what it costs.

| # | File | Lesson | Core build |
|---|---|---|---|
| 01 | `01-tokenization.html` | Tokenization: the physics of the text interface | cost meter + tokenizer round-trip |
| 02 | `02-embeddings.html` | Embeddings: meaning as geometry | cosine search over a word neighbour table |
| 03 | `03-backprop-autograd.html` | Backprop & autograd: credit assignment | hand-written micro autodiff |
| 04 | `04-gradient-descent.html` | Gradient descent, SGD, momentum, AdamW | 1-D loss landscape optimizer race |
| 05 | `05-layernorm-rmsnorm.html` | Normalization: LayerNorm, RMSNorm, the residual stream | train a 3-layer net with/without norm |
| 06 | `06-attention-core.html` | Self-attention from first principles | numpy attention with dropout |
| 07 | `07-multihead.html` | Multi-head & why heads | head-slicing experiment |
| 08 | `08-positional.html` | Positional encoding → RoPE, ALiBi, NoPE | RoPE implementation + rotation check |
| 09 | `09-kv-cache.html` | KV cache: the true cost of memory | prefill vs decode throughput model |
| 10 | `10-gqa-mqa.html` | MQA / GQA / MLA — the KV compression wars | GQA mapper + memory table |
| 11 | `11-activations.html` | Activations: ReLU → GeLU → SwiGLU | ablation on a toy MLP |
| 12 | `12-init.html` | Initialization & stability (Xavier, He, μP intuition) | measure activation variance vs depth |
| 13 | `13-regularization.html` | Overfitting, dropout, weight decay, and early stop | train/val curve lab |
| 14 | `14-lr-schedules.html` | Learning-rate schedules + warmup + the spike problem | cosine vs WSD experiment |
| 15 | `15-batching-seqpack.html` | Batching, padding, sequence packing, attention masks | correct-mask unit test suite |
| 16 | `16-loss-perplexity.html` | Cross-entropy, perplexity, bits-per-byte | compute PPL from logits by hand |
| 17 | `17-samplers.html` | Sampling: greedy, temperature, top-k, top-p, min-p, penalties | sampler playground with distributions |
| 18 | `18-decoding-strategies.html` | Beam search, speculative decoding, constrained decoding | speculative decode gain model |
| 19 | `19-full-transformer.html` | The full transformer: assemble it end-to-end | train a tiny GPT on a corpus |
| 20 | `20-training-loop.html` | The training loop: checkpoints, grad accumulation, mixed precision | resumable training harness |
| 21 | `21-gpus-numerics.html` | GPUs, numerics, fp16/bf16/fp8, memory math | VRAM estimator |
| 22 | `22-vector-search.html` | From cosine to ANN: IVF, HNSW, recall@k | brute-force vs HNSW recall |
| 23 | `23-data-corpora.html` | Data: web crawl, dedup, quality filters, data mixtures | dedup + filter a toy corpus |
| 24 | `24-reading-code.html` | Reading a real model repo (nanoGPT to HF Transformers) | annotated source walkthrough |
| 25 | `25-foundations-capstone.html` | Capstone: GPT-2 scale truth check | reproduce a GPT-2-small training curve |

## TRACK B — SCALING & ARCHITECTURE (the big-iron physics) — `track-b/`
> Goal: understand how DeepSeek and everyone else makes huge models affordable, and be able to
> reason about the cost of any architecture change on a napkin.

| # | File | Lesson | Core build |
|---|---|---|---|
| 26 | `26-scaling-laws.html` | Kaplan scaling laws: loss is a power law | fit your own tiny scaling law |
| 27 | `27-chinchilla.html` | Chinchilla: compute-optimal data vs params | compute-optimal calculator |
| 28 | `28-over-training.html` | Overtraining, inference-aware scaling, the "small but long" era | cost-per-query optimizer |
| 29 | `29-emergence.html` | Emergence, and why it is partly a metric artifact | discontinuity vs metric study |
| 30 | `30-moe.html` | Mixture of Experts: sparse activation | toy MoE router with load stats |
| 31 | `31-moe-routing.html` | Router design, load balancing, auxiliary loss vs auxiliary-loss-free | router collapse demo + fix |
| 32 | `32-deepseek-moe.html` | DeepSeekMoE: fine-grained experts + shared experts | expert-split capacity model |
| 33 | `33-mla.html` | Multi-head Latent Attention: KV compression as low-rank cache | MLA vs GQA memory math |
| 34 | `34-dsa.html` | DeepSeek Sparse Attention (DSA) + token-wise compression | sparse attention pattern sim |
| 35 | `35-long-context.html` | Long context: what 1M tokens actually costs | context cost model in $ and GB |
| 36 | `36-mtp.html` | Multi-token prediction: training signal and speculation | 2-token prediction toy |
| 37 | `37-encoder-decoder.html` | Encoder–decoder + the V4.1 asymmetric split | prefill-heavy vs decode-heavy economics |
| 38 | `38-flash-attention.html` | FlashAttention and IO-awareness | memory-bandwidth model of attention |
| 39 | `39-kernels.html` | CUDA / Triton / TileLang kernels in practice | write a fused softmax in Triton (or simulate) |
| 40 | `40-precision-quant.html` | Quantization: PTQ, QAT, INT8, FP8, AWQ/GPTQ, KV quantization | quantize a small model's weights |
| 41 | `41-distillation.html` | Distillation: teacher→student, and reasoning distillation | distill a tiny teacher |
| 42 | `42-parallelism.html` | Parallelism: DP, TP, PP, EP, ZeRO/FSDP, comms math | pick a parallel config for a given job |
| 43 | `43-training-cost.html` | Training cost modeling: FLOPs, MFU, $ per run | full cost model for a 500B run |
| 44 | `44-inference-serving.html` | Serving: batching, continuous batching, PagedAttention, prefill/decode split | throughput/latency calculator |
| 45 | `45-caching.html` | Context caching, prefix caching, cache-aware pricing | cache-hit cost model |
| 46 | `46-ssm-hybrids.html` | Alternatives: SSMs (Mamba-style), RWKV, hybrid attention | recurrence vs attention sim |
| 47 | `47-multimodal.html` | Native multimodal: vision encoding into the token stream | patchify an image, tokens-vs-pixels |
| 48 | `48-residual-stream.html` | The residual stream as shared memory (mechanistic view) | logit-lens on a tiny model |
| 49 | `49-components-circuits.html` | Induction heads, circuits, and what it means for reliability | induction-head detector |
| 50 | `50-conditioning.html` | Conditioning, in-context learning, and why prompts work | in-context task with distractors |

## TRACK C — POST-TRAINING & REASONING (how behavior is manufactured) — `track-c/`
> Goal: know exactly how a raw predictor becomes a reliable agent, and how to make it reason.

| # | File | Lesson | Core build |
|---|---|---|---|
| 51 | `51-post-training.html` | Post-training map: SFT → preferences → RL → RLHF vs RLVR | decision tree for "what do I tune?" |
| 52 | `52-sft.html` | SFT: data quality, format, masking, loss weighting | build a clean SFT JSONL from scratch |
| 53 | `53-standard-pipeline.html` | The standard pipeline: pretrain/SFT/RL/staging, before-and-after each | pipeline diagram + gate checklist |
| 54 | `54-preference-learning.html` | Preference data: pairwise comparisons, annotator bias | build a preference dataset |
| 55 | `55-dpo.html` | RLHF without RL: DPO, IPO, KTO, ORPO | implement DPO loss in numpy |
| 56 | `56-grpo.html` | GRPO: group-relative policy optimization | implement GRPO on a toy bandit |
| 57 | `57-ppo.html` | PPO for LLMs: clipping, value model, KL leash, 4 models | PPO vs GRPO tradeoff analysis |
| 58 | `58-reward-modeling.html` | Reward models: Bradley–Terry, calibration, reward-hacking surface | train a tiny reward model |
| 59 | `59-process-reward.html` | Outcome vs process rewards, step-level verification | build a process verifier |
| 60 | `60-chain-of-thought.html` | Chain-of-thought: why intermediate tokens buy compute | CoT vs no-CoT accuracy study |
| 61 | `61-test-time-compute.html` | Test-time compute: sampling, best-of-n, verifiers, adaptive budgets | budget allocator |
| 62 | `62-long-cot-r1.html` | Long CoT and R1-Zero: RL that grows reasoning | reasoning-length curves |
| 63 | `63-verifiable-rewards.html` | Verifiable rewards: unit tests, proofs, exact match — and their limits | reward function design + attack |
| 64 | `64-rlvr-vs-rlhf.html` | RLVR vs RLHF: what each can and cannot teach | capability-boundary table |
| 65 | `65-self-play-dialectic.html` | Self-play, debate, and dialectic self-improvement | two-agent debate harness |
| 66 | `66-distilling-reasoning.html` | Distilling reasoning models: rejection sampling, trace recycling | rejection-sampling loop |
| 67 | `67-data-synthesis.html` | Synthetic data + massive agent-environment synthesis (V3.2-style) | env generator for one task family |
| 68 | `68-self-feedback.html` | RL with self-feedback (V4.1-1017 "wish-driven") and its failure modes | self-critique loop with a stop rule |
| 69 | `69-reasoning-effort.html` | Thinking mode, reasoning effort budgets, thinking-in-tool-use | effort-router policy |
| 70 | `70-tool-use-training.html` | Training tool use: format, execution feedback, recovery | tool-call-from-execution trainer |
| 71 | `71-agentic-rl.html` | Agentic RL / RL for long-horizon tasks | multi-step credit assignment sim |
| 72 | `72-constitutional.html` | Constitutional AI, AI feedback, rubric-based judging | rubric critic |
| 73 | `73-continual-learning.html` | Continual learning and forgetting during post-training | measure forgetting |
| 74 | `74-eval-contamination.html` | Contamination, benchmark gaming, and honestly-measured gains | contamination detector |
| 75 | `75-reward-hacking.html` | Reward hacking: taxonomy, invariants, and hard gates | adversarial reward test |

## TRACK D — AGENTS, RAG, EVALS, PRODUCTION (where the money and the risk live) — `track-d/`
> Goal: turn all of the above into systems that run unattended and can be audited.

| # | File | Lesson | Core build |
|---|---|---|---|
| 76 | `76-agents.html` | What an agent actually is: a loop with a budget | minimal ReAct loop |
| 77 | `77-tool-calling.html` | Tool calling & MCP: schemas as the product | tool schema linter |
| 78 | `78-planning.html` | Planning: decomposition, plan-then-act, replanning | plan executor with replan triggers |
| 79 | `79-context-engineering.html` | Context engineering: window budgets, compaction, summarization | context budget planner |
| 80 | `80-memory.html` | Memory: working / episodic / semantic / procedural | memory store with decay & retrieval |
| 81 | `81-subagents.html` | Subagents and orchestration: fan-out, merge, conflicts | orchestrator with disjoint scopes |
| 82 | `82-long-horizon.html` | Long-horizon autonomy: failure compounding, drift, stuck detection | compounding failure model |
| 83 | `83-swarms.html` | Swarms, roles, consensus, and when a swarm is worse than one agent | role-selection experiment |
| 84 | `84-safety-sandboxing.html` | Sandboxing and permission models — the blast radius question | scope-guard implementation |
| 85 | `85-rag-retrieval.html` | Retrieval: hybrid search, chunking, embedding choice | chunker + hybrid retriever |
| 86 | `86-rag-reranking.html` | Reranking, query expansion, multi-hop, HyDE | reranker eval |
| 87 | `87-rag-evaluation.html` | RAG evaluation: recall, faithfulness, groundedness, A/B | RAG eval harness |
| 88 | `88-evals.html` | Evals: golden sets, statistical power, pass@k vs pass^k | eval harness with CIs |
| 89 | `89-llm-as-judge.html` | LLM-as-judge: rubrics, position bias, calibration, arbiters | judge calibration report |
| 90 | `90-observability.html` | Observability & tracing for agents | trace schema + cost attribution |
| 91 | `91-cost-latency.html` | Cost & latency budgets: caching, routing, model cascades | cascade router with SLO |
| 92 | `92-reliability.html` | Reliability: retries, idempotency, degradation, queueing | failure-injection tests |
| 93 | `93-safety-alignment.html` | Safety: refusals, jailbreaks, prompt injection, agent containment | injection defense suite |
| 94 | `94-determinism.html` | Determinism & reproducibility at temperature≠0 | seeded reproducibility audit |
| 95 | `95-rake-reporting-harness.html` | The RAKE reporting harness (declared in the project brief) | full harness spec |
| 96 | `96-production-checklist.html` | Production checklist for an autonomous agent system | go/no-go checklist |
| 97 | `97-rag-in-production.html` | RAG in production: freshness, drift, index rebuilds | index lifecycle plan |
| 98 | `98-finetune-vs-rag.html` | Fine-tune vs RAG vs prompting: the real decision rule | decision matrix with costs |
| 99 | `99-capstone.html` | Capstone: ship an audited autonomous agent | acceptance criteria |
| 100 | `100-annual-plan.html` | The 12-month plan: from where you are to level 100 | week-by-week schedule |

---

## RESOURCES — `resources/`
- `papers.html` — canonical papers, grouped by track, with difficulty and "read this first / skip this"
- `blogs.html` — maintained blogs, newsletters, engineering writeups
- `videos.html` — talks, courses, walkthroughs

## ABOUT — `about/`
- `prashanth.html` — who the course is for, built from kprsnt.in evidence
- `calibration.html` — the level-100 formula (deterministic, evidence-gated)
