import { useEffect, useMemo, useState } from 'react'
import { Zap } from 'lucide-react'
import Footer from './components/Footer'
import Header from './components/Header'
import HeroSection from './components/HeroSection'
import OrderForm from './components/OrderForm'
import OrderSummary from './components/OrderSummary'
import PreOrderClosedCard from './components/PreOrderClosedCard'
import QrisPayment from './components/QrisPayment'
import ReviewPage from './components/ReviewPage'
import { defaultFulfillmentId, products } from './data/products'
import { siteConfig } from './data/siteConfig'
import { buildOrder, type FormValues } from './utils/order'
import { generateOrderRef } from './utils/orderRef'
import { fetchPoStatus, saveOrder } from './utils/saveOrder'
import { scrollToId } from './utils/scroll'
import { normalizeIndonesianPhone } from './utils/validation'

type Step = 'form' | 'payment'

const initialValues: FormValues = {
  name: '',
  phone: '',
  productId: products[0].id,
  quantity: 1,
  fulfillmentId: defaultFulfillmentId,
  area: '',
  address: '',
  note: '',
  website: '',
}

function checkIsReviewRoute(): boolean {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '')
  const page = new URLSearchParams(window.location.search).get('page')
  return (
    path.endsWith('/ulasan') ||
    path.endsWith('/review') ||
    page === 'ulasan' ||
    page === 'review'
  )
}

export default function App() {
  const [isReview, setIsReview] = useState<boolean>(checkIsReviewRoute)
  const [isPoOpen, setIsPoOpen] = useState<boolean>(siteConfig.preOrder.defaultOpen)
  const [values, setValues] = useState<FormValues>(initialValues)
  const [step, setStep] = useState<Step>('form')
  // Nomor referensi hanya untuk sesi browser ini (tidak disimpan di server mana pun).
  const [orderRef, setOrderRef] = useState(generateOrderRef)

  const order = useMemo(() => buildOrder(values), [values])
  const phone = normalizeIndonesianPhone(values.phone)

  // Cek status PO secara berkala dari Google Sheets
  useEffect(() => {
    fetchPoStatus().then((result) => {
      if (result) {
        setIsPoOpen(result.isOpen)
      }
    })
  }, [])

  // Dukungan tombol Back/Forward browser untuk halaman ulasan
  useEffect(() => {
    function handlePopState() {
      setIsReview(checkIsReviewRoute())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigateToReview() {
    window.history.pushState({}, '', '/?page=ulasan')
    setIsReview(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function navigateToHome() {
    window.history.pushState({}, '', '/')
    setIsReview(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goTo(next: Step) {
    setStep(next)
    // Tunggu render selesai, baru gulir ke bagian pemesanan.
    window.setTimeout(() => scrollToId('pesan'), 60)
  }

  function startNewOrder() {
    setValues(initialValues)
    setOrderRef(generateOrderRef())
    goTo('form')
  }

  // Jika halaman ulasan yang dibuka
  if (isReview) {
    return <ReviewPage onBackToHome={navigateToHome} />
  }

  return (
    <>
      <Header />
      <main>
        <HeroSection />

        <section id="pesan" className="scroll-mt-16 px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[#FBEAE0] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-caramel">
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                {siteConfig.brand.sectionBadge}
              </span>
              <h2 className="mt-4 text-3xl font-bold text-caramel sm:text-4xl">
                {!isPoOpen
                  ? 'Status Pemesanan'
                  : step === 'form'
                    ? siteConfig.form.title
                    : 'Konfirmasi & Pembayaran'}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                {!isPoOpen
                  ? 'Informasi kuota dan jadwal batch Kalamoy.'
                  : step === 'form'
                    ? siteConfig.form.subtitle
                    : 'Periksa pesananmu, ikuti langkah di bawah, lalu kirim nota ke WhatsApp.'}
              </p>
            </div>

            {/* Jika PO sedang DITUTUP (Close Form) */}
            {!isPoOpen ? (
              <PreOrderClosedCard onGoToReview={navigateToReview} />
            ) : step === 'form' || !phone ? (
              <div key="form" className="grid animate-fade-up gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
                <OrderForm
                  values={values}
                  order={order}
                  onChange={(patch) => setValues((prev) => ({ ...prev, ...patch }))}
                  onSubmit={() => {
                    saveOrder('submit', values, orderRef)
                    goTo('payment')
                  }}
                />

                {/* Ringkasan live — hanya di layar lebar; di HP total tampil di atas tombol */}
                <aside className="hidden space-y-4 lg:sticky lg:top-24 lg:block">
                  <OrderSummary order={order} />
                  <p className="rounded-2xl border border-line bg-card px-4 py-3 text-center text-xs leading-relaxed text-muted">
                    🍮 {siteConfig.storageNote}
                  </p>
                </aside>
              </div>
            ) : (
              <div key="payment">
                <QrisPayment
                  values={values}
                  order={order}
                  phone={phone}
                  orderRef={orderRef}
                  onBack={() => goTo('form')}
                  onNewOrder={startNewOrder}
                />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer onGoToReview={navigateToReview} />
    </>
  )
}
