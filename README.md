# Q-PRISM

Human/organoid/neural streams as high-dimensional control signals for macroscopic matter-wave interferometry.

This repository starts from a conservative scientific frame:

- A 2026 Nature matter-wave interferometry result reports quantum interference of sodium nanoparticles containing more than 7,000 atoms and masses greater than 170,000 Da, with macroscopicity `mu = 15.5`: <https://www.nature.com/articles/s41586-025-09917-9>
- Meta/BCBL Brain2Qwerty v2 reports non-invasive MEG typed-sentence decoding, and the public SpanishBCBL/DECOMEG dataset provides MEG+EEG typing recordings under CC BY-NC 4.0: <https://huggingface.co/datasets/bcbl190626/SpanishBCBL>
- Neither result proves consciousness couples to a quantum experiment.
- Q-PRISM is the testable bridge: use neural/consciousness-derived streams as high-dimensional control and hypothesis signals, then compare them against random and classical optimizers on interferometer prediction/control tasks.

## Core Claim

Q-PRISM does **not** claim that consciousness directly collapses or projects into matter waves.

It asks a sharper experimental question:

> Can a prismed neural or organoid-derived stream improve prediction, control, anomaly discovery, or schedule selection in macroscopic quantum-interference experiments beyond random, classical ML, and human-only baselines?

## Current Liris Simulator

The simulator is now a dependency-free spatial near-field Talbot-Lau scaffold calibrated to the Nature apparatus at one operating point and constrained by a Fig. 2b eye-digitized G2-response envelope plus Fig. 3 text anchors.

Measured anchor from the paper/PDF extraction:

- grating period `d = 133 nm` from 266 nm UV gratings
- grating separation `L = 0.983 m`
- sodium cluster mean mass about `172 kDa`
- beam velocity about `160 m/s`
- reported visibility `V = 0.10 +/- 0.01` at `P2 = 15.2 mW`

The model uses the spatial Talbot ratio

```text
rho = L / L_T = L * h / (d^2 * m * v)
```

so the lawful controls are middle-grating power, velocity-window selection, mass-window selection, and analysis schedule. It is `MEASURED_SIM_FIG2B_EYE_DIGITIZED_CURVE_ENVELOPE`, not a hardware result or source-data-table full-curve fit.

## Layers

1. **Physics layer**
   - Models the sodium nanoparticle spatial Talbot-Lau regime.
   - Exposes lawful control channels: G2 laser power, velocity-bin selection, mass-bin selection, flux, SNR, Talbot `rho`, and fringe visibility.

2. **Prism layer**
   - Converts neural/semantic/time-series input into high-dimensional control proposals.
   - Brain2Qwerty anchors the first real neural-language path: constrained typed-sentence MEG/EEG decoding, not arbitrary thought reading.
   - Starts with deterministic synthetic streams and public/offline SpanishBCBL-derived event features; later accepts live EEG, BCI, organoid, or Neuralink-style streams only under explicit ethics and consent gates.

3. **Experiment layer**
   - Runs blinded schedule comparisons:
     - random control
     - classical scan optimizer
     - Q-PRISM neural/prism schedule
   - Runs a coupling sweep: pure-noise prism must lose, high-coupling prism must win before the harness calls the signal useful.

4. **Claims gate**
   - A positive result may support: `neural-prism signal improves experimental control`.
   - It does not support: `consciousness entered the wavefunction`, unless a separate experiment directly proves that mechanism.

## Run

```powershell
npm test
npm run simulate
npm run compare
npm run quant:spanishbcbl
```

Current measured simulator output on the Liris branch:

```text
operating_point_visibility=0.09999 target=0.10 evidence=MEASURED_SIM_FIG2B_EYE_DIGITIZED_CURVE_ENVELOPE
QPRISM_COUPLING_SWEEP|schema=qprism.coupling_sweep.v1|seeds=24|steps=32|self_validation=PASS|zero_delta=-0.033558|high_delta=0.035142|physics=spatial_talbot_lau_fig2b_eye_digitized_curve_envelope|evidence=MEASURED_SIM|json=0
```

## Repository Map

- `docs/source-triad.md` - how ComPilot, Nature 2026, Brain2Qwerty, and the Asolaria report fit together.
- docs/brain2qwerty-neural-decoding-anchor.md - neural-stream decoding anchor and claims boundary.
- docs/spanishbcbl-stage2-integration-plan.md - no-raw-data Stage 2 plan for SpanishBCBL events/features.
- `docs/spatial-talbot-lau-calibration.md` - the calibrated simulator boundary.
- `docs/nature-2026-metal-cluster-interferometry.md` - physics anchor.
- `docs/research-program.md` - staged Q-PRISM roadmap.
- `docs/claims-gate.md` - what can and cannot be claimed.
- `docs/ethics-and-human-subjects.md` - consent and safety gates.
- `src/qprism-simulator.mjs` - dependency-free spatial Talbot-Lau simulator scaffold.
- `src/qprism-control-policy.mjs` - deterministic schedule/control proposal utilities.
- src/qprism-experiment.mjs - comparison and coupling-sweep harness.
- src/qprism-quant-chunk.mjs - SpanishBCBL metadata-to-quant control tuple probe, derived-only and raw-data-free.
- host8/qprism_graphify_selector.rs - no-Node/no-JSON Host8 selector contract for Graphify V3 / HyperBEHCS 60D alignment.
- host8/QPRISM-HOST8-GRAPHIFY-SELECTOR-2026-07-01.hbp - tuple-text selector-axis receipt, `json=0`, `agentterms_fedenv_fire=0`.
- docs/ACTIVE-GLYPH-CARET-LENS.md - disputed CARET artifact handled only as gated active-symbolic-geometry design lens (`compile=0`, `interpret=0`, `fire=0`).
- docs/DIGITAL-PHYSICS-EXPANDABLE-SPACE-LENS.md - Brown-Hilbert slice expansion law for injecting PID-addressable points between space/time slices (`json=0`, `fire=0`).
- docs/PRISM-COMB-COLLISION-DUALITY-MAP.md - forward comb collision-avoidance and backward prism collision-causation map (`QPRISMCOMBPRISM`, `json=0`, `fire=0`).
- `test/qprism-smoke.test.mjs` - physics and policy smoke tests.
- `test/qprism-experiment.test.mjs` - comparison and self-validation tests.
