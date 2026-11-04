/**
 * ============================================================
 *  DATA PRODUK & VARIAN KALAMOY
 * ============================================================
 *  Harga dalam Rupiah, angka bulat tanpa titik. Contoh: 15000.
 */

export interface Product {
  id: string
  name: string
  variantLabel: string
  tagline: string
  description: string
  suitability: string
  price: number
}

export const products: Product[] = [
  {
    id: 'kalamoy-original-sweet',
    name: 'Original Sweet Caramel',
    variantLabel: 'Original Sweet',
    tagline: 'Manis Lembut & Creamy',
    description:
      'Quesillo klasik dengan saus karamel manis lembut, tekstur lumer seperti sutra, dan creamy di setiap suapan.',
    suitability: 'Cocok untuk pecinta dessert manis klasik & kamu yang baru pertama kali mencoba Quesillo.',
    price: 15000,
  },
  {
    id: 'kalamoy-bittersweet',
    name: 'Classic Bittersweet Caramel',
    variantLabel: 'Bittersweet (Roasted)',
    tagline: 'Aroma Panggang & Pahit Tipis',
    description:
      'Karamel gaya otentik dengan aroma panggang khas dan sentuhan pahit tipis elegan penyeimbang rasa manis custard susu.',
    suitability: 'Cocok untuk penikmat karamel otentik (Crème Caramel / Flan) yang suka rasa lebih berkarakter dan tidak enek.',
    price: 15000,
  },
]

/** Default produk pertama (untuk kompatibilitas) */
export const product = products[0]

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
