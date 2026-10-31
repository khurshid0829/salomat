(function () {
  'use strict';

  var E = window.Engine;
  var KEY = 'salomat-v1';
  var MEALS = [['b', 'Nonushta'], ['l', 'Tushlik'], ['s', 'Gazak'], ['d', 'Kechki ovqat']];
  var MEAL_NAME = { b: 'Nonushta', l: 'Tushlik', s: 'Gazak', d: 'Kechki ovqat' };
  var MEAL_TO = { b: 'Nonushtaga', l: 'Tushlikka', s: 'Gazakka', d: 'Kechki ovqatga' };
  var LEVELS = ['Yengil', 'Oʻrtacha', 'Jadal'];
  var LEVEL_MULT = [0.8, 1, 1.25];
  var WD = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  var WD_SHORT = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
  var MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  var MONTH_SHORT = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  var DEFAULT_HABITS = [
    { id: 'log', title: 'Ovqatni yozib borish', why: 'Yozib borish — vazn nazoratining eng kuchli omili' },
    { id: 'steps', title: '8 000 qadam', why: 'Kundalik qadam — eng oson faollik' },
    { id: 'protein', title: 'Oqsil maqsadiga yetish', why: 'Defitsitda mushakni saqlaydi' },
    { id: 'water', title: '2 litr suv', why: 'Ochlik va chanqoqni farqlashga yordam beradi' },
    { id: 'train', title: 'Mashq qilish', why: 'Haftada 3 marta: kuch mashqi va yurish' }
  ];
  var DEFAULT_PROFILE = { male: true, age: 35, height: 175, weight: 80, act: 0, goal: 'lose', rate: 1 };
  // shown in "one tap" before the user has history
  var STARTER = [['palov', 300], ['obi-non', 50], ['choy', 200], ['tuxum', 110], ['lagmon', 450], ['somsa', 110], ['tovuq-shorva', 450], ['olma', 180]];

  var ICON = {
    ring: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9"/>',
    food: '<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.5 1.5-3.5 4-3.5 7.5S15 15 17 15"/>',
    pulse: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    scale: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 10a5 5 0 0 1 7 0M12 10l1.5-2"/>',
    chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9z"/>',
    repeat: '<path d="M3 12a9 9 0 0 1 15.4-6.4L21 8M21 3v5h-5"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
    bowl: '<path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-1.5 1-1.5 1-3M12 7c0-1.5 1-1.5 1-3M16 7c0-1.5 1-1.5 1-3"/>',
    apple: '<path d="M12 7c-3-2-8-1-8 5 0 5 3 9 5 9 1.2 0 1.8-.6 3-.6s1.8.6 3 .6c2 0 5-4 5-9 0-6-5-7-8-5zM12 7c0-2 1-4 3-4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'
  };
  var MEAL_ICON = { b: ['sun', 'var(--energy-soft)', 'var(--energy)'], l: ['bowl', 'var(--accent-soft)', 'var(--accent)'], s: ['apple', 'var(--fat-soft)', 'var(--fat)'], d: ['moon', 'var(--protein-soft)', 'var(--protein)'] };

  function icon(name, size, width) {
    return '<svg width="' + (size || 24) + '" height="' + (size || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (width || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function n0(x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ').replace('-', '−'); }
  function signed(x) { return (x > 0 ? '+' : '') + n0(x); }
  function kg1(x) { return x == null ? '—' : (Math.round(x * 10) / 10).toFixed(1).replace('.', ',').replace('-', '−'); }
  function skg(x) { return x == null ? '—' : (x > 0 ? '+' : '') + kg1(x) + ' kg'; }
  function norm(s) { return String(s).toLowerCase().replace(/[ʻʼ’‘'`]/g, '\''); }
  // search key: apostrophes dropped, so "goshtli" finds "goʻshtli"
  function skey(s) { return norm(s).replace(/'/g, ''); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function today() { return E.dateKey(Date.now()); }
  function num(v) { var x = parseFloat(String(v).replace(',', '.')); return isNaN(x) ? null : x; }
  function frac(x) {
    var w = Math.floor(x + 1e-9), r = Math.round((x - w) * 4) / 4;
    var part = r === 0.5 ? '½' : r === 0.25 ? '¼' : r === 0.75 ? '¾' : '';
    return (w || !part ? String(w) : '') + part;
  }

  // ---------- storage ----------

  function normalize(d) {
    d = d || {};
    var arr = function (x) { return Array.isArray(x) ? x : []; };
    return {
      profile: d.profile ? Object.assign({}, DEFAULT_PROFILE, d.profile) : null,
      log: arr(d.log), foods: arr(d.foods), workouts: arr(d.workouts),
      weights: arr(d.weights), measures: arr(d.measures),
      habits: Array.isArray(d.habits) ? d.habits : DEFAULT_HABITS.slice(),
      checks: d.checks && typeof d.checks === 'object' ? d.checks : {}
    };
  }

  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) return normalize(JSON.parse(raw)); } catch (e) { /* defaults */ }
    return normalize({});
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { toast('Saqlab boʻlmadi'); }
  }

  var db = load();
  var ui = { day: null, period: 'week', query: '', pick: null, grams: null, gramEdit: false, form: null, addMeal: 'l', mealMenu: false,
    wType: 'yurish', wMin: 30, wLevel: 1, wDay: 0, pdraft: null, lastRoute: null, editFor: null };

  var toastTimer = null;
  function toast(msg, undoIds) {
    var box = document.getElementById('toast');
    box.innerHTML = '<div class="toast" role="status">' + icon('check', 18, 3) + '<span class="sp">' + esc(msg) + '</span>' +
      (undoIds ? '<button data-act="undo" data-v="' + undoIds.join(',') + '">Bekor</button>' : '') + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { box.innerHTML = ''; }, undoIds ? 4500 : 1800);
  }

  function allFoods() { return db.foods.concat(window.FOODS); }
  function findFood(id) {
    var list = allFoods().concat(ui.net ? ui.net.items : []);
    return list.filter(function (f) { return f.id === id; })[0] || null;
  }

  function searchLocal(q) {
    var words = skey(q).split(/\s+/).filter(Boolean);
    var hits = allFoods().filter(function (f) {
      var hay = skey(f.name + ' ' + (f.alt || ''));
      return words.every(function (w) { return hay.indexOf(w) >= 0; });
    });
    // names that start with the first word come first
    return hits.filter(function (f) { return skey(f.name).indexOf(words[0]) === 0; })
      .sort(function (a, b) { return a.name.length - b.name.length; })
      .concat(hits.filter(function (f) { return skey(f.name).indexOf(words[0]) !== 0; }));
  }

  // The portion a food is measured in by default: the "o'rta" one, else the first.
  function unitOf(food) {
    var ps = food.portions || [];
    var mid = ps.filter(function (p) { return /oʻrta/i.test(p[0]); })[0];
    return mid || ps[0] || ['100 g', 100];
  }

  function portionLabel(food, grams) {
    var hit = (food.portions || []).filter(function (p) { return p[1] === grams; })[0];
    return hit ? hit[0] : grams + ' g';
  }

  function dayLabel(key) {
    var d = E.keyToDate(key);
    return WD[d.getDay()] + ', ' + d.getDate() + '-' + MONTHS[d.getMonth()];
  }

  function header(eyebrow, title, extra) {
    return '<header class="head"><div><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1></div>' + (extra || '') + '</header>';
  }

  function latestWeight() {
    var w = db.weights.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return w.length ? w[w.length - 1] : null;
  }

  function snapshot(key) {
    var p = db.profile, trend = E.weightTrend(db.weights, key);
    var kg = trend.latest != null ? trend.latest : p.weight;
    var adaptive = E.adaptiveTdee(db.log, db.weights, key);
    var wk = E.dayWorkoutKcal(db.workouts, key);
    var b = E.dailyBudget(p, kg, wk, adaptive);
    return { p: p, trend: trend, kg: kg, adaptive: adaptive, wk: wk, b: b, t: E.dayTotals(db.log, key), macros: E.macroTargets(b.budget, kg) };
  }

  function mealNow() {
    var h = new Date().getHours();
    return h < 11 ? 'b' : h < 16 ? 'l' : h < 18 ? 's' : 'd';
  }

  // ---------- today ----------

  function viewToday() {
    var key = today(), s = snapshot(key), h = '';
    h += header(dayLabel(key), 'Bugun', '<a class="icon-btn" href="#profil" aria-label="Maqsad va profil">' + icon('user', 22) + '</a>');

    var left = s.b.budget - s.t.kcal, over = left < 0;
    var pct = s.b.budget ? Math.round(s.t.kcal / s.b.budget * 100) : 0;
    h += '<section class="card" style="padding:16px 18px;gap:10px" aria-label="Kunlik energiya">' +
      '<div class="between"><span class="muted" style="font-size:15px;font-weight:600">' + (over ? 'Byudjetdan ortiq' : 'Qoldi') + '</span>' +
      '<span class="muted small">byudjetning ' + pct + '%</span></div>' +
      '<div class="rnd num" style="display:flex;align-items:baseline;gap:4px;margin-top:-2px"><span class="hero-num"' + (over ? ' style="color:var(--warn)"' : '') + '>' +
      n0(Math.abs(left)) + '</span><span class="muted" style="font-size:17px;font-weight:500">kkal</span></div>' +
      '<div class="bar" role="img" aria-label="Byudjetning ' + pct + ' foizi ishlatildi"><div style="width:' + Math.min(100, pct) + '%;background:' + (over ? 'var(--warn)' : 'var(--energy-bar)') + '"></div></div>' +
      '<div class="grid3">' +
      '<div class="stat"><b class="rnd num">' + n0(s.b.budget) + '</b><span>byudjet</span></div>' +
      '<div class="stat"><b class="rnd num" style="color:var(--energy)">' + n0(s.t.kcal) + '</b><span>yedingiz</span></div>' +
      '<div class="stat"><b class="rnd num ok">' + (s.b.mode === 'adaptive' ? n0(s.wk) : '+' + n0(s.wk)) + '</b><span>mashq</span></div></div>' +
      '<span class="tiny muted">Hozircha balans ' + signed(s.t.kcal - s.b.tdee) + ' kkal · reja ' + signed(s.b.delta) +
      (s.b.mode === 'adaptive' ? ' · sarf sizning maʼlumotingizdan' : '') + '</span></section>';

    h += '<section class="card grid3" style="display:grid;padding:14px 16px">' +
      macroRing('Oqsil', s.t.p, s.macros.p, 'var(--protein)', 'var(--protein-soft)') +
      macroRing('Yogʻ', s.t.f, s.macros.f, 'var(--fat)', 'var(--fat-soft)') +
      macroRing('Uglevod', s.t.c, s.macros.c, 'var(--carb)', 'var(--carb-soft)') + '</section>';

    var empty = MEALS.filter(function (m) { return !s.t.meals[m[0]]; }).length;
    var suggest = left > 0 && empty ? Math.round(left / empty / 10) * 10 : null;
    h += '<section class="card flush">' + MEALS.map(function (m) {
      var items = db.log.filter(function (e) { return e.date === key && e.meal === m[0]; });
      var ic = MEAL_ICON[m[0]];
      var lead = '<span class="meal-ic" style="background:' + ic[1] + ';color:' + ic[2] + '">' + icon(ic[0], 20) + '</span>';
      if (items.length) {
        return '<a class="meal-row" href="#ovqat">' + lead + '<span class="grow stack" style="gap:0"><b>' + m[1] + '</b><span class="small muted ellipsis">' +
          esc(uniqueNames(items)) + '</span></span><span class="rnd num" style="font-size:17px;font-weight:600;margin-right:6px">' +
          n0(s.t.meals[m[0]]) + '</span></a>';
      }
      return '<div class="meal-row">' + lead + '<span class="grow stack" style="gap:0"><b>' + m[1] + '</b><span class="small muted">' +
        (suggest ? 'Tavsiya: ~' + n0(suggest) + ' kkal' : 'Hali yoʻq') + '</span></span><a class="plus" href="#qoshish/' + m[0] + '" aria-label="' + MEAL_TO[m[0]] + ' qoʻshish">+</a></div>';
    }).join('') + '</section>';

    var mins = E.weeklyActiveMinutes(db.workouts, key), rate = E.trendRate(s.trend, key, 14);
    h += '<section class="grid2">' +
      '<a class="tile" href="#mashq"><span class="small muted">Faollik (7 kun)</span><span class="v rnd num">' + mins + ' <small>daq</small></span>' +
      '<span class="tiny ' + (mins >= 150 ? 'ok' : 'muted') + '">Maqsad: 150 daq</span></a>' +
      '<a class="tile" href="#tana"><span class="small muted">Vazn (trend)</span><span class="v rnd num">' + kg1(s.trend.latest) + ' <small>kg</small></span>' +
      '<span class="tiny ' + (rate != null && rate < 0 ? 'ok' : 'muted') + '">' + (rate == null ? 'Tortilib boring' : skg(rate) + ' haftada') + '</span></a></section>';

    var checks = db.checks[key] || {}, done = db.habits.filter(function (x) { return checks[x.id]; }).length;
    h += '<a class="card" href="#odatlar" style="flex-direction:row;align-items:center;text-decoration:none;color:inherit;padding:14px 16px">' +
      '<span class="grow stack" style="gap:6px"><b>Bugungi odatlar · ' + done + '/' + db.habits.length + '</b><span class="dots7" aria-hidden="true">' +
      db.habits.map(function (x) { return '<span class="' + (checks[x.id] ? 'on' : '') + '"></span>'; }).join('') + '</span></span>' +
      '<span class="muted">' + icon('chev', 18, 2.5) + '</span></a>';
    return h;
  }

  function uniqueNames(items) {
    var seen = {};
    return items.map(function (e) { return e.name; }).filter(function (n) { return seen[n] ? false : (seen[n] = true); }).join(', ');
  }

  function macroRing(label, val, target, color, soft) {
    var C = 2 * Math.PI * 16, pct = target ? Math.min(1, val / target) : 0;
    return '<div class="row" style="gap:8px;min-width:0"><svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="' + label + ' ' + Math.round(pct * 100) + ' foiz" style="flex-shrink:0">' +
      '<circle cx="20" cy="20" r="16" fill="none" stroke="' + soft + '" stroke-width="5"/><circle cx="20" cy="20" r="16" fill="none" stroke="' + color +
      '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (pct * C).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 20 20)"/></svg>' +
      '<div class="stack" style="gap:0;min-width:0"><span class="tiny" style="font-weight:600;color:' + color + '">' + label + '</span><span class="rnd num small"><b>' + val +
      '</b><span class="muted">/' + target + '</span></span></div></div>';
  }

  // ---------- food log ----------

  function viewFood() {
    var key = ui.day || today(), s = snapshot(key), isToday = key === today(), h = '';
    h += '<header class="head"><div><div class="row" style="gap:6px">' +
      '<button class="icon-btn" data-act="dayShift" data-v="-1" aria-label="Oldingi kun">‹</button>' +
      '<span class="eyebrow">' + (isToday ? 'Bugun' : dayLabel(key)) + '</span>' +
      (isToday ? '' : '<button class="icon-btn" data-act="dayShift" data-v="1" aria-label="Keyingi kun">›</button>') +
      '</div><h1>Ovqat</h1></div></header>';

    var pct = Math.min(100, Math.round(s.t.kcal / s.b.budget * 100));
    h += '<div class="card" style="padding:14px 16px;gap:8px"><div class="between small"><span class="muted">Isteʼmol / byudjet</span><b class="rnd num">' +
      n0(s.t.kcal) + ' / ' + n0(s.b.budget) + ' kkal</b></div><div class="bar"><div style="width:' + pct + '%;background:var(--energy-bar)"></div></div>' +
      '<div class="grid3 tiny num"><span style="color:var(--protein)">Oqsil ' + s.t.p + ' g</span><span class="center" style="color:var(--fat)">Yogʻ ' + s.t.f + ' g</span><span style="text-align:right;color:var(--carb)">Uglevod ' + s.t.c + ' g</span></div></div>';

    MEALS.forEach(function (m) {
      var items = db.log.filter(function (e) { return e.date === key && e.meal === m[0]; });
      h += '<section class="card" style="padding:6px 16px;gap:0"><div class="meal-head"><b>' + m[1] + '</b><span class="rnd num muted small">' + n0(s.t.meals[m[0]] || 0) + ' kkal</span></div>';
      items.forEach(function (e) {
        h += '<a class="entry" href="#yozuv/' + esc(e.id) + '"><span class="grow">' + esc(e.name) +
          (e.grams ? ' <span class="p">· ' + esc(e.portion || (e.grams + ' g')) + '</span>' : '') + '</span><span class="rnd num">' + n0(e.kcal) + '</span></a>';
      });
      h += '<a class="add-link" href="#qoshish/' + m[0] + '">+ Qoʻshish</a></section>';
    });
    return h;
  }

  // ---------- add food ----------

  // Most used foods over the last 60 days, each with the grams last used.
  function frequentFoods(n) {
    var from = E.addDays(today(), -60), stats = {};
    db.log.forEach(function (e) {
      if (!e.foodId || !e.grams || e.date < from) return;
      var s = stats[e.foodId] = stats[e.foodId] || { count: 0, grams: e.grams, last: '' };
      s.count++;
      if (e.date >= s.last) { s.last = e.date; s.grams = e.grams; }
    });
    var list = Object.keys(stats).map(function (id) { return { food: findFood(id), grams: stats[id].grams, count: stats[id].count }; })
      .filter(function (x) { return x.food; }).sort(function (a, b) { return b.count - a.count; });
    STARTER.forEach(function (s) {
      if (list.length < n && !list.some(function (x) { return x.food.id === s[0]; })) list.push({ food: findFood(s[0]), grams: s[1], count: 0 });
    });
    return list.slice(0, n);
  }

  // The latest earlier day that has this meal, to repeat it in one tap.
  function lastMeal(meal, key) {
    var best = null;
    db.log.forEach(function (e) { if (e.meal === meal && e.date < key && (!best || e.date > best)) best = e.date; });
    if (!best) return null;
    var items = db.log.filter(function (e) { return e.meal === meal && e.date === best; });
    return { date: best, items: items, kcal: items.reduce(function (a, e) { return a + e.kcal; }, 0) };
  }

  function viewAdd(meal) {
    // the route picks the meal once; later re-renders keep the user's choice
    if (MEAL_NAME[meal] && ui.addRoute !== meal) { ui.addMeal = meal; ui.addRoute = meal; }
    var key = ui.day || today(), mk = E.dayTotals(db.log, key).meals[ui.addMeal] || 0;
    var h = '<div class="add-head"><a class="pill-btn glass" href="#ovqat" data-act="resetAdd">Yopish</a>' +
      '<button class="pill-btn glass meal-pill" data-act="mealMenu" aria-expanded="' + ui.mealMenu + '">' + MEAL_NAME[ui.addMeal] +
      ' <span class="muted rnd num" style="font-weight:500">· ' + n0(mk) + ' kkal</span>' + icon('down', 12, 3) + '</button></div>';
    if (ui.mealMenu) {
      h += '<div class="menu glass" role="group" aria-label="Ovqat vaqti">' + MEALS.map(function (m) {
        return '<button data-act="addMeal" data-v="' + m[0] + '" aria-pressed="' + (ui.addMeal === m[0]) + '">' + m[1] + (ui.addMeal === m[0] ? icon('check', 16, 3) : '') + '</button>';
      }).join('') + '</div>';
    }
    if (ui.form === 'food') return h + customFoodForm();
    if (ui.form === 'quick') return h + quickForm();
    h += '<div id="results" class="stack" style="gap:16px">' + resultsHtml() + '</div>';
    h += '<label class="search-float glass">' + icon('search', 20, 2.4) +
      '<input type="search" data-field="query" placeholder="Ovqat qidiring" value="' + esc(ui.query) + '" aria-label="Ovqat qidiring" autocomplete="off" enterkeyhint="search"></label>';
    return h;
  }

  function resultsHtml() {
    var q = ui.query.trim(), h = '';
    if (q) {
      var list = searchLocal(q);
      if (list.length) h += '<div class="card flush">' + list.slice(0, 30).map(function (f) { return foodRow(f, unitOf(f)[1]); }).join('') + '</div>';
      else h += '<div class="card empty"><span class="muted small">Ilova bazasida “' + esc(q) + '” yoʻq.</span></div>';
      return h + netHtml(q) + extraButtons();
    }
    var freq = frequentFoods(10);
    h += '<section class="stack" style="gap:8px"><span class="section-title">Bir bosishda</span><div class="qrow">' + freq.slice(0, 5).map(function (x) {
      var v = E.foodValues(x.food, x.grams);
      return '<button class="qchip glass" data-act="quickAdd" data-v="' + esc(x.food.id) + '" data-g="' + x.grams + '" aria-label="' + esc(x.food.name) + ' qoʻshish, ' + v.kcal + ' kkal">' +
        '<span class="stack" style="gap:0"><b style="font-size:15px">' + esc(x.food.name) + '</b><span class="tiny muted num">' + esc(portionLabel(x.food, x.grams)) + ' · ' + v.kcal +
        '</span></span><span class="pl" aria-hidden="true">+</span></button>';
    }).join('') + '</div></section>';

    var last = lastMeal(ui.addMeal, ui.day || today());
    if (last) {
      var isYesterday = last.date === E.addDays(ui.day || today(), -1);
      h += '<section class="card" style="flex-direction:row;align-items:center;padding:10px 10px 10px 16px;gap:12px">' +
        '<span class="meal-ic" style="background:var(--accent-soft);color:var(--accent)">' + icon('repeat', 18, 2.2) + '</span>' +
        '<span class="grow stack" style="gap:0"><b style="font-size:15px">' + (isYesterday ? 'Kechagi ' + MEAL_NAME[ui.addMeal].toLowerCase() : MEAL_NAME[ui.addMeal] + ', ' + dayLabel(last.date).split(', ')[1]) +
        '</b><span class="tiny muted ellipsis">' + esc(uniqueNames(last.items)) + ' · ' + n0(last.kcal) + ' kkal</span></span>' +
        '<button class="btn sm secondary" data-act="repeatMeal" data-v="' + last.date + '">Takrorlash</button></section>';
    }

    h += '<section class="stack" style="gap:8px"><span class="section-title">' + (freq.some(function (x) { return x.count; }) ? 'Siz koʻp yeydiganlar' : 'Mashhur taomlar') + '</span>' +
      '<div class="card flush">' + freq.map(function (x) { return foodRow(x.food, x.grams); }).join('') + '</div></section>';
    return h + extraButtons();
  }

  // ---------- online food search (USDA FoodData Central + Open Food Facts) ----------

  var USDA = 'https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&pageSize=8&dataType=' +
    encodeURIComponent('Foundation,SR Legacy,Survey (FNDDS)') + '&query=';
  var OFF = 'https://world.openfoodfacts.org/cgi/search.pl?search_simple=1&json=1&page_size=8' +
    '&fields=code,product_name,brands,nutriments,serving_quantity&search_terms=';

  function netHtml(q) {
    var n = ui.net && ui.net.q === q ? ui.net : null;
    if (!n) {
      return '<button class="card net-btn" data-act="netSearch">' + icon('globe', 22) + '<span class="grow stack" style="gap:0;text-align:left">' +
        '<b>Internetdan qidirish</b><span class="small muted">USDA va Open Food Facts bazalaridan</span></span></button>';
    }
    if (n.state === 'loading') return '<div class="card empty"><span class="muted small">Internetdan qidirilmoqda…</span></div>';
    if (n.state === 'error') {
      return '<div class="card empty"><span class="muted small">Internetga ulanib boʻlmadi yoki soatlik limit tugadi. Keyinroq urinib koʻring.</span>' +
        '<button class="btn sm secondary" data-act="netSearch">Qayta urinish</button></div>';
    }
    if (!n.items.length) return '<div class="card empty"><span class="muted small">Internetda ham topilmadi. “Yangi mahsulot” orqali qoʻshing.</span></div>';
    return '<section class="stack" style="gap:8px"><span class="section-title">Internetdan · 100 g uchun oʻrtacha</span><div class="card flush">' +
      n.items.map(function (f) { return foodRow(f, unitOf(f)[1]); }).join('') + '</div></section>';
  }

  function toEnglish(q) {
    return skey(q).split(/\s+/).map(function (w) {
      var dict = window.FOOD_EN || {};
      return dict[w] || dict[w.replace(/(lari|li|lik|ning|ni|dan|da|ga)$/, '')] || w;
    }).join(' ');
  }

  function r1(x) { return Math.round((Number(x) || 0) * 10) / 10; }
  function capital(s) { s = String(s).trim(); return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(); }

  var MEASURE_UZ = [[/\bcups?\b/i, 'stakan'], [/\btbsp\b|\btablespoons?\b/i, 'osh qoshiq'], [/\btsp\b|\bteaspoons?\b/i, 'choy qoshiq'],
    [/\bslices?\b/i, 'tilim'], [/\bpieces?\b/i, 'dona'], [/\bmedium\b/i, 'oʻrta'], [/\bsmall\b/i, 'kichik'], [/\blarge\b/i, 'katta']];
  function measureUz(s) {
    MEASURE_UZ.forEach(function (m) { s = s.replace(m[0], m[1]); });
    return s;
  }

  function fromUsda(x) {
    var get = function (nums) {
      var hit = (x.foodNutrients || []).filter(function (n) { return nums.indexOf(String(n.nutrientNumber)) >= 0 && n.value != null; })[0];
      return hit ? hit.value : null;
    };
    var kcal = get(['208', '957', '958']);
    if (kcal == null) return null;
    var portions = (x.foodMeasures || []).filter(function (m) { return m.gramWeight > 0 && m.disseminationText && !/quantity not/i.test(m.disseminationText); })
      .slice(0, 2).map(function (m) { return [measureUz(m.disseminationText), Math.round(m.gramWeight)]; });
    return { id: 'n-usda-' + x.fdcId, name: capital(x.description), kcal: Math.round(kcal), p: r1(get(['203'])), f: r1(get(['204'])), c: r1(get(['205'])),
      portions: portions.concat([['100 g', 100]]), net: true, src: 'USDA' };
  }

  function fromOff(x) {
    var n = x.nutriments || {}, kcal = n['energy-kcal_100g'] != null ? n['energy-kcal_100g'] : n.energy_100g != null ? n.energy_100g / 4.184 : null;
    if (kcal == null || !x.product_name) return null;
    var brand = String(x.brands || '').split(',')[0].trim(), sq = Number(x.serving_quantity), name = x.product_name.trim();
    if (name === name.toUpperCase()) name = capital(name);
    if (brand.length > 24 || name.toLowerCase().indexOf(brand.toLowerCase()) >= 0) brand = '';
    return { id: 'n-off-' + x.code, name: name + (brand ? ' — ' + brand : ''), kcal: Math.round(kcal),
      p: r1(n.proteins_100g), f: r1(n.fat_100g), c: r1(n.carbohydrates_100g),
      portions: (sq > 0 ? [['1 porsiya', Math.round(sq)]] : []).concat([['100 g', 100]]), net: true, src: 'Open Food Facts' };
  }

  function getJson(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  function netSearch(q) {
    ui.net = { q: q, state: 'loading', items: [] };
    showResults();
    var usda = getJson(USDA + encodeURIComponent(toEnglish(q))).then(function (d) {
      return (d.foods || []).map(fromUsda).filter(Boolean);
    }).catch(function () { return null; });
    var off = getJson(OFF + encodeURIComponent(q)).then(function (d) {
      return (d.products || []).map(fromOff).filter(Boolean);
    }).catch(function () { return null; });
    Promise.all([usda, off]).then(function (r) {
      if (!ui.net || ui.net.q !== q) return;
      ui.net.state = r[0] == null && r[1] == null ? 'error' : 'done';
      var seen = {};
      ui.net.items = (r[0] || []).concat(r[1] || []).filter(function (f) {
        var k = skey(f.name) + f.kcal;
        return seen[k] ? false : (seen[k] = true);
      });
      showResults();
    });
  }

  function showResults() {
    var box = document.getElementById('results');
    if (box) box.innerHTML = resultsHtml();
  }

  function extraButtons() {
    return '<div class="grid2"><button class="btn sm secondary" data-act="form" data-v="quick">Tezkor kkal</button><button class="btn sm secondary" data-act="form" data-v="food">Yangi mahsulot</button></div>';
  }

  function foodRow(f, grams) {
    var v = E.foodValues(f, grams);
    return '<div class="frow"><button class="frow-main" data-act="pickFood" data-v="' + esc(f.id) + '"><b style="font-size:16px">' + esc(f.name) + '</b>' +
      '<span class="small muted">' + esc(portionLabel(f, grams)) + (f.uz ? ' · taxminiy' : f.src ? ' · ' + f.src : f.custom ? ' · meniki' : '') + '</span></button>' +
      '<span class="rnd num muted" style="font-size:16px;font-weight:600">' + v.kcal + '</span>' +
      '<button class="plus" data-act="quickAdd" data-v="' + esc(f.id) + '" data-g="' + grams + '" aria-label="' + esc(f.name) + ' qoʻshish">+</button></div>';
  }

  function customFoodForm() {
    return '<section class="card"><h2>Yangi mahsulot yoki retsept</h2><span class="small muted">Qiymatlar 100 g uchun (qadoqdagi yorliqdan oling).</span>' +
      '<label class="field"><span>Nomi</span><input class="input" id="cf-name" placeholder="Masalan: Onamning palovi"></label>' +
      '<div class="grid2"><label class="field"><span>Kaloriya (kkal)</span><input class="input num" id="cf-kcal" type="number" inputmode="decimal"></label>' +
      '<label class="field"><span>Oqsil (g)</span><input class="input num" id="cf-p" type="number" inputmode="decimal"></label>' +
      '<label class="field"><span>Yogʻ (g)</span><input class="input num" id="cf-f" type="number" inputmode="decimal"></label>' +
      '<label class="field"><span>Uglevod (g)</span><input class="input num" id="cf-c" type="number" inputmode="decimal"></label></div>' +
      '<div class="grid2"><label class="field"><span>Porsiya nomi</span><input class="input" id="cf-pl" placeholder="Oʻrta kosa"></label>' +
      '<label class="field"><span>Porsiya (g)</span><input class="input num" id="cf-pg" type="number" inputmode="decimal"></label></div>' +
      '<button class="btn block" data-act="saveCustom">Saqlash va tanlash</button><button class="btn ghost" data-act="form" data-v="">Orqaga</button></section>';
  }

  function quickForm() {
    return '<section class="card"><h2>Tezkor qoʻshish</h2><span class="small muted">Aniq tarkibni bilmasangiz, taxminiy kaloriyani yozing.</span>' +
      '<label class="field"><span>Nomi (ixtiyoriy)</span><input class="input" id="q-name" placeholder="Masalan: toʻy oshi"></label>' +
      '<label class="field"><span>Kaloriya (kkal)</span><input class="input num" id="q-kcal" type="number" inputmode="numeric"></label>' +
      '<button class="btn block" data-act="saveQuick">Qoʻshish</button><button class="btn ghost" data-act="form" data-v="">Orqaga</button></section>';
  }

  // ---------- portion sheet ----------

  function sheetValues(food, grams) {
    var u = unitOf(food), v = E.foodValues(food, grams || 0);
    var pk = v.p * 4, fk = v.f * 9, ck = v.c * 4, tot = pk + fk + ck || 1;
    return {
      v: v, count: frac(grams / u[1]), unit: u[0].toLowerCase(),
      split: [Math.round(pk / tot * 100), Math.round(fk / tot * 100), Math.round(ck / tot * 100)],
      cta: MEAL_TO[ui.addMeal] + ' qoʻshish · ' + v.kcal + ' kkal'
    };
  }

  function sheetHtml() {
    var food = findFood(ui.pick);
    if (!food) return '';
    var u = unitOf(food), sv = sheetValues(food, ui.grams);
    var h = '<button class="scrim" data-act="unpick" aria-label="Yopish"></button><section class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(food.name) + ' porsiyasi">' +
      '<span class="grabber" aria-hidden="true"></span>' +
      '<div class="sheet-head"><button class="circ" data-act="unpick" aria-label="Yopish">' + icon('close', 16, 3) + '</button>' +
      '<div class="stack center" style="gap:2px;align-items:center"><b style="font-size:17px">' + esc(food.name) + '</b>' +
      (food.uz ? '<span class="tiny" style="font-weight:600;color:var(--carb)">taxminiy · uy retsepti</span>' : '<span class="tiny muted">100 g · ' + food.kcal + ' kkal</span>') + '</div><span></span></div>' +
      '<div class="rnd num" style="display:flex;align-items:baseline;justify-content:center;gap:6px"><span id="sv-kcal" style="font-size:44px;font-weight:600;letter-spacing:-0.5px;line-height:1;color:var(--energy)">' +
      sv.v.kcal + '</span><span class="muted" style="font-size:17px">kkal</span></div>' +
      '<div class="stepper"><button class="round" data-act="step" data-v="-1" aria-label="Yarim porsiya kam">−</button>' +
      '<button data-act="gramEdit" style="border:none;background:transparent;display:flex;flex-direction:column;align-items:center;min-height:56px;justify-content:center">' +
      '<b class="rnd num" style="font-size:22px"><span id="sv-count">' + sv.count + '</span> <span style="font-size:17px;font-weight:600">' + esc(sv.unit) + '</span></b>' +
      '<span class="small muted num"><span id="sv-grams">' + ui.grams + '</span> g · oʻzgartirish</span></button>' +
      '<button class="round" data-act="step" data-v="1" aria-label="Yarim porsiya koʻp">+</button></div>';
    if (ui.gramEdit) {
      h += '<label class="field"><span>Gramm</span><input class="input num" type="number" inputmode="decimal" min="1" max="3000" data-field="grams" value="' + ui.grams + '"></label>';
    }
    h += '<div class="grid4">' + [0.5, 1, 1.5, 2].map(function (k) {
      var g = Math.round(u[1] * k);
      return '<button class="frac" data-act="portion" data-v="' + g + '" aria-pressed="' + (ui.grams === g) + '">' + frac(k) + '</button>';
    }).join('') + '</div>';
    h += '<div class="stack" style="gap:8px"><div class="stack-bar" id="sv-bar" role="img" aria-label="Kaloriya tarkibi">' + splitBar(sv.split) + '</div>' +
      '<div class="grid3 small num" id="sv-macros">' + macroLegend(sv.v) + '</div></div>';
    h += '<div class="seg" style="grid-template-columns:repeat(4,minmax(0,1fr))" role="group" aria-label="Ovqat vaqti">' + MEALS.map(function (m) {
      return '<button data-act="addMeal" data-v="' + m[0] + '" aria-pressed="' + (ui.addMeal === m[0]) + '">' + m[1].split(' ')[0] + '</button>';
    }).join('') + '</div>';
    h += '<button class="btn block" data-act="addFood" id="sv-cta" style="min-height:58px">' + sv.cta + '</button></section>';
    return h;
  }

  function splitBar(s) {
    return '<div style="width:' + s[0] + '%;background:var(--protein)"></div><div style="width:' + s[1] + '%;background:var(--fat)"></div><div style="width:' + s[2] + '%;background:var(--carb-bar)"></div>';
  }

  function macroLegend(v) {
    return '<span><b style="color:var(--protein)">' + v.p + ' g</b> <span class="muted">oqsil</span></span><span class="center"><b style="color:var(--fat)">' + v.f +
      ' g</b> <span class="muted">yogʻ</span></span><span style="text-align:right"><b style="color:var(--carb)">' + v.c + ' g</b> <span class="muted">uglevod</span></span>';
  }

  function updateSheet() {
    var food = findFood(ui.pick);
    if (!food || !document.getElementById('sv-kcal')) return;
    var sv = sheetValues(food, ui.grams || 0);
    document.getElementById('sv-kcal').textContent = sv.v.kcal;
    document.getElementById('sv-count').textContent = sv.count;
    document.getElementById('sv-grams').textContent = ui.grams || 0;
    document.getElementById('sv-bar').innerHTML = splitBar(sv.split);
    document.getElementById('sv-macros').innerHTML = macroLegend(sv.v);
    document.getElementById('sv-cta').textContent = sv.cta;
    Array.prototype.forEach.call(document.querySelectorAll('.frac'), function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-v')) === ui.grams)); });
  }

  // ---------- entry edit ----------

  function valuesHtml(food, grams) {
    var v = E.foodValues(food, grams || 0);
    return '<div class="between" style="margin-bottom:8px"><span class="muted">Kaloriya</span><b class="rnd num" style="font-size:22px;color:var(--energy)">' + n0(v.kcal) + ' <span class="small muted">kkal</span></b></div>' +
      '<div class="grid3"><div class="macro p"><b class="num">' + v.p + ' g</b><span>Oqsil</span></div><div class="macro f"><b class="num">' + v.f + ' g</b><span>Yogʻ</span></div><div class="macro c"><b class="num">' + v.c + ' g</b><span>Uglevod</span></div></div>';
  }

  function viewEntry(id) {
    var e = db.log.filter(function (x) { return x.id === id; })[0];
    if (!e) return '<a class="back" href="#ovqat">‹ Ovqat</a><div class="card empty">Yozuv topilmadi.</div>';
    var food = e.foodId ? findFood(e.foodId) : null;
    if (ui.editFor !== id) { ui.editFor = id; ui.grams = e.grams || null; ui.addMeal = e.meal; }
    var h = '<a class="back" href="#ovqat">‹ Ovqat</a>' + header(dayLabel(e.date), 'Tahrirlash');
    h += '<section class="card"><h2 style="font-size:20px">' + esc(e.name) + '</h2>';
    if (food) {
      h += '<div class="grid3">' + (food.portions || []).concat([['100 g', 100]]).map(function (p) {
        return '<button class="portion" data-act="portion" data-v="' + p[1] + '" aria-pressed="' + (ui.grams === p[1]) + '"><b>' + esc(p[0]) + '</b><span>' + p[1] + ' g</span></button>';
      }).join('') + '</div>' +
        '<label class="field"><span>Gramm</span><input class="input num" type="number" inputmode="decimal" data-field="grams" value="' + ui.grams + '"></label>' +
        '<div id="pv">' + valuesHtml(food, ui.grams) + '</div>';
    } else {
      h += '<label class="field"><span>Kaloriya (kkal)</span><input class="input num" id="e-kcal" type="number" value="' + e.kcal + '"></label>';
    }
    h += '<div class="seg" style="grid-template-columns:repeat(4,minmax(0,1fr))" role="group" aria-label="Ovqat vaqti">' + MEALS.map(function (m) {
      return '<button data-act="addMeal" data-v="' + m[0] + '" aria-pressed="' + (ui.addMeal === m[0]) + '">' + m[1].split(' ')[0] + '</button>';
    }).join('') + '</div>';
    h += '<button class="btn block" data-act="saveEntry" data-v="' + esc(id) + '">Saqlash</button>' +
      '<button class="btn danger" data-act="deleteEntry" data-v="' + esc(id) + '">Oʻchirish</button></section>';
    return h;
  }

  // ---------- workout ----------

  function viewWorkout() {
    var key = today(), h = '', s = snapshot(key);
    var mins = E.weeklyActiveMinutes(db.workouts, key);
    h += header('Oxirgi 7 kun', 'Mashq');
    h += '<section class="card"><div class="between"><span class="rnd num"><b style="font-size:22px">' + mins + '</b> <span class="muted">/ 150 daq</span></span>' +
      '<span class="tiny muted">JSST: haftada 150–300 daq</span></div><div class="week-bars">';
    for (var i = 6; i >= 0; i--) {
      var k = E.addDays(key, -i), m = db.workouts.filter(function (w) { return w.date === k; }).reduce(function (a, w) { return a + w.min; }, 0);
      h += '<div><div class="track"><div style="height:' + Math.min(64, Math.round(m / 60 * 64)) + 'px"></div></div>' +
        (i === 0 ? '<b class="ok">' + WD_SHORT[E.weekday(k)] + '</b>' : WD_SHORT[E.weekday(k)]) + '</div>';
    }
    h += '</div><span class="tiny muted">Jadal mashq daqiqalari maqsadga ikki barobar hisoblanadi.</span></section>';

    var todays = db.workouts.filter(function (w) { return w.date === key; });
    if (todays.length) {
      h += '<section class="card tight">' + todays.map(function (w, idx) {
        return '<div class="row" style="min-height:54px' + (idx ? ';border-top:1px solid var(--line)' : '') + '"><span class="grow stack" style="gap:1px"><b style="font-size:15px">' + esc(w.name) +
          '</b><span class="tiny muted">' + w.min + ' daq · ' + LEVELS[w.level].toLowerCase() + '</span></span><span class="rnd num ok" style="font-weight:600">+' + n0(w.kcal) +
          ' kkal</span><button class="x-btn" data-act="deleteWorkout" data-v="' + esc(w.id) + '" aria-label="Oʻchirish">×</button></div>';
      }).join('') + '</section>';
    }

    var act = window.ACTIVITIES.filter(function (a) { return a.id === ui.wType; })[0] || window.ACTIVITIES[0];
    var met = act.met * LEVEL_MULT[ui.wLevel], kcal = Math.round(E.exerciseKcal(met, s.kg, ui.wMin));
    h += '<section class="card"><h2>Mashq qoʻshish</h2><div class="grid4" style="gap:6px">' + window.ACTIVITIES.map(function (a) {
      return '<button class="type" data-act="wType" data-v="' + a.id + '" aria-pressed="' + (a.id === ui.wType) + '">' + a.name + '</button>';
    }).join('') + '</div>' +
      '<div class="stepper" style="min-height:72px"><button class="round" data-act="wMin" data-v="-5" aria-label="5 daqiqa kam">−</button><span class="rnd num" style="font-size:22px;font-weight:600">' + ui.wMin +
      ' <span class="muted" style="font-size:15px;font-weight:500">daqiqa</span></span><button class="round" data-act="wMin" data-v="5" aria-label="5 daqiqa koʻp">+</button></div>' +
      '<div class="seg" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Jadallik">' + LEVELS.map(function (l, i) {
        return '<button data-act="wLevel" data-v="' + i + '" aria-pressed="' + (ui.wLevel === i) + '">' + l + '</button>';
      }).join('') + '</div>' +
      '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))" role="group" aria-label="Kun"><button data-act="wDay" data-v="0" aria-pressed="' + (ui.wDay === 0) +
      '">Bugun</button><button data-act="wDay" data-v="-1" aria-pressed="' + (ui.wDay === -1) + '">Kecha</button></div>' +
      '<div class="row"><span class="grow small muted">≈ <b class="rnd" style="color:var(--text);font-size:17px">' + n0(kcal) + ' kkal</b> · MET ' + met.toFixed(1).replace('.', ',') + '</span>' +
      '<button class="btn sm" data-act="saveWorkout">Saqlash</button></div>' +
      '<span class="tiny muted">Faqat dam holatidan ortiq sarf hisoblanadi, shuning uchun kaloriya ikki marta qoʻshilmaydi.</span></section>';
    return h;
  }

  // ---------- body ----------

  function viewBody() {
    var key = today(), p = db.profile, h = '', trend = E.weightTrend(db.weights, key), lw = latestWeight();
    h += header('Vazn va oʻlchamlar', 'Tana');
    h += '<section class="card"><div class="row"><label class="field grow"><span>Bugungi vazn (kg)</span><input class="input num" id="w-kg" type="number" inputmode="decimal" step="0.1" value="' +
      (lw ? lw.kg : p.weight) + '"></label><button class="btn sm" data-act="saveWeight" style="align-self:flex-end">Saqlash</button></div>' +
      '<span class="tiny muted">Ertalab, hojatxonadan keyin, nonushtadan oldin torting.</span></section>';

    var rate = E.trendRate(trend, key, 14), from = E.addDays(key, -29);
    var pts = [], dots = '', vals = [];
    for (var i = 29; i >= 0; i--) {
      var k = E.addDays(key, -i);
      if (trend.map[k] != null) vals.push(trend.map[k]);
      db.weights.forEach(function (w) { if (w.date === k) vals.push(w.kg); });
    }
    h += '<section class="card chart"><div class="between"><span class="rnd num"><b style="font-size:28px">' + kg1(trend.latest) + '</b> <span class="muted">kg trend</span></span>' +
      '<span class="small num ' + (rate != null && rate < 0 ? 'ok' : 'muted') + '" style="font-weight:600">' + (rate == null ? '' : skg(rate) + ' / hafta') + '</span></div>';
    if (vals.length >= 2) {
      var lo = Math.floor(Math.min.apply(null, vals) - 0.5), hi = Math.ceil(Math.max.apply(null, vals) + 0.5);
      var y = function (v) { return 8 + (hi - v) / (hi - lo) * 104; }, x = function (j) { return 36 + j * (318 - 42) / 29; };
      for (var j = 0; j < 30; j++) {
        var kk = E.addDays(from, j);
        if (trend.map[kk] != null) pts.push(x(j).toFixed(1) + ',' + y(trend.map[kk]).toFixed(1));
        db.weights.forEach(function (w) { if (w.date === kk) dots += 'M' + x(j).toFixed(1) + ' ' + y(w.kg).toFixed(1) + 'h0'; });
      }
      h += '<svg viewBox="0 0 318 130" role="img" aria-label="30 kunlik vazn grafigi">' +
        '<line class="grid" x1="36" x2="318" y1="8" y2="8"/><line class="grid" x1="36" x2="318" y1="112" y2="112"/>' +
        '<text class="axis" x="0" y="12">' + kg1(hi) + '</text><text class="axis" x="0" y="116">' + kg1(lo) + '</text>' +
        '<path class="dots" d="' + dots + '"/><polyline class="trend" points="' + pts.join(' ') + '"/>' +
        '<text class="axis" x="36" y="128">30 kun oldin</text><text class="axis" x="318" y="128" text-anchor="end">bugun</text></svg>' +
        '<span class="tiny muted">Nuqtalar — tarozi, chiziq — silliqlangan trend. Kunlik ±1 kg tebranish (suv, tuz) normal.</span>';
    } else {
      h += '<span class="small muted">Grafik uchun kamida 2 kun torting.</span>';
    }
    h += '</section>';

    var ms = db.measures.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var last = ms[ms.length - 1] || {}, first = ms[0] || {};
    var fields = [['waist', 'Bel aylanasi'], ['chest', 'Koʻkrak aylanasi'], ['hip', 'Boʻksa aylanasi'], ['neck', 'Boʻyin aylanasi']];
    h += '<span class="section-title">Oʻlchamlar (sm)</span><section class="card"><div class="grid2">' + fields.map(function (f) {
      var d = last[f[0]] != null && first[f[0]] != null && ms.length > 1 ? last[f[0]] - first[f[0]] : null;
      return '<label class="field"><span>' + f[1] + (d ? ' <b class="' + (d < 0 ? 'ok' : 'warm') + '">' + (d > 0 ? '+' : '') + kg1(d).replace(',0', '') + '</b>' : '') + '</span>' +
        '<input class="input num" id="m-' + f[0] + '" type="number" inputmode="decimal" step="0.5" value="' + (last[f[0]] != null ? last[f[0]] : '') + '"></label>';
    }).join('') + '</div><button class="btn block secondary" data-act="saveMeasures">Oʻlchamlarni saqlash</button>' +
      '<span class="tiny muted">Bel: pastki qovurgʻa va son suyagi oʻrtasida, nafas chiqargandan keyin. Haftada bir marta yetarli.</span></section>';

    var height = p.height, w = last.waist, hipv = last.hip, neck = last.neck;
    var r1 = E.whtr(w, height), r2 = E.whr(w, hipv), bf = E.navyBodyFat(p.male, height, w, neck, hipv);
    h += '<section class="card tight">' +
      ratioRow('Bel / boʻy', 'maqsad 0,50 dan kam', r1, r1 != null && r1 >= 0.5) +
      ratioRow('Bel / boʻksa', 'JSST: ' + (p.male ? 'erkak 0,90' : 'ayol 0,85') + ' gacha', r2, r2 != null && r2 > (p.male ? 0.9 : 0.85), true) +
      '<div class="row" style="min-height:54px;border-top:1px solid var(--line)"><span class="grow stack" style="gap:0"><b style="font-size:15px">Tana yogʻi, taxminiy</b>' +
      '<span class="tiny muted">US Navy formulasi · ±3–4% · boʻyin ' + (p.male ? '' : 'va boʻksa ') + 'kerak</span></span><b class="rnd num">' + (bf == null ? '—' : bf + '%') + '</b></div></section>';
    return h;
  }

  function ratioRow(title, sub, v, high, border) {
    return '<div class="row" style="min-height:54px' + (border ? ';border-top:1px solid var(--line)' : '') + '"><span class="grow stack" style="gap:0"><b style="font-size:15px">' + title +
      '</b><span class="tiny muted">' + sub + '</span></span><b class="rnd num ' + (v == null ? '' : high ? 'warm' : 'ok') + '">' + (v == null ? '—' : String(v.toFixed(2)).replace('.', ',')) + '</b></div>';
  }

  // ---------- analysis ----------

  function viewAnalysis() {
    var key = today(), s = snapshot(key), h = '';
    var labels = { day: 'Bugun, ovqatlar boʻyicha', week: 'Oxirgi 7 kun', month: 'Oxirgi 30 kun', year: E.keyToDate(key).getFullYear() + ', oylik oʻrtacha' };
    h += header(labels[ui.period], 'Tahlil');
    h += '<div class="seg glass" style="grid-template-columns:repeat(4,minmax(0,1fr))" role="group" aria-label="Davr">' + [['day', 'Kun'], ['week', 'Hafta'], ['month', 'Oy'], ['year', 'Yil']].map(function (p) {
      return '<button data-act="period" data-v="' + p[0] + '" aria-pressed="' + (ui.period === p[0]) + '">' + p[1] + '</button>';
    }).join('') + '</div>';

    if (!db.log.length) {
      return h + '<div class="card empty"><h2>Hali maʼlumot yoʻq</h2><span class="small muted">Bir necha kun ovqat va vazn yozing — bu yerda grafik va xulosalar chiqadi.</span><a class="btn secondary" href="#qoshish/' + mealNow() + '">Ovqat qoʻshish</a></div>';
    }

    var bars, tiles;
    if (ui.period === 'day') {
      bars = MEALS.map(function (m) { return { label: m[1].split(' ')[0], intake: s.t.meals[m[0]] || 0, exp: null }; });
      tiles = [['Balans', signed(s.t.kcal - s.b.tdee)], ['Byudjet', n0(s.b.budget)], ['Oqsil', s.t.p + ' / ' + s.macros.p + ' g']];
    } else {
      var series = E.periodSeries({ profile: s.p, log: db.log, workouts: db.workouts, trend: s.trend }, ui.period, key);
      bars = series.bars.map(function (b, i) {
        var label = ui.period === 'year' ? MONTH_SHORT[b.month] : ui.period === 'week' ? WD_SHORT[b.weekday] : (i % 5 === 0 || i === 29 ? String(E.keyToDate(b.key).getDate()) : '');
        return { label: label, intake: b.intake, exp: b.exp };
      });
      tiles = [['Oʻrt. balans', series.avgBalance == null ? '—' : signed(series.avgBalance) + '/kun'], ['Kutilgan', skg(series.expectedKg)], ['Haqiqiy trend', skg(series.actualKg)]];
    }
    var max = Math.max(1000, Math.max.apply(null, bars.map(function (b) { return Math.max(b.intake || 0, b.exp || 0); })) * 1.08);
    var W = 318, H = 150, n = bars.length, cw = W / n, bw = Math.min(28, cw * 0.62), out = '';
    bars.forEach(function (b, i) {
      var cx = cw * i + cw / 2;
      if (b.intake != null) { var bh = b.intake / max * H; out += '<rect class="in" x="' + (cx - bw / 2).toFixed(1) + '" y="' + (H - bh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="' + Math.min(6, bw / 2).toFixed(1) + '"/>'; }
      if (b.exp != null) out += '<rect class="ex" x="' + (cx - cw * 0.45).toFixed(1) + '" y="' + (H - b.exp / max * H - 1.5).toFixed(1) + '" width="' + (cw * 0.9).toFixed(1) + '" height="3" rx="1.5"/>';
      if (b.label) out += '<text class="axis" x="' + cx.toFixed(1) + '" y="' + (H + 14) + '" text-anchor="middle">' + b.label + '</text>';
    });
    h += '<section class="card chart"><div class="between"><h2>Energiya balansi</h2><span class="legend"><span><i style="background:var(--energy-bar)"></i>isteʼmol</span>' +
      (ui.period === 'day' ? '' : '<span><i style="background:var(--accent);height:3px"></i>sarf</span>') + '</span></div>' +
      '<svg viewBox="0 0 ' + W + ' ' + (H + 18) + '" role="img" aria-label="Isteʼmol va sarf ustunlari"><line class="grid" x1="0" x2="' + W + '" y1="' + H + '" y2="' + H + '"/>' + out + '</svg></section>';
    h += '<section class="grid3">' + tiles.map(function (t, i) {
      return '<div class="tile"><span class="tiny muted">' + t[0] + '</span><b class="rnd num' + (i === 2 ? ' ok' : '') + '" style="font-size:17px">' + t[1] + '</b></div>';
    }).join('') + '</section>';

    var formula = Math.round(E.baseExpenditure(s.p, s.kg) + avgWorkout(key, 21));
    if (s.adaptive != null) {
      h += '<section class="card soft" style="gap:4px"><b>Haqiqiy sarfingiz ≈ ' + n0(s.adaptive) + ' kkal/kun</b><span class="small">3 haftalik ovqat va vazn trendidan hisoblandi. Formula ' +
        n0(formula) + ' deb baholagan. Byudjet shu haqiqiy qiymatga moslashtirildi.</span></section>';
    } else {
      h += '<section class="card soft" style="gap:4px"><b>Haqiqiy sarf hali hisoblanmagan</b><span class="small">Kamida 14 kun ovqat yozib, 8 marta tortilganingizdan soʻng ilova formulani sizning maʼlumotingiz bilan tuzatadi. Hozircha formula: ≈' + n0(formula) + ' kkal.</span></section>';
    }

    var days = ui.period === 'year' ? 365 : ui.period === 'month' ? 30 : 7, from = E.addDays(key, -(days - 1));
    var mins = db.workouts.filter(function (w) { return w.date >= from; }).reduce(function (a, w) { return a + w.min; }, 0);
    var ms = db.measures.filter(function (m) { return m.date >= from && m.waist; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var waist = ms.length > 1 ? ms[ms.length - 1].waist - ms[0].waist : null;
    var wt = s.trend.map[key] != null && s.trend.map[from] != null ? s.trend.map[key] - s.trend.map[from] : null;
    h += '<section class="grid4">' +
      '<a class="tile" href="#mashq"><span class="tiny muted">Mashq</span><b class="rnd num" style="font-size:15px">' + mins + ' daq</b></a>' +
      '<a class="tile" href="#tana"><span class="tiny muted">Vazn</span><b class="rnd num" style="font-size:15px">' + skg(wt) + '</b></a>' +
      '<a class="tile" href="#tana"><span class="tiny muted">Bel</span><b class="rnd num" style="font-size:15px">' + (waist == null ? '—' : (waist > 0 ? '+' : '') + kg1(waist).replace(',0', '') + ' sm') + '</b></a>' +
      '<a class="tile" href="#odatlar"><span class="tiny muted">Odatlar</span><b class="rnd num" style="font-size:15px">' + (E.habitScore(db.habits, db.checks, key, Math.min(days, 30)) || 0) + '%</b></a></section>';
    return h;
  }

  function avgWorkout(key, days) {
    var from = E.addDays(key, -(days - 1));
    return db.workouts.filter(function (w) { return w.date >= from && w.date <= key; }).reduce(function (a, w) { return a + w.kcal; }, 0) / days;
  }

  // ---------- habits ----------

  function viewHabits() {
    var key = today(), checks = db.checks[key] || {}, h = '';
    var done = db.habits.filter(function (x) { return checks[x.id]; }).length;
    h += '<a class="back" href="#bugun">‹ Bugun</a>' + header('Bugun ' + done + '/' + db.habits.length + ' · hafta ' + (E.habitScore(db.habits, db.checks, key, 7) || 0) + '%', 'Odatlar');
    h += '<section class="card soft small" style="line-height:20px"><span>Odat oʻrtacha <b>66 kunda</b> avtomatik boʻladi (odamga qarab 18–254 kun). Bir kun oʻtkazib yuborish natijaga taʼsir qilmaydi — asosiysi davom etish.</span></section>';
    h += '<div class="stack">' + db.habits.map(function (x) {
      var on = !!checks[x.id], cnt = 0, dots = '';
      for (var i = 6; i >= 0; i--) { var d = (db.checks[E.addDays(key, -i)] || {})[x.id]; if (d) cnt++; dots += '<span class="' + (d ? 'on' : '') + '"></span>'; }
      return '<div class="habit"><button class="check" data-act="habit" data-v="' + esc(x.id) + '" aria-pressed="' + on + '" aria-label="' + esc(x.title) + '">' + (on ? icon('check', 18, 3.5) : '') + '</button>' +
        '<span class="grow stack" style="gap:5px"><span class="between"><b style="font-size:15px">' + esc(x.title) + '</b><span class="tiny muted num">' + cnt + '/7</span></span>' +
        '<span class="dots7" aria-hidden="true">' + dots + '</span>' + (x.why ? '<span class="tiny muted">' + esc(x.why) + '</span>' : '') + '</span>' +
        '<button class="x-btn" data-act="removeHabit" data-v="' + esc(x.id) + '" aria-label="' + esc(x.title) + ' odatini oʻchirish">×</button></div>';
    }).join('') + '</div>';
    h += '<section class="card"><label class="field"><span>Yangi odat</span><input class="input" id="h-new" placeholder="Masalan: kechki 20:00 dan keyin ovqat yoʻq"></label><button class="btn secondary block" data-act="addHabit">Qoʻshish</button></section>';
    return h;
  }

  // ---------- profile ----------

  function viewProfile() {
    var first = !db.profile;
    if (!ui.pdraft) ui.pdraft = Object.assign({}, db.profile || DEFAULT_PROFILE);
    var d = ui.pdraft, h = '';
    h += (first ? '' : '<a class="back" href="#bugun">‹ Bugun</a>') + header(first ? 'Xush kelibsiz' : 'Shaxsiy sozlash', 'Maqsad');
    if (first) h += '<section class="card soft small" style="line-height:20px"><span>Kunlik kaloriya meʼyoringizni hisoblash uchun bir necha maʼlumot kerak. Hammasi faqat shu telefonda saqlanadi.</span></section>';
    h += '<section class="card">' +
      segRow('Jins', 'male', [[true, 'Erkak'], [false, 'Ayol']], d.male) +
      '<div class="grid3">' + numField('Yosh', 'age', d.age) + numField('Boʻy (sm)', 'height', d.height) + numField('Vazn (kg)', 'weight', d.weight) + '</div>' +
      segRow('Kundalik harakat (mashqsiz)', 'act', [[0, 'Oʻtirib'], [1, 'Aralash'], [2, 'Tik oyoqda']], d.act) +
      segRow('Maqsad', 'goal', [['lose', 'Tashlash'], ['keep', 'Saqlash'], ['gain', 'Oshirish']], d.goal) +
      (d.goal === 'keep' ? '' : segRow('Surʼat (vaznning haftalik %)', 'rate', d.goal === 'gain' ? [[0, '0,25%'], [1, '0,5%']] : [[0, '0,25%'], [1, '0,5%'], [2, '0,75%'], [3, '1%']], d.rate)) +
      '</section>';

    var bmr = E.bmr(d, d.weight), base = E.baseExpenditure(d, d.weight), b = E.dailyBudget(d, d.weight, 0, null);
    h += '<section class="card" style="gap:4px">' +
      kv('Asosiy almashinuv (BMR)', n0(bmr) + ' kkal') + kv('Kundalik sarf (mashqsiz)', n0(base) + ' kkal') +
      kv(d.goal === 'gain' ? 'Profitsit' : 'Defitsit', signed(b.delta) + ' kkal' + (d.goal === 'keep' ? '' : ' · ≈' + kg1(Math.abs(b.delta) * 7 / E.KCAL_PER_KG) + ' kg/hafta')) +
      '<div class="between" style="border-top:1px solid var(--line);min-height:52px"><b>Kunlik byudjet</b><b class="rnd num" style="font-size:20px;color:var(--energy)">' + n0(b.budget) + ' kkal</b></div>' +
      kv('Oqsil maqsadi (1,6 g/kg)', E.proteinTarget(d.weight) + ' g') +
      (b.floored ? '<span class="tiny warm">Byudjet xavfsiz chegaraga (' + E.floorKcal(d) + ' kkal) koʻtarildi. Sekinroq surʼat tanlang.</span>' : '') +
      '<span class="tiny muted" style="margin-top:4px">Mifflin–St Jeor formulasi. Mashq kunlari byudjetga mashq sarfi qoʻshiladi. 3 haftadan soʻng ilova haqiqiy sarfingizni vazn trendidan aniqlaydi.</span></section>';
    h += '<button class="btn block" data-act="saveProfile">' + (first ? 'Boshlash' : 'Saqlash') + '</button>';

    if (!first) {
      h += '<section class="card"><h2>Maʼlumotlar</h2><span class="small muted">Hammasi faqat shu qurilmada saqlanadi. Vaqti-vaqti bilan nusxa oling.</span>' +
        '<button class="btn secondary block" data-act="export">Nusxa olish (JSON)</button>' +
        '<label class="btn secondary block" style="cursor:pointer">Nusxadan tiklash<input type="file" accept="application/json,.json" data-act-change="import" hidden></label>' +
        (db.log.length ? '' : '<button class="btn ghost block" data-act="demo">Namuna maʼlumot bilan sinab koʻrish</button>') +
        '<button class="btn danger block" data-act="clearAll">Hamma maʼlumotni oʻchirish</button></section>';
    }
    h += '<p class="tiny muted center" style="margin:0">Salomat 0.3 · tibbiy maslahat oʻrnini bosmaydi. Homiladorlik, qandli diabet yoki boshqa kasallik boʻlsa, shifokor bilan maslahatlashing.</p>';
    return h;
  }

  function segRow(label, key, opts, value) {
    return '<div class="field"><span>' + label + '</span><div class="seg" style="grid-template-columns:repeat(' + opts.length + ',minmax(0,1fr))" role="group" aria-label="' + label + '">' +
      opts.map(function (o) { return '<button data-act="pseg" data-k="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (o[0] === value) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
  }

  function numField(label, key, value) {
    return '<label class="field"><span>' + label + '</span><input class="input num" type="number" inputmode="decimal" data-pf="' + key + '" value="' + value + '"></label>';
  }

  function kv(k, v) { return '<div class="between small" style="min-height:32px"><span class="muted">' + k + '</span><b class="num">' + v + '</b></div>'; }

  // ---------- routing ----------

  var VIEWS = { bugun: viewToday, ovqat: viewFood, qoshish: viewAdd, yozuv: viewEntry, mashq: viewWorkout, tana: viewBody, tahlil: viewAnalysis, odatlar: viewHabits, profil: viewProfile };
  var TABS = [['bugun', 'Bugun', 'ring'], ['ovqat', 'Ovqat', 'food'], ['mashq', 'Mashq', 'pulse'], ['tana', 'Tana', 'scale'], ['tahlil', 'Tahlil', 'chart']];
  var TAB_OF = { qoshish: 'ovqat', yozuv: 'ovqat', odatlar: 'bugun', profil: 'bugun' };

  function route() {
    var parts = (location.hash || '#bugun').slice(1).split('/');
    var name = VIEWS[parts[0]] ? parts[0] : 'bugun';
    if (!db.profile) name = 'profil';
    return { name: name, arg: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function render() {
    var r = route();
    document.getElementById('app').innerHTML = VIEWS[r.name](r.arg);
    var rk = r.name + '/' + (r.arg || '');
    if (ui.lastRoute !== rk) { window.scrollTo(0, 0); ui.lastRoute = rk; }
    var sheet = r.name === 'qoshish' && ui.pick && !ui.form ? sheetHtml() : '';
    document.getElementById('sheet').innerHTML = sheet;
    document.body.classList.toggle('sheet-open', !!sheet);
    var dock = document.getElementById('dock'), tabs = document.getElementById('tabs');
    dock.hidden = !db.profile || r.name === 'qoshish';
    if (!tabs.childElementCount) {
      tabs.innerHTML = TABS.map(function (t) { return '<a href="#' + t[0] + '" data-tab="' + t[0] + '">' + icon(t[2], 22, 2.2) + t[1] + '</a>'; }).join('');
    }
    document.getElementById('fab').setAttribute('href', '#qoshish/' + mealNow());
    var active = TAB_OF[r.name] || r.name;
    Array.prototype.forEach.call(tabs.children, function (a) {
      if (a.getAttribute('data-tab') === active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }

  // ---------- actions ----------

  function addLog(entry) {
    entry.id = uid();
    db.log.push(entry);
    // logging food counts as the logging habit for that day
    var day = db.checks[entry.date] = db.checks[entry.date] || {};
    if (db.habits.some(function (x) { return x.id === 'log'; })) day.log = true;
    return entry.id;
  }

  function logFood(food, grams) {
    // an online result is kept in "my foods" the first time it is eaten
    if (food.net && !db.foods.some(function (x) { return x.id === food.id; })) db.foods.unshift(Object.assign({}, food, { custom: true }));
    var v = E.foodValues(food, grams), hit = (food.portions || []).filter(function (p) { return p[1] === grams; })[0];
    return addLog({ date: ui.day || today(), meal: ui.addMeal, foodId: food.id, name: food.name, grams: grams, portion: hit ? hit[0] + ', ' + grams + ' g' : null, kcal: v.kcal, p: v.p, f: v.f, c: v.c });
  }

  function resetAdd() { ui.pick = null; ui.grams = null; ui.gramEdit = false; ui.form = null; ui.query = ''; ui.mealMenu = false; ui.addRoute = null; ui.net = null; }

  var ACTIONS = {
    dayShift: function (el) {
      var k = E.addDays(ui.day || today(), Number(el.getAttribute('data-v')));
      ui.day = k >= today() ? null : k; render();
    },
    resetAdd: function () { resetAdd(); go('#ovqat'); },
    mealMenu: function () { ui.mealMenu = !ui.mealMenu; render(); },
    form: function (el) { ui.form = el.getAttribute('data-v') || null; render(); },
    pickFood: function (el) {
      var f = findFood(el.getAttribute('data-v'));
      if (!f) return;
      var recent = frequentFoods(30).filter(function (x) { return x.food.id === f.id && x.count; })[0];
      ui.pick = f.id; ui.grams = recent ? recent.grams : unitOf(f)[1]; ui.gramEdit = false; render();
    },
    unpick: function () { ui.pick = null; ui.grams = null; ui.gramEdit = false; render(); },
    portion: function (el) { ui.grams = Number(el.getAttribute('data-v')); if (ui.pick) updateSheet(); else render(); },
    step: function (el) {
      var f = findFood(ui.pick), half = unitOf(f)[1] / 2;
      ui.grams = Math.max(Math.round(half), Math.round((Math.round(ui.grams / half) + Number(el.getAttribute('data-v'))) * half));
      updateSheet();
    },
    gramEdit: function () { ui.gramEdit = !ui.gramEdit; render(); var i = document.querySelector('.sheet [data-field=grams]'); if (i) i.focus(); },
    addMeal: function (el) {
      ui.addMeal = el.getAttribute('data-v'); ui.mealMenu = false;
      if (ui.pick) {
        Array.prototype.forEach.call(document.querySelectorAll('.sheet .seg button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === ui.addMeal)); });
        updateSheet();
      } else render();
    },
    netSearch: function () {
      var q = ui.query.trim();
      if (q) netSearch(q);
    },
    quickAdd: function (el) {
      var f = findFood(el.getAttribute('data-v')), g = Number(el.getAttribute('data-g'));
      if (!f || !g) return;
      var id = logFood(f, g); save();
      toast(f.name + ' qoʻshildi · ' + E.foodValues(f, g).kcal + ' kkal', [id]); render();
    },
    repeatMeal: function (el) {
      var from = el.getAttribute('data-v'), key = ui.day || today(), ids = [], kcal = 0;
      db.log.filter(function (e) { return e.meal === ui.addMeal && e.date === from; }).forEach(function (e) {
        var c = Object.assign({}, e); delete c.id; c.date = key; ids.push(addLog(c)); kcal += e.kcal;
      });
      save(); toast(MEAL_NAME[ui.addMeal] + ' takrorlandi · ' + n0(kcal) + ' kkal', ids); render();
    },
    undo: function (el) {
      var ids = el.getAttribute('data-v').split(',');
      db.log = db.log.filter(function (e) { return ids.indexOf(e.id) < 0; });
      save(); document.getElementById('toast').innerHTML = ''; render();
    },
    addFood: function () {
      var food = findFood(ui.pick), g = ui.grams;
      if (!food || !g || g <= 0) { toast('Grammni kiriting'); return; }
      var id = logFood(food, g); save();
      var kcal = E.foodValues(food, g).kcal;
      ui.pick = null; ui.grams = null; ui.gramEdit = false;
      toast(food.name + ' qoʻshildi · ' + kcal + ' kkal', [id]); render();
    },
    saveCustom: function () {
      var val = function (id) { return document.getElementById(id).value; };
      var name = val('cf-name').trim(), kcal = num(val('cf-kcal'));
      if (!name || kcal == null) { toast('Nomi va kaloriyasini kiriting'); return; }
      var f = { id: 'c-' + uid(), name: name, kcal: kcal, p: num(val('cf-p')) || 0, f: num(val('cf-f')) || 0, c: num(val('cf-c')) || 0, custom: true, portions: [] };
      var pg = num(val('cf-pg'));
      if (pg) f.portions.push([val('cf-pl').trim() || 'Porsiya', pg]);
      db.foods.unshift(f); save();
      ui.form = null; ui.pick = f.id; ui.grams = unitOf(f)[1]; render();
    },
    saveQuick: function () {
      var kcal = num(document.getElementById('q-kcal').value);
      if (!kcal || kcal <= 0) { toast('Kaloriyani kiriting'); return; }
      var id = addLog({ date: ui.day || today(), meal: ui.addMeal, foodId: null, name: document.getElementById('q-name').value.trim() || 'Tezkor', grams: null, kcal: Math.round(kcal), p: 0, f: 0, c: 0 });
      save(); ui.form = null; toast('Qoʻshildi · ' + Math.round(kcal) + ' kkal', [id]); render();
    },
    saveEntry: function (el) {
      var id = el.getAttribute('data-v'), e = db.log.filter(function (x) { return x.id === id; })[0];
      if (!e) return;
      var food = e.foodId ? findFood(e.foodId) : null;
      if (food) {
        if (!ui.grams || ui.grams <= 0) { toast('Grammni kiriting'); return; }
        var v = E.foodValues(food, ui.grams), hit = (food.portions || []).filter(function (p) { return p[1] === ui.grams; })[0];
        Object.assign(e, { grams: ui.grams, portion: hit ? hit[0] + ', ' + ui.grams + ' g' : null, kcal: v.kcal, p: v.p, f: v.f, c: v.c });
      } else {
        var k = num(document.getElementById('e-kcal').value);
        if (!k) { toast('Kaloriyani kiriting'); return; }
        e.kcal = Math.round(k);
      }
      e.meal = ui.addMeal; ui.editFor = null; save(); toast('Saqlandi'); go('#ovqat');
    },
    deleteEntry: function (el) {
      if (!confirm('Bu yozuv oʻchirilsinmi?')) return;
      var id = el.getAttribute('data-v');
      db.log = db.log.filter(function (x) { return x.id !== id; }); ui.editFor = null; save(); go('#ovqat');
    },
    wType: function (el) { ui.wType = el.getAttribute('data-v'); render(); },
    wMin: function (el) { ui.wMin = Math.max(5, Math.min(300, ui.wMin + Number(el.getAttribute('data-v')))); render(); },
    wLevel: function (el) { ui.wLevel = Number(el.getAttribute('data-v')); render(); },
    wDay: function (el) { ui.wDay = Number(el.getAttribute('data-v')); render(); },
    saveWorkout: function () {
      var act = window.ACTIVITIES.filter(function (a) { return a.id === ui.wType; })[0], date = E.addDays(today(), ui.wDay);
      var kg = snapshot(date).kg, met = act.met * LEVEL_MULT[ui.wLevel];
      db.workouts.push({ id: uid(), date: date, type: act.id, name: act.name, min: ui.wMin, level: ui.wLevel, met: met, kcal: Math.round(E.exerciseKcal(met, kg, ui.wMin)) });
      var day = db.checks[date] = db.checks[date] || {};
      if (db.habits.some(function (x) { return x.id === 'train'; })) day.train = true;
      save(); toast('Saqlandi'); render();
    },
    deleteWorkout: function (el) {
      if (!confirm('Bu mashq oʻchirilsinmi?')) return;
      var id = el.getAttribute('data-v');
      db.workouts = db.workouts.filter(function (w) { return w.id !== id; }); save(); render();
    },
    saveWeight: function () {
      var kg = num(document.getElementById('w-kg').value);
      if (!kg || kg < 25 || kg > 350) { toast('Vaznni tekshiring'); return; }
      var key = today();
      db.weights = db.weights.filter(function (w) { return w.date !== key; });
      db.weights.push({ date: key, kg: Math.round(kg * 10) / 10 });
      save(); toast('Saqlandi'); render();
    },
    saveMeasures: function () {
      var m = { date: today() }, any = false;
      ['waist', 'chest', 'hip', 'neck'].forEach(function (k) { var v = num(document.getElementById('m-' + k).value); if (v) { m[k] = v; any = true; } });
      if (!any) { toast('Kamida bitta oʻlcham kiriting'); return; }
      db.measures = db.measures.filter(function (x) { return x.date !== m.date; });
      db.measures.push(m); save(); toast('Saqlandi'); render();
    },
    period: function (el) { ui.period = el.getAttribute('data-v'); render(); },
    habit: function (el) {
      var id = el.getAttribute('data-v'), key = today(), day = db.checks[key] = db.checks[key] || {};
      day[id] = !day[id]; save(); render();
    },
    addHabit: function () {
      var t = document.getElementById('h-new').value.trim();
      if (!t) return;
      db.habits.push({ id: 'h-' + uid(), title: t, why: '' }); save(); render();
    },
    removeHabit: function (el) {
      var id = el.getAttribute('data-v'), x = db.habits.filter(function (h) { return h.id === id; })[0];
      if (!x || !confirm('“' + x.title + '” odati oʻchirilsinmi?')) return;
      db.habits = db.habits.filter(function (h) { return h.id !== id; }); save(); render();
    },
    pseg: function (el) {
      var k = el.getAttribute('data-k'), v = el.getAttribute('data-v');
      ui.pdraft[k] = k === 'male' ? v === 'true' : (k === 'goal' ? v : Number(v));
      if (k === 'goal' && v === 'gain' && ui.pdraft.rate > 1) ui.pdraft.rate = 1;
      render();
    },
    saveProfile: function () {
      var d = ui.pdraft;
      if (!(d.age >= 16 && d.age <= 90) || !(d.height >= 120 && d.height <= 230) || !(d.weight >= 30 && d.weight <= 300)) { toast('Yosh, boʻy va vaznni tekshiring'); return; }
      var first = !db.profile, prevW = db.profile ? db.profile.weight : null;
      db.profile = Object.assign({}, d);
      if (first || prevW !== d.weight) {
        db.weights = db.weights.filter(function (w) { return w.date !== today(); });
        db.weights.push({ date: today(), kg: d.weight });
      }
      save(); ui.pdraft = null; toast('Saqlandi'); go('#bugun');
    },
    export: function () {
      var name = 'salomat-' + today() + '.json', file = new File([JSON.stringify(db, null, 2)], name, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: name }).catch(function () { /* closed */ }); return; }
      var a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    },
    demo: function () { demoData(); save(); toast('Namuna yuklandi'); go('#bugun'); },
    clearAll: function () {
      if (!confirm('Hamma maʼlumot oʻchiriladi. Davom etasizmi?')) return;
      db = normalize({}); ui.pdraft = null; save(); go('#profil');
    }
  };

  function importFile(input) {
    var f = input.files && input.files[0];
    if (!f) return;
    f.text().then(function (text) {
      var data = normalize(JSON.parse(text));
      if (!confirm(data.log.length + ' ta ovqat yozuvi topildi. Joriy maʼlumotlar almashtirilsinmi?')) return;
      db = data; save(); render(); toast('Tiklandi');
    }).catch(function () { toast('Fayl oʻqilmadi'); });
  }

  // 45 days of plausible sample data around the current profile.
  function demoData() {
    var seed = 11, rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    var key = today(), p = db.profile, start = p.weight + 1.8;
    var plan = [['b', 'tuxum', 110], ['b', 'obi-non', 150], ['b', 'qatiq', 200], ['l', 'palov', 300], ['l', 'achchiq-chuchuk', 150], ['l', 'lagmon', 450],
      ['l', 'tovuq', 150], ['l', 'obi-non', 100], ['s', 'olma', 180], ['s', 'yongoq', 30], ['d', 'tovuq-shorva', 450], ['d', 'grechka', 200], ['d', 'mol', 120], ['s', 'banan', 120],
      ['d', 'obi-non', 50], ['s', 'shakar', 10]];
    db.log = []; db.weights = []; db.workouts = []; db.measures = []; db.checks = {};
    for (var i = 44; i >= 0; i--) {
      var d = E.addDays(key, -i), progress = (44 - i) / 44;
      var picks = [plan[0], plan[1], rnd() < 0.5 ? plan[2] : plan[13], plan[3 + Math.floor(rnd() * 3)], plan[4], plan[7],
        rnd() < 0.7 ? plan[8] : plan[9], plan[10 + Math.floor(rnd() * 3)], plan[14], plan[15]];
      if (i === 0) picks = picks.slice(0, 6); // today is still in progress
      picks.forEach(function (x) {
        var f = findFood(x[1]), v = E.foodValues(f, x[2]);
        db.log.push({ id: uid() + db.log.length, date: d, meal: x[0], foodId: f.id, name: f.name, grams: x[2], portion: null, kcal: v.kcal, p: v.p, f: v.f, c: v.c });
      });
      if (rnd() < 0.85) db.weights.push({ date: d, kg: Math.round((start - 1.8 * progress + (rnd() - 0.5) * 0.9) * 10) / 10 });
      var wd = E.weekday(d);
      if (wd === 1 || wd === 3 || wd === 6 || rnd() < 0.15) {
        var a = window.ACTIVITIES[[0, 3, 2, 0, 4][Math.floor(rnd() * 5)]], min = [30, 45, 60][Math.floor(rnd() * 3)], met = a.met;
        db.workouts.push({ id: uid() + i, date: d, type: a.id, name: a.name, min: min, level: 1, met: met, kcal: Math.round(E.exerciseKcal(met, p.weight, min)) });
      }
      if (i % 7 === 0) db.measures.push({ date: d, waist: Math.round((95 - 3 * progress) * 2) / 2, chest: Math.round((106 - 1.5 * progress) * 2) / 2, hip: 101, neck: 39 });
      var c = {};
      db.habits.forEach(function (h) { if (rnd() < 0.7) c[h.id] = true; });
      db.checks[d] = c;
    }
  }

  // ---------- wiring ----------

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act]');
    if (!el || !ACTIONS[el.getAttribute('data-act')]) return;
    if (el.tagName !== 'A') ev.preventDefault();
    ACTIONS[el.getAttribute('data-act')](el, ev);
  });

  // Enter in the search box: go online when the built-in table has nothing
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' || ev.target.getAttribute('data-field') !== 'query') return;
    ev.preventDefault();
    var q = ui.query.trim();
    if (q && !searchLocal(q).length && !(ui.net && ui.net.q === q)) netSearch(q);
    ev.target.blur();
  });

  document.addEventListener('input', function (ev) {
    var f = ev.target.getAttribute('data-field');
    if (f === 'query') {
      ui.query = ev.target.value;
      showResults();
    } else if (f === 'grams') {
      ui.grams = num(ev.target.value);
      if (ui.pick) { updateSheet(); return; }
      var e = db.log.filter(function (x) { return x.id === ui.editFor; })[0], food = e && e.foodId ? findFood(e.foodId) : null;
      var pv = document.getElementById('pv');
      if (pv && food) pv.innerHTML = valuesHtml(food, ui.grams);
      Array.prototype.forEach.call(document.querySelectorAll('.portion'), function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-v')) === ui.grams)); });
    }
  });

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.getAttribute('data-act-change') === 'import') { importFile(el); el.value = ''; return; }
    var k = el.getAttribute('data-pf');
    if (k && ui.pdraft) { var v = num(el.value); if (v != null) { ui.pdraft[k] = v; render(); } }
  });

  window.addEventListener('hashchange', function () {
    var name = (location.hash || '').slice(1).split('/')[0];
    if (name !== 'qoshish') resetAdd();
    if (name !== 'yozuv') ui.editFor = null;
    if (name !== 'profil') ui.pdraft = null;
    if (name === 'bugun') ui.day = null;
    render();
  });
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !document.activeElement.matches('input, textarea')) render(); });

  render();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(function () { /* offline cache is optional */ });
  }
})();
