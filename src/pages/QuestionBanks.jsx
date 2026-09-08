import { useId, useState } from 'react'
import {
  loadQuestionBanks,
  createQuestionBank,
  deleteQuestionBank,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from '../utils/storage.js'

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

const inputClass =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition'

const blankForm = { type: 'text', text: '', options: ['', '', '', ''], correctIndex: -1 }

export default function QuestionBanks() {
  const [banks, setBanks] = useState(loadQuestionBanks)
  const [openBankId, setOpenBankId] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createTitle, setCreateTitle] = useState('')
  const [newQuestion, setNewQuestion] = useState(blankForm)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [editingQuestion, setEditingQuestion] = useState(blankForm)

  const openBank = banks.find((b) => b.id === openBankId) || null
  const bank = openBank

  function refresh() {
    setBanks(loadQuestionBanks())
  }

  function handleCreateBank(e) {
    e.preventDefault()
    const title = createTitle.trim()
    if (!title) return
    const created = createQuestionBank({ title })
    setCreateTitle('')
    setShowCreate(false)
    refresh()
    setOpenBankId(created.id)
  }

  function handleDeleteBank(id) {
    if (!confirm('هل أنت متأكد من حذف هذا البنك وجميع أسئلته؟')) return
    deleteQuestionBank(id)
    if (openBankId === id) setOpenBankId(null)
    refresh()
  }

  function handleAddQuestion(e) {
    e.preventDefault()
    if (!openBank) return
    const payload = buildPayload(newQuestion)
    if (!payload) return
    addQuestion(openBank.id, payload)
    setNewQuestion(blankForm)
    refresh()
  }

  function startEditing(question) {
    const q = { ...question }
    setEditingQuestion({
      type: q.type === 'mc' ? 'mc' : 'text',
      text: q.text || '',
      options: Array.isArray(q.options) && q.options.length ? [...q.options] : ['', '', '', ''],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : -1,
    })
    setEditingQuestionId(question.id)
  }

  function cancelEditing() {
    setEditingQuestionId(null)
    setEditingQuestion(blankForm)
  }

  function saveEditing(e) {
    e.preventDefault()
    if (!openBank) return
    const payload = buildPayload(editingQuestion)
    if (!payload) return
    updateQuestion(openBank.id, editingQuestionId, payload)
    cancelEditing()
    refresh()
  }

  function handleDeleteQuestion(id) {
    if (!confirm('حذف هذا السؤال؟')) return
    deleteQuestion(openBank.id, id)
    refresh()
  }

  function buildPayload(form) {
    const text = form.text.trim()
    if (!text) return null
    if (form.type === 'mc') {
      const options = form.options.map((o) => o.trim())
      if (options.some((o) => !o)) {
        alert('يرجى تعبئة جميع الخيارات')
        return null
      }
      if (form.correctIndex < 0 || form.correctIndex >= options.length) {
        alert('يرجى تحديد الخيار الصحيح')
        return null
      }
      return { type: 'mc', text, options, correctIndex: form.correctIndex }
    }
    return { type: 'text', text, options: null, correctIndex: null }
  }

  if (bank) {
    const questions = bank.questions || []
    return (
      <div className="space-y-6 max-w-3xl">
        <div>
          <button
            onClick={() => setOpenBankId(null)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
          >
            <span>→</span>
            العودة إلى البنوك
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${colorMap[bank.color]} flex items-center justify-center text-white shadow`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">{bank.title}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {bank.subject ? `${bank.subject} · ` : ''}
                  <strong className="text-slate-700">{questions.length}</strong> سؤالاً
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteBank(bank.id)}
              className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 text-sm font-semibold hover:bg-rose-50 transition-colors"
            >
              حذف البنك
            </button>
          </div>
        </div>

        <QuestionForm
          form={newQuestion}
          setForm={setNewQuestion}
          onSubmit={handleAddQuestion}
          submitLabel="إضافة سؤال"
          placeholder="اكتب السؤال الجديد هنا..."
        />

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
          {questions.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-400 text-sm">لا توجد أسئلة بعد — ابدأ بإضافة أول سؤال</p>
            </div>
          ) : (
            questions.map((question, index) =>
              editingQuestionId === question.id ? (
                <div key={question.id} className="p-5 border-t border-slate-100 bg-slate-50/50">
                  <QuestionForm
                    form={editingQuestion}
                    setForm={setEditingQuestion}
                    onSubmit={saveEditing}
                    submitLabel="حفظ التعديل"
                    onCancel={cancelEditing}
                  />
                </div>
              ) : (
                <QuestionRow
                  key={question.id}
                  index={index}
                  question={question}
                  onEdit={() => startEditing(question)}
                  onDelete={() => handleDeleteQuestion(question.id)}
                />
              )
            )
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">بنوك الأسئلة</h2>
          <p className="text-sm text-slate-500 mt-1">أنشئ مجموعاتك من الأسئلة ونظّمها بسهولة</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow shadow-brand-600/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          بنك جديد
        </button>
      </div>

      {banks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold">لا توجد بنوك أسئلة بعد</p>
          <p className="text-sm text-slate-400 mt-1 mb-5">أنشئ أول بنك مثل «الوحدة الأولى» وابدأ بإضافة الأسئلة</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
          >
            إنشاء بنك جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banks.map((bank) => (
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
                <button
                  onClick={() => handleDeleteBank(bank.id)}
                  className="p-2 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="حذف البنك"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <h3 className="mt-4 font-bold text-slate-800 line-clamp-1">{bank.title}</h3>
              {bank.subject && <p className="mt-1 text-sm text-slate-500">{bank.subject}</p>}

              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${softColorMap[bank.color]}`}>
                  {(bank.questions || []).length} سؤالاً
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <button
                  onClick={() => setOpenBankId(bank.id)}
                  className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                >
                  فتح البنك ←
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCreate(false)}></div>
          <form
            onSubmit={handleCreateBank}
            className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-xl"
          >
            <h3 className="font-bold text-slate-800 text-lg">إنشاء بنك أسئلة جديد</h3>
            <p className="text-sm text-slate-500 mt-1 mb-5">مثال: «الوحدة الأولى - الجمع والطرح»</p>

            <label className="block text-xs font-semibold text-slate-500 mb-1">عنوان البنك</label>
            <input
              value={createTitle}
              onChange={(e) => setCreateTitle(e.target.value)}
              placeholder="الوحدة الأولى"
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
                إنشاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function QuestionForm({ form, setForm, onSubmit, submitLabel, placeholder, onCancel }) {
  const correctName = useId()
  const isMc = form.type === 'mc'

  function setType(type) {
    setForm({ ...form, type, correctIndex: type === 'mc' ? form.correctIndex : -1 })
  }

  function setOption(i, value) {
    const options = form.options.map((o, idx) => (idx === i ? value : o))
    setForm({ ...form, options })
  }

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setType('text')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            !isMc ? 'bg-brand-600 text-white shadow shadow-brand-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          سؤال نصي
        </button>
        <button
          type="button"
          onClick={() => setType('mc')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isMc ? 'bg-brand-600 text-white shadow shadow-brand-600/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          اختيار من متعدد
        </button>
      </div>

      <input
        value={form.text}
        onChange={(e) => setForm({ ...form, text: e.target.value })}
        placeholder={placeholder || 'اكتب السؤال...'}
        className={inputClass}
      />

      {isMc && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-semibold text-slate-500">الخيارات</label>
            <label className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-3 h-3 rounded-full border border-brand-500 inline-block"></span>
              اضغط دائرة الخيار الصحيح
            </label>
          </div>
          {form.options.map((option, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 rounded-xl border p-2.5 cursor-pointer transition-colors ${
                form.correctIndex === i
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                {String.fromCharCode(65 + i)}
              </span>
              <input
                value={option}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`الخيار ${String.fromCharCode(65 + i)}...`}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <input
                type="radio"
                name={correctName}
                checked={form.correctIndex === i}
                onChange={() => setForm({ ...form, correctIndex: i })}
                className="w-4 h-4 shrink-0 text-brand-600 focus:ring-brand-500"
              />
            </label>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            إلغاء
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors shadow shadow-brand-600/20"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function QuestionRow({ index, question, onEdit, onDelete }) {
  const isMc = question.type === 'mc'
  return (
    <div className="p-5 flex items-start gap-4">
      <span className="w-7 h-7 shrink-0 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
              isMc ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {isMc ? 'اختيار من متعدد' : 'نصي'}
          </span>
        </div>
        <p className="text-slate-700 leading-relaxed">{question.text}</p>
        {isMc && Array.isArray(question.options) && (
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {question.options.map((option, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                  question.correctIndex === i
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="w-5 h-5 shrink-0 rounded-full bg-white border border-slate-200 text-slate-500 text-[10px] font-bold flex items-center justify-center">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="truncate">{option}</span>
                {question.correctIndex === i && (
                  <svg className="w-3.5 h-3.5 shrink-0 ml-auto text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          aria-label="تعديل السؤال"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          aria-label="حذف السؤال"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}