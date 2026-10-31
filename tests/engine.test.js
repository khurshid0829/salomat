const test = require('node:test');
const assert = require('node:assert/strict');
const E = require('../engine.js');

const P = { male: true, age: 35, height: 178, act: 0, goal: 'lose', rate: 1, weight: 84 };
const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, (msg || '') + ` ${a} !~ ${b}`);

test('Mifflin-St Jeor BMR and baseline', () => {
  assert.equal(E.bmr(P, 84), 1782.5);
  assert.equal(E.bmr({ ...P, male: false }, 84), 1616.5);
  close(E.baseExpenditure(P, 84), 2139, 0.5);
  close(E.baseExpenditure({ ...P, act: 2 }, 84), 2495.5, 0.5);
});

test('net workout calories exclude resting MET', () => {
  assert.equal(E.exerciseKcal(7, 84, 60), 504);
  assert.equal(E.exerciseKcal(0.8, 84, 60), 0);
});

test('goal delta: lose, keep, gain (gain capped at 0.5%/week)', () => {
  close(E.goalDelta(P, 84), -462, 0.5);
  assert.equal(E.goalDelta({ ...P, goal: 'keep' }, 84), 0);
  close(E.goalDelta({ ...P, goal: 'gain', rate: 3 }, 84), 462, 0.5);
});

test('daily budget adds workouts only in formula mode', () => {
  const f = E.dailyBudget(P, 84, 245, null);
  assert.deepEqual(f, { tdee: 2384, delta: -462, budget: 1922, floored: false, mode: 'formula' });
  const a = E.dailyBudget(P, 84, 245, 2300);
  assert.equal(a.tdee, 2300);
  assert.equal(a.budget, 1838);
  assert.equal(a.mode, 'adaptive');
});

test('budget never drops below the safe floor', () => {
  const small = { male: false, age: 60, height: 150, act: 0, goal: 'lose', rate: 3 };
  const b = E.dailyBudget(small, 50, 0, null);
  assert.equal(b.budget, 1200);
  assert.equal(b.floored, true);
});

test('macro targets', () => {
  assert.deepEqual(E.macroTargets(1922, 84), { p: 134, f: 64, c: 203 });
});

test('food values scale per 100 g', () => {
  assert.deepEqual(E.foodValues({ kcal: 197, p: 6, f: 9.3, c: 22 }, 300), { kcal: 591, p: 18, f: 27.9, c: 66 });
});

test('day totals by meal', () => {
  const log = [
    { date: '2026-10-31', meal: 'b', kcal: 300, p: 20, f: 10, c: 30 },
    { date: '2026-10-31', meal: 'l', kcal: 600, p: 30, f: 20, c: 70 },
    { date: '2026-10-30', meal: 'l', kcal: 999, p: 0, f: 0, c: 0 }
  ];
  const t = E.dayTotals(log, '2026-10-31');
  assert.equal(t.kcal, 900);
  assert.equal(t.p, 50);
  assert.equal(t.meals.b, 300);
  assert.equal(t.n, 2);
});

test('weight trend smooths and carries over gaps', () => {
  const t = E.weightTrend([{ date: '2026-10-01', kg: 84 }, { date: '2026-10-03', kg: 83 }], '2026-10-04');
  assert.equal(t.map['2026-10-02'], 84);
  assert.equal(t.map['2026-10-03'], 83.9);
  assert.equal(t.map['2026-10-04'], 83.9);
  assert.equal(t.latest, 83.9);
});

test('adaptive TDEE recovers expenditure from intake and weight change', () => {
  const today = '2026-10-31', log = [], weights = [];
  for (let i = 60; i >= 1; i--) {
    const d = E.addDays(today, -i);
    log.push({ date: d, meal: 'l', kcal: 2000 });
    weights.push({ date: d, kg: 85 - 0.05 * (60 - i) });
  }
  // losing 0.05 kg/day on 2000 kcal -> ~2000 + 0.05*7700 = 2385
  close(E.adaptiveTdee(log, weights, today), 2385, 25);
  assert.equal(E.adaptiveTdee(log.slice(-10), weights, today), null);
  assert.equal(E.adaptiveTdee(log, weights.slice(-5), today), null);
});

test('period series: week bars, balance and expected change', () => {
  const today = '2026-10-31';
  const data = {
    profile: P, workouts: [{ date: today, kcal: 245, min: 45, level: 1 }],
    log: [{ date: today, meal: 'l', kcal: 1640 }, { date: '2026-10-30', meal: 'l', kcal: 2139 }],
    trend: E.weightTrend([{ date: '2026-10-01', kg: 84 }], today)
  };
  const s = E.periodSeries(data, 'week', today);
  assert.equal(s.bars.length, 7);
  assert.equal(s.bars[6].exp, 2384);
  assert.equal(s.bars[0].intake, null);
  // (1640-2384) and (2139-2139) -> avg -372
  assert.equal(s.avgBalance, -372);
  assert.equal(s.actualKg, 0);
  assert.equal(E.periodSeries(data, 'year', today).bars.length, 12);
});

test('body ratios and Navy body fat', () => {
  assert.equal(E.whtr(92, 178), 0.52);
  assert.equal(E.whr(92, 101), 0.91);
  assert.equal(E.navyBodyFat(true, 178, 92, 39), 21);
  assert.equal(E.navyBodyFat(false, 165, 80, 33, null), null);
  assert.equal(typeof E.navyBodyFat(false, 165, 80, 33, 100), 'number');
});

test('habit score and weekly active minutes', () => {
  const today = '2026-10-31', checks = {};
  for (let i = 0; i < 7; i++) checks[E.addDays(today, -i)] = { a: true };
  assert.equal(E.habitScore([{ id: 'a' }, { id: 'b' }], checks, today, 7), 50);
  assert.equal(E.weeklyActiveMinutes([{ date: today, min: 30, level: 1 }, { date: today, min: 20, level: 2 }, { date: '2026-10-01', min: 99, level: 1 }], today), 70);
});
