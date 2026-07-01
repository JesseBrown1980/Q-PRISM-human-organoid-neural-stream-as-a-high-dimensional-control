# Brain2Qwerty Neural-Decoding Anchor

Status: `PRIMARY_SOURCE` / `OPERATOR_PROVIDED_HF_CARD` / `MEASURED_WEB_PRIOR` as of 2026-07-01 from Meta AI, the Facebook Research code repo, the Brain2Qwerty v2 PDF, and the BCBL Hugging Face dataset card.

## Primary Surfaces

- Meta blog: https://ai.meta.com/blog/brain2qwerty-brain-ai-human-communication/
- Code: https://github.com/facebookresearch/brain2qwerty
- v2 paper PDF: https://facebookresearch.github.io/brain2qwerty/assets/brain2qwerty_v2.pdf
- public dataset card: https://huggingface.co/datasets/bcbl190626/SpanishBCBL
- v1 Nature Neuroscience paper: https://www.nature.com/articles/s41593-026-02303-2
- companion neuroscience arXiv: https://arxiv.org/abs/2502.07429

## Layer Split

There are two related but distinct evidence layers:

1. Brain2Qwerty v2 result layer.
   - non-invasive MEG typed-sentence decoding,
   - about 22,000 typed sentences from 9 volunteer participants,
   - about 10 hours of MEG per participant,
   - reported average WER 39%, equivalent to about 61% word accuracy,
   - best participant: more than half of decoded sentences with one word error or less.

2. Public SpanishBCBL / DECOMEG dataset layer.
   - public Hugging Face dataset underlying Brain2Qwerty v1 and the companion neuroscience study,
   - MEG and EEG recordings plus behavioral logs,
   - Spanish sentence typing from memory,
   - released under CC BY-NC 4.0,
   - about 262 GB by card summary / about 280 GB by Hugging Face file-size display.

The public SpanishBCBL release is the right first Q-PRISM Stage 2 substrate. The v2 performance result is a public scientific anchor, but the v2 dataset is a separate layer and should not be treated as already available inside this repo.

## SpanishBCBL Dataset Geometry

From the Hugging Face dataset card provided by the operator:

- task: read -> wait -> type brief Spanish sentences from memory,
- participants: 35 healthy adult volunteers at BCBL in San Sebastián, Spain,
- cohort: native Spanish speakers, right-handed, skilled typists, typing accuracy at least 80%,
- demographics: 23% men / 77% women, mean age 31.6 +/- 5.2 years,
- repeated MEG subject IDs:
  - person 1: S1, S18,
  - person 4: S4, S14,
  - person 5: S5, S10, S21,
- S23 should be excluded for the MEG merge because of a metallic implant,
- merging repeats and excluding S23 gives 19 unique MEG participants,
- each session: 128 unique declarative Spanish sentences of 5-8 words,
- MEG: about 5.1K sentences / about 193K characters,
- EEG: about 4K sentences / about 146K characters,
- per-participant recording time: EEG 0.88 +/- 0.02 h, MEG 0.93 +/- 0.01 h,
- total typing time: about 17.7 h EEG and about 21.5 h MEG,
- MEG system: Megin / Elekta Neuromag, 306 channels, 1 kHz, online filters 0.1 Hz high-pass and 330 Hz low-pass,
- EEG system: BrainVision actiCAP slim, 64 channels, 1 kHz,
- keyboard: custom MR-compatible QWERTY keyboard with non-ferromagnetic silver-spring mechanisms,
- raw identifying materials such as structural MRI/T1, head-position videos, eye-tracking, and session videos are excluded from the public release.

File structure:

```text
pinet2024_public/
  MEG/
    FIF/      raw continuous MEG .fif recordings
    logs/     MATLAB .mat behavioral logs
  EEG/
    EEG/      BrainVision .eeg/.vhdr/.vmrk recordings
    logs/     MATLAB .mat behavioral logs
```

Release file counts:

```text
MEG raw .fif: 231 across 29 recording directories
MEG behavioral .mat logs: 84
EEG .eeg/.vhdr/.vmrk triplets: 117 each
EEG behavioral .mat logs: 62
```

## Loading Boundary

The dataset card recommends event construction through the Brain2Qwerty/studies stack:

```python
import studies  # registers Pinet2024Meg / Pinet2024Eeg
from neuralset.events import Study

study = Study(name="Pinet2024Meg", path="SpanishBCBL")
# use "Pinet2024Eeg" for EEG
study.download()
events = study.build()
```

For Q-PRISM, this becomes an events-first rule:

```text
raw M/EEG -> studies/neuralset event dataframe -> derived typed-language features -> schedule priors -> compact receipts
```

Do not put raw 262-280GB M/EEG files in this repository. If downloaded, they belong in an explicit external data root with license/provenance receipts. This repo should store only small derived manifests, schedule proposals, hashes, metrics, and claims-gate notes.

## What It Establishes

Brain2Qwerty and SpanishBCBL establish that non-invasive brain recordings can be organized into a serious typed-language decoding pipeline when the task, recording modality, training target, and subject protocol are explicit.

For Q-PRISM this supports:

- typed-language or attempted-typing signals as the first real neural-stream adapter,
- semantic embeddings or decoded text as schedule priors,
- public/offline data integration before live capture,
- strict separation between raw sensitive neural data and compact derived receipts.

## What It Does Not Establish

Brain2Qwerty does not prove arbitrary thought reading, consciousness transfer, organoid personhood, or neural control of a quantum system.

The demonstrated public-data task is constrained:

```text
participant sees a sentence
participant waits
participant types the memorized sentence
MEG/EEG and behavioral logs are aligned
models decode typed language production from brain activity
```

That is highly relevant to Q-PRISM, but the honest import is narrower than a general consciousness stream. For Q-PRISM, Brain2Qwerty supports treating non-invasive neural data as a high-dimensional symbolic/control prior, not as direct evidence that mind enters a matter-wave interferometer.

## Q-PRISM Design Consequences

1. The neural stream adapter should start with typed-language or attempted-typing signals.
2. The first real-data integration target is SpanishBCBL events and derived features, not a 280GB raw-data mirror inside the repo.
3. The experiment harness should compare four streams:
   - random/noise controls,
   - classical scheduler,
   - decoded-language/semantic priors,
   - synthetic high-coupling oracle controls for self-validation only.
4. Raw neural recordings are sensitive human-subject data. Q-PRISM should store derived schedules, hashes, metrics, consent/provenance records, and license notes; it should not hoard raw neural data unless an explicit approved data protocol requires it.
5. Because SpanishBCBL is CC BY-NC 4.0, any commercial or product-facing use is out of scope unless separately licensed.

## Claims Boundary

Allowed now:

```text
Brain2Qwerty and SpanishBCBL demonstrate that constrained typed-sentence production can be studied from non-invasive MEG/EEG with public code and a public non-commercial dataset.
```

Allowed as a Q-PRISM hypothesis:

```text
Decoded or ground-truth typed-language streams may provide useful high-dimensional priors for schedule selection in a physics simulator or, later, a hardware experiment.
```

Denied:

```text
Brain2Qwerty proves arbitrary thought reading.
SpanishBCBL proves consciousness coupling to quantum systems.
A Q-PRISM simulator result is a human-neural or hardware result.
```
