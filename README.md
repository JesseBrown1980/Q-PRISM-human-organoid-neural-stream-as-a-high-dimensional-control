# Q-PRISM — neural stream as a high-dimensional control (Acer build)

**Can a prismed neural/consciousness-derived signal improve prediction, control, or
discovery in a macroscopic quantum-interference experiment, beyond random and classical
baselines?** That is a *testable* question, and this repo is the apparatus for testing it —
in simulation first, with zero human or hardware risk.

> This is the **Acer** build (`acer/` branch). A parallel **Liris** build exists for
> bilateral comparison; GitHub is the mediator. See [Bilateral](#bilateral-build).

## The reframe (what this is NOT)

Q-PRISM is **not** "consciousness magically touches quantum matter" — that isn't testable
and would be a weak claim. The neural stream never touches a wavefunction. It is prismed
through Asolaria/HyperBEHCS into **lawful physical control parameters only** — middle-grating
laser power, velocity-window and mass-filter selection — and evaluated against a physics
simulator of the interferometer. See [`docs/CLAIMS-GATE.md`](docs/CLAIMS-GATE.md).

## Physics layer — calibrated to a real experiment

The simulator is a **spatial near-field Talbot–Lau interferometer**, calibrated to
**Nature s41586-025-09917-9** (Arndt group, Vienna — quantum interference of sodium metal
clusters >7,000 atoms, >170,000 Da, macroscopicity μ=15.5):

| parameter | value | source |
|---|---|---|
| grating period `d` | 133 nm (266 nm laser / 2) | paper |
| grating separation `L` | 0.983 m | paper |
| beam velocity | ~160 m/s | paper |
| cluster mass | 143–197 kDa (mean 172) | paper |
| vacuum | 9×10⁻⁹ mbar | paper |
| operating visibility | **V = 0.10 ± 0.01** at P2 = 15.2 mW | paper |

Resonance is velocity- and mass-dependent via `ρ = L/L_T = L·h /(d²·m·v)`, so velocity and
mass selection are real control levers. **The G2-power response is calibrated to the paper's
measured quantum-visibility curve (Fig. 2b), not just one point** — the model now tracks the full
curve: peak V≈0.10 at ~17 mW, minimum ~40 mW, weak revival ~55 mW (8 check points match within
~0.002). This replaced an ad-hoc single-Bessel that oscillated too fast (the real G2 is an
absorptive ionization grating). `TAG: G2-power axis figure-digitized to Fig. 2b (~16 eye-read
points); the mass axis (Fig. 3, a 2-D map) and a rigorous least-squares fit still need the
published source data.`

## The three-arm blinded test

`random` · `optimizer` (classical (1+1)-ES) · `prism` (identical ES **+** neural nudge).
The prism and optimizer share the **exact same search backbone** — the only difference is
the neural stream — so any gap isolates the neural contribution and nothing else.

A synthetic `NeuralStream` with an `oracle_coupling` knob lets us prove the harness is honest:

```
python run_experiment.py            # coupling sweep + self-validation
python -m pytest tests/ -q          # 25 tests incl. the honest-null + power checks
```

### Measured (this build, Fig-2b-calibrated physics, budget 80, 30 seeds; score = fraction of ground-truth SNR)

| oracle_coupling | random | optimizer | prism | Welch t | p | verdict |
|---:|---:|---:|---:|---:|---:|---|
| 0.0 | 0.840 ± 0.076 | 0.842 ± 0.275 | 0.848 ± 0.108 | +0.12 | 0.909 | **no advantage** (null holds — stream is noise) |
| 0.3 | 0.840 ± 0.076 | 0.842 ± 0.275 | 0.949 ± 0.043 | +2.11 | 0.043 | **prism > optimizer** |
| 0.6 | 0.840 ± 0.076 | 0.842 ± 0.275 | 0.989 ± 0.012 | +2.93 | 0.007 | **prism > optimizer** |
| 0.9 | 0.840 ± 0.076 | 0.842 ± 0.275 | 1.000 ± 0.002 | +3.14 | 0.004 | **prism > optimizer** |

(`results/coupling-sweep-calibrated.json`; the pre-calibration sweep is kept at
`results/coupling-sweep.json` — under the old physics the 0.3 band was unresolved, p=0.09.)

**Self-validation PASS on the calibrated physics:** the prism gains an advantage *only* when
the stream genuinely carries information (coupling ≥ 0.3, strengthening monotonically), and
none when it is noise (coupling 0, p=0.91). A harness that rewarded a noise stream would be
rigged; this one does not.

## Why this design (external-verifier grounding)

The methodology follows the **grounded refinement loop**: a proposer suggests actions, a
*checkable verifier* scores them, the proposer refines. This is exactly the "add an external
verifier" step named as the highest-value next move in the Asolaria report (§8), and it is
the pattern shown to work in **COMPILOT** (Merouani, Kara Bernou & Baghdadi, *Agentic
Auto-Scheduling: An Experimental Study of LLM-Guided Loop Optimization*, PACT 2025,
arXiv:2511.00592) — an LLM proposes loop transformations, a compiler returns legality +
measured speedup, and the loop reaches 2.66–3.54× and rivals the Pluto polyhedral optimizer.
Here the **physics simulator is the verifier** and the schedule sources are the proposers.
A natural next arm is an **LLM/COMPILOT-style proposer** grounded by the same simulator,
benchmarked against the neural-prism arm.

## Layers (roadmap)

1. **Physics** — spatial Talbot–Lau sim (this build). *Next:* full-curve calibration.
2. **Prism** — Asolaria maps streams → HyperBEHCS selector tuples (`qprism/behcs.py`) →
   control proposals. Never claims "mind enters wavefunction."
3. **Neural** — **pluggable source socket** (`qprism/neural_sources.py`,
   [`docs/NEURAL-SOURCES.md`](docs/NEURAL-SOURCES.md)): `synthetic` (baseline) ·
   `connectome` (C. elegans-scale graph dynamics, Wasiolek path) · `recorded` (real
   non-invasive MEG/EEG features, Brain2Qwerty path — public data, no surgery/IRB).
   Real data does **not** bypass the honest null. Organoid/Neuralink-class only much later,
   with IRB/consent, no shortcut.
4. **Experiment** — three-arm blinded comparison (this build).
5. **Claim gate** — [`docs/CLAIMS-GATE.md`](docs/CLAIMS-GATE.md).

**Stage 2 — cube absorption** ([`docs/STAGE2-CUBE-ABSORPTION.md`](docs/STAGE2-CUBE-ABSORPTION.md)):
`qprism/cube_absorb.py` represents a neural feature window as a fabric-addressable **3,200-byte
cube tuple** + derived-only chunk (60D BEHCS selector; `raw_in_repo=0`), format-aligned to the
shipped `combined-quant-engine` and Liris's `qprism-quant-chunk`. Drives the prism arm via
`CubeSource`. Uses fabric/recall/atlas/graphify only as read/representation surfaces — never fires
AgentTerms/FEDENV. Raw M/EEG stays on D:, sha-referenced; 280 GB download deferred to explicit go.

**Double Binary Black Hole Comms Quant Prism**
([`docs/DOUBLE-BINARY-BLACK-HOLE-COMS-QUANT-PRISM.md`](docs/DOUBLE-BINARY-BLACK-HOLE-COMS-QUANT-PRISM.md)):
design bridge from the older double/binary-black-hole consent capsule to Q-PRISM cube/quant
tuples and HBI/HBP `json=0` receipts. This is a bounded simulator/design cell, not a live
communications tunnel or hardware-fire claim.

## Bilateral build

Built in parallel by **Acer** (this branch, numpy/scipy, calibrated spatial model) and
**Liris** (independent scaffold). Compare branches, attack-verify each other's physics, merge
the stronger pieces. GitHub is the mediator.

## Honesty boundaries

No consciousness/physics/hardware-transcending claims. The neural stream proposes control
parameters; the simulator, not the prism, decides whether a proposal is good; and no result
here is a claim about real neural data — only about whether the *method* can detect a signal
when one exists. Calibration is to a single reported data point. See `docs/CLAIMS-GATE.md`.

## Layout
```
qprism/physics.py   spatial Talbot-Lau forward model (calibrated to the paper)
qprism/sources.py   random / optimizer / prism schedule sources + synthetic NeuralStream
qprism/harness.py   three-arm blinded comparison + self-validation
qprism/behcs.py     BEHCS-1024 selector-tuple identifiers
run_experiment.py   CLI
tests/              physics sanity + harness-integrity (honest-null + power) tests
docs/CLAIMS-GATE.md what a "win" may and may not claim
docs/DOUBLE-BINARY-BLACK-HOLE-COMS-QUANT-PRISM.md
                    double/binary-black-hole consent capsule + Q-PRISM quant tuple design
```

*Credit: reframing from an untestable metaphysical claim to a blinded, simulator-grounded
control-signal test is the author's (Jesse Daniel Brown). Physics-anchor paper and COMPILOT
cited above. AI assistance per the Asolaria report §9.*
