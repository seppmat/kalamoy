import { useRef, useState, type FormEvent } from 'react'
import { ArrowRight, Bike, Check, Info, MapPin, Minus, Plus, Store, User } from 'lucide-react'
import { deliveryRules, fulfillmentOptions, product, productInfo } from '../data/products'
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
            placeholder="Nama Anda (cth: Sarah Amelia)"
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

      {/* Produk (hanya satu, otomatis terpilih) */}
      <div>
        <p className="mb-2 text-sm font-semibold">Produk</p>
        <div className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-caramel bg-[#FBF1E6] p-4 shadow-soft ring-1 ring-caramel/40">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-caramel text-card"
          >
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{product.name}</p>
            <p className="mt-0.5 text-xs leading-snug text-muted">{product.description}</p>
          </div>
          <p className="shrink-0 whitespace-nowrap text-sm font-semibold text-caramel">
            {formatCurrency(product.price)}
            <span className="text-xs font-normal text-muted"> /{productInfo.unitName}</span>
          </p>
        </div>
      </div>

      {/* Jumlah */}
      <div>
        <p id="qty-label" className="mb-2 text-sm font-semibold">
          Jumlah Pesanan ({productInfo.unitName}) <span className="text-caramel">*</span>
        </p>
        <div className="flex items-center gap-4">
          <div
            role="group"
            aria-labelledby="qty-label"
            className="inline-flex shrink-0 items-center rounded-2xl border border-line bg-card p-1.5"
          >
            <button
              type="button"
              onClick={() => update({ quantity: Math.max(1, values.quantity - 1) })}
              disabled={values.quantity <= 1}
              aria-label="Kurangi jumlah"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBEAE0] text-caramel transition active:scale-90 hover:bg-[#F6DDCE] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-5 w-5" aria-hidden="true" />
            </button>
            <output aria-live="polite" className="w-12 text-center text-lg font-semibold tabular-nums">
              {values.quantity}
            </output>
            <button
              type="button"
              onClick={() => update({ quantity: Math.min(productInfo.maxQuantity, values.quantity + 1) })}
              disabled={values.quantity >= productInfo.maxQuantity}
              aria-label="Tambah jumlah"
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBEAE0] text-caramel transition active:scale-90 hover:bg-[#F6DDCE] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs leading-snug text-muted">{productInfo.quantityHint}</p>
        </div>
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
          {order.quantity} {productInfo.unitName} · total sementara
        </span>
        <span key={order.total} className="animate-pop font-serif text-xl font-bold text-caramel">
          {formatCurrency(order.total)}
        </span>
      </div>

      <div>
        <button type="submit" className="btn-primary w-full">
          {needsConfirmation ? 'Lanjut & Ajukan Pengantaran' : 'Lanjut ke Pembayaran'}
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          {needsConfirmation
            ? 'Belum ada pembayaran. Pengantaran dikonfirmasi dulu lewat WhatsApp sebelum kamu membayar.'
            : 'Belum ada pembayaran yang diproses. Kamu akan melihat ringkasan & QRIS di langkah berikutnya.'}
        </p>
      </div>
    </form>
  )
}
