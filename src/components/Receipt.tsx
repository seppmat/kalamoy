import { useEffect, useState } from 'react'
import { Check, ClipboardCopy, Download, Hourglass, MessageCircle, Plus, Share2 } from 'lucide-react'
import { buildReceiptText, renderReceiptPng, type ReceiptData } from '../utils/receipt'
import { siteConfig } from '../data/siteConfig'

interface ReceiptProps {
  data: ReceiptData
  whatsappUrl: string
  onNewOrder: () => void
}

export default function Receipt({ data, whatsappUrl, onNewOrder }: ReceiptProps) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [canShareFile, setCanShareFile] = useState(false)
  const [copied, setCopied] = useState(false)

  const text = buildReceiptText(data)
  const fileName = `nota-${siteConfig.brand.name.toLowerCase()}-${data.orderRef}.png`

  useEffect(() => {
    let cancelled = false
    let url: string | null = null

    renderReceiptPng(data)
      .then((b) => {
        if (cancelled) return
        url = URL.createObjectURL(b)
        setBlob(b)
        setImgUrl(url)
        try {
          const file = new File([b], fileName, { type: 'image/png' })
          setCanShareFile(Boolean(navigator.canShare?.({ files: [file] })))
        } catch {
          setCanShareFile(false)
        }
      })
      .catch(() => !cancelled && setFailed(true))

    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [data, fileName])

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard bisa diblokir; pelanggan masih bisa pakai tombol WhatsApp */
    }
  }

  async function shareImage() {
    if (!blob) return
    try {
      const file = new File([blob], fileName, { type: 'image/png' })
      await navigator.share({ files: [file], title: `Nota ${siteConfig.brand.name}`, text })
    } catch {
      /* dibatalkan pengguna — tidak perlu apa-apa */
    }
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-up space-y-5">
      <div className="rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-5">
        {imgUrl ? (
          <img src={imgUrl} alt={`Nota pesanan ${data.orderRef}`} className="w-full rounded-2xl" />
        ) : failed ? (
          <pre className="whitespace-pre-wrap break-words rounded-2xl bg-sand/60 p-4 text-xs leading-relaxed">
            {text}
          </pre>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-sand/60 text-sm text-muted">
            Menyiapkan nota…
          </div>
        )}
      </div>

      <div className="flex gap-2.5 rounded-2xl bg-[#FBEAE0] p-4 text-xs leading-relaxed">
        <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-caramel" aria-hidden="true" />
        <p>
          Nota ini berstatus <strong>menunggu verifikasi</strong>. Kirim ke WhatsApp beserta{' '}
          <strong>screenshot bukti bayar</strong>; pesanan diproses setelah kami memastikan pembayaran masuk.
        </p>
      </div>

      <div className="space-y-3">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Kirim Nota via WhatsApp
        </a>
        <p className="text-center text-[11px] text-muted">
          WhatsApp terbuka dengan teks nota siap kirim. Lampirkan bukti bayar, lalu tekan Kirim.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {imgUrl ? (
            <a href={imgUrl} download={fileName} className="btn-ghost">
              <Download className="h-4 w-4" aria-hidden="true" />
              Simpan Nota
            </a>
          ) : (
            <button type="button" disabled className="btn-ghost opacity-50">
              <Download className="h-4 w-4" aria-hidden="true" />
              Simpan Nota
            </button>
          )}
          <button type="button" onClick={copyText} className="btn-ghost">
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ClipboardCopy className="h-4 w-4" aria-hidden="true" />
            )}
            {copied ? 'Tersalin!' : 'Salin Teks'}
          </button>
        </div>

        {canShareFile && (
          <button type="button" onClick={shareImage} className="btn-ghost w-full">
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Bagikan Gambar Nota
          </button>
        )}

        <button type="button" onClick={onNewOrder} className="btn-ghost w-full">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Buat Pesanan Baru
        </button>
      </div>
    </div>
  )
}
