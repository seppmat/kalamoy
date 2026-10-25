import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  ImageOff,
  MessageCircle,
  ReceiptText,
} from 'lucide-react'
import { siteConfig } from '../data/siteConfig'
import { formatCurrency } from '../utils/formatCurrency'
import { imageUrl } from '../utils/assetUrl'
import {
  buildWhatsAppUrl,
  generateDeliveryRequestMessage,
  isWhatsAppConfigured,
} from '../utils/generateWhatsAppUrl'
import type { FormValues, OrderCalc } from '../utils/order'
import { buildReceiptData, buildReceiptText, type ReceiptData } from '../utils/receipt'
import { scrollToId } from '../utils/scroll'
import OrderSummary from './OrderSummary'
import Receipt from './Receipt'
import SafeImage from './SafeImage'

interface QrisPaymentProps {
  values: FormValues
  order: OrderCalc
  /** Nomor pelanggan yang sudah dinormalkan, mis. "6281234567890" */
  phone: string
  orderRef: string
  onBack: () => void
  onNewOrder: () => void
}

type Phase = 'request' | 'pay' | 'receipt'

/**
 * ALUR
 *  - Ambil di lobby : pay -> receipt
 *  - Diantar        : request (ajukan via WhatsApp, JANGAN bayar dulu) -> pay -> receipt
 *
 * CATATAN PENTING:
 * Menampilkan QRIS dan membuat nota BUKAN bukti pembayaran. Versi ini tidak punya backend, jadi
 * status "lunas" tidak pernah ditandai otomatis — penjual memeriksa bukti bayar secara manual
 * lewat WhatsApp. Verifikasi otomatis butuh payment gateway + backend yang aman.
 */
