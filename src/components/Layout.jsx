import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const navItems = [
  {
    path: '/',
    label: 'بنوك الأسئلة',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    path: '/teams',
    label: 'الفرق',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    path: '/challenges',
    label: 'التحدي',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    path: '/settings',
    label: 'الإعدادات',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const location = useLocation()

  const isChallengeRound = location.pathname === '/challenges/round'

  useEffect(() => {
    if (isChallengeRound) {
      setSidebarVisible(false)
    }
  }, [isChallengeRound])

  const showSidebar = sidebarVisible && !isChallengeRound

  return (
    <div className="min-h-screen bg-slate-100">
      {/* الموبايل: طبقة معتمة عند الفتح */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white border-l border-slate-200 shadow-lg transform transition-transform duration-300 z-30 flex flex-col
          ${open ? 'translate-x-0' : showSidebar ? 'translate-x-full lg:translate-x-0' : 'translate-x-full'}`}
      >
        {/* الشعار */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow">
            م
          </div>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">منصة المعلم</h1>
            <p className="text-xs text-slate-400">إدارة التعليم التفاعلي</p>
          </div>
        </div>

        {/* عناصر التنقل */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* بطاقة المعلم */}
        <div className="mx-4 mb-5 p-4 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              ي
            </div>
            <div>
              <p className="font-semibold text-sm">أ. ياسين</p>
              <p className="text-xs text-white/80">معلم رياضيات</p>
            </div>
          </div>
        </div>
      </aside>

      {/* المحتوى */}
      <div className={`${showSidebar ? 'lg:mr-64' : ''} transition-all duration-300`}>
        {/* الشريط العلوي */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              aria-label="فتح القائمة"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setSidebarVisible((v) => !v)}
              className="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              aria-label={showSidebar ? 'إخفاء الشريط الجانبي' : 'إظهار الشريط الجانبي'}
              title={showSidebar ? 'إخفاء الشريط الجانبي' : 'إظهار الشريط الجانبي'}
            >
              {showSidebar ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">أهلاً بعودتك 👋</span>
            <span>· اليوم هو الثلاثاء 8 سبتمبر</span>
          </div>


        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
