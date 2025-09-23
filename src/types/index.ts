export interface User {
  id: string
  email: string
  name: string
  role: "student" | "admin"
  class?: string
  subjects?: string[]
  createdAt: string
}

export interface Question {
  id: string
  subject: string
  year: number
  topic: string
  questionText: string
  type: "mcq" | "subjective"
  difficulty: "easy" | "medium" | "hard"
  options?: string[]
  correctAnswer?: string
  tags: string[]
  isImportant?: boolean
}

export interface Test {
  id: string
  title: string
  subject: string
  questions: Question[]
  duration: number
  totalMarks: number
  createdAt: string
}

export interface TestAttempt {
  id: string
  testId: string
  userId: string
  answers: Record<string, string>
  score: number
  completedAt: string
  timeSpent: number
}

export interface Summary {
  id: string
  title: string
  content: string
  subject: string
  detailLevel: "short" | "medium" | "detailed"
  createdAt: string
}

export interface PlannerTask {
  id: string
  title: string
  subject: string
  type: "study" | "revision" | "test"
  dueDate: string
  completed: boolean
  priority: "low" | "medium" | "high"
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, role: "student" | "admin") => Promise<void>
  logout: () => void
  loading: boolean
}


// Question type definitions
export const QuestionTypes = {
  MCQ: "mcq",
  SUBJECTIVE: "subjective",
  NUMERICAL: "numerical",
  TRUE_FALSE: "true_false",
}

export const DifficultyLevels = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
}

export const DetailLevels = {
  SHORT: "short",
  MEDIUM: "medium",
  DETAILED: "detailed",
}

// Default question structure
export const createQuestion = (data = {}) => ({
  id: data.id || "",
  questionText: data.questionText || data.question_text || "",
  questionNumber: data.questionNumber || data.question_number || "",
  marks: data.marks || 0,
  subject: data.subject || "",
  topic: data.topic || "",
  difficulty: data.difficulty || DifficultyLevels.MEDIUM,
  type: data.type || QuestionTypes.SUBJECTIVE,
  year: data.year || new Date().getFullYear(),
  session: data.session || "",
  courseOutcome: data.courseOutcome || data.course_outcome || "",
  tags: data.tags || [],
  isImportant: data.isImportant || false,
  options: data.options || [],
  correctAnswer: data.correctAnswer || "",
  explanation: data.explanation || "",
  tableData: data.tableData || data.table_data || null,
  imageDescription: data.imageDescription || data.image_description || "",
})

// Paper structure
export const createPaper = (data = {}) => ({
  id: data.id || data._id || "",
  collegeName: data.collegeName || data.college_name || "",
  isAutonomous: data.isAutonomous || data.is_autonomous || false,
  examinationName: data.examinationName || data.examination_name || "",
  session: data.session || "",
  courseLevel: data.courseLevel || data.course_level || "",
  term: data.term || "",
  subjectCode: data.subjectCode || data.subject_code || "",
  subjectName: data.subjectName || data.subject_name || "",
  departments: data.departments || [],
  durationMinutes: data.durationMinutes || data.duration_minutes || 0,
  maxMarks: data.maxMarks || data.max_marks || 0,
  instructions: data.instructions || [],
  questions: (data.questions || []).map(createQuestion),
  createdAt: data.createdAt || data.created_at || new Date().toISOString(),
  updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
})

// Summary structure
export const createSummary = (data = {}) => ({
  id: data.id || data._id || "",
  title: data.title || "",
  content: data.content || "",
  subject: data.subject || "",
  detailLevel: data.detailLevel || data.detail_level || DetailLevels.MEDIUM,
  createdAt: data.createdAt || data.created_at || new Date().toISOString(),
  updatedAt: data.updatedAt || data.updated_at || new Date().toISOString(),
})

// Test configuration structure
export const createTestConfig = (data = {}) => ({
  subject: data.subject || "All",
  topics: data.topics || [],
  difficulty: data.difficulty || [],
  questionTypes: data.questionTypes || data.question_types || [],
  questionCount: data.questionCount || data.question_count || 10,
  duration: data.duration || 30,
})

// Test result structure
export const createTestResult = (data = {}) => ({
  id: data.id || data._id || "",
  testConfig: createTestConfig(data.testConfig || data.test_config || {}),
  questions: (data.questions || []).map(createQuestion),
  answers: data.answers || {},
  score: data.score || 0,
  totalQuestions: data.totalQuestions || data.total_questions || 0,
  correctAnswers: data.correctAnswers || data.correct_answers || 0,
  timeSpent: data.timeSpent || data.time_spent || 0,
  completedAt: data.completedAt || data.completed_at || new Date().toISOString(),
})
