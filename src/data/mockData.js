export const mockQuestionBanks = [
  {
    id: 'bank-1',
    title: 'بنك أسئلة الرياضيات - الصف الخامس',
    subject: 'رياضيات',
    grades: 'الخامس',
    questionCount: 48,
    tags: ['جمع', 'طرح', 'كسور'],
    updatedAt: '2026-09-05',
    color: 'indigo',
  },
  {
    id: 'bank-2',
    title: 'بنك أسئلة العلوم - الصف السادس',
    subject: 'علوم',
    grades: 'السادس',
    questionCount: 32,
    tags: ['طاقة', 'كائنات حية'],
    updatedAt: '2026-09-02',
    color: 'emerald',
  },
  {
    id: 'bank-3',
    title: 'بنك أسئلة اللغة العربية - الصف الرابع',
    subject: 'لغة عربية',
    grades: 'الرابع',
    questionCount: 55,
    tags: ['نحو', 'إملاء'],
    updatedAt: '2026-08-28',
    color: 'rose',
  },
]

export const mockTeams = [
  {
    id: 'team-1',
    name: 'فريق الرياضيات',
    teacherName: 'أ. أحمد',
    memberCount: 4,
    emoji: '📐',
    lastActivity: 'منذ ساعتين',
  },
  {
    id: 'team-2',
    name: 'نخبة العلوم',
    teacherName: 'أ. سارة',
    memberCount: 6,
    emoji: '🔬',
    lastActivity: 'أمس',
  },
  {
    id: 'team-3',
    name: 'رواد الحاسوب',
    teacherName: 'أ. خالد',
    memberCount: 3,
    emoji: '💻',
    lastActivity: 'منذ 3 أيام',
  },
]

export const mockChallenges = [
  {
    id: 'ch-1',
    title: 'تحدي الحساب الذهني السريع',
    description: 'منافسة بين فرق الصف الخامس في العمليات الحسابية.',
    status: 'نشط',
    teamCount: 3,
    endsIn: 'يومان',
    color: 'amber',
  },
  {
    id: 'ch-2',
    title: 'تحدي المعرفة العامة',
    description: 'أسئلة متنوعة في العلوم والجغرافيا والتاريخ.',
    status: 'قادم',
    teamCount: 5,
    endsIn: 'لم يبدأ',
    color: 'sky',
  },
]

export const mockSettingsProfile = {
  name: 'أ. ياسين',
  email: 'teacher@example.com',
  school: 'مدرسة النموذجية',
  subject: 'رياضيات',
  avatarColor: 'indigo',
}
