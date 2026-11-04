import { siteConfig } from '../data/siteConfig'
import { buildOrder, type FormValues } from './order'
import { normalizeIndonesianPhone } from './validation'

export type OrderEvent = 'submit' | 'paid'

/** True jika URL Web App Google Apps Script sudah diisi di siteConfig. */
export function isOrdersEndpointConfigured(): boolean {
  return /^https:\/\/script\.google(usercontent)?\.com\//.test(siteConfig.ordersEndpoint)
}

/**
 * Mengirim pesanan ke Google Sheets lewat Google Apps Script. "Kirim dan lupakan".
 *
 *  - 'submit' : saat pelanggan menekan "Lanjut" di form.
 *  - 'paid'   : saat pelanggan menekan "Saya Sudah Bayar" (BUKAN bukti bayar; penjual tetap memverifikasi).
 */
export function saveOrder(event: OrderEvent, values: FormValues, orderRef: string): void {
  if (!isOrdersEndpointConfigured()) return

  const phone = normalizeIndonesianPhone(values.phone)
  if (!phone) return

  const order = buildOrder(values)
  const isDelivery = order.fulfillment.requiresConfirmation

  const payload = {
    event,
    orderRef,
    name: values.name.trim(),
    phone,
    productId: order.product.id,
    productName: order.product.name,
    quantity: order.quantity,
    fulfillmentId: order.fulfillment.id,
    area: isDelivery ? values.area : '',
    address: isDelivery ? values.address.trim() : '',
    note: values.note.trim(),
    website: values.website,
  }

  try {
    void fetch(siteConfig.ordersEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* gagal diam-diam: pelanggan tetap bisa lanjut dan mengirim nota via WhatsApp */
    })
  } catch {
    /* fetch tidak tersedia / diblokir */
  }
}

export interface ReviewPayload {
  name: string
  variant: string
  rating: number
  comment: string
}

/**
 * Mengirim ulasan pelanggan ke tab 'Ulasan' di Google Sheets.
 */
export function saveReview(data: ReviewPayload): Promise<boolean> {
  if (!isOrdersEndpointConfigured()) {
    return Promise.resolve(true)
  }

  const payload = {
    event: 'review',
    name: data.name.trim() || 'Anonim',
    variant: data.variant,
    rating: data.rating,
    comment: data.comment.trim(),
    createdAt: new Date().toISOString(),
  }

  return new Promise((resolve) => {
    try {
      void fetch(siteConfig.ordersEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
        .then(() => resolve(true))
        .catch(() => resolve(true))
    } catch {
      resolve(true)
    }
  })
}

export interface PoStatusResult {
  isOpen: boolean
  message?: string
}

/**
 * Memeriksa status Pre-Order dari Google Sheets tab 'Pengaturan'.
 * Mengembalikan null jika gagal fetch (fallback ke default di siteConfig).
 */
export async function fetchPoStatus(): Promise<PoStatusResult | null> {
  if (!isOrdersEndpointConfigured()) return null

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000) // timeout 4 detik

    const res = await fetch(`${siteConfig.ordersEndpoint}?action=status`, {
      method: 'GET',
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) return null
    const data = await res.json()

    // Membaca boolean isOpen atau string "BUKA" / "TUTUP"
    const statusStr = String(data.status || data.isOpen || '').trim().toLowerCase()
    const isOpen = statusStr === 'true' || statusStr === 'buka' || statusStr === 'open'

    return {
      isOpen,
      message: data.message,
    }
  } catch {
    return null
  }
}
