"""Cube absorption — represent a neural feature window as a KERNEL-NATIVE, fabric-addressable
cube node (json=0, Host-8 8-byte handle, graphify-60D selector envelope).

"The fabric absorbs anything by representing it -> cube." Made concrete for Q-PRISM Stage 2,
in the metal-kernel form (NOT Node, NOT JSON as the carrier):

  raw M/EEG (stays on D:, referenced by sha256)
    -> derived feature window
    -> canonical 3200-byte QUANT TUPLE  (turbo 1024*int8 + signs 128 + zeta 1024 + hist 256*u32)
    -> KERNEL-NATIVE cube node: handle8 (FNV1a64 Host-8 PK) + glyph + 60D selector envelope
    -> json=0 HBP tuple row  (pipe-delimited; JSON only as cold debug per the HyperBEHCS adapter rule)
    -> CubeSource -> prism arm

Node identity is BYTE-IDENTICAL to acer `tools/graphify/graphify.py` (`handle8`, `glyphword`),
so each cube is a node in the SAME 60D atlas graph both colonies use. Selector axes follow the
graphify `sel:*` envelope: room(D37) · handle8(D16) · to_pid[60-tuple](D16) · PortLabel(D13) ·
domain[1/8](D37) · tier[1/6](D37) · executor(D1) · signgate(D11) · runtime/E-axis(D12).

HONESTY: this delivers the kernel-native FORMAT (handle8 PK, json=0, graphify-60D node) so a cube
BINDS to the Rust 8-byte Host-8 metal kernel. Actually EXECUTING the quant ON the metal kernel is
the operator-gated migration — not fired here. runtime axis = `staged`, E=0. Representation only:
uses fabric/recall/atlas/graphify as read surfaces; never fires AgentTerms/FEDENV. Raw is preserved
by sha256 (referenced), never reconstructed from the tuple, never stored in the repo.
"""
from __future__ import annotations
from dataclasses import dataclass, field
import hashlib
import numpy as np
from .neural_sources import NeuralSource, _sigmoid

TUPLE_BYTES = 3200            # turbo 1024 + signs 128 + zeta 1024 + hist 1024
LANES = 1024
_PROJ_SEED = 51966           # fixed projection seed (deterministic lanes)
_B62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"


def glyphword(s: str) -> str:
    """Deterministic baseN glyph id — byte-identical to graphify.py."""
    v = int.from_bytes(hashlib.sha256(s.encode()).digest()[:6], "big"); o = ""
    for _ in range(4):
        o += _B62[v % 62]; v //= 62
    return "gly-" + o


def handle8(s: str) -> str:
    """FNV-1a 64-bit = the Host-8 8-byte primary key — byte-identical to graphify.py."""
    h = 0xcbf29ce484222325
    for ch in s.encode():
        h = ((h ^ ch) * 0x100000001b3) & 0xffffffffffffffff
    return format(h, "016x")


