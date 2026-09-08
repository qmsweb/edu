import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loadTeams } from '../utils/storage.js'
import { loadQuestionBanks } from '../utils/storage.js'
import SpinningWheel from '../components/SpinningWheel.jsx'

const slotColors = [
  { bg: 'bg-gradient-to-br from-brand-600 to-brand-500', ring: 'ring-brand-200' },
  { bg: 'bg-gradient-to-br from-rose-600 to-rose-500', ring: 'ring-rose-200' },
]

export default function ChallengeSetup() {
  const navigate = useNavigate()
  const [teams] = useState(loadTeams)
  const [banks] = useState(loadQuestionBanks)
  const [selected, setSelected] = useState([])
  const [bankId, setBankId] = useState('')
  const [spinning, setSpinning] = useState(false)
  const wheelRef = useRef(null)

  const selectedIds = new Set(selected.map((t) => t.id))
  const remaining = useMemo(() => teams.filter((t) => !selectedIds.has(t.id)), [teams, selected])
  const availableBanks = useMemo(() => banks.filter((b) => (b.questions || []).length > 0), [banks])
  const selectedBank = banks.find((b) => b.id === bankId)

  function handleSettle(team) {
    setSelected((prev) => (prev.length < 2 && !prev.some((t) => t.id === team.id) ? [...prev, team] : prev))
  }

  function reset() {
    setSelected([])
    setSpinning(false)
  }

  const ready = selected.length === 2 && bankId

  function start() {
    if (!ready) return
    const [teamA, teamB] = selected
    navigate('/challenges/round', {
      state: { teamAId: teamA.id, teamBId: teamB.id, bankId },
    })
  }

  if (teams.length < 2) {
    return (
      <div className="space-y-6">
        <BackHeader />
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.024-.833-2.794 0L5.354 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold">تحتاج إلى فريقين على الأقل</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">أضف الفرق المشاركة أولاً قبل بدء التحدي</p>
          <Link
            to="/teams"
            className="inline-flex px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            الذهاب إلى الفرق
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BackHeader />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* العجلة */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6">
          <div className="text-center mb-5">
            <h3 className="font-bold text-slate-800 text-lg">عجلة الحظ</h3>
            <p className="text-sm text-slate-500 mt-1">
              {selected.length === 0 && 'دوّر العجلة لاختيار الفريق الأول'}
              {selected.length === 1 && 'رائع! دوّر الآن لاختيار الفريق الثاني'}
              {selected.length === 2 && 'اكتمل اختيار الفريقين — اضغط "بدء المواجهة" بالأسفل'}
            </p>
          </div>

          <SpinningWheel
            ref={wheelRef}
            names={remaining.map((t) => t.name)}
            onSpinStart={() => setSpinning(true)}
            onSettle={handleSettle}
          />

          <div className="mt-6 flex items-center justify-center gap-3">
            {selected.length < 2 && (
              <button
                onClick={() => wheelRef.current && wheelRef.current.spin()}
                disabled={spinning || remaining.length < 1}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow shadow-brand-600/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {spinning ? '... يتم التدوير' : 'تدوير'}
              </button>
            )}
            {selected.length > 0 && (
              <button
                onClick={reset}
                disabled={spinning}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                إعادة التدوير
              </button>
            )}
          </div>

          {/* الفرق المختارة */}
          <div className="mt-7 flex items-center justify-center gap-3 sm:gap-5">
            {[0, 1].map((slot) => {
              const team = selected[slot]
              const color = slotColors[slot % slotColors.length]
              return (
                <div key={slot} className="flex items-center gap-3 sm:gap-4">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ${color.ring} ${color.bg} text-white flex flex-col items-center justify-center shadow-lg ${
                      team ? '' : 'opacity-30'
                    }`}
                  >
                    <span className="text-2xl font-bold">{team ? team.name.trim().charAt(0) : '؟'}</span>
                    {team && <span className="text-[10px] max-w-[80px] truncate">{team.name}</span>}
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      {slot === 0 ? 'الفريق الأول' : 'الفريق الثاني'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{team ? `${team.points} نقطة` : 'لم يُختار بعد'}</p>
                  </div>
                  {slot === 0 && <div className="text-sm font-black text-brand-600 bg-brand-50 rounded-full w-8 h-8 flex items-center justify-center">VS</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* إعدادات المواجهة */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">إعداد المواجهة</h3>
            <p className="text-sm text-slate-500 mt-1">اختر بنك الأسئلة الذي ستُختبر به الفريقان</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2">بنك الأسئلة</label>
            {banks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                <p className="text-sm text-slate-500">لا توجد بنوك أسئلة بعد</p>
                <Link to="/" className="text-sm font-semibold text-brand-600 hover:text-brand-700 mt-1 inline-block">
                  إنشاء بنك أسئلة
                </Link>
              </div>
            ) : (
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition bg-white"
              >
                <option value="">— اختر بنك الأسئلة —</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.title}
                    {(bank.questions || []).length > 0 ? ` (${bank.questions.length} سؤال)` : ' (بدون أسئلة)'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedBank && (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center text-lg font-bold">
                {(selectedBank.title || '؟').trim().charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedBank.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {(selectedBank.questions || []).length} سؤال
                  {selectedBank.subject ? ` · ${selectedBank.subject}` : ''}
                </p>
              </div>
            </div>
          )}

          <button
            onClick={start}
            disabled={!ready}
            className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold transition-colors shadow ${
              ready
                ? 'bg-gradient-to-l from-brand-600 to-brand-500 text-white hover:from-brand-700 hover:to-brand-600 shadow-brand-600/25'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            بدء المواجهة
          </button>

          <p className="text-xs text-slate-400 text-center leading-relaxed">
            {!ready && 'اختر فريقين عبر العجلة ثم حدد بنك الأسئلة لتفعيل الزر'}
            {ready && 'سيتم نقلك إلى شاشة طرح الأسئلة'}
          </p>
        </div>
      </div>
    </div>
  )
}

function BackHeader() {
  return (
    <div className="flex items-center gap-4">
      <Link
        to="/challenges"
        className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors"
        aria-label="العودة للتحدي"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">إعداد التحدي</h2>
        <p className="text-sm text-slate-500 mt-1">دوّر العجلة لاختيار الفريقين المتنافسين</p>
      </div>
    </div>
  )
}