export default function QrisPayment({ values, order, phone, orderRef, onBack, onNewOrder }: QrisPaymentProps) {
  const isDelivery = order.fulfillment.requiresConfirmation
  const [phase, setPhase] = useState<Phase>(isDelivery ? 'request' : 'pay')
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)
  const [qrisReady, setQrisReady] = useState(true)
  const qrisSrc = imageUrl(siteConfig.images.qris)

  const address = isDelivery ? values.address.trim() : undefined

  function go(next: Phase) {
    setPhase(next)
    window.setTimeout(() => scrollToId('pesan'), 60)
  }

  function makeReceipt() {
    setReceipt(
      buildReceiptData({
        orderRef,
        name: values.name.trim(),
        phone,
        note: values.note.trim(),
        address,
        order,
        createdAt: new Date(),
      }),
    )
    go('receipt')
  }

  if (phase === 'receipt' && receipt) {
    return (
      <div>
        <Banner title="Nota sudah dibuat!" text="Kirim nota & bukti bayar ke WhatsApp supaya pesananmu kami proses." />
        <Receipt data={receipt} whatsappUrl={buildWhatsAppUrl(buildReceiptText(receipt))} onNewOrder={onNewOrder} />
      </div>
    )
  }

  const requestUrl = buildWhatsAppUrl(
    generateDeliveryRequestMessage({ orderRef, name: values.name, phone, address: address ?? '', note: values.note, order }),
  )

  const steps = [
    'Simpan gambar QRIS dengan tombol di bawah, atau scan langsung dari layar perangkat lain.',
    'Buka aplikasi m-banking atau e-wallet yang mendukung QRIS, lalu pilih Scan / Upload QR.',
    `Masukkan nominal sesuai total: ${formatCurrency(order.total)}.`,
    'Setelah membayar, screenshot bukti bayarnya, lalu tekan "Saya Sudah Bayar" untuk membuat nota.',
  ]

  return (
    <div className="animate-fade-up">
      {phase === 'request' ? (
        <Banner title="Pengantaran perlu dikonfirmasi" text="Jangan bayar dulu. Ajukan lewat WhatsApp, tunggu kami membalas." />
      ) : (
        <Banner title="Detail pesanan sudah siap!" text="Pesanan belum dibayar. Selesaikan pembayaran QRIS di bawah." />
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <OrderSummary
          order={order}
          customer={{ name: values.name.trim(), whatsapp: phone, note: values.note.trim(), orderRef, address }}
        />

        {phase === 'request' ? (
          <div className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-6">
            <h2 className="text-xl font-bold text-caramel">Ajukan Pengantaran</h2>

            <ol className="mt-4 space-y-3 text-sm">
              {[
                'Tekan tombol di bawah. WhatsApp terbuka dengan pesan pengajuan yang sudah terisi.',
                'Tekan Kirim di WhatsApp, lalu tunggu balasan kami. Pengajuan bisa kami tolak jika lokasi terlalu jauh atau belum dikenal.',
                'Setelah kami setuju, kembali ke halaman ini dan lanjut ke pembayaran QRIS.',
              ].map((text, i) => (
                <li key={text} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-honey/80 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-snug text-muted">{text}</span>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex gap-2.5 rounded-2xl bg-[#FBEAE0] p-4 text-xs leading-relaxed">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-caramel" aria-hidden="true" />
              <p>
                <strong>Jangan bayar sebelum ada konfirmasi</strong> dari kami, supaya tidak ada pembayaran untuk
                pengantaran yang ternyata tidak bisa dilayani.
              </p>
            </div>

            {import.meta.env.DEV && !isWhatsAppConfigured() && <DevWhatsAppNote />}

            <div className="mt-5 space-y-3">
              <a href={requestUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Ajukan via WhatsApp
              </a>
              <button type="button" onClick={() => go('pay')} className="btn-ghost w-full">
                Sudah dikonfirmasi — lanjut bayar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={onBack} className="btn-ghost w-full">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Ubah Pesanan
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-6">
            <h2 className="text-xl font-bold text-caramel">Bayar dengan QRIS</h2>

            <div className="mx-auto mt-4 flex aspect-square w-full max-w-[280px] items-center justify-center overflow-hidden rounded-2xl border border-line bg-white p-3">
              <SafeImage
                src={qrisSrc}
                alt={`QRIS pembayaran ${siteConfig.brand.name}`}
                className="h-full w-full object-contain"
                onStatusChange={setQrisReady}
                fallback={
                  <div
                    role="img"
                    aria-label="Placeholder QRIS"
                    className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-toffee/50 bg-sand/50 p-4 text-center"
                  >
                    <ImageOff className="h-8 w-8 text-toffee" aria-hidden="true" />
                    <p className="text-sm font-semibold">PLACEHOLDER QRIS</p>
                    <p className="text-xs text-muted">
                      Gambar QRIS belum dipasang. Letakkan file{' '}
                      <code className="rounded bg-card px-1">{siteConfig.images.qris}</code> di folder{' '}
                      <code className="rounded bg-card px-1">public/images/</code>.
                    </p>
                  </div>
                }
              />
            </div>

            {qrisReady ? (
              <a
                href={qrisSrc}
                download={`qris-${siteConfig.brand.name.toLowerCase()}.png`}
                className="btn-ghost mt-4 w-full"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Simpan QRIS
              </a>
            ) : (
              <button type="button" disabled className="btn-ghost mt-4 w-full opacity-50">
                <Download className="h-4 w-4" aria-hidden="true" />
                Simpan QRIS (belum tersedia)
              </button>
            )}
            <p className="mt-2 text-center text-[11px] text-muted">
              Jika tidak terunduh, tekan lama pada gambar QRIS lalu pilih “Simpan Gambar”.
            </p>

            <ol className="mt-5 space-y-3 text-sm">
              {steps.map((text, i) => (
                <li key={text} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-honey/80 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="leading-snug text-muted">{text}</span>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex gap-2.5 rounded-2xl bg-[#FBEAE0] p-4 text-xs leading-relaxed text-ink">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-caramel" aria-hidden="true" />
              <p>
                <strong>Nominal harus sama persis</strong> dengan total {formatCurrency(order.total)}. Tampilnya
                QRIS dan nota bukan bukti pembayaran - pesanan diproses setelah penjual memeriksa bukti bayarmu
                secara manual.
              </p>
            </div>

            {import.meta.env.DEV && !isWhatsAppConfigured() && <DevWhatsAppNote />}

            <div className="mt-5 space-y-3">
              <button type="button" onClick={makeReceipt} className="btn-primary w-full">
                <ReceiptText className="h-5 w-5" aria-hidden="true" />
                Saya Sudah Bayar
              </button>
              <p className="text-center text-[11px] text-muted">
                Tekan setelah pembayaran QRIS selesai. Nota berstatus “menunggu verifikasi” sampai kami
                mengonfirmasi.
              </p>
              <button type="button" onClick={onBack} className="btn-ghost w-full">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Ubah Pesanan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Banner({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-honey bg-honey/40 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 animate-pop items-center justify-center rounded-full bg-caramel text-card">
        <Check className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="text-sm leading-snug">
        <p className="font-semibold">{title}</p>
        <p className="text-muted">{text}</p>
      </div>
    </div>
  )
}

function DevWhatsAppNote() {
  return (
    <p className="mt-4 rounded-xl border border-dashed border-toffee bg-sand/60 p-3 text-xs text-muted">
      <strong>[Mode pengembangan]</strong> Nomor WhatsApp belum diatur di <code>src/data/siteConfig.ts</code>.
      Tombol WhatsApp akan membuka WhatsApp tanpa kontak tujuan.
    </p>
  )
}
