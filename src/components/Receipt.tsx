import { useEffect, useState } from 'react'
import { Download, Hourglass, MessageCircle, Plus, Send } from 'lucide-react'
import { siteConfig } from '../data/siteConfig'
import { renderReceiptPng, type ReceiptData } from '../utils/receipt'

interface ReceiptProps {
  data: ReceiptData
  /** Link chat WhatsApp penjual TANPA teks bawaan (yang dikirim cukup gambar nota). */
  chatUrl: string
  onNewOrder: () => void
}

export default function Receipt({ data, chatUrl, onNewOrder }: ReceiptProps) {
  const [file, setFile] = useState<File | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [canShareFile, setCanShareFile] = useState(false)

  const fileName = `nota-${siteConfig.brand.name.toLowerCase()}-${data.orderRef}.png`

  useEffect(() => {
    let cancelled = false
    let url: string | null = null

    renderReceiptPng(data)
      .then((blob) => {
        if (cancelled) return
        const f = new File([blob], fileName, { type: 'image/png' })
        url = URL.createObjectURL(blob)
        setFile(f)
        setImgUrl(url)
        try {
          setCanShareFile(Boolean(navigator.canShare?.({ files: [f] })))
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

  function triggerDownload() {
    if (!imgUrl) return
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  /**
   * Mengirim GAMBAR nota saja.
   *  - HP (Web Share API): membuka menu bagikan dengan gambar terlampir; pelanggan memilih WhatsApp
   *    lalu chat Kalamoy.
   *  - Desktop / browser tanpa dukungan: gambar diunduh dan chat WhatsApp Kalamoy dibuka;
   *    pelanggan melampirkan gambar yang baru diunduh.
   * Catatan: link wa.me tidak bisa melampirkan gambar secara otomatis, jadi pelanggan tetap menekan Kirim.
   */
  async function sendReceipt() {
    if (!file) return
    if (canShareFile) {
      try {
        await navigator.share({ files: [file], title: `Nota ${siteConfig.brand.name}` })
        return
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return // dibatalkan pengguna
        // gagal karena hal lain → pakai jalur unduh + buka chat
      }
    }
    triggerDownload()
    window.open(chatUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-up space-y-5">
      <div className="rounded-3xl border border-line bg-card p-4 shadow-soft sm:p-5">
        {imgUrl ? (
          <img src={imgUrl} alt={`Nota pesanan ${data.orderRef}`} className="w-full rounded-2xl" />
        ) : failed ? (
          <div className="rounded-2xl bg-sand/60 p-6 text-center text-sm text-muted">
            Nota gagal dibuat di browser ini. Catat nomor pesananmu{' '}
            <strong className="text-ink">{data.orderRef}</strong> dan kirim bersama bukti bayar ke WhatsApp.
          </div>
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-sand/60 text-sm text-muted">
            Menyiapkan nota…
          </div>
        )}
      </div>

      <div className="flex gap-2.5 rounded-2xl bg-[#FBEAE0] p-4 text-xs leading-relaxed">
        <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-caramel" aria-hidden="true" />
        <p>
          Nota ini berstatus <strong>menunggu verifikasi</strong>. Kirim <strong>gambar nota</strong> beserta{' '}
          <strong>screenshot bukti bayar</strong> ke WhatsApp; pesanan diproses setelah kami memastikan
          pembayaran masuk.
        </p>
      </div>

      <div className="space-y-3">
        <button type="button" onClick={sendReceipt} disabled={!file} className="btn-primary w-full">
          <Send className="h-5 w-5" aria-hidden="true" />
          Kirim Nota ke WhatsApp
        </button>
        <p className="text-center text-[11px] text-muted">
          {canShareFile
            ? `Pilih WhatsApp lalu chat ${siteConfig.brand.name}, kirim gambar nota, dan sertakan bukti bayar.`
            : 'Gambar nota akan terunduh dan WhatsApp terbuka. Lampirkan gambar nota & bukti bayar, lalu tekan Kirim.'}
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
          <a href={chatUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Buka Chat
          </a>
        </div>

        <button type="button" onClick={onNewOrder} className="btn-ghost w-full">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Buat Pesanan Baru
        </button>
      </div>
    </div>
  )
}
