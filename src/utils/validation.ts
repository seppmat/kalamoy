import { deliveryRules } from '../data/products'
import type { FormValues } from './order'

export interface FormErrors {
  name?: string
  phone?: string
  area?: string
  address?: string
}

/**
 * Menormalkan nomor HP Indonesia ke format internasional untuk WhatsApp (tanpa "+").
 * Menerima: 0812-3456-7890, 812 3456 7890, +62 812 3456 7890, 6281234567890
 * Mengembalikan: "6281234567890", atau null jika tidak valid.
 *
 * Aturan: nomor seluler Indonesia diawali 8 setelah kode negara, panjang 9–12 digit.
 */
export function normalizeIndonesianPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')
  if (!digits) return null

  if (digits.startsWith('62')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = digits.slice(1)

  if (!/^8[1-9]\d{7,10}$/.test(digits)) return null
  return `62${digits}`
}

export function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  const name = values.name.trim()
  if (!name) errors.name = 'Nama lengkap wajib diisi ya.'
  else if (name.length < 2) errors.name = 'Nama terlalu pendek, minimal 2 huruf.'
  else if (name.length > 60) errors.name = 'Nama terlalu panjang, maksimal 60 karakter.'

  if (!values.phone.trim()) {
    errors.phone = 'Nomor WhatsApp wajib diisi supaya kami bisa menghubungimu.'
  } else if (!normalizeIndonesianPhone(values.phone)) {
    errors.phone = 'Format nomor belum sesuai. Contoh: 812-3456-7890 atau 0812-3456-7890.'
  }

  // Aturan khusus pengantaran: hanya area Surabaya, dan alamat wajib diisi.
  if (values.fulfillmentId === 'delivery') {
    if (values.area === '') errors.area = 'Pilih dulu lokasimu ya.'
    else if (values.area === 'outside') errors.area = deliveryRules.outsideMessage

    const address = values.address.trim()
    if (!address) errors.address = 'Alamat pengantaran wajib diisi.'
    else if (address.length < 10) errors.address = 'Alamat terlalu singkat. Tulis jalan, nomor, dan patokan.'
  }

  return errors
}
