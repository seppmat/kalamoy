/**
 * ============================================================
 *  DATA PRODUK  (nama, harga, aturan pengambilan — semua di sini)
 * ============================================================
 *  Harga dalam Rupiah, angka bulat tanpa titik. Contoh: 15000.
 *
 *  Saat ini hanya ada SATU produk, jadi tidak ada pilihan varian
 *  di form (otomatis terpilih). Ingin menambah varian di kemudian hari?
 *  Ubah `product` menjadi array dan kembalikan pemilih varian di OrderForm.
 */

export const product = {
  id: 'kalamoy-original-caramel',
  name: 'Original Caramel',
  description: 'Quesillo karamel original: manis, lembut, dan lumer di setiap suapan.',
  price: 15000,
}

export const productInfo = {
  unitName: 'pcs',
  maxQuantity: 20,
  quantityHint: 'Setiap pesanan sudah termasuk sendok.',
  includedNote: 'Sudah termasuk sendok',
}

export type FulfillmentId = 'pickup' | 'delivery'

export interface FulfillmentOption {
  id: FulfillmentId
  label: string
  /** Label pendek untuk tombol pilihan di HP */
  shortLabel: string
  /** Biaya tambahan dalam Rupiah (0 = tanpa biaya) */
  fee: number
  /** Teks kecil di bawah pilihan saat opsi ini aktif */
  hint: string
  /**
   * true = penjual harus mengonfirmasi dulu lewat WhatsApp SEBELUM pelanggan membayar.
   * Dipakai untuk pengantaran karena tidak semua alamat bisa dilayani.
   */
  requiresConfirmation: boolean
}

export const fulfillmentOptions: FulfillmentOption[] = [
  {
    id: 'pickup',
    label: 'Ambil di Lobby Kampus',
    shortLabel: 'Ambil di Lobby',
    fee: 0,
    hint: 'Titik ambil: Lobby Kampus. Jam pengambilan disepakati lewat WhatsApp.',
    requiresConfirmation: false,
  },
  {
    id: 'delivery',
    label: 'Diantar',
    shortLabel: 'Diantar',
    // Biasanya diantar oleh teman sendiri, jadi default tanpa ongkir.
    // Kalau mau menarik ongkir, ubah angka ini (mis. 5000).
    fee: 0,
    hint: 'Khusus area Surabaya & kenalan Kalamoy. Dikonfirmasi dulu sebelum pembayaran.',
    requiresConfirmation: true,
  },
]

/** Aturan pengantaran — dipakai di teks form dan validasi. */
export const deliveryRules = {
  areaName: 'Surabaya',
  notice:
    'Pengantaran terbatas untuk area Surabaya dan khusus teman/kenalan Kalamoy. Kami konfirmasi dulu lewat WhatsApp sebelum kamu membayar, dan pengajuan bisa saja kami tolak jika lokasi terlalu jauh.',
  outsideMessage:
    'Maaf, pengantaran hanya untuk area Surabaya. Kamu bisa memilih “Ambil di Lobby Kampus” sebagai gantinya.',
}

export const defaultFulfillmentId: FulfillmentId = 'pickup'
