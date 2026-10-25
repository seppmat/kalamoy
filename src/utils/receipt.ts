import { productInfo } from '../data/products'
import { siteConfig } from '../data/siteConfig'
import { formatCurrency, formatFee } from './formatCurrency'
import type { OrderCalc } from './order'

/**
 * NOTA PESANAN
 * ------------
 * Dibuat di browser pelanggan setelah ia menekan "Saya Sudah Bayar".
 * Karena tidak ada backend, nota ini BUKAN bukti pembayaran: statusnya selalu
 * "Menunggu verifikasi". Penjual yang memastikan pembayaran masuk, lalu mengonfirmasi lewat WhatsApp.
 * (Nota yang bisa membuat tulisan "LUNAS" sendiri akan sangat mudah dipalsukan.)
 */
export interface ReceiptData {
  orderRef: string
  createdAt: Date
  name: string
  /** Nomor dinormalkan tanpa +, mis. "6281234567890" */
  phone: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
  fulfillmentLabel: string
  deliveryFee: number
  address?: string
  note?: string
  total: number
}

export function buildReceiptData(args: {
  orderRef: string
  name: string
  phone: string
  note: string
  address?: string
  order: OrderCalc
  createdAt: Date
}): ReceiptData {
  const { order } = args
  return {
    orderRef: args.orderRef,
    createdAt: args.createdAt,
    name: args.name,
    phone: args.phone,
    productName: order.product.name,
    quantity: order.quantity,
    unitPrice: order.unitPrice,
    subtotal: order.subtotal,
    fulfillmentLabel: order.fulfillment.label,
    deliveryFee: order.deliveryFee,
    address: args.address || undefined,
    note: args.note || undefined,
    total: order.total,
  }
}

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Asia/Jakarta',
})

export function formatReceiptDate(date: Date): string {
  return `${dateFormatter.format(date)} WIB`
}

/** "Diantar" atau "Diantar (+Rp 5.000)" bila ada ongkir. */
function fulfillmentText(d: ReceiptData): string {
  return d.deliveryFee > 0 ? `${d.fulfillmentLabel} (+${formatFee(d.deliveryFee)})` : d.fulfillmentLabel
}

export const RECEIPT_STATUS = 'MENUNGGU VERIFIKASI PEMBAYARAN'
export const RECEIPT_FOOTER = `Nota dibuat otomatis dari website ${siteConfig.brand.name}. Pesanan dianggap lunas setelah pembayaran dikonfirmasi oleh ${siteConfig.brand.name} lewat WhatsApp.`

/** Versi teks nota — jadi isi pesan WhatsApp. */
export function buildReceiptText(d: ReceiptData): string {
  const line = '━━━━━━━━━━━━━━'
  const lines = [
    `🧾 *NOTA PESANAN ${siteConfig.brand.name.toUpperCase()}*`,
    siteConfig.brand.tagline,
    line,
    `No. Pesanan: ${d.orderRef}`,
    `Tanggal: ${formatReceiptDate(d.createdAt)}`,
    `Nama: ${d.name}`,
    `WhatsApp: +${d.phone}`,
    line,
    `*${d.productName}*`,
    `${d.quantity} ${productInfo.unitName} × ${formatCurrency(d.unitPrice)} = ${formatCurrency(d.subtotal)}`,
    'Sendok: Gratis',
    `Pengambilan: ${fulfillmentText(d)}`,
  ]
  if (d.address) lines.push(`Alamat: ${d.address}`)
  if (d.note) lines.push(`Catatan: ${d.note}`)
  lines.push(
    line,
    `*TOTAL: ${formatCurrency(d.total)}*`,
    'Metode: QRIS',
    `Status: ${RECEIPT_STATUS.charAt(0) + RECEIPT_STATUS.slice(1).toLowerCase()} ⏳`,
    line,
    `Halo ${siteConfig.brand.name}! Saya sudah membayar via QRIS sesuai total di atas. Bukti bayar saya lampirkan di chat ini ya. Terima kasih 🙏`,
  )
  return lines.join('\n')
}

