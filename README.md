# Kalamoy — Website Pemesanan (Mobile-First)

Website pemesanan satu halaman untuk **KALAMOY — Premium Quesillo**, pengganti Google Form.
Dibangun dengan **React + Vite + TypeScript + Tailwind CSS + Lucide React**. Statis; penyimpanan pesanan memakai **Google Sheets** lewat Google Apps Script (gratis, opsional).

## Alur pelanggan

**Ambil di lobby kampus:** Hero → Isi form → Bayar QRIS → "Saya Sudah Bayar" → **Nota (gambar)** → Kirim gambar nota + bukti bayar ke WhatsApp

**Diantar:** Hero → Isi form (+ alamat, hanya area Surabaya) → **Ajukan via WhatsApp (jangan bayar dulu)** → setelah dikonfirmasi penjual: Bayar QRIS → Nota (gambar) → Kirim ke WhatsApp

Pengantaran dikonfirmasi dulu karena hanya melayani teman/kenalan di area Surabaya. Pelanggan yang memilih "Luar Surabaya" tidak bisa melanjutkan pengantaran dan diarahkan ke ambil di lobby.

Jika Google Sheets sudah dipasang, pesanan **tercatat otomatis** dua kali: saat form dikirim dan saat "Saya Sudah Bayar" ditekan.

---

## ⚠️ Batasan (baca dulu)

- **Pembayaran diverifikasi manual.** Menampilkan QRIS, membuat nota, dan menekan "Saya Sudah Bayar" **bukan bukti pembayaran**. Nota selalu berstatus **"Menunggu verifikasi pembayaran"**; website dan skrip tidak pernah menulis "LUNAS". Kolom **Status** di Sheet kamu isi sendiri setelah mengecek mutasi QRIS.
- **Pencatatan ke Sheet bersifat "kirim dan lupakan".** Browser tidak bisa membaca balasan Apps Script dengan andal, jadi website tidak bisa memastikan 100% bahwa baris sudah masuk. Email notifikasi dan pesan WhatsApp menjadi cadangan.
- **Tanpa Apps Script** (kolom `ordersEndpoint` kosong), pesanan tidak disimpan di mana pun. Satu-satunya catatan adalah chat WhatsApp.
- **Nomor pesanan** (mis. `KLM-261027-K7F2`) dibuat di browser sebagai penanda di nota & Sheet — bukan ID dari sistem pusat.
- Link WhatsApp (`wa.me`) tidak bisa melampirkan gambar otomatis. Pelanggan tetap yang menekan Kirim.
- Tombol "Sudah dikonfirmasi — lanjut bayar" pada alur pengantaran **tidak memverifikasi apa pun**. Jika pelanggan membayar sebelum kamu menyetujui, Sheet menandainya "Bayar, antar belum disetujui".

Untuk status pembayaran otomatis dibutuhkan **payment gateway** (mis. Midtrans, Xendit) + backend yang memverifikasi *webhook*. **Jangan pernah** menaruh secret key atau kredensial di kode frontend.

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

Selama file belum ada, tampil **placeholder berlabel** (tanpa ikon gambar rusak, tanpa QRIS palsu). Gunakan gambar QRIS **asli** milik usahamu.

### b. Nama produk, harga, ongkir

Edit `src/data/products.ts` (`product.name`, `product.price`, dan `fee` pada `fulfillmentOptions`).

> **Penting:** jika harga atau ongkir berubah, ubah juga `UNIT_PRICE` dan `FULFILLMENT` di `apps-script/Code.gs`. Skrip menghitung ulang total sendiri dan tidak mempercayai angka dari browser, jadi kedua tempat harus sama.

### c. Nomor WhatsApp bisnis

Di `src/data/siteConfig.ts`:

```ts
whatsappNumber: '62XXXXXXXXXX', // ← ganti!
```

Format internasional **tanpa** `+`, spasi, atau tanda hubung (contoh `6281234567890`). Selama masih placeholder, tombol WhatsApp membuka `https://wa.me/` tanpa kontak tujuan. **Ganti sebelum website dibagikan.**

---

## 3. Menyimpan pesanan ke Google Sheets

Skrip ada di `apps-script/Code.gs` dan sudah diisi ID spreadsheet Kalamoy. Kolom Sheet: `Waktu · No. Pesanan · Nama · WhatsApp · Jumlah · Pengambilan · Alamat · Catatan · Total · Status · Waktu klik "Sudah bayar"`.

### Langkah pemasangan (sekitar 10 menit, sekali saja)

1. Buka spreadsheet-nya. Pastikan nama tab-nya **`Sheet1`** (atau ubah `SHEET_NAME` di skrip).
2. Menu **Extensions → Apps Script**. Hapus kode bawaan, tempel seluruh isi `apps-script/Code.gs`, lalu simpan (Ctrl+S).
3. Di dropdown fungsi (atas editor) pilih **`setupSheet`**, klik **Run**. Setujui izin akses (Review permissions → pilih akunmu → *Advanced* → *Go to … (unsafe)* → *Allow*). Peringatan ini muncul karena skrip buatan sendiri belum diverifikasi Google; itu normal. Hasil: header yang kosong dilengkapi (yang sudah kamu isi tidak ditimpa) dan kolom Status punya dropdown.
4. *(Opsional)* Jalankan **`kirimPesananContoh`**. Satu baris contoh muncul di Sheet dan email notifikasi masuk. Hapus baris contohnya setelah dicek.
5. Klik **Deploy → New deployment**, ikon roda gigi → **Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   
   Klik **Deploy**, lalu salin **Web app URL** (berakhiran `/exec`).
