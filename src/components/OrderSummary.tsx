import { Receipt } from 'lucide-react'
import { productInfo } from '../data/products'
import { formatCurrency, formatFee } from '../utils/formatCurrency'
import type { OrderCalc } from '../utils/order'

interface OrderSummaryProps {
  order: OrderCalc
  /** Diisi saat ringkasan final (setelah form dikirim); kosong untuk ringkasan live. */
  customer?: { name: string; whatsapp: string; note: string; orderRef: string; address?: string }
}

export default function OrderSummary({ order, customer }: OrderSummaryProps) {
  const { product, quantity, unitPrice, subtotal, deliveryFee, fulfillment, total } = order

  return (
    <div className="rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-caramel">
          <Receipt className="h-5 w-5 shrink-0" aria-hidden="true" />
          Ringkasan Pesanan
        </h2>
        <span className="shrink-0 whitespace-nowrap rounded-full bg-honey/70 px-2.5 py-1 text-[11px] font-semibold text-ink">
          {customer ? customer.orderRef : 'Kalkulasi Otomatis'}
        </span>
      </div>

      {customer && (
        <dl className="mt-4 space-y-1.5 rounded-2xl bg-sand/60 p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">Nama</dt>
            <dd className="text-right font-semibold">{customer.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">WhatsApp</dt>
            <dd className="text-right font-semibold">+{customer.whatsapp}</dd>
          </div>
          {customer.address && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted">Alamat</dt>
              <dd className="break-words text-right">{customer.address}</dd>
            </div>
          )}
          {customer.note && (
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted">Catatan</dt>
              <dd className="break-words text-right">{customer.note}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold">{product.name}</p>
            <p className="text-xs text-muted">
              {quantity} {productInfo.unitName} × {formatCurrency(unitPrice)}
            </p>
          </div>
          <p className="font-semibold">{formatCurrency(subtotal)}</p>
        </div>

        <div className="flex justify-between gap-4 text-muted">
          <span>{fulfillment.label}</span>
          <span>{formatFee(deliveryFee)}</span>
        </div>

        <div className="flex justify-between gap-4 text-muted">
          <span>Sendok</span>
          <span>Gratis</span>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Pembayaran</p>
          <p className="mt-0.5 text-xs text-muted">{productInfo.includedNote}</p>
        </div>
        <p
          key={total}
          className="animate-pop whitespace-nowrap font-serif text-2xl font-bold text-caramel sm:text-3xl"
        >
          {formatCurrency(total)}
        </p>
      </div>
    </div>
  )
}