/* ------------------------------------------------------------------ */
/*  Gambar nota (PNG) digambar dengan <canvas> — tanpa library tambahan */
/* ------------------------------------------------------------------ */

const W = 720 // lebar logis; kanvas digandakan 2× supaya tajam di layar HP
const SCALE = 2
const CARD_X = 24
const CONTENT_X = 64
const CONTENT_R = W - 64
const SERIF = '"Playfair Display", Georgia, serif'
const SANS = '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif'

const C = {
  bg: '#F7F1E7',
  card: '#FFFDF8',
  line: '#E8D9C7',
  ink: '#493126',
  muted: '#806B5A',
  caramel: '#A9572B',
  honey: '#F2D99A',
}

type Ctx = CanvasRenderingContext2D

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Membungkus teks per kata; kata yang terlalu panjang dipotong per karakter. */
function wrap(ctx: Ctx, text: string, maxWidth: number): string[] {
  const out: string[] = []
  for (const para of text.split('\n')) {
    let current = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      let w = word
      while (ctx.measureText(w).width > maxWidth && w.length > 1) {
        let cut = w.length - 1
        while (cut > 1 && ctx.measureText(w.slice(0, cut)).width > maxWidth) cut--
        if (current) {
          out.push(current)
          current = ''
        }
        out.push(w.slice(0, cut))
        w = w.slice(cut)
      }
      const test = current ? `${current} ${w}` : w
      if (ctx.measureText(test).width > maxWidth && current) {
        out.push(current)
        current = w
      } else {
        current = test
      }
    }
    out.push(current)
  }
  return out
}

/**
 * Menggambar nota. Mengembalikan posisi y akhir konten.
 * Dipanggil dua kali: sekali di kanvas kosong (H = 0) untuk mengukur tinggi, lalu sekali untuk menggambar.
 */
