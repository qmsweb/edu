import { mockTeams } from '../data/mockData.js'

export default function Teams() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">الفرق</h2>
          <p className="text-sm text-slate-500 mt-1">قسّم طلابك إلى فرق وتابع أداءهم</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow shadow-brand-600/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          فريق جديد
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">
                {team.emoji}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">{team.name}</h3>
                <p className="text-sm text-slate-500">{team.teacherName}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{team.memberCount} أعضاء</span>
            </div>

            <div className="mt-3 space-y-2">
              {Array.from({ length: Math.min(team.memberCount, 3) }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                  عضو تجريبي {i + 1}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-400">آخر نشاط: {team.lastActivity}</span>
              <button className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                إدارة ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}