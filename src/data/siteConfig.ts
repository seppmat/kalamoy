/**
 * ============================================================
 *  KONFIGURASI SITUS KALAMOY  (file ini yang paling sering diedit)
 * ============================================================
 *
 *  GAMBAR
 *  Cukup tulis NAMA FILE-nya saja. Semua gambar dibaca dari folder
 *  `public/images/`. Contoh: kalau kamu menaruh `foto-custard.png`
 *  di `public/images/`, di bawah cukup tulis 'foto-custard.png'.
 *
 *  WHATSAPP
 *  Ganti `whatsappNumber` dengan nomor bisnis, format internasional
 *  TANPA tanda + atau spasi. Contoh: '6281234567890'.
 *
 *  CATATAN KEAMANAN
 *  Jangan taruh API key / secret payment gateway di file ini.
 *  Semua isi file ini ikut terkirim ke browser pengunjung.
 */
export const siteConfig = {
  brand: {
    name: 'Kalamoy',
    wordmark: 'kalamoy.',
    tagline: 'Premium Quesillo',
    badge: 'Usaha Kecil-Kecilan',
    sectionBadge: 'Proyek Wirausaha Mahasiswa',
    footerText: 'Proyek Kewirausahaan Mahasiswa',
  },

  // ---------- GAMBAR (nama file saja, di folder public/images/) ----------
  images: {
    poster: 'product-poster.jpg', // foto utama di hero
    qris: 'qris.png', //            gambar QRIS dari pemilik usaha
  },

  // ---------- WHATSAPP ----------
  // PLACEHOLDER: ganti dengan nomor asli sebelum dipublikasikan!
  whatsappNumber: '6288247423301',

  // ---------- PENYIMPANAN PESANAN (Google Sheets) ----------
  // Tempel URL Web App dari Google Apps Script di sini (berakhiran /exec).
  // Panduan: README.md bagian "Menyimpan pesanan ke Google Sheets".
  // Dikosongkan = pesanan TIDAK dikirim ke Sheet (website tetap berjalan normal).
  // Catatan: URL ini publik dan bukan rahasia; pengamannya ada di skrip Apps Script.
  ordersEndpoint: 'https://script.google.com/macros/s/AKfycbwJVidl1c9b4XcZfLCI7w_Do1UJVdC-8eHWXFFvjqMzhUuYHgJIs3171wWrawlEze8iuQ/exec',

  // ---------- TEKS HERO ----------
  hero: {
    pill: '100% Pure Milk & Cane Caramel',
    headlineBold: 'Karamel Lumer,',
    headlineItalic: 'Kenikmatan Asli di Setiap Suapan.',
    description:
      'Premium quesillo karamel buatan tangan mahasiswa wirausaha. Manis lembut, lumer seketika, dibuat dalam batch kecil supaya selalu segar.',
    floatingTop: { title: 'Freshly Made Batch', subtitle: 'Dibuat per pesanan' },
    floatingBottom: '100% Pure Milk & Cane Sugar',
    trust: ['Freshly Made Harian', 'Higienis & Halal', 'Ambil di Lobby Kampus'],
  },

  // ---------- TEKS FORM ----------
  form: {
    title: 'Formulir Pemesanan',
    subtitle: 'Pesan sekarang!',
  },

  storageNote: 'Kalamoy tahan hingga 5 hari dalam kulkas bersuhu 2°C – 5°C. Nikmati selagi dingin!',
}
