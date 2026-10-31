// Built-in foods, values per 100 g (kcal, protein, fat, carbs).
// Basics: rounded USDA FoodData Central values. Uzbek dishes ("uz: true"): estimates for a
// typical home recipe; real values vary ±20–30%, so the user can add their own recipe.
// portions: [label, grams]
window.FOODS = [
  // Uzbek dishes
  { id: 'palov', name: 'Palov', kcal: 197, p: 6, f: 9.3, c: 22, uz: true, portions: [['Kichik kosa', 200], ['Oʻrta kosa', 300], ['Katta kosa', 400]] },
  { id: 'lagmon', name: 'Lagʻmon', kcal: 110, p: 5, f: 4, c: 14, uz: true, portions: [['Kosa', 450], ['Kichik kosa', 300]] },
  { id: 'mastava', name: 'Mastava', kcal: 75, p: 3, f: 3, c: 9, uz: true, portions: [['Kosa', 400]] },
  { id: 'shorva', name: 'Shoʻrva (goʻshtli)', kcal: 60, p: 4, f: 3.5, c: 3.5, uz: true, portions: [['Kosa', 400]] },
  { id: 'tovuq-shorva', name: 'Tovuq shoʻrva', kcal: 55, p: 4, f: 2.5, c: 4, uz: true, portions: [['Kosa', 450]] },
  { id: 'moshxorda', name: 'Moshxoʻrda', kcal: 90, p: 4, f: 3, c: 12, uz: true, portions: [['Kosa', 400]] },
  { id: 'manti', name: 'Manti', kcal: 220, p: 10, f: 11, c: 20, uz: true, portions: [['1 dona', 50], ['5 dona', 250]] },
  { id: 'chuchvara', name: 'Chuchvara', kcal: 210, p: 9, f: 9, c: 23, uz: true, portions: [['Kosa', 300]] },
  { id: 'somsa', name: 'Somsa (tandir, goʻshtli)', kcal: 300, p: 10, f: 17, c: 27, uz: true, portions: [['1 dona', 110]] },
  { id: 'dimlama', name: 'Dimlama', kcal: 90, p: 5, f: 5, c: 6, uz: true, portions: [['Tarelka', 350]] },
  { id: 'qozon-kabob', name: 'Qozon kabob', kcal: 230, p: 12, f: 15, c: 12, uz: true, portions: [['Tarelka', 300]] },
  { id: 'shashlik', name: 'Shashlik (qoʻy)', kcal: 270, p: 22, f: 20, c: 0, uz: true, portions: [['1 six', 100]] },
  { id: 'achchiq-chuchuk', name: 'Achchiq-chuchuk', kcal: 40, p: 0.8, f: 2.5, c: 3.5, uz: true, portions: [['Porsiya', 150]] },
  { id: 'obi-non', name: 'Obi non', kcal: 265, p: 8.5, f: 2.5, c: 52, uz: true, portions: [['⅛ dona', 50], ['¼ dona', 100], ['½ dona', 200]] },

  // Grains and sides
  { id: 'guruch', name: 'Guruch, pishgan', kcal: 130, p: 2.7, f: 0.3, c: 28, portions: [['Tarelka', 200]] },
  { id: 'grechka', name: 'Grechka, pishgan', kcal: 92, p: 3.4, f: 0.6, c: 20, portions: [['Tarelka', 200]] },
  { id: 'suli', name: 'Suli boʻtqa (suvda)', kcal: 71, p: 2.5, f: 1.5, c: 12, portions: [['Tarelka', 250]] },
  { id: 'makaron', name: 'Makaron, pishgan', kcal: 158, p: 5.8, f: 0.9, c: 31, portions: [['Tarelka', 200]] },
  { id: 'kartoshka', name: 'Kartoshka, qaynatilgan', kcal: 87, p: 1.9, f: 0.1, c: 20, portions: [['1 oʻrta', 150]] },
  { id: 'fri', name: 'Kartoshka fri', kcal: 312, p: 3.4, f: 15, c: 41, portions: [['Porsiya', 120]] },
  { id: 'oq-non', name: 'Oq non (buxanka)', kcal: 265, p: 9, f: 3.2, c: 49, portions: [['1 tilim', 30]] },
  { id: 'yasmiq', name: 'Yasmiq, pishgan', kcal: 116, p: 9, f: 0.4, c: 20, portions: [['Tarelka', 200]] },
  { id: 'noxat', name: 'Noʻxat, pishgan', kcal: 164, p: 8.9, f: 2.6, c: 27, portions: [['Tarelka', 150]] },

  // Protein
  { id: 'tuxum', name: 'Tuxum', kcal: 143, p: 12.6, f: 9.5, c: 0.7, portions: [['1 dona', 55], ['2 dona', 110]] },
  { id: 'tovuq', name: 'Tovuq koʻkragi, pishgan', kcal: 165, p: 31, f: 3.6, c: 0, portions: [['Porsiya', 150]] },
  { id: 'mol', name: 'Mol goʻshti, qaynatilgan', kcal: 220, p: 27, f: 12, c: 0, portions: [['Porsiya', 120]] },
  { id: 'qoy', name: 'Qoʻy goʻshti, pishgan', kcal: 294, p: 25, f: 21, c: 0, portions: [['Porsiya', 120]] },
  { id: 'baliq', name: 'Baliq (oq), pishgan', kcal: 105, p: 23, f: 0.9, c: 0, portions: [['Porsiya', 150]] },
  { id: 'kolbasa', name: 'Kolbasa (qaynatma)', kcal: 257, p: 12, f: 22, c: 2, portions: [['2 tilim', 50]] },

  // Dairy
  { id: 'sut', name: 'Sut 2,5%', kcal: 52, p: 2.9, f: 2.5, c: 4.7, portions: [['1 stakan', 250]] },
  { id: 'qatiq', name: 'Qatiq', kcal: 60, p: 3, f: 3.2, c: 4.1, portions: [['1 stakan', 200]] },
  { id: 'tvorog', name: 'Tvorog 5%', kcal: 121, p: 17, f: 5, c: 3, portions: [['Porsiya', 150]] },
  { id: 'pishloq', name: 'Pishloq (qattiq)', kcal: 356, p: 25, f: 27.4, c: 2.2, portions: [['1 tilim', 20]] },
  { id: 'sariyog', name: 'Sariyogʻ', kcal: 717, p: 0.9, f: 81, c: 0.1, portions: [['1 choy qoshiq', 5]] },

  // Fruit and vegetables
  { id: 'olma', name: 'Olma', kcal: 52, p: 0.3, f: 0.2, c: 14, portions: [['1 oʻrta', 180]] },
  { id: 'banan', name: 'Banan', kcal: 89, p: 1.1, f: 0.3, c: 23, portions: [['1 dona', 120]] },
  { id: 'uzum', name: 'Uzum', kcal: 69, p: 0.7, f: 0.2, c: 18, portions: [['1 kosa', 150]] },
  { id: 'anor', name: 'Anor', kcal: 83, p: 1.7, f: 1.2, c: 19, portions: [['1 dona (doni)', 170]] },
  { id: 'tarvuz', name: 'Tarvuz', kcal: 30, p: 0.6, f: 0.2, c: 8, portions: [['1 boʻlak', 300]] },
  { id: 'qovun', name: 'Qovun', kcal: 34, p: 0.8, f: 0.2, c: 8, portions: [['1 boʻlak', 250]] },
  { id: 'pomidor', name: 'Pomidor', kcal: 18, p: 0.9, f: 0.2, c: 3.9, portions: [['1 dona', 120]] },
  { id: 'bodring', name: 'Bodring', kcal: 15, p: 0.7, f: 0.1, c: 3.6, portions: [['1 dona', 120]] },

  // Nuts, sweets, oils, drinks
  { id: 'yongoq', name: 'Yongʻoq (grek)', kcal: 654, p: 15, f: 65, c: 14, portions: [['1 hovuch', 30]] },
  { id: 'bodom', name: 'Bodom', kcal: 579, p: 21, f: 50, c: 22, portions: [['1 hovuch', 30]] },
  { id: 'mayiz', name: 'Mayiz', kcal: 299, p: 3.1, f: 0.5, c: 79, portions: [['1 hovuch', 40]] },
  { id: 'asal', name: 'Asal', kcal: 304, p: 0.3, f: 0, c: 82, portions: [['1 choy qoshiq', 7]] },
  { id: 'shakar', name: 'Shakar', kcal: 387, p: 0, f: 0, c: 100, portions: [['1 choy qoshiq', 5]] },
  { id: 'shokolad', name: 'Shokolad (sutli)', kcal: 535, p: 7.7, f: 30, c: 59, portions: [['¼ plitka', 25]] },
  { id: 'yog', name: 'Oʻsimlik yogʻi', kcal: 884, p: 0, f: 100, c: 0, portions: [['1 osh qoshiq', 14]] },
  { id: 'choy', name: 'Choy (shakarsiz)', kcal: 1, p: 0, f: 0, c: 0.3, portions: [['1 piyola', 200]] },
  { id: 'qahva', name: 'Qahva (qora)', kcal: 2, p: 0.3, f: 0, c: 0, portions: [['1 chashka', 200]] },
  { id: 'kola', name: 'Gazli ichimlik (shirin)', kcal: 42, p: 0, f: 0, c: 10.6, portions: [['0,5 l', 500]] }
];

// Workout types with MET values (Compendium of Physical Activities, moderate effort).
window.ACTIVITIES = [
  { id: 'yurish', name: 'Yurish', met: 3.5 },
  { id: 'yugurish', name: 'Yugurish', met: 8.0 },
  { id: 'futbol', name: 'Futbol', met: 7.0 },
  { id: 'fitnes', name: 'Fitnes / kuch', met: 5.0 },
  { id: 'badan', name: 'Badantarbiya', met: 3.8 },
  { id: 'velo', name: 'Velosiped', met: 6.8 },
  { id: 'suzish', name: 'Suzish', met: 6.0 },
  { id: 'boshqa', name: 'Boshqa', met: 4.0 }
];
