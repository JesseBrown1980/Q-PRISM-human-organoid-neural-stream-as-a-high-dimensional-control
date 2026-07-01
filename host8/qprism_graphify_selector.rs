//! Q-PRISM Host8 selector alignment for Graphify V3 / HyperBEHCS 60D.
//!
//! Standalone Rust: no Node, no JSON, no serde. The graph node primary key is
//! FNV1a64(graphify_id), while content handles remain sha256-prefix Host8 values.
//! It models the kernel/on-metal contract Q-PRISM should hand to Asolaria OS:
//! represent/address first; AgentTerms/FEDENV execution only after a separate
//! operator-gated envelope.

#[derive(Clone, Copy, Debug, Eq, PartialEq, Hash)]
pub struct Host8(pub [u8; 8]);

impl Host8 {
    pub const ZERO: Host8 = Host8([0; 8]);

    pub fn from_sha256_prefix(hex64: &str) -> Result<Self, &'static str> {
        if hex64.len() < 16 {
            return Err("sha256 hex prefix must have at least 16 chars");
        }
        let bytes = hex64.as_bytes();
        let mut out = [0u8; 8];
        let mut i = 0;
        while i < 8 {
            out[i] = (hex_nibble(bytes[i * 2])? << 4) | hex_nibble(bytes[i * 2 + 1])?;
            i += 1;
        }
        Ok(Host8(out))
    }

    pub fn from_fnv1a64_id(id: &str) -> Self {
        let mut h: u64 = 0xcbf29ce484222325;
        for b in id.as_bytes() {
            h ^= *b as u64;
            h = h.wrapping_mul(0x100000001b3);
        }
        Host8(h.to_be_bytes())
    }

    pub fn to_hex16(self) -> [u8; 16] {
        const HEX: &[u8; 16] = b"0123456789abcdef";
        let mut out = [0u8; 16];
        let mut i = 0;
        while i < 8 {
            out[i * 2] = HEX[(self.0[i] >> 4) as usize];
            out[i * 2 + 1] = HEX[(self.0[i] & 0x0f) as usize];
            i += 1;
        }
        out
    }

    pub fn hex_string(self) -> String {
        String::from_utf8_lossy(&self.to_hex16()).into_owned()
    }
}

fn hex_nibble(b: u8) -> Result<u8, &'static str> {
    match b {
        b'0'..=b'9' => Ok(b - b'0'),
        b'a'..=b'f' => Ok(b - b'a' + 10),
        b'A'..=b'F' => Ok(b - b'A' + 10),
        _ => Err("non-hex character"),
    }
}

pub const GRAPHIFY_SCHEMA: &str = "ASOLARIA-GRAPHIFY-V3-HYPERBEHCS-60D";
pub const GRAPHIFY_FRAME: &str = "60D_PLUS_HYPERBEHCS";
pub const SELECTOR_CONSTRAINT: &str = "selector_constraint:hyperbehcs-selector-router-60d";
pub const HOT_PATH: &str = "HBP_HBI_TUPLE_TEXT";
pub const FRONTEND_PROJECTION: &str = "raw_projection_inert";
pub const SPACE_EXPANSION_RULE: &str = "brown_hilbert_slice_expansion_pid_injection";

pub const SELECTOR_AXES: [&str; 11] = [
    "selector_axis:d-axis-tuples",
    "selector_axis:glyph-family",
    "selector_axis:executor-program",
    "selector_axis:pipe-type",
    "selector_axis:operation-class",
    "selector_axis:route-cylinder-room",
    "selector_axis:proof-tier",
    "selector_axis:runtime-mode",
    "selector_axis:colony-vantage",
    "selector_axis:slice-time",
    "selector_axis:binary-hash-hex-crypto",
];

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct QPrismCubeSelector {
    pub source: Host8,
    pub tuple: Host8,
    pub node: Host8,
    pub graphify_id: String,
    pub raw_in_repo: bool,
    pub agentterms_fedenv_fire: bool,
}

