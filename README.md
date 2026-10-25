# Kalamoy — Website Pemesanan (Mobile-First)

Website pemesanan satu halaman untuk **KALAMOY — Premium Quesillo**, pengganti Google Form.
Dibangun dengan **React + Vite + TypeScript + Tailwind CSS + Lucide React**. Statis, tanpa backend, tanpa database.

## Alur pelanggan

**Ambil di lobby kampus:** Hero → Isi form → Bayar QRIS → "Saya Sudah Bayar" → **Nota** → Kirim ke WhatsApp

**Diantar:** Hero → Isi form (+ alamat, hanya area Surabaya) → **Ajukan via WhatsApp (jangan bayar dulu)** → setelah dikonfirmasi penjual: Bayar QRIS → Nota → Kirim ke WhatsApp

Pengantaran dikonfirmasi dulu karena hanya melayani teman/kenalan di area Surabaya. Pelanggan yang memilih "Luar Surabaya" tidak bisa melanjutkan pengantaran dan diarahkan ke ambil di lobby.

---

## ⚠️ Batasan versi ini (baca dulu)

Versi awal ini **sengaja tidak punya backend**. Artinya:

- **Pesanan tidak disimpan di mana pun.** Tidak ada database, dan `localStorage` tidak dipakai sebagai "database pesanan". Satu-satunya catatan pesanan adalah **pesan WhatsApp** yang dikirim pelanggan.
- **Nomor pesanan** (mis. `KLM-261025-K7F2`) hanya penanda di sesi browser untuk dicantumkan di nota & pesan WhatsApp — bukan ID di sistem.
- **Pembayaran diverifikasi manual.** Menampilkan QRIS dan membuat nota **bukan bukti pembayaran**. Nota selalu berstatus **"Menunggu verifikasi pembayaran"**; website tidak pernah menulis "LUNAS". (Nota yang bisa membuat tulisan lunas sendiri mudah dipalsukan.) Penjual memeriksa mutasi/e-wallet dan bukti bayar yang dikirim lewat WhatsApp.
- Tombol "Ajukan" dan "Kirim Nota" hanya **membuka WhatsApp dengan pesan terisi**. Pelanggan tetap harus menekan Kirim sendiri.
- Tombol "Sudah dikonfirmasi — lanjut bayar" pada alur pengantaran **tidak memverifikasi apa pun**; itu hanya membuka langkah berikutnya. Konfirmasi sebenarnya terjadi di chat WhatsApp.

Untuk fitur berikut, dibutuhkan layanan tambahan / integrasi backend yang aman:

| Kebutuhan | Yang diperlukan |
| --- | --- |
| Menyimpan pesanan permanen & dashboard pesanan | Database + backend (mis. Supabase, Firebase, atau API sendiri) |
| Status pembayaran otomatis (lunas / belum) | **Payment gateway** (mis. Midtrans, Xendit) + backend yang memverifikasi *webhook* |
| Nota resmi yang tidak bisa dipalsukan | Nota dibuat server setelah pembayaran terverifikasi |

> **Jangan pernah** menaruh secret key payment gateway atau kredensial pribadi di kode frontend. Semua isi frontend bisa dilihat siapa pun.

---

## 1. Menjalankan di komputer sendiri

Butuh **Node.js 18+**.

```bash
npm install          # 1. install dependensi
npm run dev          # 2. server pengembangan (biasanya http://localhost:5173)
npm run build        # 3. build produksi (sekaligus cek error TypeScript)
npm run preview      # 4. coba hasil build secara lokal
```

---

## 2. Mengganti gambar, harga, aturan antar, dan nomor WhatsApp

### a. Gambar (cukup nama file)

Taruh file di `public/images/`, lalu tulis **nama filenya saja** di `src/data/siteConfig.ts`:

```ts
images: {
  poster: 'product-poster.jpg', // foto utama di hero
  qris: 'qris.png',             // gambar QRIS asli dari pemilik usaha
},
```

- Selama file belum ada, tampil **placeholder berlabel** (tanpa ikon gambar rusak, tanpa QRIS palsu).
- Gunakan gambar QRIS **asli** milik usahamu (dari aplikasi bank / e-wallet merchant).

### b. Nama produk, harga, ongkir

