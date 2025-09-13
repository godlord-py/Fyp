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
