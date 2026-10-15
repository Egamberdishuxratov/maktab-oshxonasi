# Smart Oshxona — maktab oshxonasi

React + Tailwind CSS 4 + Vite. Ma'lumotlar **brauzer xotirasida (localStorage)** saqlanadi, tashqi backend kerak emas.

## Ishga tushirish
```bash
npm install
npm run dev
```
Brauzerda http://localhost:5173 ochiladi. Joylash: `npm run build`, `dist` papkasini Vercel/Netlify'ga yuklang.

## Bosh oshpaz akkaunti
| Rol | Email | Parol |
|---|---|---|
| Bosh oshpaz — Shovkat Sarayev | Shovkat@gmail.com | 87654321 |
| O'quvchi | Egamberdi@gmail.com | 12345 |

Bosh oshpaz telefoni: 99 530 45 89. O'quvchi ro'yxatdan o'tayotganda 1–11-sinfdan birini tanlaydi; tanlangan sinf akkauntida saqlanadi. Oshpaz staji ro'yxatdan o'tishda so'ralmaydi; oshpazlar ro'yxatida ism ustiga bosilganda demo staj yili ko'rsatiladi. O'quvchilar sig'imi 1–6 kishilik qilib farqlangan, maktab oshxonasi uslubida tasvirlangan 10 ta stoldan birini sana-vaqt bilan bron qilishi mumkin; tanlangan stol sig'imigacha odam qo'shiladi, bir stol bir soat band bo'ladi, bronlar brauzer xotirasida sahifa yangilanganda ham saqlanadi. Yuborilgan bron oshpaz tasdiqlaguncha kutilayotgan bo'ladi va shu vaqt ichida stol band hisoblanadi. Oshpaz yoki bosh oshpaz bronni tasdiqlashi mumkin; tasdiqlangan holat o'quvchiga ham ko'rinadi. O'quvchi bronni bekor qilganda u o'quvchi sahifasidan yo'qoladi, oshpaz va bosh oshpaz sahifasida esa bekor qilingan deb ko'rinib qoladi. Oshpaz/bosh oshpaz barcha bronlar, bron qilgan o'quvchining ism-sinfi va holatini ko'ra oladi; bron yaratish va bekor qilish faqat o'quvchiga ruxsat etiladi. Oshpaz sifatida ro'yxatdan o'tgan akkauntni bosh oshpaz tasdiqlamaguncha u tizimga kira olmaydi. Menyuda maktab oshxonasiga mos 20 ta taom va ichimlik boshlang'ich holatda mavjud.

## Oshpaz akkauntlari
Quyidagi 5 ta oshpaz akkaunti oldindan yaratiladi; barchasining paroli `87654321`:
- Dilnoza Karimova — `oshpaz1@oshxona.uz`
- Mohira Rasulova — `oshpaz2@oshxona.uz`
- Madina Tursunova — `oshpaz3@oshxona.uz`
- Gulbahor Ismoilova — `oshpaz4@oshxona.uz`
- Zilola Abdullayeva — `oshpaz5@oshxona.uz`

## Rollarni sinash
Ma'lumot bitta brauzerda umumiy bo'lgani uchun turli akkauntlarni alohida tablarda sinash mumkin. Oshpaz akkaunti tasdiqlanishi uchun bosh oshpaz bo'lib kirib, "Oshpazlar" bo'limidan arizani qabul qiling. Boshqa oynadagi o'zgarish bir necha soniyada ko'rinadi. Inkognito oyna yoki boshqa qurilma bu ma'lumotni **ko'rmaydi**.

## Muhim cheklov
localStorage faqat shu brauzerda ishlaydi, shuning uchun "ikki qurilmada ishlash" talabi bajarilmaydi. Ma'lumotni tozalash: brauzer konsolida `localStorage.clear()` va sahifani yangilash (bosh oshpaz akkaunti va namunaviy menyu qayta yaratiladi).

## Kod tuzilishi
- `src/lib/api.js` — barcha qoidalar: rol va egalik tekshiruvi, narxni hisoblash, zaxirani band qilish/qaytarish, holatlar zanjiri, takroriy yuborishdan himoya, parol hash (PBKDF2).
- `src/context/AuthContext.jsx` — kirish, chiqish, sessiya (sahifa yangilanganda saqlanadi).
- `src/hooks/usePolling.js` — ma'lumotni har 3 soniyada yangilaydi.
- `src/pages/*` — Katalog, Tafsilot, Savatcha, Buyurtmalarim, Stol bronlari (o'quvchi); Buyurtmalar, Menyu (oshpaz); Oshpazlarni tasdiqlash (bosh oshpaz).
- `src/components/*` — DishCard, OrderCard, Header, forma va umumiy qismlar.
