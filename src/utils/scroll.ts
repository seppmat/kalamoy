/** Scroll halus ke elemen berdasarkan id; otomatis instan jika pengguna memilih reduced motion. */
export function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