def _sha16(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()[:16]


def _lanes_from_window(win: np.ndarray) -> np.ndarray:
    feat = win.mean(axis=0) if win.ndim == 2 else np.asarray(win, float).ravel()
    rng = np.random.default_rng(_PROJ_SEED)
    R = rng.standard_normal((LANES, feat.shape[0])) / np.sqrt(feat.shape[0])
    lanes = R @ feat
    return lanes / (np.std(lanes) or 1.0)


def quant_tuple(win: np.ndarray) -> bytes:
    """Canonical 3200-byte quant tuple (json=0 binary) from a feature window."""
    lanes = _lanes_from_window(win)
    turbo = np.clip(np.round(lanes * 42.0), -127, 127).astype(np.int8)                 # 1024 B
    signs = np.packbits((turbo >= 0).astype(np.uint8))                                  # 128 B
    idx = np.arange(LANES)
    zeta = ((turbo.astype(np.int64) ^ (idx * 2654435761 % 256)) & 0xFF).astype(np.uint8)  # 1024 B (stand-in)
    hist = np.bincount((turbo.astype(np.int64) + 128).clip(0, 255), minlength=256).astype(np.uint32)  # 1024 B
    buf = turbo.tobytes() + signs.tobytes() + zeta.tobytes() + hist.tobytes()
    assert len(buf) == TUPLE_BYTES, f"tuple is {len(buf)}B, expected {TUPLE_BYTES}"
    return buf


@dataclass
class CubeChunk:
    node_id: str
    handle8: str                 # FNV1a64 Host-8 8-byte primary key
    glyph: str                   # deterministic baseN glyph id (graphify parity)
    dataset_id: str
    license: str
    subject: str
    session: str
    modality: str
    window_start_s: float
    window_dur_s: float
    n_samples: int
    feature_digest: str
    tuple_sha16: str
    source_sha256: str           # RAW recording -> referenced, never stored
    sel_room: str                # D37 room_stub
    sel_topid: str               # D16 to_pid [60-tuple] (BEHCS-1024 glyph address)
    sel_portlabel: str           # D13 PortLabel prefix
    sel_domain: str              # D37 atlas-domain [1/8]
    sel_tier: str                # D37 access-tier [1/6]
    sel_executor: str            # D1  EXECUTED_BY
    sel_signgate: str            # D11 sign-gate verdict + cosign-seq
    sel_runtime: str             # D12 runtime/E-axis frozen->staged->live->cutover
    raw_in_repo: int = 0
    derived_only: int = 1
    tuple_bytes: int = TUPLE_BYTES
    tuple: bytes = field(default=b"", repr=False)

    def hbp_row(self) -> str:
        """json=0 kernel-native tuple row (the primary carrier). No JSON."""
        f = self
        return ("QPRISMCUBE"
                f"|handle8={f.handle8}|glyph={f.glyph}|node={f.node_id}"
                f"|dataset={f.dataset_id}|license={f.license}"
                f"|subject={f.subject}|session={f.session}|modality={f.modality}"
                f"|win_start_s={f.window_start_s}|win_dur_s={f.window_dur_s}|n_samples={f.n_samples}"
                f"|feat_sha16={f.feature_digest}|tuple_sha16={f.tuple_sha16}|tuple_bytes={f.tuple_bytes}"
                f"|source_sha256={f.source_sha256}"
                f"|sel_room={f.sel_room}|sel_topid={f.sel_topid}|sel_portlabel={f.sel_portlabel}"
                f"|sel_domain={f.sel_domain}|sel_tier={f.sel_tier}|sel_executor={f.sel_executor}"
                f"|sel_signgate={f.sel_signgate}|sel_runtime={f.sel_runtime}"
                f"|raw_in_repo={f.raw_in_repo}|derived_only={f.derived_only}|json=0")


def absorb_window(win: np.ndarray, *, dataset_id="bcbl190626/SpanishBCBL",
                  license="CC-BY-NC-4.0", subject="S?", session="?", modality="MEG",
                  window_start_s=0.0, window_dur_s=0.0,
                  source_sha256="referenced-on-D") -> CubeChunk:
    """Represent one feature window as a kernel-native, graphify-60D-addressed cube node."""
    win = np.atleast_2d(win)
    tup = quant_tuple(win)
    feat_digest = _sha16(win.astype(np.float32).tobytes())
    node_id = f"qprism/cube/{dataset_id}/{subject}/{session}/{round(float(window_start_s),3)}/{feat_digest}"
    topid = "HG1024:QPRISM:" + glyphword(node_id)[4:]           # 60-tuple to_pid (glyph address)
    return CubeChunk(
        node_id=node_id, handle8=handle8(node_id), glyph=glyphword(node_id),
        dataset_id=dataset_id, license=license, subject=subject, session=session, modality=modality,
        window_start_s=float(window_start_s), window_dur_s=float(window_dur_s), n_samples=int(win.shape[0]),
        feature_digest=feat_digest, tuple_sha16=_sha16(tup), source_sha256=source_sha256,
        sel_room=f"qprism/{dataset_id.split('/')[-1]}/{subject}", sel_topid=topid,
        sel_portlabel="qprism.cube", sel_domain="vector", sel_tier="RESTRICTED",
        sel_executor="host8.quant.cube-absorb", sel_signgate="UNSIGNED", sel_runtime="staged",
        tuple=tup)


def cube_to_control(chunk: CubeChunk) -> np.ndarray:
    """Project a cube tuple's turbo lanes to a [0,1]^5 control proposal for the prism arm."""
    turbo = np.frombuffer(chunk.tuple[:LANES], dtype=np.int8).astype(float) / 127.0
    rng = np.random.default_rng(_PROJ_SEED ^ 1)
    R = rng.standard_normal((5, LANES)) / np.sqrt(LANES)
    return np.clip(_sigmoid(3.0 * R @ turbo), 0, 1)


class CubeSource(NeuralSource):
    """Neural source backed by a sequence of absorbed cube nodes (real-data path)."""
    def __init__(self, chunks: list[CubeChunk]):
        if not chunks:
            raise ValueError("CubeSource needs at least one cube chunk")
        self.chunks = chunks
        self.i = 0

    def next(self) -> np.ndarray:
        c = self.chunks[self.i % len(self.chunks)]
        self.i += 1
        return cube_to_control(c)
