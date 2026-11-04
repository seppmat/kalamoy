import {
  fulfillmentOptions,
  products,
  productInfo,
  type FulfillmentId,
  type FulfillmentOption,
  type Product,
} from '../data/products'

export type DeliveryArea = '' | 'surabaya' | 'outside'

export interface FormValues {
  name: string
  /** Nomor lokal yang diketik pelanggan (tanpa +62), mis. "812-3456-7890" */
  phone: string
  productId: string
  quantity: number
  fulfillmentId: FulfillmentId
  /** Hanya dipakai bila diantar */
  area: DeliveryArea
  address: string
  note: string
  /** Kolom jebakan bot (disembunyikan dari manusia). Harus selalu kosong. */
  website: string
}

export interface OrderCalc {
  product: Product
  fulfillment: FulfillmentOption
  quantity: number
  unitPrice: number
  subtotal: number
  deliveryFee: number
  total: number
}

/** Menghitung total secara otomatis dari varian produk terpilih + pilihan pelanggan. */
export function buildOrder(values: FormValues): OrderCalc {
  const selectedProduct =
    products.find((p) => p.id === values.productId) ?? products[0]
  const fulfillment =
    fulfillmentOptions.find((f) => f.id === values.fulfillmentId) ?? fulfillmentOptions[0]
  const quantity = Math.min(Math.max(1, Math.floor(values.quantity) || 1), productInfo.maxQuantity)
  const subtotal = selectedProduct.price * quantity
  const deliveryFee = fulfillment.fee

  return {
    product: selectedProduct,
    fulfillment,
    quantity,
    unitPrice: selectedProduct.price,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}
