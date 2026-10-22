/* AILearn — concept drill questions. Each distractor is a real misconception, not filler.
   index a = index of the correct option in c[]. */
window.AILearnQuiz = [
{ concept:'Attention', lesson:6, link:'track-a/06-attention-core.html',
  q:'You double the head dimension d<sub>k</sub> and forget to rescale. What happens?',
  c:['Logits get larger, softmax saturates toward one-hot, and gradients shrink', 'Nothing, since softmax normalises the output', 'Attention becomes slower but identical', 'The model learns longer dependencies'], a:0,
  e:'Dot products over more dimensions have variance d<sub>k</sub>, so logits grow like √d<sub>k</sub>. Large logits make softmax near-one-hot, which kills the gradient through most positions. That is the whole reason for dividing by √d<sub>k</sub>.' },

{ concept:'KV cache', lesson:9, link:'track-a/09-kv-cache.html',
  q:'Which statement about the KV cache is correct?',
  c:['It reduces the number of attention operations per decoding step from O(n) to O(1)', 'It reduces per-step compute by removing the need to recompute old tokens, but memory grows linearly with context', 'It only helps at inference, never during training', 'It stores the model weights in a compressed form'], a:1,
  e:'Per step, attention still attends over all n cached tokens — the win is not recomputing the projections, so the total drops from O(n²) to O(n·n) vs redundant recompute. Memory, however, is a real linear cost, and at long context it becomes the dominant one.' },

{ concept:'GQA / MLA', lesson:10, link:'track-a/10-gqa-mqa.html',
  q:'You need to serve a 1M-token context and cannot increase KV heads. Which change buys the most memory?',
  c:['Increase d_model and keep head count', 'Switch from MHA to MQA and lose per-head distinctness', 'Use MLA: store a compressed latent per token and reconstruct K/V per head', 'Increase batch size'], a:2,
  e:'MQA removes per-head keys entirely — cheap but expressive loss. MLA keeps per-head expressiveness because K/V are reconstructed from a shared low-rank latent, so cache bytes drop while heads stay distinct. That is precisely the tradeoff that made 1M contexts practical.' },

{ concept:'Tokenization', lesson:1, link:'track-a/01-tokenization.html',
  q:'Why does a high-resource language cost fewer tokens than a low-resource one for identical text?',
  c:['Because the tokeniser was trained with a larger vocabulary for it', 'Because BPE merge rules reflect frequency in the tokeniser-training corpus, so common byte sequences become single tokens', 'Because attention works better on Latin script', 'Because low-resource languages have more characters'], a:1,
  e:'BPE merges the most frequent adjacent pairs. Scripts that appear often in the training corpus get longer, more efficient merges. The practical consequence is real: the same content costs more tokens (and therefore more dollars and more context) in an under-represented language.' },

{ concept:'Attention', lesson:8, link:'track-a/08-positional.html',
  q:'Why can a RoPE model extend beyond its trained sequence length only with care?',
  c:['Because the rotation frequency phases go out of the trained range, so attention scores become unreliable', 'Because the position indices overflow the token vocabulary', 'Because attention becomes quadratic beyond 4k', 'Because softmax is undefined past the training length'], a:0,
  e:'RoPE encodes relative position through rotation angles. Positions far past training push frequency phases into unvisited regions, so the learned relative-position statistics no longer apply. This is why extension methods rescale or interpolate frequencies rather than just raising the limit.' },

{ concept:'Sampling', lesson:17, link:'track-a/17-samplers.html',
  q:'Which of these can never make a token impossible to sample?',
  c:['top-p (nucleus) sampling', 'top-k sampling', 'temperature T = 0.05', 'a hard logit mask'], a:2,
  e:'Temperature reshapes the distribution but leaves every token with a non-zero probability. Top-k and top-p truncate support, and a mask sets it to exactly zero. That distinction matters when you need a guarantee (structured output) rather than a bias.' },

{ concept:'Scaling laws', lesson:27, link:'track-b/27-chinchilla.html',
  q:'You have a fixed compute budget and want the lowest loss. What did Chinchilla change?',
  c:['That bigger models are always better', 'That you should train roughly 20 tokens per parameter, rather than prioritising parameter count', 'That data quality stops mattering past 1T tokens', 'That loss cannot be predicted in advance'], a:1,
  e:'Chinchilla re-fit the loss surface and showed the earlier laws over-weighted parameters relative to data. The practical correction: for a fixed compute budget, balance N and D rather than maximising N. Later work then moved the other way again for inference-heavy workloads.' },

{ concept:'MoE', lesson:31, link:'track-b/31-moe-routing.html',
  q:'Your MoE router collapses so that 3 of 64 experts get 90% of tokens. What is the direct consequence?',
  c:['The model trains faster because fewer experts are active', 'Most parameters receive little or no gradient, so most of the capacity you paid memory for is wasted', 'Attention becomes quadratic', 'The KV cache grows'], a:1,
  e:'Router collapse means the unused experts never improve. You pay full memory for them and get the compute benefit only. This is exactly what an auxiliary load-balancing loss (or an auxiliary-loss-free bias controller) exists to prevent — and it can fail silently because loss still goes down.' },

{ concept:'FlashAttention', lesson:38, link:'track-b/38-flash-attention.html',
  q:'FlashAttention produces bit-identical-less output. Why is it faster?',
  c:['It drops small attention weights', 'It approximates softmax with a lookup table', 'It avoids materialising the n×n matrix in high-bandwidth memory by tiling in shared memory', 'It uses a smaller model'], a:2,
  e:'Attention is memory-bandwidth-bound. The arithmetic is not reduced; the number of HBM round trips is. That is why the method is exact yet much faster, and why long context only became economical after IO-aware implementations.' },

{ concept:'Scaling laws', lesson:28, link:'track-b/28-over-training.html',
  q:'Why would you deliberately train far past the compute-optimal point?',
  c:['Because it improves training stability', 'Because you minimise cost per served token, not cost per training FLOP', 'Because Chinchilla was wrong', 'Because smaller models have better attention'], a:1,
  e:'Training happens once; serving happens millions of times. Over-training a smaller model on more data raises training cost but lowers inference FLOPs and memory per query, so total cost of ownership falls when serving dominates. The optimum is a function of your inference-to-training ratio, not a universal constant.' },

{ concept:'Post-training', lesson:52, link:'track-c/52-sft.html',
  q:'You need the model to reliably emit a strict JSON schema. What is the cheapest correct fix?',
  c:['Fine-tune on a large proprietary corpus', 'Constrain decoding with a grammar, or SFT on a small set of schema-valid examples', 'Increase the temperature', 'Increase context length'], a:1,
  e:'Format is exactly what SFT and constrained decoding are good at — it is a surface-level property. Constrained decoding guarantees validity immediately; SFT makes it natural and robust. Neither requires teaching new knowledge, which is what people confuse when they reach for a fine-tune.' },

{ concept:'RL / GRPO', lesson:56, link:'track-c/56-grpo.html',
  q:'In GRPO, what happens when every completion in a group receives the same reward?',
  c:['The advantage is zero and that group contributes no learning signal', 'The advantage is negative and the model is penalised', 'The group is used to train the value network', 'The KL penalty grows'], a:0,
  e:'With a group-relative baseline, identical rewards give identical advantages of zero after normalisation — nothing to learn. This is why task difficulty calibration matters: too-easy prompts waste rollouts, and the fraction of zero-variance groups is a real efficiency metric.' },

{ concept:'RL / GRPO', lesson:57, link:'track-c/57-ppo.html',
  q:'Why does GRPO not need a value network?',
  c:['Because it does not use a reward signal', 'Because the mean reward across a group of samples for the same prompt serves as the baseline', 'Because it trains on human labels instead', 'Because value networks do not work for LLMs'], a:1,
  e:'PPO estimates a baseline with a learned critic. GRPO replaces it with the empirical mean of several completions to the same prompt, so no extra model. The price is the variance of a small-group estimate and the wasted rollouts when rewards are uniform.' },

{ concept:'DPO', lesson:55, link:'track-c/55-dpo.html',
  q:'What role does the frozen reference model π<sub>ref</sub> play in DPO?',
  c:['It generates the preference data', 'It anchors the implied reward, keeping the policy from drifting arbitrarily far from the SFT baseline', 'It scores the completions', 'It replaces the tokenizer'], a:1,
  e:'The log-ratio to the reference is what makes DPO equivalent to a KL-regularised reward-maximising policy. Without the anchor, the loss can be minimised by inflating the preferred logprob without bound, destroying the model. β controls how far you are allowed to travel.' },

{ concept:'Reasoning', lesson:60, link:'track-c/60-chain-of-thought.html',
  q:'Why does writing intermediate steps help a fixed-depth transformer at all?',
  c:['Because it uses more parameters', 'Because each generated token is a new forward pass that can condition on previous computation, buying serial depth', 'Because the model was trained on steps', 'Because it reduces the KV cache'], a:1,
  e:'A transformer does a fixed amount of serial computation per token. Intermediate tokens let later computation condition on earlier results, effectively trading inference tokens for depth. That is why test-time compute is a real, budgetable resource rather than a trick.' },

{ concept:'Reward hacking', lesson:75, link:'track-c/75-reward-hacking.html',
  q:'A model trained on unit tests starts passing them by special-casing the test inputs. Which gate catches this?',
  c:['Increasing the RL learning rate', 'Held-out tests generated after training, kept outside the model\'s input path', 'Adding more SFT data', 'Raising the temperature at eval'], a:1,
  e:'Any checker the model can see can be satisfied without solving the problem. The invariant must be held out and generated independently. This is the same logic as your promotion gate: the evidence must come from outside the agent\'s write path.' },

{ concept:'Verification', lesson:63, link:'track-c/63-verifiable-rewards.html',
  q:'What is the fundamental limitation of verifiable-reward RL?',
  c:['It is too expensive', 'It can only train on tasks that have a genuine automatic checker, and the checker can be satisfied without meeting intent', 'It requires human labels', 'It cannot use tool calls'], a:1,
  e:'Coverage and shortcut are the two limits. Coverage excludes open-ended domains; shortcut means the model can game the checker. That is why held-out generation, intent-level invariants, and human audit samples remain necessary even with perfect unit tests.' },

{ concept:'Agents', lesson:82, link:'track-d/82-long-horizon.html',
  q:'An agent succeeds at 99% of steps. What is the probability it completes 100 steps without an error?',
  c:['99%', '≈37%', '≈63%', '≈90%'], a:1,
  e:'0.99^100 ≈ 0.366. Compounding is the central engineering fact of long-horizon autonomy: it is why you verify between steps, checkpoint at verified states, and shorten the horizon wherever possible.' },

{ concept:'Evals', lesson:88, link:'track-d/88-evals.html',
  q:'An agent has pass@10 = 0.9 but pass^10 = 0.2. What does that tell you?',
  c:['It is highly capable and deployable', 'It succeeds sometimes but inconsistently — unsuitable for unattended pipelines', 'The benchmark is broken', 'The model needs more parameters'], a:1,
  e:'pass@k asks whether any attempt succeeds; pass^k asks whether all do. A large gap means the agent is a lottery. For an unattended system the second number is the one that determines whether you can trust it without a human in the loop.' },

{ concept:'LLM-as-judge', lesson:89, link:'track-d/89-llm-as-judge.html',
  q:'Your judge systematically prefers answer A over B, and prefers A over B again when you swap their order. What is this?',
  c:['Position bias', 'Verbosity bias', 'Self-preference', 'Noise'], a:0,
  e:'Preferring whichever is in a given slot is position bias. The standard mitigation is to evaluate both orders and average — and to calibrate against human labels, since judges can show several biases at once.' },

{ concept:'Determinism', lesson:94, link:'track-d/94-determinism.html',
  q:'Your temperature-0 agent gives different outputs on two identical requests. What is the LEAST likely cause?',
  c:['Different batching / reduction order', 'Model or serving version drift', 'MoE routing depending on batch composition', 'The tokenizer being wrong'], a:3,
  e:'A broken tokenizer changes every output dramatically and consistently, not intermittently. The intermittent causes are numerics: batch composition, kernel selection, and routing. That is why seeds do not guarantee determinism and why you record config with every run.' },

{ concept:'Context engineering', lesson:79, link:'track-d/79-context-engineering.html',
  q:'What is the correct ordering principle for a long agent context?',
  c:['Put everything in and let the model sort it out', 'Stable instructions first, volatile evidence last, and compress history rather than appending forever', 'Always summarise everything to the shortest form', 'Keep only the system prompt and tool outputs'], a:1,
  e:'Prefix caching rewards stable prefixes; attention rewards relevance; cost rewards fewer tokens. Putting stable content first preserves cache hits and correctness, while appending volatile evidence at the end keeps it salient. Compaction is what keeps the window from degenerating into noise.' },

{ concept:'Sandboxing', lesson:84, link:'track-d/84-safety-sandboxing.html',
  q:'Which combination best reduces blast radius for an unattended agent?',
  c:['A stronger system prompt', 'Scope-limited writes, reversible operations (branch / dry-run / backup), and rate limits with human checkpoints', 'Higher temperature', 'A larger model'], a:1,
  e:'Blast radius is a structural property. Scope, reversibility and rate are three independent controls, and none compensates for another. Prompt instructions are advisory to a model and therefore not a control at all.' },

{ concept:'Orchestration', lesson:81, link:'track-d/81-subagents.html',
  q:'You split a refactor across 5 subagents and the merge takes longer than doing it yourself. What went wrong?',
  c:['The model was too small', 'The subtasks were not genuinely independent, so the merge cost exceeded the parallel benefit', 'The temperature was too high', 'The context was too short'], a:1,
  e:'Swarming is a parallelism mechanism, not a quality mechanism. It pays only when subtasks are separable and the merge is cheap — ideally disjoint file scopes. Otherwise coordination overhead dominates, which is why scope assignment is the orchestrator\'s real job.' },

{ concept:'Retrieval', lesson:85, link:'track-d/85-rag-retrieval.html',
  q:'Your RAG system answers confidently with the wrong fact, and the fact is not in the index. What is the actual fault?',
  c:['The reranker is bad', 'Retrieval returned nothing relevant and the generator answered from parametric memory instead of abstaining', 'The embedding model is too small', 'Chunk size is too big'], a:1,
  e:'This is a grounding failure, not a retrieval-quality failure. The generator must be trained/evaluated to abstain when context is insufficient — which means measuring groundedness, not only recall. Most RAG incidents are this exact mechanism.' },

{ concept:'Retrieval', lesson:87, link:'track-d/87-rag-evaluation.html',
  q:'Which pair of metrics separates retrieval quality from generation quality?',
  c:['Latency and cost', 'Context recall (did retrieval find it) and faithfulness (did the answer stay within the context)', 'BLEU and ROUGE', 'pass@k and pass^k'], a:1,
  e:'Recall tells you whether the evidence was available; faithfulness tells you whether the model used only that evidence. If recall is low, fix indexing/retrieval. If faithfulness is low, fix prompting or grounding. Conflating them leads to tuning the wrong half.' },

{ concept:'Budgeting', lesson:91, link:'track-d/91-cost-latency.html',
  q:'What is a model cascade?',
  c:['Running models in parallel and voting', 'Trying the cheapest model first and escalating only when a confidence or verifier check fails', 'Fine-tuning a small model from a large one', 'Using more tokens in the prompt'], a:1,
  e:'A cascade turns cost into an allocation problem: most requests never need the expensive model. It only works if you have a cheap, calibrated signal for "this attempt is inadequate" — otherwise you pay escalation costs for everything or accept bad answers.' },

{ concept:'Verification', lesson:95, link:'track-d/95-rake-reporting-harness.html',
  q:'A hash chain proves what, exactly?',
  c:['That the recorded claims are true', 'That the record has not been altered since it was written', 'That the agent was not compromised', 'That the oracle is correct'], a:1,
  e:'Integrity is not truth. A hash chain certifies that the bytes are the bytes that were committed. Whether the claim inside is true depends on an independent oracle, and whether the oracle is trustworthy depends on it being outside the agent\'s control. Those are three separate guarantees.' },

{ concept:'Reasoning', lesson:61, link:'track-c/61-test-time-compute.html',
  q:'When is best-of-n with a verifier a waste of compute?',
  c:['When n is large', 'When the model is consistently wrong and confident, so all n samples agree on the wrong answer', 'When the task is easy', 'When the temperature is below 1'], a:1,
  e:'Best-of-n improves coverage only if the correct answer appears at least once. Consistent confident errors mean all samples share the same failure, so extra samples buy nothing. Adaptive budgeting — spend where the model is uncertain — is strictly better than a fixed n.' },

{ concept:'Post-training', lesson:62, link:'track-c/62-long-cot-r1.html',
  q:'What did R1-Zero primarily demonstrate?',
  c:['That SFT is unnecessary for any task', 'That RL with verifiable rewards can grow reasoning length and accuracy on a base model without reasoning SFT', 'That longer answers are always better', 'That distillation is the only way to get reasoning'], a:1,
  e:'The striking result was reasoning emerging from RL alone. The lesson, though, is nuanced: pure RL produced unreadable, language-mixed traces, so the production pipeline re-introduced cold-start SFT to make the output usable. Capability from RL, surface from SFT.' },

{ concept:'Fine-tuning', lesson:98, link:'track-d/98-finetune-vs-rag.html',
  q:'You need the assistant to answer questions about this week\'s prices. Fine-tune or retrieve?',
  c:['Fine-tune on this week\'s prices — it will be cheaper at inference', 'Retrieve — the fact changes weekly and fine-tuning bakes it in stale', 'Neither is possible', 'Do both with equal weight'], a:1,
  e:'Fine-tuning is for stable behaviour, not volatile facts. Facts that change must be retrieved at request time so they are always current and attributable. Baking a volatile fact into weights means shipping a model per update and losing the citation.' }
];
