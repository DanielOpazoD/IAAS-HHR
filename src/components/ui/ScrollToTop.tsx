import { useState, useEffect } from 'react'

/** Floating button that appears when user scrolls down, scrolls back to top on click */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return

    const handleScroll = () => {
      setVisible(main.scrollTop > 300)
    }

    main.addEventListener('scroll', handleScroll, { passive: true })
    return () => main.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => {
        document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      className="fixed bottom-6 right-6 z-30 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-200 hover:shadow-xl transition-all animate-fade-up print:hidden"
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
