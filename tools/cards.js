/* AILearn - flashcard deck. Every card asks for a MECHANISM, not a definition. */
window.AILearnCards = [

/* ------------------------------------------------ TRACK A - FOUNDATIONS */
{ id:'a01', track:'a', lesson:1, link:'track-a/01-tokenization.html',
  q:'Why does a byte-level BPE have <em>no out-of-vocabulary tokens</em>, and what does that guarantee cost you?',
  a:'Byte-level BPE starts from 256 byte values, so any UTF-8 string is representable and an UNK token never occurs. The cost is <em>token inefficiency</em>: rare scripts and long numbers fragment into many tokens, so the same text in an under-represented language can cost several times more tokens and context than English. Efficiency is a function of how often your script appeared in the merge-training data.' },

{ id:'a02', track:'a', lesson:1, link:'track-a/01-tokenization.html',
  q:'Why does leading whitespace attached to a token (" leading") change model behaviour, not just tokenisation?',
  a:'The space is part of the token, so "the" and " the" are different embedding rows with different learned statistics. Word-initial tokens occur only at word starts and therefore learn a different distribution than continuations. This is why a trailing space, or a space before a number, can shift a model answer.' },

{ id:'a03', track:'a', lesson:9, link:'track-a/09-kv-cache.html',
  q:'Derive why the KV cache reduces decoding from O(n^2) per token to O(n) per token, and say what memory it costs.',
  a:'Without a cache, generating token n+1 requires recomputing attention over all n previous tokens, giving O(n^2) total work for a length-n sequence. With a cache you store the K and V projections of every previous token, so each new step does attention against them directly: O(n) compute per token. The memory cost is 2 x n_layers x n_kv_heads x d_head x n_tokens x bytes, and it grows linearly with context. That is why the cache, not the weights, dominates long-context inference.' },

{ id:'a04', track:'a', lesson:6, link:'track-a/06-attention-core.html',
  q:'Why divide attention scores by sqrt(d_k)? Give the variance argument, not the folklore.',
  a:'If q and k have i.i.d. components with mean 0 and variance 1, their dot product over d_k dimensions has variance d_k and standard deviation sqrt(d_k). Without scaling, logits spread out as d_k grows, softmax saturates into a near-one-hot distribution, gradients vanish, and training destabilises. Dividing by sqrt(d_k) restores unit variance so logits stay in a usable range.' },

{ id:'a05', track:'a', lesson:10, link:'track-a/10-gqa-mqa.html',
  q:'What exactly does MLA compress, and what does it NOT compress?',
  a:'MLA stores a compressed latent vector per token instead of full K and V per head, then reconstructs K and V on the fly via learned up-projections. So it compresses the cache, the dominant memory term, and cuts bytes per token per layer dramatically. It does not reduce the number of tokens, does not reduce attention compute at decode beyond the traffic saving, and adds projection FLOPs at decode time in exchange for the memory win.' },

{ id:'a06', track:'a', lesson:8, link:'track-a/08-positional.html',
  q:'RoPE encodes relative position by rotating q and k. Show why the dot product depends only on the difference of positions.',
  a:'Rotate each query by angle theta x pos_q and each key by theta x pos_k. The dot product of two rotated vectors depends on the angle between them, which is theta x (pos_q - pos_k). So the attention score is a function of the relative offset only. That is why the model generalises to offsets it did not memorise, and why naive extension beyond the trained length still degrades: the frequency phases go out of distribution.' },

{ id:'a07', track:'a', lesson:17, link:'track-a/17-samplers.html',
  q:'Temperature, top-k and top-p act together. Which one changes the shape of the distribution and which ones truncate it?',
  a:'Temperature divides the logits by T before softmax. That reshapes the distribution: T below 1 sharpens it, T above 1 flattens it, but it never makes any probability exactly zero. Top-k and top-p truncate the support: they keep the k most likely tokens, or the smallest set whose cumulative probability reaches p, then renormalise. Truncation is harder, because it can never sample the excluded tokens; temperature is softer.' },

{ id:'a08', track:'a', lesson:16, link:'track-a/16-loss-perplexity.html',
  q:'A model reports cross-entropy of 2.3 nats per token. What is the perplexity, and what does it mean concretely?',
  a:'Perplexity = e^2.3, about 10.0. It means the model is, on average, as uncertain as if it were choosing uniformly among ten equally likely next tokens at each step. It does not mean it is 90% wrong, and it does not mean it knows ten options; it is the effective branching factor of its predictive distribution. Comparing perplexities across tokenisers is invalid unless normalised to bits-per-byte.' },

{ id:'a09', track:'a', lesson:13, link:'track-a/13-regularization.html',
  q:'Why does weight decay bias the model toward small weights, and what is the pathological case where it hurts?',
  a:'The L2 penalty adds lambda x norm(w)^2 to the loss; the gradient adds 2 x lambda x w, which pulls every weight multiplicatively toward zero each step. This is a prior that simpler, smaller-norm functions are preferable, and it reduces effective capacity. It hurts when the useful signal genuinely needs large weights, for example sharp one-hot-like memorisation of facts, and it is scale-sensitive: weights attached to LayerNorm can be over-shrunk if you decay every parameter uniformly.' },

{ id:'a10', track:'a', lesson:19, link:'track-a/19-full-transformer.html',
  q:'Name the parameter tensors in a single transformer block and give their shapes in terms of d_model, n_heads and d_ff.',
  a:'QKV projections: d_model x (3 x d_model) for MHA, or per-head d_model x d_head. Output projection: d_model x d_model. MLP up-projection: d_model x d_ff, often 4 x d_model, or about 2.67 x d_model each for the SwiGLU gate and up matrices. MLP down-projection: d_ff x d_model. Plus norm gains of size d_model. The MLP dominates parameter count, usually about two thirds of a dense block.' },

{ id:'a11', track:'a', lesson:21, link:'track-a/21-gpus-numerics.html',
  q:'Estimate inference memory for a 7B-parameter model at fp16, and say what breaks when you push context to 128k.',
  a:'Weights alone: 7e9 x 2 bytes, about 14 GB. Add the KV cache: for example 32 layers, 32 heads, d_head 128, that is 2 x 32 x 32 x 128 x 2 bytes, about 524 KB per token, so 128k tokens is about 67 GB of cache alone, far more than the weights. That is the whole argument for GQA and MLA and for KV quantisation: past a certain context length, the cache is the system.' },

{ id:'a12', track:'a', lesson:20, link:'track-a/20-training-loop.html',
  q:'What does gradient accumulation change mathematically versus functionally?',
  a:'Mathematically it approximates a large batch: averaging gradients over N micro-batches gives the gradient of the mean loss over the combined batch. Functionally it is not identical, because normalisation statistics and per-step state such as optimizer steps and the LR schedule step count differ, and in practice you accumulate sums and divide once to avoid fp16 underflow. It trades time for memory, not for accuracy.' },

{ id:'a13', track:'a', lesson:15, link:'track-a/15-batching-seqpack.html',
  q:'What is the bug that shows up when a causal attention mask is applied incorrectly after sequence packing?',
  a:'If packed sequences do not get a block-diagonal mask, tokens from sequence B can attend to sequence A. The loss looks better during training because the model gets free context, then collapses at inference where that context is absent. The tell is a suspiciously low training loss with no matching eval gain, and samples that are fluent but incoherently cross-referencing.' },

{ id:'a14', track:'a', lesson:22, link:'track-a/22-vector-search.html',
  q:'Why is HNSW approximate, and how do you measure whether it is good enough?',
  a:'A hierarchical navigable small-world graph prunes edges to keep search logarithmic, so it may never visit the true nearest neighbour. You measure recall@k against brute force on a sample of queries, not speed alone. A fast index with recall@10 of 0.6 is worse than brute force at your scale; the crossover point is the real engineering decision.' },

{ id:'a15', track:'a', lesson:3, link:'track-a/03-backprop-autograd.html',
  q:'State the chain rule in the form backprop actually uses, and say why gradient subtraction happens at the end.',
  a:'For output z and loss L, the local gradient dL/dw equals dL/dz times dz/dw. Backprop computes the incoming dL/dz, the error, once per node and reuses it for every input edge. The subtraction in grad = upstream - lr x grad happens last because backprop only produces gradients; applying them is a separate optimizer step. Conflating the two is the classic bug when you forget to zero gradients, which then accumulate silently across steps.' },

/* ------------------------------------------------ TRACK B - SCALING */
{ id:'b01', track:'b', lesson:26, link:'track-b/26-scaling-laws.html',
  q:'Kaplan versus Chinchilla: what changed, and why are the earlier scaling laws still useful?',
  a:'Kaplan et al. found loss as a power law in N, D and C but under-weighted data relative to parameters, so models of a given compute budget were too big for the data they saw. Chinchilla re-fit and showed compute-optimal training needs roughly 20 tokens per parameter, with loss scaling as a x N^-alpha + b x D^-beta + c. The Kaplan results still describe the shape, the exponents and the irreducible floor; Chinchilla corrected the allocation.' },

{ id:'b02', track:'b', lesson:28, link:'track-b/28-over-training.html',
  q:'Why is a model trained far past Chinchilla-optimal on its parameters a rational serving choice?',
  a:'If you pay for inference repeatedly and training once, the cost you minimise is total cost of ownership, not training loss. Training smaller models on far more tokens cuts inference FLOPs and memory per query. The optimum shifts as the ratio of inference volume to training cost grows, the same shift that made small-but-long-trained models the default.' },

{ id:'b03', track:'b', lesson:30, link:'track-b/30-moe.html',
  q:'In a sparse MoE layer, what is the trade between parameter count and FLOPs?',
  a:'Total parameters grow with the number of experts, since the router and all experts must be resident in memory, but FLOPs per token grow only with the number of active experts. So MoE decouples capacity from compute. The cost: you need all experts resident, so serving is memory-bound, and routing makes the computation data-dependent.' },

{ id:'b04', track:'b', lesson:31, link:'track-b/31-moe-routing.html',
  q:'What failure does an auxiliary load-balancing loss prevent, and what is the cost of the usual fix in an auxiliary-loss-free scheme?',
  a:'Without a balancing signal the router collapses onto a few experts: the chosen experts get more gradient, improve, and attract more tokens, a rich-get-richer loop that wastes capacity. The standard fix is an auxiliary loss penalising imbalance, but it competes with the language-model loss and distorts the routing objective. Auxiliary-loss-free balancing adjusts per-expert routing biases at update time instead, which keeps the router responsive to the task, but it is a heuristic controller that must be tuned or it can oscillate.' },

{ id:'b05', track:'b', lesson:33, link:'track-b/33-mla.html',
  q:'Why is MLA better than GQA when you cannot raise the KV head count, and what is the price?',
  a:'GQA lets heads share a single K/V head, so reducing heads reduces the expressiveness of the cache. MLA instead keeps per-head expressiveness by keeping a compact latent per token and reconstructing K and V per head through learned projections. So you keep distinct attention per head while storing far fewer bytes. The price is decode-time projection FLOPs and more complex kernels; the payoff is memory, which is the binding constraint on long contexts.' },

{ id:'b06', track:'b', lesson:35, link:'track-b/35-long-context.html',
  q:'Name three distinct costs that grow with context length, and say which dominated first as contexts grew.',
  a:'KV-cache memory grows linearly. Attention compute grows quadratically in vanilla attention and less with sparse methods. Prefill latency grows with prompt length, because the whole prompt must be processed before the first output token. Prefill latency and cache memory dominated first in practice; sparse attention and token-wise compression attack the compute and memory terms respectively.' },

{ id:'b07', track:'b', lesson:34, link:'track-b/34-dsa.html',
  q:'DeepSeek Sparse Attention: what gets sparsified, and what breaks if you sparsify the wrong thing?',
  a:'Sparse attention selects a subset of key positions per query so attention operates over a sparse pattern rather than a dense n x n block, reducing compute and memory traffic toward O(n x k). If the selector is wrong or trained on the wrong distribution, the model loses long-range recall patterns. It shows up as tasks needing exact retrieval from far back in context suddenly failing while local fluency stays intact.' },

{ id:'b08', track:'b', lesson:37, link:'track-b/37-encoder-decoder.html',
  q:'Why does an asymmetric 8B-input / 16B-output active split make sense for agentic work?',
  a:'Agent workloads are prefill-heavy on input, with large context from tool results, files and history, but require high-quality decoding for reasoning tokens and precise edits. If input and output share one stream you over-pay for encoding and under-invest in generation quality. Splitting them spends capacity where quality actually lands. The metric to watch is cost per usable task completion, not cost per token.' },

{ id:'b09', track:'b', lesson:38, link:'track-b/38-flash-attention.html',
  q:'FlashAttention is exact. So what is it optimising, and why does that matter?',
  a:'It re-orders computation in tiles that fit in shared memory, avoiding materialising the full n x n attention matrix in high-bandwidth memory. The arithmetic is the same; the number of HBM round-trips is not. Attention is memory-bandwidth-bound, not FLOP-bound, so reducing traffic is the win. That is why it is exact and still much faster, and why long context only became practical after IO-aware implementations.' },

{ id:'b10', track:'b', lesson:42, link:'track-b/42-parallelism.html',
  q:'Tensor parallelism splits weights. What communication does it force at every layer, and why does that limit it to a node?',
  a:'Each rank holds a shard of a matrix; the matmul output is a partial sum, so ranks must all-reduce or all-gather activations per layer, synchronously. The volume is proportional to the activation size and the frequency is per layer per token, so latency demands fast interconnect, NVLink-class speed within a node rather than across it. That is why tensor-parallel size is bounded by the NVLink domain and pipeline or data parallelism handle the rest.' },

{ id:'b11', track:'b', lesson:43, link:'track-b/43-training-cost.html',
  q:'Give the standard FLOPs estimate for training and explain the leading factor.',
  a:'Training FLOPs is approximately 6 x N x D, where N is parameters and D is training tokens. The factor is 2 for the forward pass, one multiply-add per parameter per token, and 4 for the backward pass, twice the forward cost, giving 6. GPU-hours equals FLOPs divided by achieved FLOPS; achieved FLOPS is peak scaled by model FLOPs utilisation, typically well below peak.' },

{ id:'b12', track:'b', lesson:45, link:'track-b/45-caching.html',
  q:'Why does prefix caching save money while adding almost no compute?',
  a:'A prefix cache stores the KV state of the processed prompt prefix, so a request sharing that prefix skips prefill for those tokens entirely: just reuse, no attention over them. Savings scale with prefix length and repetition. The trap: the cache is only valid if the prefix is byte-identical, so adding a timestamp to the system prompt or reordering tools silently destroys hit rate with no error.' },

{ id:'b13', track:'b', lesson:40, link:'track-b/40-precision-quant.html',
  q:'Why does quantising weights help more than quantising activations, and why does quantising the KV cache help most of all?',
  a:'Weights are static and near zero-mean, so calibration methods like GPTQ and AWQ cut their error well; activations have per-token outliers, so naive activation quantisation loses far more accuracy. The KV cache is the largest growing tensor during long-context decode, so per-element bit reduction multiplies into a large memory win, and memory is the binding constraint. It is also the riskiest to quantise, since attention is sensitive to K precision.' },

{ id:'b14', track:'b', lesson:29, link:'track-b/29-emergence.html',
  q:'Why can an emergent capability appear as a metric artifact rather than a sudden jump in underlying ability?',
  a:'If the metric is discontinuous, such as exact-match accuracy on a multi-step task, while the underlying competence improves smoothly, accuracy stays near zero until the model can complete almost every step, then rises steeply. Switch to a continuous metric, such as token-level accuracy or the log-probability of the correct answer, and the smooth improvement is visible. Much apparent emergence is metric discreteness, but not all, so test with a continuous metric before concluding either way.' },

{ id:'b15', track:'b', lesson:47, link:'track-b/47-multimodal.html',
  q:'What is the key architectural difference between bolted-on vision and native multimodal input?',
  a:'Bolted-on: a vision encoder projects patches into tokens prepended to the text stream, so the model sees images as a foreign language it learned late. Native: the model is trained from the start with interleaved modalities, so representations are jointly learned and cross-modal reasoning is not a second task layered on top. The practical tell is whether image tokens share the same positional and attention machinery as text tokens.' },

/* ------------------------------------------------ TRACK C - POST-TRAINING */
{ id:'c01', track:'c', lesson:52, link:'track-c/52-sft.html',
  q:'Why does SFT teach format far better than it teaches new knowledge or reasoning ability?',
  a:'SFT is imitation on a small curated set: it shifts the output distribution toward the demonstrated style, structure and refusal behaviour. New facts need many exposures with reliable supervision, which SFT data rarely provides; reasoning quality needs a search signal that next-token imitation cannot give. That is the whole reason post-training splits into SFT for format and RL for capability.' },

{ id:'c02', track:'c', lesson:55, link:'track-c/55-dpo.html',
  q:'Write the DPO loss and explain what it replaces.',
  a:'L equals the negative log sigmoid of beta x (log pi_theta(y_w|x) - log pi_ref(y_w|x) - log pi_theta(y_l|x) + log pi_ref(y_l|x)), where y_w is preferred over y_l, pi_ref is the frozen SFT reference policy, and beta controls divergence from it. It replaces a separate reward-model-plus-PPO loop with a single supervised-style loss whose optimum is the same KL-regularised reward-maximising policy.' },

{ id:'c03', track:'c', lesson:56, link:'track-c/56-grpo.html',
  q:'GRPO replaces a value network. What does it use instead, and what new failure does that introduce?',
  a:'For each prompt it samples a group of G completions and uses the group mean, often with the standard deviation, as the baseline, so the advantage is (r_i - mean) / std. No critic model to train. The failures: zero-variance groups, where all rewards are equal so the advantage is zero and that prompt contributes no learning signal at all; length bias, since longer answers may be systematically rewarded; and total dependence on reward-model or verifier quality, with no value model to smooth estimation error.' },

{ id:'c04', track:'c', lesson:57, link:'track-c/57-ppo.html',
  q:'Why is PPO the expensive option for LLM RL, in terms of models in memory?',
  a:'PPO for LLMs needs a policy, a frozen reference policy for the KL penalty, a reward model, and a value or critic model: four large models alive during training, plus the rollout buffer. PPO also needs careful advantage normalisation and clipping. Simpler alternatives like DPO and GRPO trade the critic for a cheaper baseline and accept slightly worse credit assignment.' },

{ id:'c05', track:'c', lesson:63, link:'track-c/63-verifiable-rewards.html',
  q:'Why is verifiable reward the strongest training signal, and what are its two hard limits?',
  a:'Verifiable reward, from unit tests, exact match or a proof checker, is deterministic, cheap, and cannot be argued with: the model cannot talk its way past a failing test. Limits: coverage, because only tasks with a genuine checker can use it, which excludes open-ended domains; and shortcut, because the model can satisfy the checker without satisfying the intent by hardcoding inputs or special-casing. That is why held-out tests and generation-based checks are required.' },

{ id:'c06', track:'c', lesson:60, link:'track-c/60-chain-of-thought.html',
  q:'Why do intermediate tokens improve a transformer effective capability at all?',
  a:'A fixed-depth transformer has a fixed amount of serial computation per token; the final output is computed in one forward pass of L layers. Writing intermediate tokens lets each step condition on the previous ones, so computation is serialised across generated tokens, buying depth the network does not have. The cost is inference tokens, which is exactly why test-time compute is a tradeable resource.' },

{ id:'c07', track:'c', lesson:62, link:'track-c/62-long-cot-r1.html',
  q:'What did R1-Zero show that changed how people think about reasoning, and what did it get wrong?',
  a:'R1-Zero was RL on a base model with verifiable rewards and essentially no SFT reasoning traces, and reasoning length and accuracy still grew, showing reasoning can emerge from RL alone. What went wrong: readability and language mixing collapsed, so the traces were unusable as products. The R1 pipeline added cold-start SFT and rejection-sampling distillation to keep the capability and fix the surface. Capability came from RL; usability came from SFT.' },

{ id:'c08', track:'c', lesson:61, link:'track-c/61-test-time-compute.html',
  q:'Best-of-n sampling with a verifier: why can this beat just sampling more, and when is it wasted compute?',
  a:'Sampling n times and taking the majority or the verifier-best improves coverage, since you only need one success, so it beats greedy under a good verifier. It is wasted if the verifier is weak or biased, if the model is confidently and consistently wrong so all n samples agree, or if marginal returns fall below the marginal token cost. Adaptive budgeting, spending more only where confidence is low, dominates a fixed n.' },

{ id:'c09', track:'c', lesson:75, link:'track-c/75-reward-hacking.html',
  q:'Give three concrete reward-hacking patterns and the invariant or gate that catches each.',
  a:'Checker exploitation, special-casing test inputs, caught by held-out tests generated after the fact. Spec gaming, satisfying the literal metric while violating intent, such as deleting asserts or returning constants, caught by intent-level invariant checks the model cannot edit. Reward-model flattery, verbose hedged answers that score well, caught by length-normalised scoring plus a human audit sample. In all three the gate must live outside the model write path.' },

{ id:'c10', track:'c', lesson:68, link:'track-c/68-self-feedback.html',
  q:'Why does self-feedback RL work at all, and what is the failure mode when you remove external verification?',
  a:'It works because the model has an internal notion of quality that is better than its generation ability: critiquing is easier than producing. RL against its own critique can improve generation. Without external verification it drifts toward self-consistent, internally flattering outputs, because the critique and the generation co-adapt into a closed loop. You need a fixed external anchor, a held-out check or a human audit, to detect the drift.' },

{ id:'c11', track:'c', lesson:70, link:'track-c/70-tool-use-training.html',
  q:'Why is thinking in tool-use a training change and not just a prompt change?',
  a:'When thinking is trained interleaved with tool calls, the model learns to reason after observing a tool result, planning the next call from real evidence rather than from its guess about the result. Prompt-only interleaving cannot teach a model to condition its reasoning on outcomes it was trained to ignore. The gain shows up specifically on multi-step tasks with mid-task surprises.' },

{ id:'c12', track:'c', lesson:66, link:'track-c/66-distilling-reasoning.html',
  q:'Rejection-sampling distillation: why does it work and where does the ceiling come from?',
  a:'You sample many traces from a strong reasoning model, keep only those that pass verification, and SFT a smaller model on them. It transfers distributional knowledge efficiently and cheaply. The ceiling is the teacher: a student trained on teacher traces cannot exceed teacher quality on cases where the teacher never finds a correct trace, and it inherits the teacher blind spots. Generation-based filtering also biases toward problems solvable within the sampling budget.' },

{ id:'c13', track:'c', lesson:58, link:'track-c/58-reward-modeling.html',
  q:'Why does a Bradley-Terry reward model become unreliable off-distribution, and how do you detect it before it poisons training?',
  a:'It is trained on pairwise comparisons from a specific policy and data distribution; the relationship between desired and assumed reward is only calibrated where data exists, and no ground truth anchors the absolute scale. Off-distribution, ranking can be arbitrary while confidence stays high. Detect it by measuring reward margins on held-out samples, checking calibration against independent judges, and monitoring reward-versus-verifier divergence per batch. Rising reward with a flat verifier score is the poisoning signature.' },

/* ------------------------------------------------ TRACK D - AGENTS */
{ id:'d01', track:'d', lesson:76, link:'track-d/76-agents.html',
  q:'Formally, what makes an agent different from a chain of model calls?',
  a:'Feedback and control: the agent observes the result of its action and conditions the next action on it, inside a bounded loop with a stopping rule and a resource budget. A chain never reads its own output. That one property creates both the capability and the failure modes: compounding errors, drift, and unbounded spend.' },

{ id:'d02', track:'d', lesson:82, link:'track-d/82-long-horizon.html',
  q:'If each step succeeds at 99%, what is end-to-end success at 100 steps, and what is the engineering consequence?',
  a:'0.99^100 is about 36.6%. At 200 steps it falls to about 13.4%. Consequences: short verified steps beat one long run; checkpoints let you resume from a verified state instead of the whole run; and you need explicit re-planning triggers, because a silent 1% error rate becomes a certainty over a long horizon.' },

{ id:'d03', track:'d', lesson:77, link:'track-d/77-tool-calling.html',
  q:'Why is a tool schema more consequential than the tool implementation in an agent system?',
  a:'The schema is the entire interface the model reasons over. Names, descriptions and parameter shapes determine whether the model calls it correctly, in the right order, with legal arguments. A brilliant implementation behind a vague schema is unusable; a correct call into a mediocre handler can be retried. Schema quality is the highest-leverage part of the tool layer.' },

{ id:'d04', track:'d', lesson:81, link:'track-d/81-subagents.html',
  q:'When is a swarm worse than a single agent? Name three conditions.',
  a:'When the work is not actually parallel, so subagents duplicate effort or contend for the same files. When the merge is more expensive than the work, so reconciling divergent edits costs more than doing it once with full context. When coordination overhead scales faster than the benefit, with token burn rising faster than verified output. A swarm is a parallelism mechanism, not a quality mechanism.' },

{ id:'d05', track:'d', lesson:84, link:'track-d/84-safety-sandboxing.html',
  q:'What is blast radius in agent design, and what are the three independent controls on it?',
  a:'Blast radius is the set of things the agent can destroy if it does the wrong thing. Controls: scope, meaning where it can write at all; reversibility, meaning whether there is a rollback via branches, dry runs or backups; and rate, meaning how much it can do before a human checkpoint. Each is independent, so tightening one does not compensate for another, and you should be able to state the blast radius in one sentence.' },

{ id:'d06', track:'d', lesson:88, link:'track-d/88-evals.html',
  q:'What does pass@k miss, and why does pass^k matter more for agents?',
  a:'pass@k measures whether any of k attempts succeeds, rewarding lottery-like behaviour. pass^k measures whether the same attempt succeeds k times: consistency. For unattended agents, consistency is what makes them deployable, because an agent that succeeds 1 in 10 times is worse than useless in a pipeline even though pass@10 looks great. Report both and weight consistency heavily.' },

{ id:'d07', track:'d', lesson:89, link:'track-d/89-llm-as-judge.html',
  q:'Name three biases of LLM judges and the specific design change that mitigates each.',
  a:'Position bias: randomly swap A and B order and average the verdicts. Verbosity bias: cap output length or score per-claim rather than whole answers. Self-preference: never use the same model family as both candidate and judge; use an independent family or a human-audited sample. All three are measured, not assumed, by calibrating against a human-labelled reference set.' },

{ id:'d08', track:'d', lesson:92, link:'track-d/92-reliability.html',
  q:'Why is idempotency essential for agent tool calls, and what makes a tool non-idempotent?',
  a:'Agents retry after partial failure. If an action has side effects that accumulate, such as sending an email, appending a record or charging, a retry duplicates it. A tool is non-idempotent when repeating it changes the world differently from doing it once. The fix is to require an idempotency key per logical action and have the tool return the prior result for a repeated key, so the model can retry safely.' },

{ id:'d09', track:'d', lesson:94, link:'track-d/94-determinism.html',
  q:'Even at temperature 0, outputs can differ between runs. Name four causes.',
  a:'Batching changes floating-point reduction order, and with MoE routing it changes which experts receive which tokens. Kernel and numerics differences produce tiny differences that amplify. MoE routing ties exactness to token order. Serving version drift covers model, tokenizer or server updates. Treat determinism as a property to be tested, not assumed, and record model, version and harness configs in every run.' },

{ id:'d10', track:'d', lesson:95, link:'track-d/95-rake-reporting-harness.html',
  q:'Why must the ledger live outside the agent writable workspace?',
  a:'If the agent can write the record, the record is a claim, not evidence. An agent that has drifted, or was manipulated by injected content, can rewrite its own history and erase the divergence. The ledger must be append-only, hash-chained, and written by a component the agent cannot reach; otherwise every downstream verification is circular.' },

{ id:'d11', track:'d', lesson:98, link:'track-d/98-finetune-vs-rag.html',
  q:'Fine-tune, RAG, or prompt: what is the decision rule, in one sentence each?',
  a:'Prompt when the behaviour is instruction-shaped and the knowledge is small: fastest and easiest to change. RAG when the knowledge changes or is too large to bake in, and freshness or citations matter. Fine-tune when the behaviour is a stable pattern the model cannot be talked into, such as formatting at scale, a domain style, or a specific tool protocol, and never to inject facts you will need to update.' },

{ id:'d12', track:'d', lesson:83, link:'track-d/83-swarms.html',
  q:'What property must a ledger have for multi-agent verification to be meaningful?',
  a:'Independence: no agent may be able to write another agent record or the verifier verdict, and the verifier must not share state with the agent it judges. Otherwise swarm verification is self-attestation, and the cryptographic chain certifies consistency of a lie. A hash chain proves the record was not altered; it says nothing about whether the claim inside it is true.' },

{ id:'d13', track:'d', lesson:82, link:'track-d/82-long-horizon.html',
  q:'What is drift in a long-horizon agent, and what two signals detect it before failure is visible?',
  a:'Drift is the gradual divergence of the agent behaviour from the behaviour that was audited, driven by context growth, summarisation loss and stale state. Early signals: rising token count per completed subtask, meaning the agent is re-reading context it should have held; and a falling rate of verifiable claims versus narrative claims. Both appear before output quality visibly collapses.' },

{ id:'d14', track:'d', lesson:96, link:'track-d/96-production-checklist.html',
  q:'Give the four questions every agent run must answer from its record alone, and the one that is usually missing.',
  a:'What exactly was the configuration. What was claimed. What independently verified each claim. Who can prove the chain is intact. The usually missing one is independent verification: most systems log what the agent did, not what an independent oracle concluded about it. Without it a run can demonstrate activity but not truth.' },

{ id:'d15', track:'d', lesson:90, link:'track-d/90-observability.html',
  q:'Why does cost attribution per phase change agent behaviour more than a total cost counter?',
  a:'A total tells you the run was expensive. Per-phase attribution tells you which phase burned it: context re-reading, tool retries, or reasoning tokens. Only the latter supports a decision, and it lets the agent act on it, because a phase with poor cost per verified outcome can be down-weighted next cycle. Measurement at the right granularity is an optimisation, not just monitoring.' },

/* ------------------------------------------------ AGI LAB */
{ id:'z01', track:'d', lesson:76, link:'../agi/index.html',
  q:'SKILLA: why is authority granted per-skill rather than per-agent?',
  a:'An agent is a heterogeneous bundle of competences. A single autonomy level forces the weakest or the strongest skill to govern everything, either blocking the good skills or over-granting the bad ones. Per-skill authority is measurable, decays independently, and localises the blast radius of a single bad skill to the actions that depend on it.' },

{ id:'z02', track:'d', lesson:88, link:'../agi/benchmark.html',
  q:'Why is FABLE a product rather than a sum of its components?',
  a:'Because the components are not independently compensable. A record with perfect answerability and zero integrity is falsified evidence; a system that answers everything but lies about outcomes has zero replication. Multiplication means no amount of good bookkeeping can compensate for a broken chain or a false claim, which is exactly the property an auditability score needs.' }
];
