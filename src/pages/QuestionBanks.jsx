import { mockQuestionBanks } from '../data/mockData.js'

const colorMap = {
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
}

const softColorMap = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
}

export default function QuestionBanks() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">بنوك الأسئلة</h2>
          <p className="text-sm text-slate-500 mt-1">أنشئ مجموعاتك من الأسئلة ونظّمها بسهولة</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow shadow-brand-600/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          بنك جديد
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockQuestionBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl ${colorMap[bank.color]} flex items-center justify-center text-white shadow`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-slate-400">{bank.updatedAt}</span>
            </div>

            <h3 className="mt-4 font-bold text-slate-800 line-clamp-1">{bank.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {bank.subject} · {bank.grades}
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {bank.tags.map((tag) => (
                <span key={tag} className={`text-xs px-2.5 py-1 rounded-full border ${softColorMap[bank.color]}`}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm text-slate-500">
                <strong className="text-slate-800">{bank.questionCount}</strong> سؤالاً
              </span>
              <button className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                فتح البنك ←
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}