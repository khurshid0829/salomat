// Pure energy, weight and habit calculations. No DOM, no storage; "today" is passed in.
// Dates are local keys "YYYY-MM-DD"; energy in kcal; mass in kg; lengths in cm.
(function (root) {
  'use strict';

  var KCAL_PER_KG = 7700;          // energy in 1 kg of body fat (rule of thumb)
  var ACT = [1.2, 1.3, 1.4];       // daily life without workouts: sitting, mixed, on feet
  var RATES = [0.0025, 0.005, 0.0075, 0.01]; // share of body weight per week
  var TREND_ALPHA = 0.1;           // smoothing for the weight trend (EMA)

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function dateKey(ts) {
    var d = new Date(ts);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function keyToDate(key) {
    var p = key.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0, 0);
  }

  function addDays(key, n) {
    var d = keyToDate(key);
    d.setDate(d.getDate() + n);
    return dateKey(d.getTime());
  }

  function weekday(key) { return keyToDate(key).getDay(); }

  function daysBetween(a, b) { return Math.round((keyToDate(b) - keyToDate(a)) / 86400000); }

  function sum(xs) { return xs.reduce(function (a, b) { return a + b; }, 0); }
  function avg(xs) { return xs.length ? sum(xs) / xs.length : null; }

  // ---------- energy ----------

  // Mifflin-St Jeor (1990) resting energy
  function bmr(p, kg) {
    return 10 * kg + 6.25 * p.height - 5 * p.age + (p.male ? 5 : -161);
  }

  function baseExpenditure(p, kg) { return bmr(p, kg) * ACT[p.act]; }

  // Net workout energy: resting 1 MET is already in the daily baseline.
  function exerciseKcal(met, kg, min) {
    return Math.max(0, met - 1) * kg * min / 60;
  }

  // Planned daily change: negative = deficit, positive = surplus.
  function goalDelta(p, kg) {
    if (p.goal === 'keep') return 0;
    var r = RATES[Math.min(p.rate, p.goal === 'gain' ? 1 : 3)];
    return (p.goal === 'gain' ? 1 : -1) * kg * r * KCAL_PER_KG / 7;
  }

  function floorKcal(p) { return p.male ? 1500 : 1200; }

  // With an adaptive estimate the average workout load is already inside it,
  // so the day's workouts are only added in formula mode.
  function dailyBudget(p, kg, workoutKcal, adaptive) {
    var tdee = adaptive != null ? adaptive : baseExpenditure(p, kg) + workoutKcal;
    var delta = goalDelta(p, kg);
    var raw = tdee + delta;
    return {
      tdee: Math.round(tdee),
      delta: Math.round(delta),
      budget: Math.round(Math.max(floorKcal(p), raw)),
      floored: raw < floorKcal(p),
      mode: adaptive != null ? 'adaptive' : 'formula'
    };
  }

  function proteinTarget(kg) { return Math.round(1.6 * kg); }

  // Fat 30% of budget, protein by weight, carbs the rest.
  function macroTargets(budget, kg) {
    var p = proteinTarget(kg), f = Math.round(budget * 0.3 / 9);
    return { p: p, f: f, c: Math.max(0, Math.round((budget - p * 4 - f * 9) / 4)) };
  }

  // ---------- food log ----------

  function foodValues(food, grams) {
    var k = grams / 100;
    return {
      kcal: Math.round(food.kcal * k),
      p: Math.round(food.p * k * 10) / 10,
      f: Math.round(food.f * k * 10) / 10,
      c: Math.round(food.c * k * 10) / 10
    };
  }

  function dayTotals(log, key) {
    var t = { kcal: 0, p: 0, f: 0, c: 0, n: 0, meals: { b: 0, l: 0, s: 0, d: 0 } };
    log.forEach(function (e) {
      if (e.date !== key) return;
      t.kcal += e.kcal; t.p += e.p || 0; t.f += e.f || 0; t.c += e.c || 0; t.n++;
      t.meals[e.meal] = (t.meals[e.meal] || 0) + e.kcal;
    });
    t.p = Math.round(t.p); t.f = Math.round(t.f); t.c = Math.round(t.c);
    return t;
  }

  function dayWorkoutKcal(workouts, key) {
    return Math.round(sum(workouts.filter(function (w) { return w.date === key; }).map(function (w) { return w.kcal; })));
  }

  // ---------- weight ----------

  // Smoothed weight per day from the first weigh-in to `toKey`; gaps carry the trend.
  function weightTrend(weights, toKey) {
    var list = weights.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!list.length) return { map: {}, first: null, latest: null };
    var byDay = {};
    list.forEach(function (w) { byDay[w.date] = w.kg; });
    var map = {}, t = list[0].kg, key = list[0].date;
    var end = toKey > list[list.length - 1].date ? toKey : list[list.length - 1].date;
    while (key <= end) {
      if (byDay[key] != null) t += TREND_ALPHA * (byDay[key] - t);
      map[key] = Math.round(t * 100) / 100;
      key = addDays(key, 1);
    }
    return { map: map, first: list[0].date, latest: map[toKey] != null ? map[toKey] : map[end] };
  }

  // kg per week over the last `days` days of the trend.
  function trendRate(trend, toKey, days) {
    var from = addDays(toKey, -days);
    if (trend.map[from] == null || trend.map[toKey] == null) return null;
    return Math.round((trend.map[toKey] - trend.map[from]) / days * 7 * 100) / 100;
  }

  // Expenditure back-calculated from intake and weight trend over a window
  // ending yesterday. Needs 14+ logged days and 8+ weigh-ins.
  function adaptiveTdee(log, weights, todayKey, windowDays) {
    windowDays = windowDays || 21;
    var end = addDays(todayKey, -1), start = addDays(end, -(windowDays - 1)), before = addDays(start, -1);
    var trend = weightTrend(weights, end);
    if (!trend.first || trend.first > before) return null;
    var weighIns = weights.filter(function (w) { return w.date >= start && w.date <= end; }).length;
    if (weighIns < 8) return null;
    var intake = {};
    log.forEach(function (e) { if (e.date >= start && e.date <= end) intake[e.date] = (intake[e.date] || 0) + e.kcal; });
    var days = Object.keys(intake);
    if (days.length < 14) return null;
    var avgIntake = avg(days.map(function (k) { return intake[k]; }));
    var dKg = trend.map[end] - trend.map[before];
    return Math.round(avgIntake - dKg * KCAL_PER_KG / windowDays);
  }

  // ---------- analysis ----------

  // Bars for the analysis chart. period: 'week' | 'month' | 'year'.
  function periodSeries(data, period, todayKey) {
    var p = data.profile, trend = data.trend;
    var kgFor = function (k) { return trend.map[k] != null ? trend.map[k] : p.weight; };
    var expFor = function (k) { return baseExpenditure(p, kgFor(k)) + dayWorkoutKcal(data.workouts, k); };
    var intakeByDay = {};
    data.log.forEach(function (e) { intakeByDay[e.date] = (intakeByDay[e.date] || 0) + e.kcal; });
    var bars = [];
    if (period === 'year') {
      var y = keyToDate(todayKey).getFullYear();
      for (var m = 0; m < 12; m++) {
        var prefix = y + '-' + pad(m + 1), ins = [], exs = [];
        Object.keys(intakeByDay).forEach(function (k) {
          if (k.indexOf(prefix) === 0 && k <= todayKey) { ins.push(intakeByDay[k]); exs.push(expFor(k)); }
        });
        bars.push({ key: prefix, month: m, intake: ins.length ? Math.round(avg(ins)) : null, exp: ins.length ? Math.round(avg(exs)) : null, days: ins.length });
      }
    } else {
      var n = period === 'month' ? 30 : 7;
      for (var i = n - 1; i >= 0; i--) {
        var k = addDays(todayKey, -i);
        bars.push({ key: k, weekday: weekday(k), intake: intakeByDay[k] != null ? Math.round(intakeByDay[k]) : null, exp: Math.round(expFor(k)), days: 1 });
      }
    }
    var logged = bars.filter(function (b) { return b.intake != null; });
    var balance = logged.length ? Math.round(avg(logged.map(function (b) { return b.intake - b.exp; }))) : null;
    var spanDays = period === 'year' ? daysBetween(keyToDate(todayKey).getFullYear() + '-01-01', todayKey) + 1 : (period === 'month' ? 30 : 7);
    var loggedDays = sum(logged.map(function (b) { return b.days; }));
    var from = addDays(todayKey, -(spanDays - 1));
    var actual = trend.map[todayKey] != null && trend.map[from] != null ? Math.round((trend.map[todayKey] - trend.map[from]) * 10) / 10 : null;
    return {
      bars: bars,
      avgBalance: balance,
      expectedKg: balance != null ? Math.round(balance * (period === 'year' ? loggedDays : spanDays) / KCAL_PER_KG * 10) / 10 : null,
      actualKg: actual,
      loggedDays: loggedDays
    };
  }

  // ---------- body ----------

  function whtr(waist, height) { return waist && height ? Math.round(waist / height * 100) / 100 : null; }
  function whr(waist, hip) { return waist && hip ? Math.round(waist / hip * 100) / 100 : null; }

  // US Navy body-fat estimate (Hodgdon & Beckett), metric form.
  function navyBodyFat(male, height, waist, neck, hip) {
    if (!height || !waist || !neck) return null;
    var v;
    if (male) {
      if (waist <= neck) return null;
      v = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
    } else {
      if (!hip || waist + hip <= neck) return null;
      v = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height)) - 450;
    }
    return Math.round(v);
  }

  // ---------- habits ----------

  // Share of habit checks done over the last `days` days (0..100).
  function habitScore(habits, checks, todayKey, days) {
    if (!habits.length) return null;
    var done = 0;
    for (var i = 0; i < days; i++) {
      var day = checks[addDays(todayKey, -i)] || {};
      habits.forEach(function (h) { if (day[h.id]) done++; });
    }
    return Math.round(done / (habits.length * days) * 100);
  }

  // WHO 2020: vigorous minutes count double toward the weekly 150.
  function weeklyActiveMinutes(workouts, todayKey) {
    var from = addDays(todayKey, -6);
    return Math.round(sum(workouts.filter(function (w) { return w.date >= from && w.date <= todayKey; })
      .map(function (w) { return w.min * (w.level === 2 ? 2 : 1); })));
  }

  var api = {
    KCAL_PER_KG: KCAL_PER_KG, RATES: RATES, ACT: ACT,
    dateKey: dateKey, keyToDate: keyToDate, addDays: addDays, weekday: weekday, daysBetween: daysBetween,
    bmr: bmr, baseExpenditure: baseExpenditure, exerciseKcal: exerciseKcal, goalDelta: goalDelta, floorKcal: floorKcal,
    dailyBudget: dailyBudget, proteinTarget: proteinTarget, macroTargets: macroTargets,
    foodValues: foodValues, dayTotals: dayTotals, dayWorkoutKcal: dayWorkoutKcal,
    weightTrend: weightTrend, trendRate: trendRate, adaptiveTdee: adaptiveTdee, periodSeries: periodSeries,
    whtr: whtr, whr: whr, navyBodyFat: navyBodyFat, habitScore: habitScore, weeklyActiveMinutes: weeklyActiveMinutes
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Engine = api;
})(this);
