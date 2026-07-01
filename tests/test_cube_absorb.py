"""Cube-absorption tests: canonical 3200-byte tuple, kernel-native json=0 HBP row, Host-8
handle parity with graphify, graphify-60D selector envelope, and CubeSource -> prism arm."""
import numpy as np
from qprism.physics import Apparatus, observe
from qprism.sources import PrismSource, denormalize
from qprism.cube_absorb import (absorb_window, quant_tuple, cube_to_control,
                                 CubeSource, TUPLE_BYTES, handle8, glyphword)


def _fixture_window(seed=1, T=25, F=64):
    rng = np.random.default_rng(seed)
    return np.sin(np.linspace(0, 8 * np.pi, T)[:, None] * rng.uniform(0.5, 3, (1, F))) \
        + 0.3 * rng.standard_normal((T, F))


def test_tuple_is_canonical_3200_bytes():
    assert len(quant_tuple(_fixture_window())) == TUPLE_BYTES == 3200


def test_handle8_matches_graphify_fnv1a64():
    # byte-identical Host-8 8-byte PK (FNV-1a 64-bit) -> hex 16 chars
    assert len(handle8("qprism/cube/x")) == 16          # 8-byte PK -> 16 hex chars
    # verify the exact FNV-1a-64 algorithm (byte-identical to graphify.py)
    ref = 0xcbf29ce484222325
    for ch in b"a":
        ref = ((ref ^ ch) * 0x100000001b3) & 0xffffffffffffffff
    assert handle8("a") == format(ref, "016x")
    assert glyphword("a").startswith("gly-")


def test_hbp_row_is_json0_and_kernel_native():
    ch = absorb_window(_fixture_window(), subject="S5", session="1", window_start_s=12.5)
    row = ch.hbp_row()
    assert row.startswith("QPRISMCUBE|") and row.endswith("|json=0")
    assert "{" not in row and "}" not in row and '"' not in row     # no JSON carrier
    assert f"handle8={ch.handle8}" in row and len(ch.handle8) == 16  # Host-8 8-byte PK present
    assert "raw_in_repo=0" in row and "derived_only=1" in row
    # graphify-60D selector envelope axes present
    for axis in ("sel_room", "sel_topid", "sel_portlabel", "sel_domain", "sel_tier",
                 "sel_executor", "sel_signgate", "sel_runtime"):
        assert f"|{axis}=" in row
    assert "sel_runtime=staged" in row and "sel_signgate=UNSIGNED" in row  # E=0, uncosigned


def test_deterministic():
    w = _fixture_window(3)
    assert quant_tuple(w) == quant_tuple(w)
    assert absorb_window(w).handle8 == absorb_window(w).handle8


def test_cube_source_drives_prism_arm():
    chunks = [absorb_window(_fixture_window(s), subject=f"S{s}", window_start_s=s) for s in range(6)]
    src = CubeSource(chunks)
    ap = Apparatus()
    arm = PrismSource(seed=7, stream=src, influence=0.5)
    best = -np.inf
    for _ in range(40):
        x = arm.ask()
        snr = observe(denormalize(x, ap), ap)["snr"]
        arm.tell(x, snr)
        best = max(best, snr)
    assert 0.0 <= best <= 1.0


def test_control_vector_valid():
    v = cube_to_control(absorb_window(_fixture_window()))
    assert v.shape == (5,) and np.all((v >= 0) & (v <= 1))


def test_active_glyph_law_is_gated():
    ch = absorb_window(_fixture_window(), subject="S5")
    law = ch.active_glyph_law()
    assert law.startswith("QPRISMACTIVEGLYPH|") and law.endswith("|json=0")
    for gate in ("compile=0", "interpret=0", "fire=0", "behavior=represent_address",
                 "geometry=graphify60d"):
        assert gate in law
    assert f"handle8={ch.handle8}" in law
