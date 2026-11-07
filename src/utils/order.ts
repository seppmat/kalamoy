import {
  fulfillmentOptions,
  products,
  type FulfillmentId,
  type FulfillmentOption,
  type Product,
} from '../data/products'

export type DeliveryArea = '' | 'surabaya' | 'outside'

export interface FormValues {
  name: string
  /** Nomor lokal yang diketik pelanggan (tanpa +62), mis. "812-3456-7890" */
  phone: string
  /** Jumlah kuantiti per varian produk, mis. { 'kalamoy-original-sweet': 2, 'kalamoy-bittersweet': 1 } */
  items: Record<string, number>
  fulfillmentId: FulfillmentId
  /** Hanya dipakai bila diantar */
  area: DeliveryArea
  address: string
  note: string
  /** Kolom jebakan bot (disembunyikan dari manusia). Harus selalu kosong. */
  website: string
  // Kompatibilitas mundur
  productId?: string
  quantity?: number
}

export interface OrderItem {
  product: Product
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface OrderCalc {
  /** Seluruh item varian yang dipesan (hanya yang kuantitinya > 0) */
  items: OrderItem[]
  /** Total seluruh pcs dari semua varian */
  totalQuantity: number
  subtotal: number
  deliveryFee: number
  total: number
  fulfillment: FulfillmentOption
  /** Ringkasan teks varian, mis. "Original Sweet (2), Bittersweet (1)" */
  itemsSummary: string

  // Kompatibilitas mundur untuk komponen lama
  product: Product
  quantity: number
  unitPrice: number
}

/** Menghitung total secara otomatis dari seluruh varian yang dimasukkan ke keranjang. */
export function buildOrder(values: FormValues): OrderCalc {
  const fulfillment =
    fulfillmentOptions.find((f) => f.id === values.fulfillmentId) ?? fulfillmentOptions[0]

  const items: OrderItem[] = []
  let totalQuantity = 0
  let subtotal = 0

  products.forEach((p) => {
    let qty = 0
    if (values.items && typeof values.items[p.id] === 'number') {
      qty = Math.max(0, Math.floor(values.items[p.id]))
    } else if (values.productId === p.id) {
      qty = Math.max(0, Math.floor(values.quantity || 1))
    }

    if (qty > 0) {
      const itemSubtotal = p.price * qty
      items.push({
        product: p,
        quantity: qty,
        unitPrice: p.price,
        subtotal: itemSubtotal,
      })
      totalQuantity += qty
      subtotal += itemSubtotal
    }
  })

  const deliveryFee = fulfillment.fee
  const total = subtotal + deliveryFee

  const itemsSummary =
    items.length > 0
      ? items.map((it) => `${it.product.variantLabel} (${it.quantity})`).join(', ')
      : 'Belum ada item dipilih'

  const primaryProduct = items[0]?.product ?? products[0]

  return {
    items,
    totalQuantity,
    subtotal,
    deliveryFee,
    total,
    fulfillment,
    itemsSummary,
    product: primaryProduct,
    quantity: totalQuantity,
    unitPrice: primaryProduct.price,
  }
}
