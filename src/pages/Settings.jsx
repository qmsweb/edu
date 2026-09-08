import { mockSettingsProfile } from '../data/mockData.js'

const toggleItem =
  'relative inline-flex h-6 w-11 items-center rounded-full bg-brand-600 cursor-pointer'

const toggleDot = 'inline-block h-4 w-4 transform translate-x-1 rounded-full bg-white'

export default function Settings() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">الإعدادات</h2>
        <p className="text-sm text-slate-500 mt-1">إدارة ملفك الشخصي وتفضيلات التطبيق</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-5">الملف الشخصي</h3>

        <div className="flex flex-wrap items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold shadow">
            {mockSettingsProfile.name.split(' ').pop()
              ? mockSettingsProfile.name.replace('أ. ', '').charAt(0)
              : 'ي'}
          </div>

          <div className="flex-1 min-w-[200px] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">الاسم</label>
                <input
                  readOnly
                  defaultValue={mockSettingsProfile.name}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">البريد الإلكتروني</label>
                <input
                  readOnly
                  defaultValue={mockSettingsProfile.email}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">المدرسة</label>
                <input
                  readOnly
                  defaultValue={mockSettingsProfile.school}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">المادة</label>
                <input
                  readOnly
                  defaultValue={mockSettingsProfile.subject}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600"
                />
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors">
              حفظ التعديلات
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h3 className="font-bold text-slate-800">تفضيلات التطبيق</h3>

        {[
          { title: 'الإشعارات الفورية', desc: 'إشعار عند إطلاق تحدٍ جديد أو انضمام فريق' },
          { title: 'الوضع الليلي', desc: 'تبديل المظهر إلى ألوان داكنة (قريباً)' },
          { title: 'اللغة', desc: 'اللغة الحالية: العربية (RTL)' },
        ].map((pref, i) => (
          <div key={pref.title} className="flex items-center justify-between gap-4 py-1">
            <div>
              <p className="text-sm font-semibold text-slate-700">{pref.title}</p>
              <p className="text-xs text-slate-400">{pref.desc}</p>
            </div>
            <div className={toggleItem}>
              <span className={toggleDot}></span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-rose-700">منطقة الخطر</p>
          <p className="text-xs text-rose-500">إزالة جميع البيانات المحلية من المتصفح</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 transition-colors">
          مسح البيانات
        </button>
      </div>
    </div>
  )
}