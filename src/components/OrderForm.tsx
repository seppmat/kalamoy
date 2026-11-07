import { useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Bike,
  Info,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  User,
} from 'lucide-react'
import { deliveryRules, fulfillmentOptions, products, productInfo } from '../data/products'
import { formatCurrency } from '../utils/formatCurrency'
import type { FormValues, OrderCalc } from '../utils/order'
import { validateForm, type FormErrors } from '../utils/validation'

interface OrderFormProps {
  values: FormValues
  order: OrderCalc
  onChange: (patch: Partial<FormValues>) => void
  onSubmit: () => void
}

export default function OrderForm({ values, order, onChange, onSubmit }: OrderFormProps) {
  const [errors, setErrors] = useState<FormErrors>({})
  const [attempted, setAttempted] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const addressRef = useRef<HTMLTextAreaElement>(null)

  const isDelivery = values.fulfillmentId === 'delivery'
  const needsConfirmation = order.fulfillment.requiresConfirmation

  /** Update nilai; setelah pelanggan pernah menekan tombol, error ikut diperbarui langsung. */
  function update(patch: Partial<FormValues>) {
    onChange(patch)
    if (attempted) setErrors(validateForm({ ...values, ...patch }))
  }

  function handleItemQuantityChange(productId: string, newQty: number) {
    const nextItems = { ...(values.items || {}) }
    const validQty = Math.max(0, Math.floor(newQty))

    // Hitung total dari produk lain
    const otherQtyTotal = Object.entries(nextItems)
      .filter(([id]) => id !== productId)
      .reduce((sum, [, q]) => sum + q, 0)

    if (otherQtyTotal + validQty > productInfo.maxQuantity) {
      nextItems[productId] = Math.max(0, productInfo.maxQuantity - otherQtyTotal)
    } else {
      nextItems[productId] = validQty
    }

    update({ items: nextItems })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const found = validateForm(values)
    setAttempted(true)
    setErrors(found)

    if (found.name) return void nameRef.current?.focus()
    if (found.phone) return void phoneRef.current?.focus()
    if (found.area) return void document.getElementById('area-surabaya')?.focus()
    if (found.address) return void addressRef.current?.focus()
    onSubmit()
  }

  const activeFulfillment = fulfillmentOptions.find((f) => f.id === values.fulfillmentId)

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-3xl border border-line bg-card p-5 shadow-soft sm:p-8"
    >
      {/* Nama */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-semibold">
          Nama Lengkap <span className="text-caramel">*</span>
        </label>
        <div className="relative">
          <User
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
          <input
            ref={nameRef}
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            maxLength={60}
            placeholder="Nama Anda (cth: Mohamad Roza)"
            value={values.name}
            onChange={(e) => update({ name: e.target.value })}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={`field pl-10 ${errors.name ? 'field-error' : ''}`}
          />
        </div>
        {errors.name && (
          <p id="name-error" role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      {/* WhatsApp */}
      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-semibold">
          Nomor WhatsApp <span className="text-caramel">*</span>
        </label>
        <div
          className={`flex items-center overflow-hidden rounded-xl border bg-card transition focus-within:border-caramel focus-within:ring-2 focus-within:ring-caramel/20 ${
            errors.phone ? 'border-red-400' : 'border-line'
          }`}
        >
          <span className="select-none border-r border-line bg-sand/60 px-3.5 py-3 text-sm font-semibold">
            +62
          </span>
          <input
            ref={phoneRef}
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            maxLength={16}
            placeholder="812-3456-7890"
            value={values.phone}
            onChange={(e) => update({ phone: e.target.value })}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : 'phone-hint'}
            className="w-full bg-transparent px-3.5 py-3 text-ink placeholder:text-muted/60 focus:outline-none"
          />
        </div>
        {errors.phone ? (
          <p id="phone-error" role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.phone}
          </p>
        ) : (
          <p id="phone-hint" className="mt-1.5 text-xs text-muted">
            Rincian pesanan & konfirmasi akan dikirim ke WhatsApp ini.
          </p>
        )}
      </div>

      {/* Pilihan Varian & Keranjang Pesanan */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p id="variant-label" className="text-sm font-semibold">
            Pilihan Varian &amp; Jumlah <span className="text-caramel">*</span>
          </p>
          <span className="text-xs text-muted">Bisa pesan lebih dari 1 rasa</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {products.map((p) => {
            const itemQty =
              values.items?.[p.id] ?? (values.productId === p.id ? values.quantity || 0 : 0)
            const isSelected = itemQty > 0

            return (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-caramel bg-[#FBF1E6] shadow-soft ring-2 ring-caramel/40'
                    : 'border-line bg-card hover:border-toffee/60'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-honey/60 px-2.5 py-0.5 text-[10px] font-semibold text-ink">
                      {p.tagline}
                    </span>
                    <span className="whitespace-nowrap text-xs font-semibold text-caramel">
                      {formatCurrency(p.price)}
                      <span className="text-[11px] font-normal text-muted"> /{productInfo.unitName}</span>
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-bold text-ink">{p.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{p.description}</p>
                </div>

                <div className="mt-3 border-t border-line/60 pt-3">
                  <p className="text-[11px] leading-snug text-caramel/90">
                    💡 <span className="font-medium">{p.suitability}</span>
                  </p>

                  {/* Tombol Tambah / Stepper */}
                  <div className="mt-3">
                    {itemQty === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleItemQuantityChange(p.id, 1)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-caramel/50 bg-card py-2 text-xs font-semibold text-caramel transition hover:bg-caramel hover:text-card active:scale-95"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Tambah ke Pesanan
                      </button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-caramel">
                          {formatCurrency(p.price * itemQty)}
                        </span>
                        <div className="inline-flex items-center rounded-xl border border-line bg-card p-1">
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(p.id, itemQty - 1)}
                            aria-label={`Kurangi ${p.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBEAE0] text-caramel transition active:scale-90 hover:bg-[#F6DDCE]"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold tabular-nums text-ink">
                            {itemQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleItemQuantityChange(p.id, itemQty + 1)}
                            disabled={order.totalQuantity >= productInfo.maxQuantity}
                            aria-label={`Tambah ${p.name}`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FBEAE0] text-caramel transition active:scale-90 hover:bg-[#F6DDCE] disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Ringkasan Keranjang Pesanan */}
        <div className="mt-3.5 rounded-2xl border border-honey/80 bg-[#FBF4E8] p-4 text-xs">
          <div className="flex items-center justify-between font-semibold text-caramel">
            <span className="flex items-center gap-1.5 text-sm font-bold">
              <ShoppingBag className="h-4 w-4" />
              Keranjang Pesanan ({order.totalQuantity} {productInfo.unitName})
            </span>
            {order.totalQuantity > 0 && (
              <span className="text-sm font-bold text-ink">
                Subtotal: {formatCurrency(order.subtotal)}
              </span>
            )}
          </div>

          {order.totalQuantity === 0 ? (
            <p className="mt-2 text-muted">
              Keranjangmu masih kosong. Silakan tekan tombol <strong>+ Tambah ke Pesanan</strong> pada varian di atas.
            </p>
          ) : (
            <div className="mt-2.5 space-y-1.5">
              {order.items.map((it) => (
                <div key={it.product.id} className="flex items-center justify-between text-ink">
                  <span>
                    🍮 {it.product.name} × {it.quantity} {productInfo.unitName}
                  </span>
                  <span className="font-semibold">{formatCurrency(it.subtotal)}</span>
                </div>
              ))}
              <p className="border-t border-honey/60 pt-2 text-[11px] text-muted">
                {productInfo.quantityHint} (Maks. {productInfo.maxQuantity} {productInfo.unitName} per pemesanan)
              </p>
            </div>
          )}
        </div>

        {errors.items && (
          <p id="items-error" role="alert" className="mt-2 text-sm font-semibold text-red-600">
            {errors.items}
          </p>
        )}
      </div>

      {/* Pengambilan */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Metode Pengambilan</legend>
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-line bg-[#FBEAE0]/70 p-1.5">
          {fulfillmentOptions.map((option) => {
            const selected = option.id === values.fulfillmentId
            const Icon = option.id === 'pickup' ? Store : Bike
            return (
              <label
                key={option.id}
                className={`flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-xl px-2 text-center text-sm font-medium transition-all duration-200 focus-within:ring-2 focus-within:ring-caramel/40 active:scale-[0.98] ${
                  selected ? 'bg-card text-ink shadow-soft' : 'text-muted hover:text-ink'
                }`}
              >
                <input
                  type="radio"
                  name="fulfillment"
                  value={option.id}
                  checked={selected}
                  onChange={() => update({ fulfillmentId: option.id })}
                  className="sr-only"
                />
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {option.shortLabel}
                  {option.fee > 0 ? ` (+${formatCurrency(option.fee)})` : ''}
                </span>
              </label>
            )
          })}
        </div>
        {activeFulfillment && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-caramel" aria-hidden="true" />
            {activeFulfillment.hint}
          </p>
        )}
      </fieldset>

      {/* Khusus diantar */}
      {isDelivery && (
        <div className="animate-fade-up space-y-5 rounded-2xl border border-honey bg-honey/20 p-4">
          <div className="flex gap-2.5 text-xs leading-relaxed">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-caramel" aria-hidden="true" />
            <p>{deliveryRules.notice}</p>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              Lokasimu berada di… <span className="text-caramel">*</span>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'surabaya', label: `Area ${deliveryRules.areaName}`, id: 'area-surabaya' },
                  { value: 'outside', label: `Luar ${deliveryRules.areaName}`, id: 'area-outside' },
                ] as const
              ).map((opt) => {
                const selected = values.area === opt.value
                return (
                  <label
                    key={opt.value}
                    className={`flex min-h-[48px] cursor-pointer items-center justify-center rounded-xl border px-2 text-center text-sm font-medium transition focus-within:ring-2 focus-within:ring-caramel/40 active:scale-[0.98] ${
                      selected ? 'border-caramel bg-card shadow-soft' : 'border-line bg-card/70 text-muted'
                    }`}
                  >
                    <input
                      id={opt.id}
                      type="radio"
                      name="area"
                      value={opt.value}
                      checked={selected}
                      onChange={() => update({ area: opt.value })}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                )
              })}
            </div>
            {values.area === 'outside' && (
              <p role="alert" className="mt-2 rounded-xl bg-red-50 p-3 text-sm leading-snug text-red-700">
                {deliveryRules.outsideMessage}
              </p>
            )}
            {errors.area && values.area === '' && (
              <p role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.area}
              </p>
            )}
          </fieldset>

          <div>
            <label htmlFor="address" className="mb-2 block text-sm font-semibold">
              Alamat Pengantaran <span className="text-caramel">*</span>
            </label>
            <textarea
              ref={addressRef}
              id="address"
              name="address"
              rows={3}
              maxLength={200}
              autoComplete="street-address"
              placeholder="Nama jalan, nomor, RT/RW, kecamatan, dan patokan"
              value={values.address}
              onChange={(e) => update({ address: e.target.value })}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={errors.address ? 'address-error' : undefined}
              className={`field resize-none ${errors.address ? 'field-error' : ''}`}
            />
            {errors.address && (
              <p id="address-error" role="alert" className="mt-1.5 text-sm text-red-600">
                {errors.address}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Catatan */}
      <div>
        <label htmlFor="note" className="mb-2 block text-sm font-semibold">
          Catatan Tambahan <span className="font-normal text-muted">(Opsional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={200}
          placeholder="Catatan khusus, ucapan kartu, atau jam pickup yang diinginkan..."
          value={values.note}
          onChange={(e) => update({ note: e.target.value })}
          className="field resize-none"
        />
      </div>

      {/* Total ringkas untuk layar kecil — ringkasan lengkap tampil di samping pada layar lebar */}
      <div className="flex items-center justify-between rounded-2xl bg-sand/70 px-4 py-3 lg:hidden">
        <span className="text-sm text-muted">
          {order.totalQuantity} {productInfo.unitName} · total sementara
        </span>
        <span key={order.total} className="animate-pop font-serif text-xl font-bold text-caramel">
          {formatCurrency(order.total)}
        </span>
      </div>

      <div>
        <button
          type="submit"
          disabled={order.totalQuantity < 1}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {order.totalQuantity < 1
            ? 'Pilih Minimal 1 Varian di Atas'
            : needsConfirmation
              ? 'Lanjut & Ajukan Pengantaran'
              : 'Lanjut ke Pembayaran'}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          {needsConfirmation
            ? 'Belum ada pembayaran. Pengantaran dikonfirmasi dulu lewat WhatsApp sebelum kamu membayar.'
            : 'Belum ada pembayaran yang diproses. Kamu akan melihat ringkasan & QRIS di langkah berikutnya.'}
        </p>
      </div>

      {/* Kolom jebakan bot: tidak terlihat & tidak bisa difokus oleh manusia (sengaja di akhir form
          supaya tidak memengaruhi jarak antar bagian). */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Jangan diisi</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => onChange({ website: e.target.value })}
        />
      </div>
    </form>
  )
}
