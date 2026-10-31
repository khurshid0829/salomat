// Sanity checks for the built-in food table.
const test = require('node:test');
const assert = require('node:assert');

global.window = {};
require('../foods.js');
const FOODS = global.window.FOODS;

// ids already stored in users' logs must never disappear
const OLD_IDS = ['palov', 'lagmon', 'mastava', 'shorva', 'tovuq-shorva', 'moshxorda', 'manti', 'chuchvara', 'somsa', 'dimlama',
  'qozon-kabob', 'shashlik', 'achchiq-chuchuk', 'obi-non', 'guruch', 'grechka', 'suli', 'makaron', 'kartoshka', 'fri', 'oq-non',
  'yasmiq', 'noxat', 'tuxum', 'tovuq', 'mol', 'qoy', 'baliq', 'kolbasa', 'sut', 'qatiq', 'tvorog', 'pishloq', 'sariyog', 'olma',
  'banan', 'uzum', 'anor', 'tarvuz', 'qovun', 'pomidor', 'bodring', 'yongoq', 'bodom', 'mayiz', 'asal', 'shakar', 'shokolad',
  'yog', 'choy', 'qahva', 'kola'];

test('ids are unique and old ids are kept', () => {
  const ids = FOODS.map((f) => f.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  OLD_IDS.forEach((id) => assert.ok(ids.includes(id), id));
  assert.ok(FOODS.length >= 200);
});

test('every food has portions in grams', () => {
  FOODS.forEach((f) => {
    assert.ok(f.portions.length > 0, f.id);
    f.portions.forEach((p) => assert.ok(p[0] && p[1] > 0, f.id + ' ' + p));
  });
});

test('calories match macros (4/9/4) within 20% or 15 kcal', () => {
  FOODS.forEach((f) => {
    const est = 4 * f.p + 9 * f.f + 4 * f.c;
    assert.ok(Math.abs(est - f.kcal) <= Math.max(15, f.kcal * 0.2), f.id + ': ' + f.kcal + ' vs ' + est.toFixed(0));
  });
});
