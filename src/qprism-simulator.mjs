import { classicalSchedule, prismSchedule, randomSchedule } from './qprism-control-policy.mjs';

const H = 6.62607015e-34;
const DALTON_KG = 1.66053906660e-27;
const J2_PRIMARY_MAX_X = 3.0542369282271404;

export const NATURE_2026_APPARATUS = Object.freeze({
  atoms: 7_000,
  gratingPeriodM: 133e-9,
  gratingSpacingM: 0.983,
  uvWavelengthM: 266e-9,
  velocityMps: 160,
  velocitySigmaMps: 30,
  massKDa: 172,
  massSigmaKDa: 18,
  p2OptMw: 15.2,
  measuredVisibility: 0.10,
  gammaBlackbodyHz: 8.0,
  resonanceWidth: 0.35,
});

export function resolveConfig(params = {}) {
  const cfg = { ...NATURE_2026_APPARATUS, ...params };
  if (cfg.visibilityScale === undefined) {
    const raw = rawVisibilityAtOperatingPoint({ ...cfg, visibilityScale: 1 });
    cfg.visibilityScale = raw > 0 ? cfg.measuredVisibility / raw : cfg.measuredVisibility;
  }
  return cfg;
}

export function massKg({ massKDa, massDa } = {}) {
  if (Number.isFinite(massKDa)) return massKDa * 1_000 * DALTON_KG;
  if (Number.isFinite(massDa)) return massDa * DALTON_KG;
  throw new TypeError('massKg requires massKDa or massDa');
}

export function deBroglieWavelength({ massKDa, massDa, velocityMps }) {
  return H / (massKg({ massKDa, massDa }) * velocityMps);
}

export function talbotLength({ massKDa, massDa, velocityMps, gratingPeriodM }) {
  const lambda = deBroglieWavelength({ massKDa, massDa, velocityMps });
  return gratingPeriodM ** 2 / lambda;
}

export function rhoFor({ massKDa, velocityMps, gratingPeriodM, gratingSpacingM }) {
  return gratingSpacingM / talbotLength({ massKDa, velocityMps, gratingPeriodM });
}

export function rhoRes(config = resolveConfig()) {
  return rhoFor({
    massKDa: config.massKDa,
    velocityMps: config.velocityMps,
    gratingPeriodM: config.gratingPeriodM,
    gratingSpacingM: config.gratingSpacingM,
  });
}

export function besselJ2(x) {
  let sum = 0;
  let factorialK = 1;
  let factorialKPlus2 = 2;
  for (let k = 0; k < 28; k += 1) {
    if (k > 0) {
      factorialK *= k;
      factorialKPlus2 *= k + 2;
    }
    const term = ((-1) ** k) * (x / 2) ** (2 * k + 2) / (factorialK * factorialKPlus2);
    sum += term;
    if (Math.abs(term) < 1e-14) break;
  }
  return sum;
}

export function gratingFactor(p2Mw, config = resolveConfig()) {
  const phi0 = (J2_PRIMARY_MAX_X / config.p2OptMw) * Math.max(0, p2Mw);
  const peak = Math.abs(2 * besselJ2(J2_PRIMARY_MAX_X));
  return peak > 0 ? clamp(Math.abs(2 * besselJ2(phi0)) / peak, 0, 1.25) : 0;
}

export function visibilityAt({ velocityMps, massKDa, p2Mw }, config = resolveConfig()) {
  const rho = rhoFor({
    massKDa,
    velocityMps,
    gratingPeriodM: config.gratingPeriodM,
    gratingSpacingM: config.gratingSpacingM,
  });
  const center = rhoRes(config);
  const resonance = Math.exp(-(((rho - center) / (config.resonanceWidth * center)) ** 2));
  const grating = gratingFactor(p2Mw, config);
  const decoherence = Math.exp(-config.gammaBlackbodyHz * (2 * config.gratingSpacingM / velocityMps));
  return clamp(config.visibilityScale * resonance * grating * decoherence, 0, 1);
}

export function observeSchedule(schedule, params = {}) {
  const config = resolveConfig(params);
  const vLo = Math.max(1, schedule.velocityCenterMps - schedule.velocityHalfWidthMps);
  const vHi = Math.max(vLo + 1e-6, schedule.velocityCenterMps + schedule.velocityHalfWidthMps);
  const mLo = Math.max(1, schedule.massCenterKDa - schedule.massHalfWidthKDa);
  const mHi = Math.max(mLo + 1e-6, schedule.massCenterKDa + schedule.massHalfWidthKDa);
  const gridSize = schedule.gridSize ?? 11;
  const velocities = linspace(vLo, vHi, gridSize);
  const masses = linspace(mLo, mHi, gridSize);

  let num = 0;
  let den = 0;
  for (const velocityMps of velocities) {
    const wv = gaussianWeight(velocityMps, config.velocityMps, config.velocitySigmaMps);
    for (const massKDa of masses) {
      const wm = gaussianWeight(massKDa, config.massKDa, config.massSigmaKDa);
      const weight = wv * wm;
      num += weight * visibilityAt({ velocityMps, massKDa, p2Mw: schedule.p2Mw }, config);
      den += weight;
    }
  }

  const visibility = den > 0 ? num / den : 0;
  const flux = gaussianFraction(config.velocityMps, config.velocitySigmaMps, vLo, vHi) *
    gaussianFraction(config.massKDa, config.massSigmaKDa, mLo, mHi);
  const snr = visibility * Math.sqrt(Math.max(0, flux));
  const rho = rhoFor({
    massKDa: schedule.massCenterKDa,
    velocityMps: schedule.velocityCenterMps,
    gratingPeriodM: config.gratingPeriodM,
    gratingSpacingM: config.gratingSpacingM,
  });
  const phase = positiveModulo(2 * Math.PI * rho, 2 * Math.PI);

  return {
    step: schedule.step,
    visibility,
    flux,
    snr,
    rho,
    rhoRes: rhoRes(config),
    phase,
    fringe: 0.5 + 0.5 * visibility * Math.cos(phase),
    controls: schedule,
  };
}

