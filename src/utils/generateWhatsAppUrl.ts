import { productInfo } from '../data/products'
import { siteConfig } from '../data/siteConfig'
import { formatCurrency, formatFee } from './formatCurrency'
import type { OrderCalc } from './order'

/** True jika nomor di siteConfig sudah diganti dari placeholder. */
export function isWhatsAppConfigured(number: string = siteConfig.whatsappNumber): boolean {
  return /^62\d{8,13}$/.test(number)
}

/**
 * URL click-to-chat resmi WhatsApp: https://wa.me/<nomor>?text=<pesan>
 * Jika nomor belum dikonfigurasi, dipakai https://wa.me/?text=<pesan>
 * (pelanggan diminta memilih kontak sendiri) supaya tombol tetap berfungsi saat pengembangan.
 * Pelanggan tetap harus menekan Kirim di WhatsApp.
 */
export function buildWhatsAppUrl(text?: string, number: string = siteConfig.whatsappNumber): string {
  const base = isWhatsAppConfigured(number) ? `https://wa.me/${number}` : 'https://wa.me/'
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

export interface DeliveryRequestPayload {
  orderRef: string
  name: string
  /** Nomor pelanggan yang sudah dinormalkan, mis. "6281234567890" */
  phone: string
  address: string
  note: string
  order: OrderCalc
}

/** Pesan pengajuan antar: dikirim SEBELUM pelanggan membayar. */
export function generateDeliveryRequestMessage(p: DeliveryRequestPayload): string {
  const { order } = p
  const lines = [
    `Halo ${siteConfig.brand.name}! 🍮`,
    'Saya ingin mengajukan pesanan dengan *pengantaran*. Mohon dicek apakah alamat saya bisa diantar ya.',
    '',
    `*No. Pesanan:* ${p.orderRef}`,
    `*Nama:* ${p.name.trim()}`,
    `*WhatsApp:* +${p.phone}`,
    `*Pesanan:* ${order.product.name} — ${order.quantity} ${productInfo.unitName} × ${formatCurrency(order.unitPrice)}`,
    `*Ongkir:* ${formatFee(order.deliveryFee)}`,
    `*Total:* ${formatCurrency(order.total)}`,
    `*Alamat (area Surabaya):* ${p.address.trim()}`,
  ]
  if (p.note.trim()) lines.push(`*Catatan:* ${p.note.trim()}`)
  lines.push('', 'Saya akan membayar setelah ada konfirmasi dari kamu. Terima kasih! 🙏')
  return lines.join('\n')
}
