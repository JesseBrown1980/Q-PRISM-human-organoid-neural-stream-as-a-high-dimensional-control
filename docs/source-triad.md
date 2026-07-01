# Source Stack

Q-PRISM should be read as the intersection of four sources, not as a free-floating consciousness claim.

## 1. Agentic auto-scheduling

Local source:

`C:\Users\rayss\Downloads\2511.00592v2.pdf`

Paper identified from local PDF text:

- title: `Agentic Auto-Scheduling: An Experimental Study of LLM-Guided Loop Optimization`
- venue marker: `2025 34th International Conference on Parallel Architectures and Compilation Techniques (PACT)`
- arXiv marker: `2511.00592v2 [cs.PL] 27 Dec 2025`

Why it matters for Q-PRISM:

- The method is not mystical. It is a closed-loop agentic scheduler.
- An LLM proposes schedules.
- A hard external environment accepts or rejects them and returns measured performance.
- The agent iterates from legality and speed feedback.

Q-PRISM imports that pattern directly:

```text
agent proposes interferometer schedule
physics/simulator/hardware returns legality + visibility + phase + noise metrics
agent updates schedule strategy
```

This is the software credibility spine. If Q-PRISM cannot beat baselines in this hard-feedback scheduling frame, it does not get to make stronger claims.

## 2. Macroscopic matter-wave interferometry

Local source:

`C:\Users\rayss\Downloads\s41586-025-09917-9.pdf`

Primary publication:

<https://www.nature.com/articles/s41586-025-09917-9>

Paper identified from local PDF text:

- title: `Probing quantum mechanics with nanoparticle matter-wave interferometry`
- published online: `21 January 2026`
- platform: sodium metal-cluster matter-wave interferometry
- scale: more than 7,000 atoms, mass greater than 170,000 Da
- reported macroscopicity: `mu = 15.5`

Why it matters for Q-PRISM:

- This is the physical target class.
- Q-PRISM schedules lawful controls around a spatial Talbot-Lau matter-wave interferometer: middle-grating power, velocity-bin selection, mass-bin selection, scan order, flux/SNR, and Talbot `rho`.
- The Nature result does not imply consciousness coupling. It gives a sensitive experimental platform where schedule quality can be tested.

## 3. Non-invasive brain-to-text decoding

Primary sources:

- Meta blog: <https://ai.meta.com/blog/brain2qwerty-brain-ai-human-communication/>
- Code: <https://github.com/facebookresearch/brain2qwerty>
- v2 paper PDF: <https://facebookresearch.github.io/brain2qwerty/assets/brain2qwerty_v2.pdf>
- v1 dataset: <https://huggingface.co/datasets/bcbl190626/SpanishBCBL>

Paper and repo facts verified from primary surfaces:

- Brain2Qwerty v2 is a non-invasive MEG typed-sentence decoder.
- v2 uses about 22,000 sentences from 9 participants, about 10 hours each.
- reported v2 performance is WER 39% on average, equivalent to about 61% word accuracy; best participant had half of decoded sentences at one word error or less.
- the released code includes `brain2qwerty_v1/` and `brain2qwerty_v2/`.
- the public v1 SpanishBCBL dataset is CC BY-NC 4.0; v2 data is not public in the GitHub README at this time.

Why it matters for Q-PRISM:

- It grounds the neural-stream premise in a real non-invasive language-decoding system.
- It supports typed-language or attempted-typing neural streams as the first realistic input adapter.
- It does **not** prove arbitrary thought reading, consciousness transfer, or quantum control.

## 4. Asolaria local-first self-refining substrate

Local source:

`C:\Users\rayss\Downloads\Asolaria_Technical_Report.md`

Relevant architecture from the report:

- BEHCS-1024 / Brown-Hilbert addressing as compact identifiers and receipts.
- generate -> score -> guard -> improve refinement loop.
- GNN scoring and hard-guard promotion.
- garbage collection of raw packet-level derivatives after distillation.
- explicit claim boundaries: no physics-transcending or consciousness claims without evidence.

Why it matters for Q-PRISM:

- Asolaria is the local substrate that can run the loop, encode schedule receipts, store compact evidence, and reject overclaims.
- The 100B-style packet/cube discipline is relevant as a data architecture, not as a reason to store raw streams.
- Q-PRISM should keep distilled schedules, hashes, metrics, and farmed insights; it should not hoard raw neural or biological data.

## Combined Research Sentence

Q-PRISM is an agentic auto-scheduler for macroscopic quantum-interference experiments, using Asolaria-style compact receipts and claim gates, with Brain2Qwerty-style neural-language streams treated as high-dimensional schedule priors rather than as proven consciousness-physics mechanisms.

## First Testable Claim

```text
A Q-PRISM policy improved predeclared simulator or hardware interferometer metrics over random and classical schedule baselines under blinded comparison.
```

## Claims Not Earned Yet

Do not claim yet:

- consciousness enters the wavefunction,
- organoids project mind into quantum matter,
- a neural stream controls collapse,
- a simulator result is a hardware result,
- schedule optimization proves quantum consciousness.

## Implementation Consequence

The branch-comparison harness should evaluate Acer and Liris branches by this spine:

1. Does it preserve the hard-feedback scheduling pattern from ComPilot?
2. Does it respect the Nature interferometer physics boundary?
3. Does it respect the Brain2Qwerty neural-decoding boundary?
4. Does it use Asolaria-style compact receipts and claim gates without overclaiming?
5. Does it improve measurable outcomes?

## Liris Implementation Update — 2026-07-01

The Liris branch corrected the first simulator from a generic toy phase model to a dependency-free spatial near-field Talbot-Lau scaffold. It is calibrated to the Nature operating point only:

```text
d=133 nm, L=0.983 m, v=160 m/s, m=172 kDa, P2=15.2 mW -> V ~= 0.10
```

Current self-validation result:

```text
QPRISM_COUPLING_SWEEP|schema=qprism.coupling_sweep.v1|seeds=24|steps=32|self_validation=PASS|zero_delta=-0.029946|high_delta=0.028933|physics=spatial_talbot_lau_one_point_calibrated|evidence=MEASURED_SIM|json=0
```

This is the branch-comparison baseline for Acer/Liris review: pure-noise prism must lose, high-coupling prism may win, and both remain simulator-level until hardware evidence exists.