function paint(ctx: Ctx, d: ReceiptData, H: number): number {
  ctx.textBaseline = 'alphabetic'

  if (H > 0) {
    ctx.fillStyle = C.bg
    ctx.fillRect(0, 0, W, H)
    roundRect(ctx, CARD_X, CARD_X, W - CARD_X * 2, H - CARD_X * 2, 28)
    ctx.fillStyle = C.card
    ctx.fill()
    ctx.strokeStyle = C.line
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  const dashed = (y: number) => {
    ctx.save()
    ctx.strokeStyle = C.line
    ctx.lineWidth = 1.5
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(CONTENT_X, y)
    ctx.lineTo(CONTENT_R, y)
    ctx.stroke()
    ctx.restore()
  }

  // ---- Header ----
  let y = 100
  ctx.textAlign = 'center'
  ctx.fillStyle = C.caramel
  ctx.font = `700 46px ${SERIF}`
  ctx.fillText(siteConfig.brand.wordmark, W / 2, y)

  y += 28
  ctx.fillStyle = C.muted
  ctx.font = `600 13px ${SANS}`
  ctx.fillText(siteConfig.brand.tagline.toUpperCase().split('').join(' '), W / 2, y)

  y += 46
  ctx.fillStyle = C.ink
  ctx.font = `700 20px ${SANS}`
  ctx.fillText('NOTA PESANAN', W / 2, y)

  y += 26
  dashed(y)
  y += 36

  // ---- Baris label : nilai ----
  const labelW = 130
  const row = (label: string, value: string, opts?: { bold?: boolean; color?: string }) => {
    ctx.textAlign = 'left'
    ctx.fillStyle = C.muted
    ctx.font = `400 16px ${SANS}`
    ctx.fillText(label, CONTENT_X, y)

    ctx.font = `${opts?.bold ? 700 : 600} 16px ${SANS}`
    ctx.fillStyle = opts?.color ?? C.ink
    ctx.textAlign = 'right'
    const lines = wrap(ctx, value, CONTENT_R - CONTENT_X - labelW)
    lines.forEach((l, i) => ctx.fillText(l, CONTENT_R, y + i * 23))
    y += lines.length * 23 + 9
  }

  row('No. Pesanan', d.orderRef)
  row('Tanggal', formatReceiptDate(d.createdAt))
  row('Nama', d.name)
  row('WhatsApp', `+${d.phone}`)

  y += 4
  dashed(y)
  y += 36

  // ---- Item ----
  ctx.textAlign = 'left'
  ctx.fillStyle = C.ink
  ctx.font = `700 18px ${SANS}`
  const nameLines = wrap(ctx, d.productName, 380)
  nameLines.forEach((l, i) => ctx.fillText(l, CONTENT_X, y + i * 24))
  ctx.textAlign = 'right'
  ctx.fillText(formatCurrency(d.subtotal), CONTENT_R, y)
  y += nameLines.length * 24 - 2

  ctx.textAlign = 'left'
  ctx.fillStyle = C.muted
  ctx.font = `400 15px ${SANS}`
  ctx.fillText(`${d.quantity} ${productInfo.unitName} × ${formatCurrency(d.unitPrice)}`, CONTENT_X, y)
  y += 34

  row('Sendok', 'Gratis')
  row('Pengambilan', fulfillmentText(d))
  if (d.address) row('Alamat', d.address)
  if (d.note) row('Catatan', d.note)

  y += 4
  dashed(y)
  y += 52

  // ---- Total ----
  ctx.textAlign = 'left'
  ctx.fillStyle = C.muted
  ctx.font = `700 15px ${SANS}`
  ctx.fillText('TOTAL PEMBAYARAN', CONTENT_X, y)
  ctx.textAlign = 'right'
  ctx.fillStyle = C.caramel
  ctx.font = `700 38px ${SERIF}`
  ctx.fillText(formatCurrency(d.total), CONTENT_R, y + 4)

  y += 34
  ctx.textAlign = 'left'
  ctx.fillStyle = C.muted
  ctx.font = `400 14px ${SANS}`
  ctx.fillText('Metode pembayaran: QRIS', CONTENT_X, y)

  // ---- Status ----
  y += 40
  ctx.font = `700 13px ${SANS}`
  const pillW = ctx.measureText(RECEIPT_STATUS).width + 40
  const pillX = (W - pillW) / 2
  roundRect(ctx, pillX, y - 22, pillW, 36, 18)
  ctx.fillStyle = C.honey
  ctx.fill()
  ctx.fillStyle = C.ink
  ctx.textAlign = 'center'
  ctx.fillText(RECEIPT_STATUS, W / 2, y + 1)

  // ---- Catatan kaki ----
  y += 44
  ctx.fillStyle = C.muted
  ctx.font = `400 13px ${SANS}`
  ctx.textAlign = 'center'
  const footer = wrap(ctx, RECEIPT_FOOTER, CONTENT_R - CONTENT_X - 20)
  footer.forEach((l, i) => ctx.fillText(l, W / 2, y + i * 19))
  y += footer.length * 19

  return y
}

/** Membuat gambar nota (PNG). Menunggu font web siap supaya tampilannya sama seperti di website. */
export async function renderReceiptPng(d: ReceiptData): Promise<Blob> {
  try {
    await Promise.all([
      document.fonts.load(`700 40px ${SERIF}`),
      document.fonts.load(`400 16px ${SANS}`),
      document.fonts.load(`600 16px ${SANS}`),
      document.fonts.load(`700 16px ${SANS}`),
    ])
  } catch {
    /* font gagal dimuat → pakai font cadangan, nota tetap jadi */
  }

  const probe = document.createElement('canvas').getContext('2d')
  if (!probe) throw new Error('Canvas tidak didukung di browser ini.')
  const end = paint(probe, d, 0)
  const H = Math.ceil(end + 72)

  const canvas = document.createElement('canvas')
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas tidak didukung di browser ini.')
  ctx.scale(SCALE, SCALE)
  paint(ctx, d, H)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Gagal membuat gambar nota.'))), 'image/png')
  })
}
