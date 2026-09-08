import { useNavigate } from 'react-router-dom'
import { mockChallenges } from '../data/mockData.js'

const badgeMap = {
  نشط: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  قادم: 'bg-sky-50 text-sky-700 border-sky-200',
}

const dotMap = {
  نشط: 'bg-emerald-500',
  قادم: 'bg-sky-500',
}

export default function Challenges() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">التحدي</h2>
          <p className="text-sm text-slate-500 mt-1">أطلق منافسات ممتعة بين الفرق وقياس النتائج</p>
        </div>
        <button
          onClick={() => navigate('/challenges/setup')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow shadow-brand-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          تحدي جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {mockChallenges.map((challenge) => (
          <div
            key={challenge.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs px-3 py-1 rounded-full border font-semibold ${badgeMap[challenge.status]}`}>
                {challenge.status}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${dotMap[challenge.status]}`}></span>
                ينتهي خلال {challenge.endsIn}
              </div>
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">{challenge.title}</h3>
            <p className="mt-1 text-sm text-slate-500 leading-relaxed">{challenge.description}</p>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
              <div className="flex -space-x-2">
                {Array.from({ length: Math.min(challenge.teamCount, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-brand-500 to-brand-600 text-white text-xs flex items-center justify-center font-bold"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                <span className="ml-2 text-sm text-slate-500 flex items-center">
                  {challenge.teamCount} فرق
                </span>
              </div>
              <button className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                عرض التحدي ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}