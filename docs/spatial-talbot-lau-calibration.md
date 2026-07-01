# Spatial Talbot-Lau Calibration

Status: `MEASURED_SIM_FIG2B_EYE_DIGITIZED_CURVE_ENVELOPE` for the Liris scaffold. This is an eye-digitized curve envelope, not a source-data-table fit, not hardware validation, and not a consciousness claim.

## Why This File Exists

The first scaffold treated the interferometer like a generic phase/power toy model. The Nature 2026 platform is more specific: a spatial near-field Talbot-Lau matter-wave interferometer for sodium metal clusters. In that regime the useful resonance variable is velocity- and mass-dependent.

```text
rho = L / L_T = L * h / (d^2 * m * v)
```

That changes the control language. Q-PRISM schedules should manipulate lawful controls around `rho`, not arbitrary phase knobs.

## Apparatus Anchor

From the local Nature PDF extraction and the public article metadata:

- particle class: sodium metal clusters
- scale: more than 7,000 atoms, mass greater than 170,000 Da
- working mass anchor: about 172 kDa
- grating laser wavelength: 266 nm
- grating period: 133 nm
- grating separation: 0.983 m
- beam velocity anchor: about 160 m/s
- reported visibility anchor: `V = 0.10 +/- 0.01` at middle grating power `P2 = 15.2 mW`

## Model Included

`src/qprism-simulator.mjs` implements:

- de Broglie wavelength
- Talbot length
- spatial Talbot ratio `rho`
- a Fig. 2b eye-digitized middle-grating response envelope: peak near `17 mW`, dip near `40 mW`, weak revival near `60 mW`
- Gaussian velocity and mass selection windows
- flux and SNR proxy scoring
- one-point visibility scale so the reported operating point returns `V ~= 0.10`
- Fig. 2b eye-digitized G2 response envelope: secondary scan `V = 0.08 +/- 0.01`, peak near `P2 = 17 mW`, dip near `40 mW`, weak revival near `60 mW`, velocity spread `10 m/s`, Talbot mass line near `138.6 kDa`, and `L = LT/2` line near `277.2 kDa`

It now includes a Fig. 2b eye-digitized G2-power response envelope. This is still not a source-data-table fit: the honest next calibration step is to ingest the published plotted/source points and fit the width/decoherence parameters rigorously. Until then, `curveCalibrationEnvelope()` exposes the digitized-envelope constraints reproducibly.

## Self-Validation Gate

The coupling sweep prevents the harness from rewarding a neural/prism stream that is only noise.

Latest Liris measured simulator output after the Fig. 2b eye-digitized envelope update:

```text
coupling=0.0  prism-classical=-0.033558
coupling=0.9  prism-classical=+0.035142
self_validation=PASS
```

Interpretation:

- `coupling=0`: prism proposals are hashed/noisy and lose to the classical scan.
- `coupling=0.9`: prism proposals are strongly coupled to the resonance ridge and beat the classical scan.

This supports only the simulator-level statement that the harness distinguishes noise from useful control information.

## Claims Boundary

Allowed:

```text
A coupled prism schedule improved a Fig. 2b eye-digitized spatial Talbot-Lau simulator envelope over the declared classical scan baseline.
```

Not allowed:

```text
Consciousness entered the wavefunction.
Organoids controlled quantum collapse.
Simulator scores are hardware results.
```