export function operatingPoint(params = {}) {
  return observeSchedule({
    step: 0,
    p2Mw: 15.2,
    velocityCenterMps: 160,
    velocityHalfWidthMps: 0.5,
    massCenterKDa: 172,
    massHalfWidthKDa: 0.5,
    analysisWindow: 0.7,
    gridSize: 3,
  }, params);
}

export function simulateInterferometer(params = {}, schedule = classicalSchedule()) {
  const config = resolveConfig(params);
  const points = schedule.map((s) => observeSchedule(s, config));
  const meanVisibility = mean(points.map((p) => p.visibility));
  const meanFlux = mean(points.map((p) => p.flux));
  const meanSnr = mean(points.map((p) => p.snr));
  const fringeContrast = max(points.map((p) => p.fringe)) - min(points.map((p) => p.fringe));
  const rhoError = mean(points.map((p) => Math.abs(p.rho - p.rhoRes) / p.rhoRes));
  const phaseStability = 1 / (1 + std(points.map((p) => p.phase)));
  const resonanceQuality = 1 / (1 + rhoError);

  return {
    config,
    lambdaM: deBroglieWavelength({ massKDa: config.massKDa, velocityMps: config.velocityMps }),
    talbotLengthM: talbotLength({
      massKDa: config.massKDa,
      velocityMps: config.velocityMps,
      gratingPeriodM: config.gratingPeriodM,
    }),
    rhoRes: rhoRes(config),
    meanVisibility,
    meanFlux,
    meanSnr,
    fringeContrast,
    phaseStability,
    resonanceQuality,
    score: clamp(meanSnr * 0.62 + meanVisibility * 0.24 + resonanceQuality * 0.14, 0, 1.25),
    points,
  };
}

export function comparePolicies(seed = 'q-prism-demo', { prismCoupling = 0.45 } = {}) {
  const policies = {
    classical: classicalSchedule(),
    random: randomSchedule(seed),
    prism: prismSchedule(seed, 32, { coupling: prismCoupling }),
  };
  return Object.fromEntries(
    Object.entries(policies).map(([name, schedule]) => [name, summarize(simulateInterferometer({}, schedule))])
  );
}

function rawVisibilityAtOperatingPoint(config) {
  return visibilityAt({ velocityMps: config.velocityMps, massKDa: config.massKDa, p2Mw: config.p2OptMw }, config);
}

function summarize(result) {
  return {
    score: round(result.score),
    meanVisibility: round(result.meanVisibility),
    meanFlux: round(result.meanFlux),
    meanSnr: round(result.meanSnr),
    fringeContrast: round(result.fringeContrast),
    phaseStability: round(result.phaseStability),
    resonanceQuality: round(result.resonanceQuality),
    lambdaM: result.lambdaM,
    talbotLengthM: result.talbotLengthM,
    rhoRes: result.rhoRes,
  };
}

function linspace(lo, hi, n) {
  if (n <= 1) return [(lo + hi) / 2];
  return Array.from({ length: n }, (_, i) => lo + ((hi - lo) * i) / (n - 1));
}

function gaussianWeight(x, mu, sigma) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2);
}

function gaussianFraction(mu, sigma, lo, hi) {
  const grid = linspace(mu - 4 * sigma, mu + 4 * sigma, 401);
  let total = 0;
  let selected = 0;
  for (const x of grid) {
    const w = gaussianWeight(x, mu, sigma);
    total += w;
    if (x >= lo && x <= hi) selected += w;
  }
  return total > 0 ? clamp(selected / total, 0, 1) : 0;
}

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function std(xs) {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
}

function min(xs) {
  return xs.reduce((a, b) => Math.min(a, b), Infinity);
}

function max(xs) {
  return xs.reduce((a, b) => Math.max(a, b), -Infinity);
}

function positiveModulo(v, mod) {
  return ((v % mod) + mod) % mod;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function round(v) {
  return Math.round(v * 1_000_000) / 1_000_000;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('qprism-simulator.mjs')) {
  console.log(JSON.stringify({
    operatingPoint: {
      visibility: round(operatingPoint().visibility),
      target: NATURE_2026_APPARATUS.measuredVisibility,
      evidence: 'MEASURED_SIM_ONE_POINT_CALIBRATION',
    },
    comparison: comparePolicies(process.argv[2] || 'q-prism-demo'),
  }, null, 2));
}