6. Tempel URL itu ke `src/data/siteConfig.ts`:
   ```ts
   ordersEndpoint: 'https://script.google.com/macros/s/XXXX/exec',
   ```
7. Build / deploy ulang website (`git push` jika memakai Vercel), lalu buat satu pesanan percobaan dan cek barisnya di Sheet.

**Jika kamu mengubah kode Apps Script nanti:** Deploy → *Manage deployments* → ikon pensil → *Version*: **New version** → Deploy. URL-nya tetap sama.

### Status pesanan

| Status | Diisi oleh |
| --- | --- |
| Menunggu bayar | otomatis (ambil di lobby) |
| Pengajuan antar | otomatis (diantar) |
| Antar disetujui | **kamu**, setelah menyetujui pengantaran |
| Menunggu verifikasi | otomatis, saat pelanggan menekan "Saya Sudah Bayar" |
| Bayar, antar belum disetujui | otomatis, jika pelanggan bayar sebelum kamu menyetujui |
| Lunas · Diantar · Selesai · Batal | **kamu** (dropdown), setelah mengecek mutasi QRIS |

Setelah baris diproses (status selain "Menunggu bayar" / "Pengajuan antar"), kiriman ulang dari website tidak akan menimpanya.

### Keamanan

- **Sheet harus privat.** Buka Share → *General access* → pilih **Restricted**, lalu tambahkan anggota tim sebagai Editor lewat email. Web app berjalan atas namamu, jadi Sheet **tidak perlu dibuat publik** agar website bisa menulis.
- Nama, nomor WA, dan alamat adalah data pribadi. Aktifkan verifikasi dua langkah di akun Google pemilik Sheet dan hapus data lama yang tidak diperlukan.
- URL Web App **publik** (siapa pun yang tahu bisa mengirim data). Skrip hanya bisa **menambah/memperbarui** baris dan tidak pernah membaca atau mengembalikan isi Sheet. Pengamannya: validasi semua input, total dihitung ulang di server, status ditentukan server, teks berawalan `= + - @` dinetralkan (mencegah formula injection), kolom jebakan bot, dan batas 10 permintaan per nomor WhatsApp per jam. Ini mengurangi spam tetapi tidak menghilangkannya sepenuhnya.
- Email notifikasi pesanan baru dikirim ke pemilik akun Google (atur `NOTIFY_OWNER = false` untuk mematikannya).

---

## 4. Nota

Dibuat di browser pelanggan (tanpa library) oleh `src/utils/receipt.ts`, berupa **gambar PNG**:

- **Di HP:** tombol "Kirim Nota ke WhatsApp" membuka menu bagikan dengan gambar nota terlampir. Pelanggan memilih WhatsApp lalu chat Kalamoy.
- **Di desktop / browser tanpa dukungan:** gambar diunduh dan chat WhatsApp Kalamoy dibuka; pelanggan melampirkan gambar yang baru diunduh.
- Tombol "Simpan Nota" dan "Buka Chat" tersedia sebagai alternatif.

Pesan teks hanya dipakai pada **pengajuan pengantaran** (sebelum bayar), karena itu berupa pertanyaan ke penjual, bukan nota.

---

## 5. Upload ke GitHub

```bash
git init
git add .
git commit -m "Kalamoy ordering website"
git branch -M main
git remote add origin https://github.com/USERNAME/kalamoy.git
git push -u origin main
```

(Buat repository kosong dulu di GitHub. `node_modules` dan `dist` sudah diabaikan lewat `.gitignore`.)

## 6. Deploy ke Vercel (gratis)

1. Masuk ke [vercel.com](https://vercel.com) dengan akun GitHub.
2. **Add New → Project**, pilih repository `kalamoy`.
3. Vercel mendeteksi **Vite**. Pastikan Build Command `npm run build` dan Output Directory `dist`.
4. Klik **Deploy**. Setiap `git push` ke `main` otomatis memperbarui website.

### Custom domain

1. Vercel: project → **Settings → Domains → Add**, masukkan domain.
2. Pasang record DNS yang ditampilkan Vercel di penyedia domain (A untuk domain utama, CNAME untuk subdomain). Pakai nilai persis dari dashboard Vercel.
3. Tunggu propagasi DNS. HTTPS aktif otomatis.

## 7. Alternatif: GitHub Pages

`vite.config.ts` memakai `base: './'` sehingga aman di subfolder Pages. Jalankan `npm run build`, publikasikan isi `dist/` (mis. lewat GitHub Actions), lalu atur di **Settings → Pages**.

---

## Struktur project

```
apps-script/
  Code.gs           ← ditempel ke Google Apps Script (penerima pesanan → Sheet)
src/
  components/
    Header.tsx, HeroSection.tsx, Footer.tsx
    OrderForm.tsx     form + validasi + field alamat saat diantar
    OrderSummary.tsx  ringkasan & total
    QrisPayment.tsx   alur: ajukan antar → QRIS → nota
    Receipt.tsx       tampilan nota + kirim/simpan gambar
    SafeImage.tsx     gambar dengan placeholder bila file belum ada
  data/
    products.ts       produk, harga, opsi pengambilan, aturan antar
    siteConfig.ts     brand, nomor WhatsApp, URL Apps Script, nama file gambar, teks
  utils/
    saveOrder.ts             kirim pesanan ke Apps Script (Sheet)
    receipt.ts               nota: data & gambar PNG (canvas)
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
