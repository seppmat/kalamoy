import { Hourglass, MessageCircle, Star } from 'lucide-react'
import { siteConfig } from '../data/siteConfig'
import { buildWhatsAppUrl } from '../utils/generateWhatsAppUrl'

interface PreOrderClosedCardProps {
  onGoToReview: () => void
}

export default function PreOrderClosedCard({ onGoToReview }: PreOrderClosedCardProps) {
  const askNextBatchUrl = buildWhatsAppUrl(
    `Halo ${siteConfig.brand.name}! 🍮 Saya ingin menanyakan jadwal open PO batch berikutnya atau apakah masih ada slot tambahan ya? Terima kasih!`,
  )

  return (
    <div className="mx-auto max-w-2xl animate-fade-up rounded-3xl border border-line bg-card p-6 text-center shadow-soft sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBEAE0] text-caramel">
        <Hourglass className="h-8 w-8 animate-pulse" aria-hidden="true" />
      </div>

      <span className="mt-5 inline-block rounded-full bg-honey/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
        Status Pre-Order
      </span>

      <h3 className="mt-3 text-2xl font-bold text-caramel sm:text-3xl">
        {siteConfig.preOrder.closedTitle}
      </h3>

      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
        {siteConfig.preOrder.closedSubtitle}
      </p>

      <div className="mt-6 rounded-2xl bg-sand/60 p-4 text-xs leading-relaxed text-muted sm:text-sm">
        💡 {siteConfig.preOrder.nextBatchNote}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={askNextBatchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full sm:w-auto"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Tanya Jadwal Batch Berikutnya
        </a>

        <button
          type="button"
          onClick={onGoToReview}
          className="btn-ghost w-full sm:w-auto"
        >
          <Star className="h-4 w-4 text-honey fill-honey" aria-hidden="true" />
          Beri Ulasan / Feedback
        </button>
      </div>
    </div>
  )
}
