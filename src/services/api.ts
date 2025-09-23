import axios from "axios"

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000, // 30 seconds timeout for file uploads
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`)
    return config
  },
  (error) => {
    console.error("Request error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message.includes("ERR_CONNECTION_REFUSED")) {
      console.error("❌ Backend server is not running. Please start the backend server on port 5000.")
      error.message = "Backend server is not running. Please check if the server is started."
    } else {
      console.error("API Error:", error.response?.data || error.message)
    }
    return Promise.reject(error)
  },
)

// Paper API endpoints
export const paperAPI = {
  // Get all papers with optional filters
  getAllPapers: async (filters = {}) => {
    const params = new URLSearchParams()

    if (filters.subject && filters.subject !== "All") {
      params.append("subject", filters.subject)
    }
    if (filters.session && filters.session !== "All") {
      params.append("session", filters.session)
    }
    if (filters.search) {
      params.append("search", filters.search)
    }

    const response = await api.get(`/papers?${params.toString()}`)
    return response.data
  },

  // Get paper by ID
  getPaperById: async (id) => {
    const response = await api.get(`/papers/${id}`)
    return response.data
  },

  // Get questions from papers with filters
  getQuestions: async (filters = {}) => {
    const params = new URLSearchParams()

    if (filters.subject && filters.subject !== "All") {
      params.append("subject", filters.subject)
    }
    if (filters.topic && filters.topic !== "All") {
      params.append("topic", filters.topic)
    }
    if (filters.difficulty && filters.difficulty !== "All") {
      params.append("difficulty", filters.difficulty)
    }
    if (filters.type && filters.type !== "All") {
      params.append("type", filters.type)
    }
    if (filters.search) {
      params.append("search", filters.search)
    }

    const response = await api.get(`/questions?${params.toString()}`)
    return response.data
  },

  // Upload PDF file
  uploadPDF: async (file, onProgress) => {
    const formData = new FormData()
    formData.append("pdf", file)

    const response = await api.post("/upload-pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(percentCompleted)
        }
      },
    })

    return response.data
  },

  // Get unique subjects
  getSubjects: async () => {
    const response = await api.get("/subjects")
    return response.data
  },

  // Get unique sessions/years
  getSessions: async () => {
    const response = await api.get("/sessions")
    return response.data
  },
}

// Mock Test API endpoints
export const mockTestAPI = {
  // Generate mock test questions
  generateMockTest: async (config) => {
    const response = await api.post("/mock-test/generate", config)
    return response.data
  },

  // Save test results
  saveTestResults: async (testData) => {
    const response = await api.post("/mock-test/results", testData)
    return response.data
  },

  // Get test history
  getTestHistory: async () => {
    const response = await api.get("/mock-test/history")
    return response.data
  },
}

// AI Summarization API endpoints
export const summaryAPI = {
  // Generate summary
  generateSummary: async (content, options = {}) => {
    const response = await api.post("/summary/generate", {
      content,
      subject: options.subject || "General",
      detailLevel: options.detailLevel || "medium",
    })
    return response.data
  },

  // Get saved summaries
  getSummaries: async () => {
    const response = await api.get("/summaries")
    return response.data
  },

  // Save summary
  saveSummary: async (summaryData) => {
    const response = await api.post("/summaries", summaryData)
    return response.data
  },

  // Delete summary
  deleteSummary: async (id) => {
    const response = await api.delete(`/summaries/${id}`)
    return response.data
  },
}

// Statistics API endpoints
export const statsAPI = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get("/stats/dashboard")
    return response.data
  },

  // Get subject-wise statistics
  getSubjectStats: async () => {
    const response = await api.get("/stats/subjects")
    return response.data
  },
}

// Admin User Management API endpoints
export const adminUserAPI = {
  // Get all users with filters
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams()

    if (filters.role && filters.role !== "all") {
      params.append("role", filters.role)
    }
    if (filters.search) {
      params.append("search", filters.search)
    }
    if (filters.active !== undefined) {
      params.append("active", filters.active)
    }

    const response = await api.get(`/admin/users?${params.toString()}`)
    return response.data
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`)
    return response.data
  },

  // Update user
  updateUser: async (id, userData) => {
    const response = await api.put(`/admin/users/${id}`, userData)
    return response.data
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`)
    return response.data
  },

  // Get user statistics
  getUserStats: async () => {
    const response = await api.get("/admin/users/stats")
    return response.data
  },
}

// Admin Question Management API endpoints
export const adminQuestionAPI = {
  // Create new question
  createQuestion: async (questionData) => {
    const response = await api.post("/admin/questions", questionData)
    return response.data
  },

  // Update question
  updateQuestion: async (id, questionData) => {
    const response = await api.put(`/admin/questions/${id}`, questionData)
    return response.data
  },

  // Delete question
  deleteQuestion: async (id) => {
    const response = await api.delete(`/admin/questions/${id}`)
    return response.data
  },

  // Bulk import questions
  bulkImportQuestions: async (questionsData) => {
    const response = await api.post("/admin/questions/bulk-import", questionsData)
    return response.data
  },

  // Get question statistics
  getQuestionStats: async () => {
    const response = await api.get("/admin/questions/stats")
    return response.data
  },
}

// Admin Test Management API endpoints
export const adminTestAPI = {
  // Get all tests
  getAllTests: async (filters = {}) => {
    const params = new URLSearchParams()

    if (filters.subject && filters.subject !== "all") {
      params.append("subject", filters.subject)
    }
    if (filters.status && filters.status !== "all") {
      params.append("status", filters.status)
    }

    const response = await api.get(`/admin/tests?${params.toString()}`)
    return response.data
  },

  // Create new test
  createTest: async (testData) => {
    const response = await api.post("/admin/tests", testData)
    return response.data
  },

  // Update test
  updateTest: async (id, testData) => {
    const response = await api.put(`/admin/tests/${id}`, testData)
    return response.data
  },

  // Delete test
  deleteTest: async (id) => {
    const response = await api.delete(`/admin/tests/${id}`)
    return response.data
  },

  // Get test attempts/results
  getTestAttempts: async (testId) => {
    const response = await api.get(`/admin/tests/${testId}/attempts`)
    return response.data
  },

  // Get test statistics
  getTestStats: async () => {
    const response = await api.get("/admin/tests/stats")
    return response.data
  },
}

// Admin Subject Management API endpoints
export const adminSubjectAPI = {
  // Get all subjects
  getAllSubjects: async () => {
    const response = await api.get("/admin/subjects")
    return response.data
  },

  // Create new subject
  createSubject: async (subjectData) => {
    const response = await api.post("/admin/subjects", subjectData)
    return response.data
  },

  // Update subject
  updateSubject: async (id, subjectData) => {
    const response = await api.put(`/admin/subjects/${id}`, subjectData)
    return response.data
  },

  // Delete subject
  deleteSubject: async (id) => {
    const response = await api.delete(`/admin/subjects/${id}`)
    return response.data
  },
}

// Admin Analytics API endpoints
export const adminAnalyticsAPI = {
  // Get dashboard analytics
  getDashboardAnalytics: async (timeRange = "7d") => {
    const response = await api.get(`/admin/analytics/dashboard?timeRange=${timeRange}`)
    return response.data
  },

  // Get user growth analytics
  getUserGrowthAnalytics: async (timeRange = "6m") => {
    const response = await api.get(`/admin/analytics/user-growth?timeRange=${timeRange}`)
    return response.data
  },

  // Get test performance analytics
  getTestPerformanceAnalytics: async (timeRange = "30d") => {
    const response = await api.get(`/admin/analytics/test-performance?timeRange=${timeRange}`)
    return response.data
  },

  // Get feature usage analytics
  getFeatureUsageAnalytics: async (timeRange = "30d") => {
    const response = await api.get(`/admin/analytics/feature-usage?timeRange=${timeRange}`)
    return response.data
  },

  // Get subject-wise analytics
  getSubjectAnalytics: async () => {
    const response = await api.get("/admin/analytics/subjects")
    return response.data
  },
}

// Admin Settings API endpoints
export const adminSettingsAPI = {
  // Get all settings
  getSettings: async () => {
    const response = await api.get("/admin/settings")
    return response.data
  },

  // Update settings
  updateSettings: async (settingsData) => {
    const response = await api.put("/admin/settings", settingsData)
    return response.data
  },

  // Get system info
  getSystemInfo: async () => {
    const response = await api.get("/admin/system-info")
    return response.data
  },

  // Backup database
  backupDatabase: async () => {
    const response = await api.post("/admin/backup")
    return response.data
  },
}

// Consolidated admin API service
export const apiService = {
  // User endpoints
  getUsers: adminUserAPI.getAllUsers,
  getUserById: adminUserAPI.getUserById,
  updateUser: adminUserAPI.updateUser,
  deleteUser: adminUserAPI.deleteUser,
  getUserStats: adminUserAPI.getUserStats,

  // Question endpoints
  getQuestions: paperAPI.getQuestions,
  createQuestion: adminQuestionAPI.createQuestion,
  updateQuestion: adminQuestionAPI.updateQuestion,
  deleteQuestion: adminQuestionAPI.deleteQuestion,
  bulkImportQuestions: adminQuestionAPI.bulkImportQuestions,
  getQuestionStats: adminQuestionAPI.getQuestionStats,

  // Test endpoints
  getTests: adminTestAPI.getAllTests,
  createTest: adminTestAPI.createTest,
  updateTest: adminTestAPI.updateTest,
  deleteTest: adminTestAPI.deleteTest,
  getTestAttempts: adminTestAPI.getTestAttempts,
  getTestStats: adminTestAPI.getTestStats,

  // Subject endpoints
  getSubjects: adminSubjectAPI.getAllSubjects,
  createSubject: adminSubjectAPI.createSubject,
  updateSubject: adminSubjectAPI.updateSubject,
  deleteSubject: adminSubjectAPI.deleteSubject,

  // Analytics endpoints
  getDashboardAnalytics: adminAnalyticsAPI.getDashboardAnalytics,
  getUserGrowthAnalytics: adminAnalyticsAPI.getUserGrowthAnalytics,
  getTestPerformanceAnalytics: adminAnalyticsAPI.getTestPerformanceAnalytics,
  getFeatureUsageAnalytics: adminAnalyticsAPI.getFeatureUsageAnalytics,
  getSubjectAnalytics: adminAnalyticsAPI.getSubjectAnalytics,

  // Settings endpoints
  getSettings: adminSettingsAPI.getSettings,
  updateSettings: adminSettingsAPI.updateSettings,
  getSystemInfo: adminSettingsAPI.getSystemInfo,
  backupDatabase: adminSettingsAPI.backupDatabase,

  // File upload
  uploadPDF: paperAPI.uploadPDF,

  // Summary endpoints
  generateSummary: summaryAPI.generateSummary,
  getSummaries: summaryAPI.getSummaries,
  saveSummary: summaryAPI.saveSummary,
  deleteSummary: summaryAPI.deleteSummary,
}

export default api
