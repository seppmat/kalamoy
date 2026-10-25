import {
  fulfillmentOptions,
  product,
  productInfo,
  type FulfillmentId,
  type FulfillmentOption,
} from '../data/products'

export type DeliveryArea = '' | 'surabaya' | 'outside'

export interface FormValues {
  name: string
  /** Nomor lokal yang diketik pelanggan (tanpa +62), mis. "812-3456-7890" */
  phone: string
  quantity: number
  fulfillmentId: FulfillmentId
  /** Hanya dipakai bila diantar */
  area: DeliveryArea
  address: string
  note: string
}

export interface OrderCalc {
  product: typeof product
  fulfillment: FulfillmentOption
  quantity: number
  unitPrice: number
  subtotal: number
  deliveryFee: number
  total: number
}

/** Menghitung total secara otomatis dari data produk + pilihan pelanggan. */
export function buildOrder(values: FormValues): OrderCalc {
  const fulfillment =
    fulfillmentOptions.find((f) => f.id === values.fulfillmentId) ?? fulfillmentOptions[0]
  const quantity = Math.min(Math.max(1, Math.floor(values.quantity) || 1), productInfo.maxQuantity)
  const subtotal = product.price * quantity
  const deliveryFee = fulfillment.fee

  return {
    product,
    fulfillment,
    quantity,
    unitPrice: product.price,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  }
}
