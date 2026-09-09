import { useState, useEffect } from 'react'

function getIsLandscape() {
  if (typeof window === 'undefined') return true
  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.includes('landscape')
  }
  return window.innerWidth > window.innerHeight
}

export default function LandscapeGuard({ onConfirm, onCancel }) {
  const [isLandscape, setIsLandscape] = useState(getIsLandscape)

  useEffect(() => {
    function check() {
      setIsLandscape(getIsLandscape())
    }
    window.addEventListener('orientationchange', check)
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('orientationchange', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  if (isLandscape) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800">جاهز للتحدي!</h3>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          يتم الآن التحقق من وضع الشاشة. يمكنك المتابعة.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onConfirm}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-l from-brand-600 to-brand-500 text-white text-lg font-bold hover:from-brand-700 hover:to-brand-600 transition-all shadow-xl shadow-brand-600/30 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ابدأ المواجهة
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            رجوع
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-8 text-center">
      <div className="animate-phone-rotate mb-8">
        <div className="relative w-24 h-40 border-4 border-white/30 rounded-2xl flex items-center justify-center">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/20 rounded-full" />
          <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">قم بتدوير هاتفك</h3>
      <p className="text-white/70 max-w-sm leading-relaxed mb-8">
        لعرض المواجهة بشكل صحيح، يُرجى تدوير الهاتف إلى وضع أفقي (Landscape)
      </p>

      <div className="flex items-center gap-8 text-white/50">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-20 border-2 border-rose-400 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-rose-400">عمودي</span>
        </div>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-14 border-2 border-emerald-400 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-xs font-semibold text-emerald-400">أفقي</span>
        </div>
      </div>

      <button
        onClick={onCancel}
        className="mt-10 px-6 py-2.5 rounded-xl border border-white/20 text-white/60 text-sm font-semibold hover:bg-white/10 transition-colors"
      >
        العودة
      </button>
    </div>
  )
}
