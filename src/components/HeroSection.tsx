import { ArrowDown, CheckCircle2, Sparkles, Utensils } from 'lucide-react'
import { product, productInfo } from '../data/products'
import { siteConfig } from '../data/siteConfig'
import { formatCurrency } from '../utils/formatCurrency'
import { imageUrl } from '../utils/assetUrl'
import { scrollToId } from '../utils/scroll'
import SafeImage from './SafeImage'

const { hero, images } = siteConfig

export default function HeroSection() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-sand via-cream to-honey/30"
    >
      {/* Dekorasi melayang (aria-hidden, tidak mengganggu pembaca layar) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <span className="absolute -left-10 top-24 h-32 w-32 animate-float rounded-full bg-honey/50 blur-2xl" />
        <span
          className="absolute -right-8 bottom-20 h-40 w-40 animate-float rounded-full bg-toffee/25 blur-3xl"
          style={{ animationDelay: '-3s' }}
        />
        <span
          className="absolute right-1/3 top-10 hidden h-3 w-3 animate-float rounded-full bg-caramel/40 md:block"
          style={{ animationDelay: '-1.5s' }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-2 md:gap-12 md:py-16 lg:py-20">
        {/* Teks */}
        <div>
          <span
            className="inline-flex animate-fade-up items-center gap-1.5 rounded-full border border-honey bg-honey/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink"
          >
            <Sparkles className="h-3.5 w-3.5 text-caramel" aria-hidden="true" />
            {hero.pill}
          </span>

          <h1
            className="mt-5 animate-fade-up text-[2.5rem] font-bold leading-[1.1] text-caramel sm:text-5xl lg:text-6xl"
            style={{ animationDelay: '80ms' }}
          >
            {hero.headlineBold}
            <span className="block font-medium italic">{hero.headlineItalic}</span>
          </h1>

          <p
            className="mt-5 max-w-md animate-fade-up text-base leading-relaxed text-muted sm:text-lg"
            style={{ animationDelay: '160ms' }}
          >
            {hero.description}
          </p>

          <div
            className="mt-7 flex animate-fade-up flex-wrap items-center gap-3"
            style={{ animationDelay: '240ms' }}
          >
            <button type="button" onClick={() => scrollToId('pesan')} className="btn-primary w-full sm:w-auto">
              Pesan Sekarang
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
              <Utensils className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="rounded-full border border-line bg-card px-4 py-3 text-sm text-muted">
              Hanya <strong className="ml-1 font-semibold text-caramel">{formatCurrency(product.price)}</strong> /{' '}
              {productInfo.unitName}
            </p>
          </div>

          <ul
            className="mt-6 flex animate-fade-up flex-wrap gap-x-5 gap-y-2 text-xs text-muted"
            style={{ animationDelay: '320ms' }}
          >
            {hero.trust.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-toffee" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Foto produk */}
        <div className="relative animate-fade-up" style={{ animationDelay: '200ms' }}>
          <div className="rounded-[2rem] border border-white/80 bg-card p-2.5 shadow-soft">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-sand sm:aspect-square md:aspect-[4/5]">
              <SafeImage
                src={imageUrl(images.poster)}
                alt={`${siteConfig.brand.name} — ${siteConfig.brand.tagline} karamel di atas piring keramik`}
                className="h-full w-full object-cover"
                fallback={
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted">
                    <span className="text-5xl" aria-hidden="true">
                      🍮
                    </span>
                    <p className="text-sm font-semibold text-ink">Foto produk belum dipasang</p>
                    <p className="text-xs">
                      Letakkan file <code className="rounded bg-card px-1.5 py-0.5">{images.poster}</code> di
                      folder <code className="rounded bg-card px-1.5 py-0.5">public/images/</code>
                    </p>
                  </div>
                }
              />
            </div>
          </div>

          <div className="absolute -top-3 left-2 flex items-center gap-2 rounded-2xl border border-line bg-card px-3 py-2 shadow-soft sm:-left-3">
            <Sparkles className="h-4 w-4 text-toffee" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-xs font-semibold text-ink">{hero.floatingTop.title}</p>
              <p className="text-[10px] text-muted">{hero.floatingTop.subtitle}</p>
            </div>
          </div>

          <div className="absolute -bottom-3 right-2 rounded-full border border-honey bg-honey/90 px-3 py-1.5 text-[11px] font-semibold text-ink shadow-soft sm:-right-3">
            🍯 {hero.floatingBottom}
          </div>
        </div>
      </div>
    </section>
  )
}
