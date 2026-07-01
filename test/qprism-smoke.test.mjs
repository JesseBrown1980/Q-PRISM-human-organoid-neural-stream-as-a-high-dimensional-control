import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SCHEDULE_BOUNDS,
  classicalSchedule,
  prismSchedule,
  randomSchedule,
  syntheticNeuralStream,
} from '../src/qprism-control-policy.mjs';
import {
  comparePolicies,
  deBroglieWavelength,
  gratingFactor,
  operatingPoint,
  rhoRes,
  simulateInterferometer,
  talbotLength,
} from '../src/qprism-simulator.mjs';

function inRange(value, [lo, hi]) {
  return value >= lo && value <= hi;
}

test('deBroglie wavelength is positive for sodium nanoparticle parameters', () => {
  const lambda = deBroglieWavelength({ massKDa: 172, velocityMps: 160 });
  assert.ok(lambda > 0);
  assert.ok(lambda < 1e-11);
});

test('spatial Talbot-Lau operating point calibrates to Nature visibility', () => {
  const op = operatingPoint();
  assert.ok(Math.abs(op.visibility - 0.10) < 0.011, `visibility=${op.visibility}`);
  assert.ok(Math.abs(op.rho - op.rhoRes) < 1e-9);
});

test('Talbot length and rho are finite in the Nature regime', () => {
  const length = talbotLength({ massKDa: 172, velocityMps: 160, gratingPeriodM: 133e-9 });
  assert.ok(Number.isFinite(length));
  assert.ok(length > 0.1 && length < 10);
  assert.ok(rhoRes() > 0);
});

test('G2 grating factor is non-monotonic and peaks near 15.2 mW', () => {
  const low = gratingFactor(3);
  const peak = gratingFactor(15.2);
  const high = gratingFactor(26);
  assert.ok(peak > low);
  assert.ok(peak > high);
});

test('policy generators produce bounded spatial schedules', () => {
  for (const schedule of [classicalSchedule(8), randomSchedule('x', 8), prismSchedule('x', 8)]) {
    assert.equal(schedule.length, 8);
    for (const s of schedule) {
      assert.ok(inRange(s.p2Mw, SCHEDULE_BOUNDS.p2Mw));
      assert.ok(inRange(s.velocityCenterMps, SCHEDULE_BOUNDS.velocityCenterMps));
      assert.ok(inRange(s.velocityHalfWidthMps, SCHEDULE_BOUNDS.velocityHalfWidthMps));
      assert.ok(inRange(s.massCenterKDa, SCHEDULE_BOUNDS.massCenterKDa));
      assert.ok(inRange(s.massHalfWidthKDa, SCHEDULE_BOUNDS.massHalfWidthKDa));
      assert.ok(inRange(s.analysisWindow, SCHEDULE_BOUNDS.analysisWindow));
    }
  }
});

test('synthetic neural stream is deterministic', () => {
  assert.deepEqual(syntheticNeuralStream('same', 6), syntheticNeuralStream('same', 6));
  assert.notDeepEqual(syntheticNeuralStream('same', 6), syntheticNeuralStream('different', 6));
});

test('simulator returns finite scores for all baseline policies', () => {
  const comparison = comparePolicies('smoke');
  for (const result of Object.values(comparison)) {
    assert.ok(Number.isFinite(result.score));
    assert.ok(result.score >= 0 && result.score <= 1.25);
    assert.ok(result.meanVisibility >= 0 && result.meanVisibility <= 1);
    assert.ok(result.meanFlux >= 0 && result.meanFlux <= 1);
  }
});

test('direct simulation exposes per-step spatial records', () => {
  const result = simulateInterferometer({}, prismSchedule('records', 5, { coupling: 0.9 }));
  assert.equal(result.points.length, 5);
  assert.ok(result.points.every((p) => Number.isFinite(p.fringe)));
  assert.ok(result.points.every((p) => Number.isFinite(p.rho)));
});
