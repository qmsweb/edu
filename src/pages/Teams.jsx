import { useState } from 'react'
import {
  loadTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  addTeamPoints,
} from '../utils/storage.js'

const avatarColors = [
  'bg-brand-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-sky-500',
  'bg-violet-500',
]

const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition'

export default function Teams() {
  const [teams, setTeams] = useState(loadTeams)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingName, setEditingName] = useState('')

  function refresh() {
    setTeams(loadTeams())
  }

  function handleCreate(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    createTeam(name)
    setNewName('')
    setShowCreate(false)
    refresh()
  }

  function startEditing(team) {
    setEditingId(team.id)
    setEditingName(team.name)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditingName('')
  }

  function saveEditing(e) {
    e.preventDefault()
    const name = editingName.trim()
    if (!name || !editingId) return
    updateTeam(editingId, { name })
    cancelEditing()
    refresh()
  }

  function handleDelete(id) {
    if (!confirm('هل أنت متأكد من حذف هذا الفريق؟')) return
    deleteTeam(id)
    refresh()
  }

  function handlePoints(id, delta) {
    addTeamPoints(id, delta)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">الفرق</h2>
          <p className="text-sm text-slate-500 mt-1">قسّم طلابك إلى فرق وتابع نقاط كل فريق</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow shadow-brand-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          فريق جديد
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold">لا توجد فرق بعد</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">أضف أسماء الفرق المشاركة وستبدأ نقاط كل فريق من الصفر</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            إضافة فريق
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {teams.map((team, index) => {
            const color = avatarColors[index % avatarColors.length]
            const initial = team.name.trim().charAt(0) || '؟'
            return (
              <div
                key={team.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-shadow"
              >
                <div className="flex items-center justify-between">
                  {editingId === team.id ? (
                    <form onSubmit={saveEditing} className="flex flex-1 items-center gap-2">
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className={`${inputClass} flex-1`}
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                      >
                        حفظ
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                      >
                        إلغاء
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center text-xl font-bold shadow`}>
                          {initial}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{team.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">فريق #{index + 1}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(team.id)}
                        className="p-2 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        aria-label="حذف الفريق"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>

                {editingId !== team.id && (
                  <>
                    <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-500 text-white p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-white/80">النقاط</p>
                        <p className="text-3xl font-bold mt-1 tabular-nums">{team.points}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePoints(team.id, 1)}
                          className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center font-bold text-lg"
                          aria-label="إضافة نقطة"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handlePoints(team.id, -1)}
                          disabled={!team.points}
                          className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label="إنقاص نقطة"
                        >
                          −
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <button
                        onClick={() => startEditing(team)}
                        className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        تعديل الاسم
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)}></div>
          <form
            onSubmit={handleCreate}
            className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-xl"
          >
            <h3 className="font-bold text-slate-800 text-lg">إضافة فريق جديد</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">اكتب اسم الفريق فقط، وستكون نقاطه صفراً في البداية</p>

            <label className="block text-xs font-semibold text-slate-500 mb-1">اسم الفريق</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="فريق النسر"
              className={`${inputClass} mb-5`}
              autoFocus
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                إضافة
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}