import assert from 'node:assert/strict';
import test from 'node:test';
import { defaultSeeds, runComparison, runCouplingSweep } from '../src/qprism-experiment.mjs';

test('defaultSeeds returns stable seed ids', () => {
  assert.deepEqual(defaultSeeds(3), ['qprism-000', 'qprism-001', 'qprism-002']);
});

test('runComparison summarizes all policies', () => {
  const result = runComparison({ seeds: defaultSeeds(4), steps: 8 });
  assert.equal(result.schema, 'qprism.compare.v2');
  assert.equal(Object.keys(result.policies).sort().join(','), 'classical,prism,random');
  assert.equal(result.policies.classical.trials, 4);
  assert.ok(['classical', 'prism', 'random'].includes(result.winner));
  assert.match(result.ledgerRow, /^QPRISM_COMPARE\|/);
  assert.match(result.ledgerRow, /\|evidence=MEASURED_SIM\|/);
  assert.match(result.ledgerRow, /\|physics=spatial_talbot_lau_fig2b_eye_digitized_curve_envelope\|/);
});

test('coupling sweep refuses pure-noise prism and rewards high coupling', () => {
  const result = runCouplingSweep({ seeds: defaultSeeds(10), steps: 16, couplings: [0, 0.9] });
  assert.equal(result.schema, 'qprism.coupling_sweep.v1');
  assert.equal(result.selfValidation.pass, true);
  assert.ok(result.selfValidation.pureNoisePrismMinusClassical < 0);
  assert.ok(result.selfValidation.highCouplingPrismMinusClassical > 0);
  assert.match(result.ledgerRow, /self_validation=PASS/);
});
