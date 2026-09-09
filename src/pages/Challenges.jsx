import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  loadTeams,
  loadQuestionBanks,
  loadChallenges,
  loadTimerDuration,
  saveTimerDuration,
  formatDate,
} from '../utils/storage.js'
import LandscapeGuard from '../components/LandscapeGuard.jsx'

const slotColors = [
  { bg: 'bg-gradient-to-br from-brand-600 to-brand-500', ring: 'ring-brand-200', border: 'border-brand-400', label: 'الفريق الأول' },
  { bg: 'bg-gradient-to-br from-rose-600 to-rose-500', ring: 'ring-rose-200', border: 'border-rose-400', label: 'الفريق الثاني' },
]

export default function Challenges() {
  const navigate = useNavigate()
  const [teams] = useState(loadTeams)
  const [banks] = useState(loadQuestionBanks)
  const [challenges, setChallenges] = useState(loadChallenges)
  const [selected, setSelected] = useState([])
  const [bankId, setBankId] = useState('')
  const [timerDuration, setTimerDuration] = useState(() => loadTimerDuration() || 60)
  const [pickSlot, setPickSlot] = useState(0)
  const [showLandscapeGuard, setShowLandscapeGuard] = useState(false)

  const selectedBank = banks.find((b) => b.id === bankId)
  const ready = selected.length === 2 && bankId

  function pickTeam(team) {
    if (selected.some((s) => s.id === team.id)) return
    const next = [...selected, team]
    setSelected(next)
    if (next.length === 1) setPickSlot(1)
  }

  function removeTeam(slotIndex) {
    setSelected((prev) => prev.filter((_, i) => i !== slotIndex))
    setPickSlot(slotIndex)
  }

  function autoSelect() {
    if (teams.length < 2) return
    const shuffled = [...teams].sort(() => Math.random() - 0.5)
    const next = [shuffled[0], shuffled[1]]
    setSelected(next)
    setPickSlot(next.length)
  }

  function reset() {
    setSelected([])
    setPickSlot(0)
  }

  function start() {
    if (!ready) return
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setShowLandscapeGuard(true)
    } else {
      launchRound()
    }
  }

  const launchRound = useCallback(() => {
    const [teamA, teamB] = selected
    saveTimerDuration(timerDuration)
    reset()
    setBankId('')
    navigate('/challenges/round', {
      state: { teamAId: teamA.id, teamBId: teamB.id, bankId, timerDuration },
    })
  }, [selected, bankId, timerDuration, navigate])

  if (showLandscapeGuard) {
    return (
      <LandscapeGuard
        onConfirm={() => {
          setShowLandscapeGuard(false)
          launchRound()
        }}
        onCancel={() => setShowLandscapeGuard(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">إعداد التحدي</h2>
        <p className="text-sm text-slate-500 mt-1">اختر الفريقين المتنافسين وبنك الأسئلة ثم ابدأ المواجهة</p>
      </div>

      {teams.length < 2 ? (
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_380px] gap-6 items-start">
          {/* اختيار الفرق */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">اختر الفرق المتنافسة</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {selected.length === 0
                    ? `اضغط على فريق لاختياره كـ ${slotColors[pickSlot].label}`
                    : selected.length === 1
                      ? 'اختر الفريق الثاني'
                      : 'تم اختيار الفريقين'}
                </p>
              </div>
              {selected.length > 0 && (
                <button
                  onClick={reset}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  إعادة تعيين
                </button>
              )}
            </div>

            {/* الفرق المختارة */}
            {selected.length > 0 && (
              <div className="flex items-center justify-center gap-4 sm:gap-6 py-4">
                {selected.map((team, i) => {
                  const color = slotColors[i]
                  return (
                    <div key={team.id} className="flex items-center gap-3 sm:gap-4">
                      <button
                        onClick={() => removeTeam(i)}
                        className="group relative"
                        title="إزالة الفريق"
                      >
                        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ${color.ring} ${color.bg} text-white flex flex-col items-center justify-center shadow-lg cursor-pointer hover:opacity-90 transition-opacity`}>
                          <span className="text-2xl font-bold">{(team.name || '').trim().charAt(0) || '؟'}</span>
                          <span className="text-[10px] max-w-[80px] truncate">{team.name}</span>
                        </div>
                        <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </span>
                      </button>
                      <div className="text-center">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">{color.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{team.points} نقطة</p>
                      </div>
                      {i === 0 && selected.length > 1 && (
                        <div className="text-sm font-black text-brand-600 bg-brand-50 rounded-full w-8 h-8 flex items-center justify-center">VS</div>
                      )}
                    </div>
                  )
                })}
                {selected.length === 1 && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-4 ring-slate-200 bg-slate-100 text-slate-400 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">؟</span>
                    <span className="text-[10px]">انتظار</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={autoSelect}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                اختيار عشوائي
              </button>
            </div>

            {/* شبكة الفرق */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {teams.map((team) => {
                const isSelected = selected.some((s) => s.id === team.id)
                const activeSlot = selected.findIndex((s) => s.id === team.id)
                const color = activeSlot >= 0 ? slotColors[activeSlot] : null
                return (
                  <button
                    key={team.id}
                    onClick={() => isSelected ? removeTeam(activeSlot) : pickTeam(team)}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-center ${
                      isSelected
                        ? `${color.border} bg-white shadow-md`
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:shadow-sm'
                    }`}
                  >
                    {isSelected && (
                      <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${color.bg} text-white text-xs font-bold flex items-center justify-center ring-2 ring-white`}>
                        {activeSlot + 1}
                      </span>
                    )}
                    <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-lg font-bold text-white mb-2 ${
                      isSelected ? color.bg : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}>
                      {(team.name || '؟').trim().charAt(0)}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{team.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{team.points} نقطة</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* الإعدادات */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div>
              <h3 className="font-bold text-slate-800">إعداد المواجهة</h3>
              <p className="text-sm text-slate-500 mt-0.5">اختر بنك الأسئلة ومدة المؤقت</p>
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

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-2">مدة المؤقت (ثانية)</label>
              <div className="flex items-center gap-2">
                {[30, 60, 90, 120].map((secs) => (
                  <button
                    key={secs}
                    type="button"
                    onClick={() => setTimerDuration(secs)}
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${
                      timerDuration === secs
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {secs}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-1.5">يبدأ العد التنازلي تلقائياً عند عرض كل سؤال</p>
            </div>

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
              {!ready && 'اختر الفريقين وحدد بنك الأسئلة لتفعيل الزر'}
              {ready && 'سيتم نقلك إلى شاشة طرح الأسئلة'}
            </p>
          </div>
        </div>
      )}

      {challenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-700">سجل التحديات</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {challenges.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${
                    c.winner ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {c.winner ? 'انتهى' : 'تعادل'}
                  </span>
                  <span className="text-xs text-slate-400">{formatDate(c.createdAt)}</span>
                </div>
                <p className="font-bold text-slate-800">
                  {c.winner ? `الفائز: ${c.winner}` : 'تعادل بين الفريقين'}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {c.teamAName} ({c.teamAPoints}) — {c.teamBName} ({c.teamBPoints})
                </p>
                <p className="text-xs text-slate-400 mt-1">بنك: {c.bankTitle}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
