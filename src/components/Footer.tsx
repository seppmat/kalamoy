import { ArrowUp, HelpCircle, Star } from 'lucide-react'
import { siteConfig } from '../data/siteConfig'
import { buildWhatsAppUrl } from '../utils/generateWhatsAppUrl'
import { scrollToId } from '../utils/scroll'

interface FooterProps {
  onGoToReview?: () => void
  onOrderClick?: () => void
}

export default function Footer({ onGoToReview, onOrderClick }: FooterProps) {
  function handleBackToForm() {
    if (onOrderClick) {
      onOrderClick()
    } else {
      scrollToId('pesan')
    }
  }

  return (
    <footer className="border-t border-line bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-serif text-sm font-bold text-caramel">{siteConfig.brand.wordmark}</span>
          <span className="mx-2">•</span>© {new Date().getFullYear()} {siteConfig.brand.footerText}
        </p>
        <div className="flex flex-wrap items-center gap-5">
          {onGoToReview ? (
            <button
              type="button"
              onClick={onGoToReview}
              className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-caramel hover:text-ink"
            >
              <Star className="h-4 w-4 fill-honey text-honey" aria-hidden="true" />
              Beri Ulasan
            </button>
          ) : (
            <a
              href="/?page=ulasan"
              className="inline-flex min-h-[44px] items-center gap-1.5 font-semibold text-caramel hover:text-ink"
            >
              <Star className="h-4 w-4 fill-honey text-honey" aria-hidden="true" />
              Beri Ulasan
            </a>
          )}

          <a
            href={buildWhatsAppUrl(`Halo ${siteConfig.brand.name}, saya butuh bantuan.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-1.5 hover:text-ink"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Bantuan WhatsApp
          </a>

          <button
            type="button"
            onClick={handleBackToForm}
            className="inline-flex min-h-[44px] items-center gap-1.5 hover:text-ink"
          >
            Kembali ke Form
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  )
}