impl QPrismCubeSelector {
    pub fn new(source_sha256: &str, tuple_sha256: &str) -> Result<Self, &'static str> {
        let source = Host8::from_sha256_prefix(source_sha256)?;
        let tuple = Host8::from_sha256_prefix(tuple_sha256)?;
        let graphify_id = format!("qprism_cube:{}", tuple.hex_string());
        let node = Host8::from_fnv1a64_id(&graphify_id);
        Ok(Self { source, tuple, node, graphify_id, raw_in_repo: false, agentterms_fedenv_fire: false })
    }

    pub fn graphify_axis_count(&self) -> usize { SELECTOR_AXES.len() }

    pub fn execution_allowed(&self) -> bool { self.agentterms_fedenv_fire }

    pub fn node_hex16(&self) -> String { self.node.hex_string() }

    pub fn law_row(&self) -> String {
        format!(
            "QPRISMHOST8LAW|hot_path={}|pixels_first=1|frontend={}|node_runtime=kernel_contract_not_spawned|nodejs=0|json_object=0|agentterms_fedenv_fire=0|dispatch=0|provider_fanout=0|hardware_fire=0|json=0",
            HOT_PATH, FRONTEND_PROJECTION
        )
    }

    pub fn space_expansion_row(&self, slice_from: u64, slice_to: u64) -> String {
        format!(
            "QPRISMSPACEEXPAND|handle8={}|graphify_id={}|rule={}|slice_from={}|slice_to={}|inject_between=space_time_next_slice|pid_addressable_points=1|backend=representation_cube|frontend=raw_projection_inert|compile=0|interpret=0|fire=0|json=0",
            self.node_hex16(), self.graphify_id, SPACE_EXPANSION_RULE, slice_from, slice_to
        )
    }

    pub fn active_glyph_row(&self) -> String {
        format!(
            "QPRISMACTIVEGLYPH|handle8={}|geometry=graphify60d|behavior=represent_address|compile=0|interpret=0|fire=0|json=0",
            self.node_hex16()
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn host8_uses_first_eight_sha_bytes() {
        let h = Host8::from_sha256_prefix("7be9d49b3af31036ccce106658588309d8fb808aaf546cbf7c92baaa1cd3767d").unwrap();
        assert_eq!(h.hex_string(), "7be9d49b3af31036");
    }

    #[test]
    fn fnv1a64_graphify_pk_is_stable() {
        let h = Host8::from_fnv1a64_id("qprism_cube:7be9d49b3af31036");
        assert_eq!(h.hex_string(), "5edd3a45544437d4");
    }

    #[test]
    fn qprism_selector_preserves_graphify_axes_and_never_fires() {
        let sel = QPrismCubeSelector::new(
            "c3a7710000000000000000000000000000000000000000000000000000000000",
            "7be9d49b3af31036ccce106658588309d8fb808aaf546cbf7c92baaa1cd3767d",
        ).unwrap();
        assert_eq!(GRAPHIFY_SCHEMA, "ASOLARIA-GRAPHIFY-V3-HYPERBEHCS-60D");
        assert_eq!(GRAPHIFY_FRAME, "60D_PLUS_HYPERBEHCS");
        assert_eq!(sel.graphify_axis_count(), 11);
        assert_eq!(sel.graphify_id, "qprism_cube:7be9d49b3af31036");
        assert!(sel.law_row().contains("|hot_path=HBP_HBI_TUPLE_TEXT|pixels_first=1|frontend=raw_projection_inert|"));
        assert_eq!(sel.node_hex16(), "5edd3a45544437d4");
        assert!(sel.space_expansion_row(0, 1).contains("|rule=brown_hilbert_slice_expansion_pid_injection|"));
        assert!(sel.space_expansion_row(0, 1).contains("|inject_between=space_time_next_slice|pid_addressable_points=1|"));
        assert!(!sel.raw_in_repo);
        assert!(!sel.execution_allowed());
    }

    #[test]
    fn active_glyph_law_is_descriptor_only() {
        let sel = QPrismCubeSelector::new(
            "0ebf9ac4c41cb33d5d1acb071f4e06c8314e83d38088ec1357f36fb786b226b2",
            "7be9d49b3af31036ccce106658588309d8fb808aaf546cbf7c92baaa1cd3767d",
        ).unwrap();
        let row = sel.active_glyph_row();
        assert!(row.starts_with("QPRISMACTIVEGLYPH|handle8=5edd3a45544437d4"));
        assert!(row.contains("|geometry=graphify60d|behavior=represent_address"));
        assert!(row.contains("|compile=0|interpret=0|fire=0|json=0"));
    }
}