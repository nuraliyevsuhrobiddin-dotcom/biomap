# BIOMap - O'zbekiston noyob o'simliklarini monitoring qilish GIS platformasi 🌿🌍

![BIOMap Banner](./public/icon-512.png)

**BIOMap** — O'zbekistonning noyob va Qizil kitobga kiritilgan o'simlik turlarini monitoring qilish, sun'iy intellekt orqali turlarni aniqlash hamda GIS (Geografik Axborot Tizimlari) yordamida interaktiv xaritalash uchun mo'ljallangan markazlashgan raqamli platforma. Ushbu loyiha O'zbekiston Fanlar Akademiyasi Botanika instituti dala tadqiqotchilari va ekologlar uchun maxsus ishlab chiqilgan.

---

## 🌟 Asosiy Imkoniyatlar (Features)

* **🗺️ GIS Teleradar Xaritasi:** O'simlik populyatsiyalarini va ularning tarqalish areallarini ko'rsatish uchun yuqori aniqlikdagi interaktiv (Topografik, Vektor, Sun'iy yo'ldosh) xaritalar.
* **🤖 AI Skaner Laboratoriyasi:** O'simlik rasmini yuklash yoki kameraga tushirish orqali sun'iy intellekt uning oilasi, nomi va Qizil kitob maqomini sekunlar ichida aniqlab beradi.
* **📚 Raqamli Qizil Kitob Katalogi:** O'zbekistonda mavjud, yo'qolib borayotgan yoki kamyob o'simlik turlarining batafsil ilmiy tavsifiga ega keng qamrovli baza.
* **📊 Kengaytirilgan Statistika (Dashboard):** Monitoring qilingan o'simlik turlari va ularning viloyatlar kesimidagi holati haqida chuqurlashtirilgan grafik va tahlillar.
* **🔬 Tadqiqotchi Paneli:** Dala tadqiqotchilari xaritada yangi topilmalarni belgilab, o'z GPS koordinatalari, rasmlari va videolari bilan markaziy bazaga kiritishlari mumkin.
* **👥 Rolli Boshqaruv (RBAC):** Admin, Tadqiqotchi, Foydalanuvchi tizimi. Barcha ma'lumotlar Admin tasdig'idan o'tgachgina ommaviy xaritada paydo bo'ladi.
* **📱 PWA (Ilova sifatida o'rnatish):** Saytni brauzer orqali to'g'ridan-to'g'ri smartfon va kompyuterga ilova (App) kabi yuklab olish va qulay ishlatish imkoniyati.

---

## 🛠 Texnologiyalar (Tech Stack)

Ushbu loyiha zamonaviy va tezkor ishlashini ta'minlovchi quyidagi texnologiyalar asosida qurilgan:

* **Frontend:** React, TypeScript, Vite, Tailwind CSS
* **Xaritalar (GIS):** Leaflet (ESRI World Topo Map, CartoDB Voyager qatlamlari)
* **Sun'iy Intellekt:** Google Gemini API (Tasvir orqali botanik tahlil qilish uchun)
* **Ma'lumotlar Bazasi:** Supabase (PostgreSQL), xavfsiz autentifikatsiya, lokal LocalStorage zahira tizimi
* **UI/UX:** Lucide-React (ikonkalar), Recharts (grafiklar), Glassmorphism dizayn tili

---

## 🚀 O'rnatish va Ishga Tushirish (Local Setup)

Loyihani o'z kompyuteringizda ishga tushirish uchun quyidagi qadamlarni bajaring:

### 1. Talablar
* **Node.js** (versiya 20 yoki undan yuqori)

### 2. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 3. Muhit o'zgaruvchilarini sozlash
Loyihaning asosiy papkasida `.env` faylini yarating (yoki `.env.example` ni nusxalang) va kalitlarni kiriting:

```bash
# Skaner ishlashi uchun Gemini API kaliti (Majburiy)
GEMINI_API_KEY=sizning_gemini_kalitingiz

# Ma'lumotlar bazasi va avtorizatsiya uchun (Majburiy)
VITE_SUPABASE_URL=sizning_supabase_url_manzilingiz
VITE_SUPABASE_ANON_KEY=sizning_supabase_anon_kalitingiz
```

### 4. Dasturni ishga tushirish (Development Mode)
```bash
npm run dev
```
Dastur odatda `http://localhost:3000` yoki `http://localhost:5173` manzilida ishga tushadi.

---

## 🔒 Xavfsizlik va Ruxsatlar
* Ro'yxatdan o'tmagan mehmon foydalanuvchilar **AI Skanerdan foydalanishi, fayl yuklashi yoki yangi dala kuzatuvlarini qo'shishi** cheklangan. Barcha muhim amaliyotlar avtorizatsiyadan o'tishni talab etadi.

## 📦 Skriptlar
- `npm run dev` - dasturni ishlab chiqish rejimida ishga tushirish.
- `npm run build` - ishlab chiqarish (production) uchun kodni yig'ish.
- `npm run start` - tayyor build-ni serverda ko'tarish.
- `npm run lint` - TypeScript tahlillarini (qoidalarni) tekshirish.

---
*© 2026 BIOMap loyihasi. Ekologiya va atrof-muhitni asrash - hammamizning ishimiz!*
