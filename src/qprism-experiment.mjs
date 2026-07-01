import { classicalSchedule, prismSchedule, randomSchedule } from './qprism-control-policy.mjs';
import { simulateInterferometer } from './qprism-simulator.mjs';

export function defaultSeeds(count = 24) {
  return Array.from({ length: count }, (_, i) => `qprism-${String(i).padStart(3, '0')}`);
}

export function runComparison({ seeds = defaultSeeds(), steps = 32, params = {}, prismCoupling = 0.45 } = {}) {
  const rows = [];
  for (const seed of seeds) {
    const schedules = {
      classical: classicalSchedule(steps),
      random: randomSchedule(seed, steps),
      prism: prismSchedule(seed, steps, { coupling: prismCoupling }),
    };
    for (const [policy, schedule] of Object.entries(schedules)) {
      const result = simulateInterferometer(params, schedule);
      rows.push({
        seed,
        policy,
        score: result.score,
        meanVisibility: result.meanVisibility,
        meanFlux: result.meanFlux,
        meanSnr: result.meanSnr,
        fringeContrast: result.fringeContrast,
        phaseStability: result.phaseStability,
        resonanceQuality: result.resonanceQuality,
      });
    }
  }

  const policies = summarizePolicies(rows);
  const ranked = Object.entries(policies).sort((a, b) => b[1].meanScore - a[1].meanScore);
  const winner = ranked[0][0];
  const second = ranked[1][0];
  const scoreDelta = policies[winner].meanScore - policies[second].meanScore;
  const ledgerRow = [
    'QPRISM_COMPARE',
    'schema=qprism.compare.v2',
    `seeds=${seeds.length}`,
    `steps=${steps}`,
    `prism_coupling=${round(prismCoupling)}`,
    `winner=${winner}`,
    `runner_up=${second}`,
    `score_delta=${round(scoreDelta)}`,
    'physics=spatial_talbot_lau_fig2b_eye_digitized_curve_envelope',
    'evidence=MEASURED_SIM',
    'json=0',
  ].join('|');

  return {
    schema: 'qprism.compare.v2',
    seeds,
    steps,
    prismCoupling,
    policies,
    winner,
    runnerUp: second,
    scoreDelta: round(scoreDelta),
    ledgerRow,
  };
}

export function runCouplingSweep({ seeds = defaultSeeds(), steps = 32, params = {}, couplings = [0, 0.3, 0.6, 0.9] } = {}) {
  const rows = couplings.map((coupling) => runComparison({ seeds, steps, params, prismCoupling: coupling }));
  const sweep = rows.map((result) => ({
    coupling: result.prismCoupling,
    winner: result.winner,
    prismMeanScore: result.policies.prism.meanScore,
    classicalMeanScore: result.policies.classical.meanScore,
    randomMeanScore: result.policies.random.meanScore,
    prismMinusClassical: round(result.policies.prism.meanScore - result.policies.classical.meanScore),
  }));
  const zero = sweep.find((row) => row.coupling === 0) || sweep[0];
  const high = sweep.slice().sort((a, b) => b.coupling - a.coupling)[0];
  return {
    schema: 'qprism.coupling_sweep.v1',
    seeds,
    steps,
    couplings,
    sweep,
    selfValidation: {
      pass: zero.prismMeanScore < zero.classicalMeanScore && high.prismMeanScore > high.classicalMeanScore,
      pureNoisePrismMinusClassical: zero.prismMinusClassical,
      highCouplingPrismMinusClassical: high.prismMinusClassical,
    },
    ledgerRow: [
      'QPRISM_COUPLING_SWEEP',
      'schema=qprism.coupling_sweep.v1',
      `seeds=${seeds.length}`,
      `steps=${steps}`,
      `self_validation=${zero.prismMeanScore < zero.classicalMeanScore && high.prismMeanScore > high.classicalMeanScore ? 'PASS' : 'FAIL'}`,
      `zero_delta=${round(zero.prismMinusClassical)}`,
      `high_delta=${round(high.prismMinusClassical)}`,
      'physics=spatial_talbot_lau_fig2b_eye_digitized_curve_envelope',
      'evidence=MEASURED_SIM',
      'json=0',
    ].join('|'),
  };
}

function summarizePolicies(rows) {
  const out = {};
  for (const policy of [...new Set(rows.map((r) => r.policy))]) {
    const slice = rows.filter((r) => r.policy === policy);
    out[policy] = {
      meanScore: round(mean(slice.map((r) => r.score))),
      meanVisibility: round(mean(slice.map((r) => r.meanVisibility))),
      meanFlux: round(mean(slice.map((r) => r.meanFlux))),
      meanSnr: round(mean(slice.map((r) => r.meanSnr))),
      meanFringeContrast: round(mean(slice.map((r) => r.fringeContrast))),
      meanPhaseStability: round(mean(slice.map((r) => r.phaseStability))),
      meanResonanceQuality: round(mean(slice.map((r) => r.resonanceQuality))),
      trials: slice.length,
    };
  }
  return out;
}

function mean(xs) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function round(v) {
  return Math.round(v * 1_000_000) / 1_000_000;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('qprism-experiment.mjs')) {
  const result = runCouplingSweep();
  console.log(JSON.stringify(result, null, 2));
  console.log(result.ledgerRow);
}
