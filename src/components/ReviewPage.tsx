import { useState, type FormEvent } from 'react'
import { ArrowLeft, Check, Heart, Send, Sparkles, Star } from 'lucide-react'
import { products } from '../data/products'
import { siteConfig } from '../data/siteConfig'
import { saveReview } from '../utils/saveOrder'
import Footer from './Footer'
import Header from './Header'

interface ReviewPageProps {
  onBackToHome: () => void
}

const ratingLabels: Record<number, string> = {
  1: 'Sangat Kurang Memuaskan 😞',
  2: 'Kurang Memuaskan 🙁',
  3: 'Perlu Banyak Evaluasi 😐',
  4: 'Kurang Cocok di Lidah 😕',
  5: 'Cukup Lumayan 🙂',
  6: 'Cukup Enak 👍',
  7: 'Enak & Lembut! 😋',
  8: 'Enak Banget, Nagih! 🥰',
  9: 'Hampir Sempurna! ✨',
  10: 'Luar Biasa, Suka Banget! 🌟🍮',
}

export default function ReviewPage({ onBackToHome }: ReviewPageProps) {
  const [name, setName] = useState('')
  const [variant, setVariant] = useState(products[0].name)
  const [rating, setRating] = useState<number>(10)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const activeRating = hoverRating !== null ? hoverRating : rating

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    await saveReview({
      name: name.trim() || 'Anonim',
      variant,
      rating,
      comment,
    })

    setSubmitting(false)
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <Header />
      <main className="min-h-screen px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl">
          {/* Tombol Kembali */}
          <button
            type="button"
            onClick={onBackToHome}
            className="group mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-xs font-semibold text-muted transition hover:border-caramel hover:text-caramel"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
            Kembali ke Beranda
          </button>

          {submitted ? (
            <div className="animate-fade-up rounded-3xl border border-line bg-card p-8 text-center shadow-soft sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-honey/40 text-caramel">
                <Heart className="h-8 w-8 fill-caramel text-caramel" aria-hidden="true" />
              </div>

              <span className="mt-5 inline-block rounded-full bg-honey/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
                Ulasan Diterima
              </span>

              <h2 className="mt-3 text-2xl font-bold text-caramel sm:text-3xl">
                Terima Kasih Banyak! 🍮
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                Ulasan dan saran dari kamu sudah tersimpan di database kami. Masukanmu sangat berharga bagi kami untuk terus menjaga dan meningkatkan kualitas rasa Kalamoy.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={onBackToHome}
                  className="btn-primary mx-auto inline-flex"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-up rounded-3xl border border-line bg-card p-6 shadow-soft sm:p-10">
              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[#FBEAE0] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-caramel">
                  <Sparkles className="h-3 w-3" />
                  Ruang Masukan & Evaluasi Rasa
                </span>
                <h1 className="mt-3 text-2xl font-bold text-caramel sm:text-3xl">
                  Bagikan Pengalamanmu Menikmati {siteConfig.brand.name} 🍮
                </h1>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                  Kami ingin terus berkembang. Ceritakan bagaimana rasa, kemanisan, tekstur, atau kemasan yang kamu terima!
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                {/* Nama */}
                <div>
                  <label htmlFor="review-name" className="block text-sm font-semibold">
                    Nama / Panggilan <span className="text-xs font-normal text-muted">(Boleh dikosongkan)</span>
                  </label>
                  <input
                    id="review-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="mis. Kak Budi (Boleh anonim)"
                    className="mt-2 w-full rounded-2xl border border-line bg-sand/30 px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-caramel focus:bg-card focus:outline-none"
                  />
                </div>

                {/* Varian yang dicoba */}
                <div>
                  <label className="block text-sm font-semibold">
                    Varian yang Kamu Coba <span className="text-caramel">*</span>
                  </label>
                  <div className="mt-2 grid gap-2.5 sm:grid-cols-3">
                    {[
                      ...products.map((p) => p.name),
                      'Mencoba Keduanya',
                    ].map((v) => {
                      const isSelected = variant === v
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVariant(v)}
                          className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-medium transition ${
                            isSelected
                              ? 'border-caramel bg-[#FBF1E6] text-caramel shadow-soft ring-1 ring-caramel/40'
                              : 'border-line bg-sand/20 text-ink hover:border-toffee/50 hover:bg-sand/40'
                          }`}
                        >
                          <span className="line-clamp-2">{v}</span>
                          {isSelected && (
                            <Check className="ml-1.5 h-3.5 w-3.5 shrink-0 text-caramel" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Rating Bintang Interaktif (1-10) */}
                <div className="rounded-2xl border border-line bg-sand/30 p-5 text-center">
                  <label className="block text-sm font-semibold">
                    Beri Nilai Keseluruhan (1 – 10 Bintang) <span className="text-caramel">*</span>
                  </label>
                  <p className="mt-1 text-xs text-muted">Sentuh atau klik bintang untuk memberi nilai</p>

                  {/* 10 Stars row */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((starNum) => {
                      const isLit = starNum <= activeRating
                      return (
                        <button
                          key={starNum}
                          type="button"
                          onClick={() => setRating(starNum)}
                          onMouseEnter={() => setHoverRating(starNum)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="group p-1 transition-transform active:scale-125 focus:outline-none"
                          aria-label={`Beri nilai ${starNum} dari 10`}
                        >
                          <Star
                            className={`h-6 w-6 transition-colors duration-150 sm:h-7 sm:w-7 ${
                              isLit
                                ? 'fill-[#E89332] text-[#E89332]'
                                : 'fill-transparent text-line hover:text-[#E89332]/50'
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>

                  {/* Nilai & Status Teks */}
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="rounded-full bg-honey/70 px-2.5 py-0.5 text-xs font-bold text-ink">
                      {activeRating} / 10
                    </span>
                    <span className="text-xs font-semibold text-caramel">
                      {ratingLabels[activeRating]}
                    </span>
                  </div>
                </div>

                {/* Kritik & Saran / Ulasan Teks */}
                <div>
                  <label htmlFor="review-comment" className="block text-sm font-semibold">
                    Kritik, Saran, atau Ulasan Rasa <span className="text-caramel">*</span>
                  </label>
                  <textarea
                    id="review-comment"
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Contoh: Teksturnya lumer banget dan manisnya pas! Cuma mungkin untuk yang bittersweet karamelnya bisa dibikin sedikit lebih pekat lagi..."
                    className="mt-2 w-full rounded-2xl border border-line bg-sand/30 p-4 text-sm text-ink placeholder:text-muted/60 focus:border-caramel focus:bg-card focus:outline-none"
                  />
                  <p className="mt-1.5 text-xs text-muted">
                    Boleh sebutkan apa yang kamu suka, dan apa yang menurutmu bisa kami tingkatkan.
                  </p>
                </div>

                {/* Tombol Kirim */}
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    'Mengirim Ulasan…'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim Ulasan Sekarang
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
