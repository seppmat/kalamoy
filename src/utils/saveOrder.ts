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
 *
 * Yang dikirim hanya data isian. Total & status TIDAK dikirim karena dihitung dan ditentukan oleh server.
 * Browser tidak bisa membaca balasan Apps Script dengan andal (mode no-cors), jadi keberhasilan tidak
 * dapat dipastikan dari sini. Pelanggan tetap mengirim nota ke WhatsApp sebagai cadangan.
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
      // text/plain termasuk jenis "sederhana": tidak memicu preflight CORS yang tidak didukung Apps Script.
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
