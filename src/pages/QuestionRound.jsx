import { Link, useLocation } from 'react-router-dom'
import { loadTeams } from '../utils/storage.js'
import { loadQuestionBanks } from '../utils/storage.js'

export default function QuestionRound() {
  const location = useLocation()
  const { teamAId, teamBId, bankId } = location.state || {}
  const teams = loadTeams()
  const banks = loadQuestionBanks()

  const teamA = teams.find((t) => t.id === teamAId)
  const teamB = teams.find((t) => t.id === teamBId)
  const bank = banks.find((b) => b.id === bankId)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/challenges/setup"
          className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-600 flex items-center justify-center hover:bg-slate-50 transition-colors"
          aria-label="العودة لإعداد التحدي"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">طرح الأسئلة</h2>
          <p className="text-sm text-slate-500 mt-1">المواجهة جاهزة — ستظهر الأسئلة في هذه الشاشة</p>
        </div>
      </div>

      {/* فريقا المواجهة */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <TeamBadge team={teamA} gradient="from-brand-600 to-brand-500" />
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-black text-sm">
              VS
            </div>
          </div>
          <TeamBadge team={teamB} gradient="from-rose-600 to-rose-500" />
        </div>

        {bank && (
          <div className="mt-6 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-center gap-2 text-sm">
            <span className="text-slate-400">بنك الأسئلة:</span>
            <span className="font-semibold text-slate-700">{bank.title}</span>
            <span className="text-xs text-slate-400">({(bank.questions || []).length} سؤال)</span>
          </div>
        )}
      </div>

      {/* منطقة الأسئلة (واجهة فقط) */}
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-slate-600 font-semibold">واجهة طرح الأسئلة</p>
        <p className="text-sm text-slate-400 mt-1 mb-5">
          سنضيف هنا منطق عرض الأسئلة، شريط التوقيت، ومتابعة النقاط في الخطوة التالية
        </p>
        <Link
          to="/challenges/setup"
          className="inline-flex px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
        >
          العودة لإعداد التحدي
        </Link>
      </div>
    </div>
  )
}

function TeamBadge({ team, gradient }) {
  const name = team?.name || '—'
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center text-3xl font-bold shadow-lg`}
      >
        {name.trim().charAt(0)}
      </div>
      <span className="text-sm font-bold text-slate-800 max-w-[110px] truncate">{name}</span>
      <span className="text-xs text-slate-400 tabular-nums">{team?.points ?? 0} نقطة</span>
    </div>
  )
}