const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

/** 15000 -> "Rp 15.000" */
export function formatCurrency(amount: number): string {
  return rupiah.format(amount).replace(/ /g, ' ')
}

/** 0 -> "Gratis", selain itu "Rp x" */
export function formatFee(amount: number): string {
  return amount === 0 ? 'Gratis' : formatCurrency(amount)
}
