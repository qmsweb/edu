import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  loadTeams,
  loadQuestionBanks,
  loadChallenges,
  loadTimerDuration,
  saveTimerDuration,
  formatDate,
} from '../utils/storage.js'
import SpinningWheel from '../components/SpinningWheel.jsx'

const slotColors = [
  { bg: 'bg-gradient-to-br from-brand-600 to-brand-500', ring: 'ring-brand-200' },
  { bg: 'bg-gradient-to-br from-rose-600 to-rose-500', ring: 'ring-rose-200' },
]

export default function Challenges() {
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [teams] = useState(loadTeams)
  const [banks] = useState(loadQuestionBanks)
  const [challenges, setChallenges] = useState(loadChallenges)
  const [selected, setSelected] = useState([])
  const [bankId, setBankId] = useState('')
  const [timerDuration, setTimerDuration] = useState(() => loadTimerDuration() || 60)
  const [spinning, setSpinning] = useState(false)
  const wheelRef = useRef(null)

  const selectedBank = banks.find((b) => b.id === bankId)
  const ready = selected.length === 2 && bankId

  function handleSettle(firstTeam) {
    setSpinning(false)
    if (!firstTeam || !firstTeam.id) return
    const pool = teams.filter((t) => t.id !== firstTeam.id)
    const secondTeam = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null
    setSelected(secondTeam ? [firstTeam, secondTeam] : [firstTeam])
  }

  function reset() {
    setSelected([])
    setSpinning(false)
  }

  function start() {
    if (!ready) return
    const [teamA, teamB] = selected
    saveTimerDuration(timerDuration)
    setShowModal(false)
    reset()
    setBankId('')
    navigate('/challenges/round', {
      state: { teamAId: teamA.id, teamBId: teamB.id, bankId, timerDuration },
    })
  }

  function openModal() {
    if (teams.length < 2) return
    setSelected([])
    setBankId('')
    setSpinning(false)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    reset()
    setBankId('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">التحدي</h2>
        <p className="text-sm text-slate-500 mt-1">أطلق منافسات ممتعة بين الفرق وقياس النتائج</p>
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
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-600/25">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">جاهز للتحدي؟</h3>
          <p className="text-sm text-slate-500 mb-8 text-center max-w-md">
            اختر الفريقين والأسئلة وابدأ المواجهة المباشرة
          </p>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-l from-brand-600 to-brand-500 text-white text-lg font-bold hover:from-brand-700 hover:to-brand-600 transition-all shadow-xl shadow-brand-600/30 hover:shadow-brand-600/40 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ابدأ التحدي
          </button>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl border border-slate-200 shadow-2xl">
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-slate-800 text-lg">إعداد التحدي</h3>
              <button
                onClick={closeModal}
                className="w-9 h-9 rounded-xl border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
              <div className="lg:col-span-3">
                <div className="text-center mb-5">
                  <h4 className="font-bold text-slate-800">عجلة الحظ</h4>
                  <p className="text-sm text-slate-500 mt-1">دوّر العجلة لاختيار الفريقين المتنافسين</p>
                </div>

                <SpinningWheel
                  ref={wheelRef}
                  items={teams}
                  onSpinStart={() => setSpinning(true)}
                  onSettle={handleSettle}
                />

                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => wheelRef.current && wheelRef.current.spin()}
                    disabled={spinning}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow shadow-brand-600/25"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {spinning ? '... يتم التدوير' : 'تدوير'}
                  </button>
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
                          <span className="text-2xl font-bold">{team ? (team.name || '').trim().charAt(0) || '؟' : '؟'}</span>
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

              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h4 className="font-bold text-slate-800">إعداد المواجهة</h4>
                  <p className="text-sm text-slate-500 mt-1">اختر بنك الأسئلة الذي ستُختبر به الفريقان</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">بنك الأسئلة</label>
                  {banks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center">
                      <p className="text-sm text-slate-500">لا توجد بنوك أسئلة بعد</p>
                      <Link to="/" onClick={closeModal} className="text-sm font-semibold text-brand-600 hover:text-brand-700 mt-1 inline-block">
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
                  {!ready && 'دوّر العجلة وحدد بنك الأسئلة لتفعيل الزر'}
                  {ready && 'سيتم نقلك إلى شاشة طرح الأسئلة'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