Edit `src/data/products.ts`:

```ts
export const product = {
  name: 'Original Caramel',   // ← nama varian tunggal
  price: 15000,               // ← harga per pcs
  ...
}
```

Ongkir ada di `fulfillmentOptions` (`delivery` → `fee`), default `0` karena diantar teman. Pesan penolakan dan syarat area ada di `deliveryRules`.

### c. Nomor WhatsApp bisnis

Di `src/data/siteConfig.ts`:

```ts
whatsappNumber: '62XXXXXXXXXX', // ← ganti!
```

Format internasional **tanpa** `+`, spasi, atau tanda hubung (contoh `6281234567890`). Selama masih placeholder, tombol WhatsApp membuka `https://wa.me/?text=...` sehingga pengguna harus memilih kontak sendiri. **Ganti sebelum website dibagikan.**

Teks hero, teks form, dan catatan penyimpanan juga ada di `siteConfig.ts`.

---

## 3. Nota

Dibuat di browser pelanggan (tanpa library) oleh `src/utils/receipt.ts`:

- **Gambar PNG** — bisa disimpan atau dibagikan lewat menu share di HP (jika didukung browser).
- **Teks** — otomatis jadi isi pesan WhatsApp, dan bisa disalin.

Link WhatsApp (`wa.me`) tidak bisa melampirkan gambar secara otomatis, jadi pelanggan melampirkan nota/bukti bayar sendiri. Teks nota sudah memuat semua detail sehingga pesan tetap lengkap tanpa lampiran.

---

## 4. Upload ke GitHub

```bash
git init
git add .
git commit -m "Kalamoy ordering website"
git branch -M main
git remote add origin https://github.com/USERNAME/kalamoy.git
git push -u origin main
```

(Buat repository kosong dulu di GitHub. `node_modules` dan `dist` sudah diabaikan lewat `.gitignore`.)

## 5. Deploy ke Vercel (gratis)

1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub.
2. **Add New → Project**, pilih repository `kalamoy`.
3. Vercel mendeteksi **Vite**. Pastikan Build Command `npm run build` dan Output Directory `dist`.
4. Klik **Deploy**. Setiap `git push` ke `main` otomatis memperbarui website.

### Custom domain

1. Vercel: project → **Settings → Domains → Add**, masukkan domain.
2. Pasang record DNS yang ditampilkan Vercel di penyedia domain (A untuk domain utama, CNAME untuk subdomain). Pakai nilai persis dari dashboard Vercel.
3. Tunggu propagasi DNS. HTTPS aktif otomatis.

## 6. Alternatif: GitHub Pages

`vite.config.ts` memakai `base: './'` sehingga aman di subfolder Pages. Jalankan `npm run build`, publikasikan isi `dist/` (mis. lewat GitHub Actions), lalu atur di **Settings → Pages**.

---

## Struktur project

```
src/
  components/
    Header.tsx, HeroSection.tsx, Footer.tsx
    OrderForm.tsx     form + validasi + field alamat saat diantar
    OrderSummary.tsx  ringkasan & total
    QrisPayment.tsx   alur: ajukan antar → QRIS → nota
    Receipt.tsx       tampilan nota + tombol simpan/kirim/salin
    SafeImage.tsx     gambar dengan placeholder bila file belum ada
  data/
    products.ts       produk, harga, opsi pengambilan, aturan antar
    siteConfig.ts     brand, nomor WhatsApp, nama file gambar, teks
  utils/
    receipt.ts               nota: data, teks, gambar PNG (canvas)
    generateWhatsAppUrl.ts   link wa.me + pesan pengajuan antar
    validation.ts            validasi form & normalisasi nomor HP
    order.ts, formatCurrency.ts, orderRef.ts, scroll.ts, assetUrl.ts
public/images/        ← taruh product-poster.jpg dan qris.png di sini
```

## Aksesibilitas & performa

- Mobile-first, target sentuh ≥ 44px, tanpa horizontal overflow.
- `type="tel"` / `inputMode`, `autoComplete`, dan label yang selalu terlihat.
- Animasi CSS ringan dan menghormati `prefers-reduced-motion`.
- Error validasi memakai `role="alert"` dan fokus pindah ke kolom bermasalah.
