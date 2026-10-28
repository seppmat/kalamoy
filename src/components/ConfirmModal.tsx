import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Send, X } from 'lucide-react'
import { siteConfig } from '../data/siteConfig'

interface ConfirmModalProps {
  orderRef: string
  /** Dipanggil saat user tekan "Lanjut ke WhatsApp". */
  onConfirm: () => void
  /** Dipanggil saat user tutup modal. */
  onClose: () => void
}

/**
 * Modal pengingat yang muncul SEBELUM nota dikirim ke WhatsApp.
 * Mengingatkan pelanggan untuk menyertakan bukti transfer bersama nota.
 */
export default function ConfirmModal({ orderRef, onConfirm, onClose }: ConfirmModalProps) {
  const [closing, setClosing] = useState(false)

  function handleClose() {
    setClosing(true)
    setTimeout(onClose, 200)
  }

  function handleConfirm() {
    setClosing(true)
    setTimeout(onConfirm, 200)
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${closing ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-sm rounded-3xl border border-line bg-card p-5 shadow-xl transition-transform duration-200 sm:p-6 ${closing ? 'scale-95' : 'scale-100'}`}
      >
        {/* Tombol tutup */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-muted transition-colors hover:bg-sand hover:text-ink"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-honey/80">
            <AlertTriangle className="h-5 w-5 text-caramel" aria-hidden="true" />
          </span>
          <h3 className="text-lg font-bold leading-tight">Satu Langkah Lagi!</h3>
        </div>

        {/* Isi */}
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <p>
            Nota pesanan <strong className="text-ink">{orderRef}</strong> akan dikirim ke WhatsApp{' '}
            <strong className="text-ink">{siteConfig.brand.name}</strong>.
          </p>
          <div className="rounded-2xl bg-[#FBEAE0] p-3 text-xs leading-relaxed">
            <p>
              <strong className="text-ink">Penting:</strong> Pastikan kamu juga mengirimkan{' '}
              <strong className="text-ink">screenshot bukti transfer / pembayaran</strong> bersama gambar nota di
              chat WhatsApp ya! Pesanan baru diproses setelah bukti bayar diterima.
            </p>
          </div>
        </div>

        {/* Tombol */}
        <div className="mt-5 space-y-2.5">
          <button type="button" onClick={handleConfirm} className="btn-primary w-full">
            <Send className="h-5 w-5" aria-hidden="true" />
            Mengerti, Kirim ke WhatsApp
          </button>
          <button type="button" onClick={handleClose} className="btn-ghost w-full text-xs">
            Batal
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
