import { ArrowDown } from 'lucide-react'
import { siteConfig } from '../data/siteConfig'
import { scrollToId } from '../utils/scroll'

interface HeaderProps {
  onOrderClick?: () => void
  onLogoClick?: () => void
}

export default function Header({ onOrderClick, onLogoClick }: HeaderProps) {
  function handleOrderClick() {
    if (onOrderClick) {
      onOrderClick()
    } else {
      scrollToId('pesan')
    }
  }

  function handleLogoClick(e: React.MouseEvent) {
    if (onLogoClick) {
      e.preventDefault()
      onLogoClick()
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <a
          href={onLogoClick ? '/' : '#top'}
          onClick={handleLogoClick}
          className="flex min-w-0 items-center gap-2"
          aria-label={`${siteConfig.brand.name} — ke beranda`}
        >
          <span className="font-serif text-2xl font-bold tracking-tight text-caramel">
            {siteConfig.brand.wordmark}
          </span>
          <span className="hidden whitespace-nowrap rounded-full bg-honey/70 px-2.5 py-1 text-[11px] font-semibold text-ink min-[400px]:inline">
            🍮 {siteConfig.brand.badge}
          </span>
        </a>

        <button
          type="button"
          onClick={handleOrderClick}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-caramel px-4 text-sm font-semibold text-card transition active:scale-95 hover:bg-[#954a22]"
        >
          Pesan Sekarang
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
