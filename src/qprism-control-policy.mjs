import { createHash } from 'node:crypto';

export const SCHEDULE_BOUNDS = Object.freeze({
  p2Mw: [1, 60],
  velocityCenterMps: [70, 250],
  velocityHalfWidthMps: [3, 90],
  massCenterKDa: [118, 226],
  massHalfWidthKDa: [2, 54],
  analysisWindow: [0.35, 0.95],
});

export function hashUnit(seed, label) {
  const hex = createHash('sha256').update(`${seed}|${label}`).digest('hex').slice(0, 13);
  return parseInt(hex, 16) / 0xfffffffffffff;
}

export function syntheticNeuralStream(seed, dims = 16) {
  return Array.from({ length: dims }, (_, i) => {
    const u = hashUnit(seed, `dim:${i}`);
    return Math.sin(2 * Math.PI * u) * 0.5 + Math.cos(7 * Math.PI * u) * 0.5;
  });
}

export function prismSchedule(seed, steps = 32, { coupling = 0.45 } = {}) {
  const stream = syntheticNeuralStream(seed, 24);
  return Array.from({ length: steps }, (_, i) => {
    const a = stream[i % stream.length];
    const b = stream[(i * 5 + 3) % stream.length];
    const c = hashUnit(seed, `step:${i}`);
    const target = {
      p2Mw: 15.2 + 1.2 * a,
      velocityCenterMps: 160 + 5 * b,
      velocityHalfWidthMps: 8 + 2 * Math.abs(a),
      massCenterKDa: 172 + 3 * (a - b),
      massHalfWidthKDa: 6 + 2 * Math.abs(b),
      analysisWindow: 0.7,
    };
    const noise = {
      p2Mw: lerp(1, 60, c),
      velocityCenterMps: lerp(70, 250, hashUnit(seed, `noise-v:${i}`)),
      velocityHalfWidthMps: lerp(3, 90, hashUnit(seed, `noise-vh:${i}`)),
      massCenterKDa: lerp(118, 226, hashUnit(seed, `noise-m:${i}`)),
      massHalfWidthKDa: lerp(2, 54, hashUnit(seed, `noise-mh:${i}`)),
      analysisWindow: lerp(0.35, 0.95, hashUnit(seed, `noise-window:${i}`)),
    };
    return boundedSchedule({
      step: i,
      p2Mw: mix(noise.p2Mw, target.p2Mw, coupling),
      velocityCenterMps: mix(noise.velocityCenterMps, target.velocityCenterMps, coupling),
      velocityHalfWidthMps: mix(noise.velocityHalfWidthMps, target.velocityHalfWidthMps, coupling),
      massCenterKDa: mix(noise.massCenterKDa, target.massCenterKDa, coupling),
      massHalfWidthKDa: mix(noise.massHalfWidthKDa, target.massHalfWidthKDa, coupling),
      analysisWindow: mix(noise.analysisWindow, target.analysisWindow, coupling),
    });
  });
}

export function randomSchedule(seed, steps = 32) {
  return Array.from({ length: steps }, (_, i) => boundedSchedule({
    step: i,
    p2Mw: lerp(1, 60, hashUnit(seed, `random-p2:${i}`)),
    velocityCenterMps: lerp(70, 250, hashUnit(seed, `random-v:${i}`)),
    velocityHalfWidthMps: lerp(3, 90, hashUnit(seed, `random-vh:${i}`)),
    massCenterKDa: lerp(118, 226, hashUnit(seed, `random-m:${i}`)),
    massHalfWidthKDa: lerp(2, 54, hashUnit(seed, `random-mh:${i}`)),
    analysisWindow: lerp(0.35, 0.95, hashUnit(seed, `random-window:${i}`)),
  }));
}

export function classicalSchedule(steps = 32) {
  const p2Scan = [8, 12, 15.2, 20, 26, 34, 42, 52];
  const vScan = [-36, -18, 0, 18, 36, 0, -12, 12];
  const mScan = [-24, -12, 0, 12, 24, 0, -8, 8];
  return Array.from({ length: steps }, (_, i) => boundedSchedule({
    step: i,
    p2Mw: p2Scan[i % p2Scan.length],
    velocityCenterMps: 160 + vScan[(i * 3) % vScan.length],
    velocityHalfWidthMps: 24,
    massCenterKDa: 172 + mScan[(i * 5) % mScan.length],
    massHalfWidthKDa: 14,
    analysisWindow: 0.7,
  }));
}

function boundedSchedule(s) {
  return {
    step: s.step,
    p2Mw: clamp(s.p2Mw, ...SCHEDULE_BOUNDS.p2Mw),
    velocityCenterMps: clamp(s.velocityCenterMps, ...SCHEDULE_BOUNDS.velocityCenterMps),
    velocityHalfWidthMps: clamp(s.velocityHalfWidthMps, ...SCHEDULE_BOUNDS.velocityHalfWidthMps),
    massCenterKDa: clamp(s.massCenterKDa, ...SCHEDULE_BOUNDS.massCenterKDa),
    massHalfWidthKDa: clamp(s.massHalfWidthKDa, ...SCHEDULE_BOUNDS.massHalfWidthKDa),
    analysisWindow: clamp(s.analysisWindow, ...SCHEDULE_BOUNDS.analysisWindow),
  };
}

function mix(left, right, amount) {
  const t = clamp(amount, 0, 1);
  return left * (1 - t) + right * t;
}

function lerp(lo, hi, t) {
  return lo + (hi - lo) * t;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
