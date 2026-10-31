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

  var ICON = {
    ring: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 9 9"/>',
    food: '<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2.5 1.5-3.5 4-3.5 7.5S15 15 17 15"/>',
    pulse: '<path d="M3 12h4l3-7 4 14 3-7h4"/>',
    scale: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 10a5 5 0 0 1 7 0M12 10l1.5-2"/>',
    chart: '<path d="M5 20V11M12 20V4M19 20v-6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    chev: '<path d="M9 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'
  };

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
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function today() { return E.dateKey(Date.now()); }
  function num(v) { var x = parseFloat(String(v).replace(',', '.')); return isNaN(x) ? null : x; }

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
  var ui = { day: null, period: 'week', query: '', pick: null, grams: null, form: null, addMeal: 'l',
    wType: 'yurish', wMin: 30, wLevel: 1, wDay: 0, pdraft: null, lastRoute: null };

  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 1800);
  }

  function allFoods() { return db.foods.concat(window.FOODS); }
  function findFood(id) { return allFoods().filter(function (f) { return f.id === id; })[0] || null; }

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

  // ---------- views ----------

  function viewToday() {
    var key = today(), s = snapshot(key), h = '';
    h += header(dayLabel(key), 'Bugun', '<a class="icon-btn" href="#profil" aria-label="Maqsad va profil">' + icon('user', 22) + '</a>');

    var left = s.b.budget - s.t.kcal, over = left < 0;
    var pct = Math.min(1, s.b.budget ? s.t.kcal / s.b.budget : 0), C = 2 * Math.PI * 54;
    var balance = s.t.kcal - s.b.tdee;
    h += '<section class="card" aria-label="Kunlik energiya"><div class="ring-row">' +
      '<svg width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="' + (over ? n0(-left) + ' kkal ortiq' : n0(left) + ' kkal qoldi') + '">' +
      '<circle cx="64" cy="64" r="54" fill="none" stroke="var(--energy-soft)" stroke-width="12"/>' +
      '<circle cx="64" cy="64" r="54" fill="none" stroke="var(--energy)" stroke-width="12" stroke-linecap="round" stroke-dasharray="' +
      (pct * C).toFixed(1) + ' ' + C.toFixed(1) + '" transform="rotate(-90 64 64)"/>' +
      '<text x="64" y="62" text-anchor="middle" font-size="26" font-weight="700" fill="currentColor">' + n0(Math.abs(left)) + '</text>' +
      '<text x="64" y="82" text-anchor="middle" font-size="12" fill="var(--muted)">' + (over ? 'kkal ortiq' : 'kkal qoldi') + '</text></svg>' +
      '<div class="grow stack">' +
      '<div class="kv"><span class="muted">Byudjet</span><b class="num">' + n0(s.b.budget) + '</b></div>' +
      '<div class="kv"><span class="muted">Isteʼmol</span><b class="num" style="color:var(--energy)">' + n0(s.t.kcal) + '</b></div>' +
      '<div class="kv"><span class="muted">Mashq</span><b class="num ok">' + (s.b.mode === 'adaptive' ? n0(s.wk) : '+' + n0(s.wk)) + '</b></div>' +
      '</div></div>' +
      '<div class="pill' + (over ? ' warm' : '') + '"><span>Hozircha balans</span><b class="num">' + signed(balance) + ' kkal · reja ' + signed(s.b.delta) + '</b></div>' +
      (s.b.mode === 'adaptive' ? '<span class="tiny muted">Sarf sizning maʼlumotlaringizdan hisoblanmoqda (oxirgi 3 hafta).</span>' : '') +
      '</section>';

    h += '<section class="card"><div class="grid3" style="gap:14px">' +
      macroBar('Oqsil', s.t.p, s.macros.p, 'var(--protein)', 'var(--protein)') +
      macroBar('Yogʻ', s.t.f, s.macros.f, 'var(--fat)', 'var(--fat)') +
      macroBar('Uglevod', s.t.c, s.macros.c, 'var(--carb)', 'var(--carb-bar)') +
      '</div></section>';

    var mins = E.weeklyActiveMinutes(db.workouts, key), rate = E.trendRate(s.trend, key, 14);
    h += '<section class="grid2">' +
      '<a class="tile" href="#mashq"><span class="small muted">Faollik (7 kun)</span><span class="v num">' + mins + ' <small>daq</small></span>' +
      '<span class="tiny ' + (mins >= 150 ? 'ok' : 'muted') + '">Maqsad: 150 daq</span></a>' +
      '<a class="tile" href="#tana"><span class="small muted">Vazn (trend)</span><span class="v num">' + kg1(s.trend.latest) + ' <small>kg</small></span>' +
      '<span class="tiny ' + (rate != null && rate < 0 ? 'ok' : 'muted') + '">' + (rate == null ? 'Tortilib boring' : skg(rate) + ' haftada') + '</span></a>' +
      '</section>';

    var checks = db.checks[key] || {}, done = db.habits.filter(function (x) { return checks[x.id]; }).length;
    h += '<a class="card" href="#odatlar" style="flex-direction:row;align-items:center;text-decoration:none;color:inherit;padding:14px 16px">' +
      '<span class="grow stack" style="gap:6px"><b>Bugungi odatlar · ' + done + '/' + db.habits.length + '</b><span class="dots7" aria-hidden="true">' +
      db.habits.map(function (x) { return '<span class="' + (checks[x.id] ? 'on' : '') + '"></span>'; }).join('') + '</span></span>' +
      '<span class="muted">' + icon('chev', 18, 2.5) + '</span></a>';

    h += '<div class="grid3"><a class="btn sm" href="#qoshish/' + mealNow() + '">+ Ovqat</a><a class="btn sm secondary" href="#mashq">+ Mashq</a><a class="btn sm secondary" href="#tana">+ Vazn</a></div>';
    return h;
  }

  function macroBar(label, val, target, color, barColor) {
    var pct = target ? Math.min(100, Math.round(val / target * 100)) : 0;
    return '<div class="stack" style="gap:6px"><span class="small" style="font-weight:600;color:' + color + '">' + label + '</span>' +
      '<div class="bar"><div style="width:' + pct + '%;background:' + barColor + '"></div></div>' +
      '<span class="small num"><b>' + val + '</b> <span class="muted">/ ' + target + ' g</span></span></div>';
  }

  function mealNow() {
    var h = new Date().getHours();
    return h < 11 ? 'b' : h < 16 ? 'l' : h < 18 ? 's' : 'd';
  }

  function viewFood() {
    var key = ui.day || today(), s = snapshot(key), isToday = key === today(), h = '';
    h += '<header class="head"><div><div class="row" style="gap:4px">' +
      '<button class="icon-btn" data-act="dayShift" data-v="-1" aria-label="Oldingi kun" style="font-size:22px">‹</button>' +
      '<span class="eyebrow">' + (isToday ? 'Bugun' : dayLabel(key)) + '</span>' +
      (isToday ? '' : '<button class="icon-btn" data-act="dayShift" data-v="1" aria-label="Keyingi kun" style="font-size:22px">›</button>') +
      '</div><h1>Ovqat</h1></div><a class="icon-btn fill" href="#qoshish/' + (isToday ? mealNow() : 'l') + '" aria-label="Ovqat qoʻshish">+</a></header>';

    var pct = Math.min(100, Math.round(s.t.kcal / s.b.budget * 100));
    h += '<div class="card" style="padding:12px 16px;gap:8px"><div class="kv small"><span class="muted">Isteʼmol / byudjet</span><b class="num">' +
      n0(s.t.kcal) + ' / ' + n0(s.b.budget) + ' kkal</b></div><div class="bar" style="background:var(--energy-soft)"><div style="width:' + pct + '%;background:var(--energy)"></div></div>' +
      '<div class="grid3 tiny num"><span style="color:var(--protein)">Oqsil ' + s.t.p + ' g</span><span class="center" style="color:var(--fat)">Yogʻ ' + s.t.f + ' g</span><span style="text-align:right;color:var(--carb)">Uglevod ' + s.t.c + ' g</span></div></div>';

    MEALS.forEach(function (m) {
      var items = db.log.filter(function (e) { return e.date === key && e.meal === m[0]; });
      h += '<section class="card" style="padding:8px 16px;gap:0"><div class="meal-head"><b>' + m[1] + '</b><span class="num muted small">' + n0(s.t.meals[m[0]] || 0) + ' kkal</span></div>';
      items.forEach(function (e) {
        h += '<a class="entry" href="#yozuv/' + esc(e.id) + '" style="color:inherit;text-decoration:none"><span class="grow">' + esc(e.name) +
          (e.grams ? ' <span class="p">· ' + esc(e.portion || (e.grams + ' g')) + '</span>' : '') + '</span><span class="num">' + n0(e.kcal) + '</span></a>';
      });
      h += '<a class="add-link" href="#qoshish/' + m[0] + '">+ Qoʻshish</a></section>';
    });
    return h;
  }

  function viewAdd(meal) {
    if (MEAL_NAME[meal]) ui.addMeal = meal;
    var h = '<div class="between"><a class="back" href="#ovqat" data-act="resetAdd">‹ Bekor</a><b>' + MEAL_TO[ui.addMeal] + ' qoʻshish</b><span style="width:60px"></span></div>';

    if (ui.form === 'food') return h + customFoodForm();
    if (ui.form === 'quick') return h + quickForm();

    var food = ui.pick ? findFood(ui.pick) : null;
    if (food) return h + portionPanel(food);

    h += '<label class="search">' + icon('search', 18, 2.2) + '<input type="search" data-field="query" placeholder="Qidirish: palov, non, tuxum…" value="' + esc(ui.query) + '" aria-label="Ovqat qidirish" autocomplete="off"></label>';
    h += '<div class="grid2"><button class="btn sm secondary" data-act="form" data-v="quick">Tezkor kkal</button><button class="btn sm secondary" data-act="form" data-v="food">Yangi mahsulot</button></div>';
    h += '<div id="results" class="stack">' + resultsHtml() + '</div>';
    return h;
  }

  function resultsHtml() {
    var q = norm(ui.query.trim()), list = allFoods(), h = '';
    if (q) {
      list = list.filter(function (f) { return norm(f.name).indexOf(q) >= 0; });
      if (!list.length) return '<div class="card empty"><span class="muted small">Topilmadi. “Yangi mahsulot” orqali qoʻshing yoki “Tezkor kkal” bilan faqat kaloriyani yozing.</span></div>';
    } else {
      var seen = {}, recent = [];
      db.log.slice().reverse().forEach(function (e) {
        if (e.foodId && !seen[e.foodId] && recent.length < 6) { var f = findFood(e.foodId); if (f) { seen[e.foodId] = 1; recent.push(f); } }
      });
      if (recent.length) h += '<h2 class="section-title" style="font-size:17px">Soʻnggi</h2>' + recent.map(resultRow).join('') + '<h2 class="section-title" style="font-size:17px">Hammasi</h2>';
    }
    return h + list.map(resultRow).join('');
  }

  function resultRow(f) {
    return '<button class="res" data-act="pickFood" data-v="' + esc(f.id) + '"><span class="grow stack" style="gap:2px"><b style="font-size:15px">' + esc(f.name) + '</b>' +
      '<span class="tiny muted num">100 g · ' + n0(f.kcal) + ' kkal · O ' + f.p + ' · Y ' + f.f + ' · U ' + f.c + '</span></span>' +
      (f.uz ? '<span class="tag">taxminiy</span>' : f.custom ? '<span class="tag">meniki</span>' : '') + '</button>';
  }

  function portionPanel(food) {
    var portions = (food.portions || []).concat([['100 g', 100]]);
    if (ui.grams == null) ui.grams = portions[0][1];
    var h = '<section class="card"><div class="between"><h2 style="font-size:20px">' + esc(food.name) + '</h2>' + (food.uz ? '<span class="tag">taxminiy</span>' : '') + '</div>';
    h += '<div class="grid3">' + portions.map(function (p) {
      return '<button class="portion" data-act="portion" data-v="' + p[1] + '" aria-pressed="' + (ui.grams === p[1]) + '"><b>' + esc(p[0]) + '</b><span>' + p[1] + ' g</span></button>';
    }).join('') + '</div>';
    h += '<label class="field"><span>Gramm</span><input class="input num" type="number" inputmode="decimal" min="1" max="3000" data-field="grams" value="' + ui.grams + '"></label>';
    h += '<div id="pv">' + valuesHtml(food, ui.grams) + '</div>';
    h += '<div class="seg" style="grid-template-columns:repeat(4,minmax(0,1fr))" role="group" aria-label="Ovqat vaqti">' + MEALS.map(function (m) {
      return '<button data-act="addMeal" data-v="' + m[0] + '" aria-pressed="' + (ui.addMeal === m[0]) + '">' + m[1].split(' ')[0] + '</button>';
    }).join('') + '</div>';
    if (food.uz) h += '<span class="tiny muted">Uy retsepti boʻyicha taxminiy qiymat (±20–30%). Oʻz retseptingizni “Yangi mahsulot” orqali kiritsangiz, aniqroq boʻladi.</span>';
    h += '<button class="btn block" data-act="addFood">Qoʻshish</button></section>';
    h += '<button class="btn ghost" data-act="unpick">‹ Boshqa ovqat tanlash</button>';
    return h;
  }

  function valuesHtml(food, grams) {
    var v = E.foodValues(food, grams || 0);
    return '<div class="between" style="margin-bottom:8px"><span class="muted">Kaloriya</span><b class="num" style="font-size:28px;color:var(--energy)">' + n0(v.kcal) + ' <span class="small muted">kkal</span></b></div>' +
      '<div class="grid3"><div class="macro p"><b class="num">' + v.p + ' g</b><span>Oqsil</span></div><div class="macro f"><b class="num">' + v.f + ' g</b><span>Yogʻ</span></div><div class="macro c"><b class="num">' + v.c + ' g</b><span>Uglevod</span></div></div>';
  }

  function customFoodForm() {
    return '<section class="card"><h2>Yangi mahsulot yoki retsept</h2><span class="small muted">Qiymatlar 100 g uchun (qadoqdagi yorliqdan oling).</span>' +
      '<label class="field"><span>Nomi</span><input class="input" id="cf-name" placeholder="Masalan: Onamning palovi"></label>' +
      '<div class="grid2"><label class="field"><span>Kaloriya (kkal)</span><input class="input num" id="cf-kcal" type="number" inputmode="decimal"></label>' +
      '<label class="field"><span>Oqsil (g)</span><input class="input num" id="cf-p" type="number" inputmode="decimal"></label>' +
      '<label class="field"><span>Yogʻ (g)</span><input class="input num" id="cf-f" type="number" inputmode="decimal"></label>' +
      '<label class="field"><span>Uglevod (g)</span><input class="input num" id="cf-c" type="number" inputmode="decimal"></label></div>' +
      '<div class="grid2"><label class="field"><span>Porsiya nomi</span><input class="input" id="cf-pl" placeholder="1 kosa"></label>' +
      '<label class="field"><span>Porsiya (g)</span><input class="input num" id="cf-pg" type="number" inputmode="decimal"></label></div>' +
      '<button class="btn block" data-act="saveCustom">Saqlash va tanlash</button><button class="btn ghost" data-act="form" data-v="">Orqaga</button></section>';
  }

  function quickForm() {
    return '<section class="card"><h2>Tezkor qoʻshish</h2><span class="small muted">Aniq tarkibni bilmasangiz, taxminiy kaloriyani yozing.</span>' +
      '<label class="field"><span>Nomi (ixtiyoriy)</span><input class="input" id="q-name" placeholder="Masalan: toʻy oshi"></label>' +
      '<label class="field"><span>Kaloriya (kkal)</span><input class="input num" id="q-kcal" type="number" inputmode="numeric"></label>' +
      '<button class="btn block" data-act="saveQuick">Qoʻshish</button><button class="btn ghost" data-act="form" data-v="">Orqaga</button></section>';
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

  function viewWorkout() {
    var key = today(), h = '', s = snapshot(key);
    var mins = E.weeklyActiveMinutes(db.workouts, key);
    h += header('Oxirgi 7 kun', 'Mashq');
    h += '<section class="card"><div class="between"><span class="num"><b style="font-size:24px">' + mins + '</b> <span class="muted">/ 150 daq</span></span>' +
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
        return '<div class="row" style="min-height:52px' + (idx ? ';border-top:1px solid var(--line)' : '') + '"><span class="grow stack" style="gap:1px"><b style="font-size:15px">' + esc(w.name) +
          '</b><span class="tiny muted">' + w.min + ' daq · ' + LEVELS[w.level].toLowerCase() + '</span></span><span class="num ok" style="font-weight:600">+' + n0(w.kcal) +
          ' kkal</span><button class="x-btn" data-act="deleteWorkout" data-v="' + esc(w.id) + '" aria-label="Oʻchirish">×</button></div>';
      }).join('') + '</section>';
    }

    var act = window.ACTIVITIES.filter(function (a) { return a.id === ui.wType; })[0] || window.ACTIVITIES[0];
    var met = act.met * LEVEL_MULT[ui.wLevel], kcal = Math.round(E.exerciseKcal(met, s.kg, ui.wMin));
    h += '<section class="card"><h2>Mashq qoʻshish</h2><div class="grid4" style="gap:6px">' + window.ACTIVITIES.map(function (a) {
      return '<button class="type" data-act="wType" data-v="' + a.id + '" aria-pressed="' + (a.id === ui.wType) + '">' + a.name + '</button>';
    }).join('') + '</div>' +
      '<div class="between"><button class="round" data-act="wMin" data-v="-5" aria-label="5 daqiqa kam">−</button><span class="num" style="font-size:28px;font-weight:600">' + ui.wMin +
      ' <span class="muted" style="font-size:15px;font-weight:500">daqiqa</span></span><button class="round" data-act="wMin" data-v="5" aria-label="5 daqiqa koʻp">+</button></div>' +
      '<div class="seg" style="grid-template-columns:repeat(3,minmax(0,1fr))" role="group" aria-label="Jadallik">' + LEVELS.map(function (l, i) {
        return '<button data-act="wLevel" data-v="' + i + '" aria-pressed="' + (ui.wLevel === i) + '">' + l + '</button>';
      }).join('') + '</div>' +
      '<div class="seg" style="grid-template-columns:repeat(2,minmax(0,1fr))" role="group" aria-label="Kun"><button data-act="wDay" data-v="0" aria-pressed="' + (ui.wDay === 0) +
      '">Bugun</button><button data-act="wDay" data-v="-1" aria-pressed="' + (ui.wDay === -1) + '">Kecha</button></div>' +
      '<div class="row"><span class="grow small muted">≈ <b style="color:var(--text);font-size:17px">' + n0(kcal) + ' kkal</b> · MET ' + met.toFixed(1).replace('.', ',') + '</span>' +
      '<button class="btn sm" data-act="saveWorkout">Saqlash</button></div>' +
      '<span class="tiny muted">Faqat dam holatidan ortiq sarf hisoblanadi, shuning uchun kaloriya ikki marta qoʻshilmaydi.</span></section>';
    return h;
  }

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
    h += '<section class="card chart"><div class="between"><span class="num"><b style="font-size:28px">' + kg1(trend.latest) + '</b> <span class="muted">kg trend</span></span>' +
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
    h += '<h2 class="section-title">Oʻlchamlar (sm)</h2><section class="card"><div class="grid2">' + fields.map(function (f) {
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
      '<div class="row" style="min-height:50px;border-top:1px solid var(--line)"><span class="grow stack" style="gap:0"><b style="font-size:15px">Tana yogʻi, taxminiy</b>' +
      '<span class="tiny muted">US Navy formulasi · ±3–4% · boʻyin ' + (p.male ? '' : 'va boʻksa ') + 'kerak</span></span><b class="num">' + (bf == null ? '—' : bf + '%') + '</b></div></section>';
    return h;
  }

  function ratioRow(title, sub, v, high, border) {
    return '<div class="row" style="min-height:50px' + (border ? ';border-top:1px solid var(--line)' : '') + '"><span class="grow stack" style="gap:0"><b style="font-size:15px">' + title +
      '</b><span class="tiny muted">' + sub + '</span></span><b class="num ' + (v == null ? '' : high ? 'warm' : 'ok') + '">' + (v == null ? '—' : String(v.toFixed(2)).replace('.', ',')) + '</b></div>';
  }

  function viewAnalysis() {
    var key = today(), s = snapshot(key), h = '';
    var labels = { day: 'Bugun, ovqatlar boʻyicha', week: 'Oxirgi 7 kun', month: 'Oxirgi 30 kun', year: E.keyToDate(key).getFullYear() + ', oylik oʻrtacha' };
    h += header(labels[ui.period], 'Tahlil');
    h += '<div class="seg" style="grid-template-columns:repeat(4,minmax(0,1fr))" role="group" aria-label="Davr">' + [['day', 'Kun'], ['week', 'Hafta'], ['month', 'Oy'], ['year', 'Yil']].map(function (p) {
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
      if (b.intake != null) { var bh = b.intake / max * H; out += '<rect class="in" x="' + (cx - bw / 2).toFixed(1) + '" y="' + (H - bh).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="' + Math.min(5, bw / 2).toFixed(1) + '"/>'; }
      if (b.exp != null) out += '<rect class="ex" x="' + (cx - cw * 0.45).toFixed(1) + '" y="' + (H - b.exp / max * H - 1.5).toFixed(1) + '" width="' + (cw * 0.9).toFixed(1) + '" height="3" rx="1.5"/>';
      if (b.label) out += '<text class="axis" x="' + cx.toFixed(1) + '" y="' + (H + 14) + '" text-anchor="middle">' + b.label + '</text>';
    });
    h += '<section class="card chart"><div class="between"><h2>Energiya balansi</h2><span class="legend"><span><i style="background:var(--energy-bar)"></i>isteʼmol</span>' +
      (ui.period === 'day' ? '' : '<span><i style="background:var(--accent-ink);height:3px"></i>sarf</span>') + '</span></div>' +
      '<svg viewBox="0 0 ' + W + ' ' + (H + 18) + '" role="img" aria-label="Isteʼmol va sarf ustunlari"><line class="grid" x1="0" x2="' + W + '" y1="' + H + '" y2="' + H + '"/>' + out + '</svg></section>';
    h += '<section class="grid3">' + tiles.map(function (t, i) {
      return '<div class="tile"><span class="tiny muted">' + t[0] + '</span><b class="num' + (i === 2 ? ' ok' : '') + '" style="font-size:17px">' + t[1] + '</b></div>';
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
      '<a class="tile" href="#mashq"><span class="tiny muted">Mashq</span><b class="num" style="font-size:15px">' + mins + ' daq</b></a>' +
      '<a class="tile" href="#tana"><span class="tiny muted">Vazn</span><b class="num" style="font-size:15px">' + skg(wt) + '</b></a>' +
      '<a class="tile" href="#tana"><span class="tiny muted">Bel</span><b class="num" style="font-size:15px">' + (waist == null ? '—' : (waist > 0 ? '+' : '') + kg1(waist).replace(',0', '') + ' sm') + '</b></a>' +
      '<a class="tile" href="#odatlar"><span class="tiny muted">Odatlar</span><b class="num" style="font-size:15px">' + (E.habitScore(db.habits, db.checks, key, Math.min(days, 30)) || 0) + '%</b></a></section>';
    return h;
  }

  function avgWorkout(key, days) {
    var from = E.addDays(key, -(days - 1));
    return db.workouts.filter(function (w) { return w.date >= from && w.date <= key; }).reduce(function (a, w) { return a + w.kcal; }, 0) / days;
  }

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

  function viewProfile() {
    var first = !db.profile;
    if (!ui.pdraft) ui.pdraft = Object.assign({}, db.profile || DEFAULT_PROFILE);
    var d = ui.pdraft, h = '';
    h += (first ? '' : '<a class="back" href="#bugun">‹ Bugun</a>') + header(first ? 'Xush kelibsiz' : 'Shaxsiy sozlash', 'Maqsad');
    if (first) h += '<section class="card soft small" style="line-height:20px">Kunlik kaloriya meʼyoringizni hisoblash uchun bir necha maʼlumot kerak. Hammasi faqat shu telefonda saqlanadi.</section>';
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
      '<div class="between" style="border-top:1px solid var(--line);min-height:48px"><b>Kunlik byudjet</b><b class="num" style="font-size:22px;color:var(--energy)">' + n0(b.budget) + ' kkal</b></div>' +
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
    h += '<p class="tiny muted center" style="margin:0">Salomat 0.1 · tibbiy maslahat oʻrnini bosmaydi. Homiladorlik, qandli diabet yoki boshqa kasallik boʻlsa, shifokor bilan maslahatlashing.</p>';
    return h;
  }

  function segRow(label, key, opts, value) {
    return '<div class="field"><span>' + label + '</span><div class="seg" style="grid-template-columns:repeat(' + opts.length + ',minmax(0,1fr))" role="group" aria-label="' + label + '">' +
      opts.map(function (o) { return '<button data-act="pseg" data-k="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (o[0] === value) + '">' + o[1] + '</button>'; }).join('') + '</div></div>';
  }

  function numField(label, key, value) {
    return '<label class="field"><span>' + label + '</span><input class="input num" type="number" inputmode="decimal" data-pf="' + key + '" value="' + value + '"></label>';
  }

  function kv(k, v) { return '<div class="between small" style="min-height:30px"><span class="muted">' + k + '</span><b class="num">' + v + '</b></div>'; }

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
    var tabs = document.getElementById('tabs');
    tabs.parentElement.hidden = !db.profile;
    if (!tabs.childElementCount) {
      tabs.innerHTML = TABS.map(function (t) { return '<a href="#' + t[0] + '" data-tab="' + t[0] + '">' + icon(t[2]) + t[1] + '</a>'; }).join('');
    }
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
    save();
  }

  function resetAdd() { ui.pick = null; ui.grams = null; ui.form = null; ui.query = ''; }

  var ACTIONS = {
    dayShift: function (el) {
      var k = E.addDays(ui.day || today(), Number(el.getAttribute('data-v')));
      ui.day = k >= today() ? null : k; render();
    },
    resetAdd: function () { resetAdd(); go('#ovqat'); },
    form: function (el) { ui.form = el.getAttribute('data-v') || null; render(); },
    pickFood: function (el) { ui.pick = el.getAttribute('data-v'); ui.grams = null; render(); },
    unpick: function () { ui.pick = null; ui.grams = null; render(); },
    portion: function (el) { ui.grams = Number(el.getAttribute('data-v')); render(); },
    addMeal: function (el) { ui.addMeal = el.getAttribute('data-v'); render(); },
    addFood: function () {
      var food = findFood(ui.pick), g = ui.grams;
      if (!food || !g || g <= 0) { toast('Grammni kiriting'); return; }
      var v = E.foodValues(food, g), portion = null;
      (food.portions || []).forEach(function (p) { if (p[1] === g) portion = p[0] + ', ' + g + ' g'; });
      addLog({ date: ui.day || today(), meal: ui.addMeal, foodId: food.id, name: food.name, grams: g, portion: portion, kcal: v.kcal, p: v.p, f: v.f, c: v.c });
      resetAdd(); toast('Qoʻshildi · ' + v.kcal + ' kkal'); go('#ovqat');
    },
    saveCustom: function () {
      var val = function (id) { return document.getElementById(id).value; };
      var name = val('cf-name').trim(), kcal = num(val('cf-kcal'));
      if (!name || kcal == null) { toast('Nomi va kaloriyasini kiriting'); return; }
      var f = { id: 'c-' + uid(), name: name, kcal: kcal, p: num(val('cf-p')) || 0, f: num(val('cf-f')) || 0, c: num(val('cf-c')) || 0, custom: true, portions: [] };
      var pg = num(val('cf-pg'));
      if (pg) f.portions.push([val('cf-pl').trim() || 'Porsiya', pg]);
      db.foods.unshift(f); save();
      ui.form = null; ui.pick = f.id; ui.grams = null; render();
    },
    saveQuick: function () {
      var kcal = num(document.getElementById('q-kcal').value);
      if (!kcal || kcal <= 0) { toast('Kaloriyani kiriting'); return; }
      addLog({ date: ui.day || today(), meal: ui.addMeal, foodId: null, name: document.getElementById('q-name').value.trim() || 'Tezkor', grams: null, kcal: Math.round(kcal), p: 0, f: 0, c: 0 });
      resetAdd(); toast('Qoʻshildi'); go('#ovqat');
    },
    saveEntry: function (el) {
      var id = el.getAttribute('data-v'), e = db.log.filter(function (x) { return x.id === id; })[0];
      if (!e) return;
      var food = e.foodId ? findFood(e.foodId) : null;
      if (food) {
        if (!ui.grams || ui.grams <= 0) { toast('Grammni kiriting'); return; }
        var v = E.foodValues(food, ui.grams), portion = null;
        (food.portions || []).forEach(function (p) { if (p[1] === ui.grams) portion = p[0] + ', ' + ui.grams + ' g'; });
        Object.assign(e, { grams: ui.grams, portion: portion, kcal: v.kcal, p: v.p, f: v.f, c: v.c });
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

  document.addEventListener('input', function (ev) {
    var f = ev.target.getAttribute('data-field');
    if (f === 'query') {
      ui.query = ev.target.value;
      var box = document.getElementById('results');
      if (box) box.innerHTML = resultsHtml();
    } else if (f === 'grams') {
      ui.grams = num(ev.target.value);
      var food = findFood(ui.pick) || (function () { var e = db.log.filter(function (x) { return x.id === ui.editFor; })[0]; return e && e.foodId ? findFood(e.foodId) : null; })();
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
