const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // tanpa karakter yang mirip (0/O, 1/I)

/**
 * Membuat nomor referensi pesanan untuk sesi browser ini, contoh: KLM-261025-K7F2.
 * Ini HANYA penanda di pesan WhatsApp & nota — bukan ID di database (tidak ada database).
 */
export function generateOrderRef(): string {
  const now = new Date()
  const yy = String(now.getFullYear()).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')

  const bytes = new Uint8Array(4)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  const suffix = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')

  return `KLM-${yy}${mm}${dd}-${suffix}`
}
