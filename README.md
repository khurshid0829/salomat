# Salomat

Shaxsiy kaloriya, vazn, fitnes va odat kundaligi (PWA). Ma'lumotlar faqat qurilmaning o'zida (localStorage) saqlanadi.

## Ishga tushirish

```
node serve.js                       # http://localhost:5181
node --test tests/engine.test.js    # dvigatel testlari
```

## Hisob asoslari

| Nima | Qanday |
|---|---|
| Asosiy almashinuv | Mifflin–St Jeor (1990) |
| Kundalik sarf | BMR × 1,2 / 1,3 / 1,4 (mashqsiz turmush) + mashqlar |
| Mashq | (MET − 1) × kg × soat, MET: Compendium of Physical Activities |
| Haqiqiy sarf | 21 kun: o'rtacha iste'mol − vazn trendi o'zgarishi × 7700 / 21 (14+ kun yozuv, 8+ tortilish kerak) |
| Defitsit / profitsit | vaznning haftalik 0,25–1% i; xavfsiz chegara: erkak 1500, ayol 1200 kkal |
| Oqsil | 1,6 g/kg (Morton 2018) |
| Tana | bel/bo'y, bel/bo'ksa (JSST), US Navy yog' foizi |

## Fayllar

| Fayl | Vazifasi |
|---|---|
| `engine.js` | Sof hisob funksiyalari |
| `foods.js` | Mahsulotlar (USDA asosida) va o'zbek taomlari (taxminiy), mashq turlari |
| `app.js` | Ekranlar va saqlash |
| `sw.js` | Offline kesh (fayl o'zgarsa `VERSION` ni oshiring) |

## Cheklovlar

- Apple Health'dan qadam va mashqlarni avtomatik o'qib bo'lmaydi (veb-ilova cheklovi).
- O'zbek taomlari qiymati retseptga qarab ±20–30% farq qiladi.
- Tibbiy maslahat o'rnini bosmaydi.
