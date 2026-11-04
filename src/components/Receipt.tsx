import { useEffect, useState } from 'react'
import { CheckCircle2, Download, MessageCircle, Plus } from 'lucide-react'
import { siteConfig } from '../data/siteConfig'
import { renderReceiptPng, type ReceiptData } from '../utils/receipt'

interface ReceiptProps {
  data: ReceiptData
  /** Link chat WhatsApp penjual dengan teks konfirmasi pembayaran. */
  chatUrl: string
  onNewOrder: () => void
}

export default function Receipt({ data, chatUrl, onNewOrder }: ReceiptProps) {
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const fileName = `nota-${siteConfig.brand.name.toLowerCase()}-${data.orderRef}.png`

  useEffect(() => {
    let cancelled = false
    let url: string | null = null

    renderReceiptPng(data)
      .then((blob) => {
        if (cancelled) return
        url = URL.createObjectURL(blob)
        setImgUrl(url)
      })
      .catch(() => !cancelled && setFailed(true))

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [data, fileName])

  return (
    <div className="mx-auto max-w-xl animate-fade-up space-y-5">
      {/* Kartu Status Berhasil */}
      <div className="rounded-3xl border border-honey bg-[#FBF4E8] p-5 text-center shadow-soft sm:p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-honey text-caramel">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <h3 className="mt-3 text-lg font-bold text-caramel sm:text-xl">
          WhatsApp Berhasil Dibuka! 🍮
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted sm:text-sm">
          Nota pesanan otomatis terunduh ke HP/laptopmu. Cukup{' '}
          <strong className="text-ink">lampirkan screenshot bukti transfer</strong> bersama{' '}
          <strong className="text-ink">gambar nota</strong> di chat WhatsApp agar pesananmu segera disiapkan!
        </p>

        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <a
            href={chatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-xs sm:w-auto sm:text-sm"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Buka Chat WhatsApp Lagi
          </a>

          {imgUrl && (
            <a
              href={imgUrl}
              download={fileName}
              className="btn-ghost w-full text-xs sm:w-auto sm:text-sm"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download Ulang Nota
            </a>
          )}
        </div>
      </div>

      {/* Preview Gambar Nota */}
      <div className="rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-5">
        <p className="mb-3 text-center text-xs font-semibold text-muted">
          Preview Nota Pesanan (#{data.orderRef})
        </p>
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={`Nota pesanan ${data.orderRef}`}
            className="w-full rounded-2xl shadow-sm"
          />
        ) : failed ? (
          <div className="rounded-2xl bg-sand/60 p-6 text-center text-sm text-muted">
            Nota gagal dimuat di browser ini. No. pesananmu:{' '}
            <strong className="text-ink">{data.orderRef}</strong>
          </div>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-sand/60 text-sm text-muted">
            Menyiapkan nota…
          </div>
        )}
      </div>

      {/* Tombol Buat Pesanan Baru */}
      <button type="button" onClick={onNewOrder} className="btn-ghost w-full">
        <Plus className="h-4 w-4" aria-hidden="true" />
        Buat Pesanan Baru
      </button>
    </div>
  )
}
