const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
const API_TIMEOUT = 30000

const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    console.log(`Making ${options.method || "GET"} request to ${url}`)

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === "AbortError") {
      throw new Error("Request timeout")
    }

    if (error.message.includes("Failed to fetch") || error.message.includes("ERR_NETWORK")) {
      console.error("❌ Backend server is not running. Please start the backend server on port 5000.")
      throw new Error("Backend server is not running. Please check if the server is started.")
    }

    console.error("API Error:", error.message)
    throw error
  }
}

const handleJsonResponse = async (response: Response) => {
  try {
    return await response.json()
  } catch (error) {
    console.error("Failed to parse JSON response:", error)
    throw new Error("Invalid JSON response from server")
  }
}

export const paperAPI = {
  getAllPapers: async (filters: any = {}) => {
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

    const response = await fetchWithTimeout(`${API_BASE_URL}/papers?${params.toString()}`)
    return await handleJsonResponse(response)
  },

  getPaperById: async (id: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/papers/${id}`)
    return await handleJsonResponse(response)
  },

  getQuestions: async (filters: any = {}) => {
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
    if (filters.limit) {
      params.append("limit", filters.limit.toString())
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/questions?${params.toString()}`)
    return await handleJsonResponse(response)
  },

  getSolution: async (questionId: string) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/solutions/${questionId}`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.log(`No solution found in database for question ${questionId}`)
      return null
    }
  },

  uploadPDF: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append("pdf", file)

    if (onProgress) {
      onProgress(0)
    }

    const response = await fetchWithTimeout(`${API_BASE_URL}/upload-pdf`, {
      method: "POST",
      body: formData,
      headers: {} as any,
    })

    if (onProgress) {
      onProgress(100)
    }

    return await handleJsonResponse(response)
  },

  getSubjects: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/subjects`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.warn("Using mock subjects data")
      return ["Physics", "Chemistry", "Mathematics", "Computer Science", "Biology"]
    }
  },

  getSessions: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/sessions`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.warn("Using mock sessions data")
      return ["2024", "2023", "2022", "2021", "2020"]
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/dashboard/stats`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.warn("Using mock dashboard stats")
      return {
        totalPapers: 150,
        totalQuestions: 2500,
        totalSubjects: 5,
        recentActivity: [],
      }
    }
  },

  getPapers: async (filters: any = {}) => {
    return await paperAPI.getAllPapers(filters)
  },
}

export const mockTestAPI = {
  generateMockTest: async (config: any) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/mock-test/generate`, {
      method: "POST",
      body: JSON.stringify(config),
    })
    return await handleJsonResponse(response)
  },

  saveTestResults: async (testData: any) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/mock-test/results`, {
      method: "POST",
      body: JSON.stringify(testData),
    })
    return await handleJsonResponse(response)
  },

  getTestHistory: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/mock-test/history`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.warn("Using mock test history data")
      return []
    }
  },
}

export const summaryAPI = {
  generateSummary: async (content: string, options: any = {}) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/summary/generate`, {
      method: "POST",
      body: JSON.stringify({
        content,
        subject: options.subject || "General",
        detailLevel: options.detailLevel || "medium",
      }),
    })
    return await handleJsonResponse(response)
  },

  getSummaries: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/summaries`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.warn("Using mock summaries data")
      return []
    }
  },

  saveSummary: async (summaryData: any) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/summaries`, {
      method: "POST",
      body: JSON.stringify(summaryData),
    })
    return await handleJsonResponse(response)
  },

  deleteSummary: async (id: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/summaries/${id}`, {
      method: "DELETE",
    })
    return await handleJsonResponse(response)
  },
}

export const statsAPI = {
  getDashboardStats: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/stats/dashboard`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.warn("Using mock dashboard stats")
      return {
        totalQuestions: 2500,
        totalTests: 45,
        averageScore: 78,
        studyStreak: 12,
      }
    }
  },

  getSubjectStats: async () => {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/stats/subjects`)
      return await handleJsonResponse(response)
    } catch (error) {
      console.warn("Using mock subject stats")
      return {
        Physics: { questions: 500, averageScore: 75 },
        Chemistry: { questions: 450, averageScore: 82 },
        Mathematics: { questions: 600, averageScore: 70 },
        "Computer Science": { questions: 400, averageScore: 85 },
        Biology: { questions: 350, averageScore: 78 },
      }
    }
  },
}

export const handleApiError = (error: any) => {
  if (error.message.includes("Backend server is not running")) {
    return {
      message: "Backend server is not running. Please check if the server is started.",
      type: "connection",
    }
  }

  if (error.message.includes("Failed to fetch") || error.message.includes("ERR_NETWORK")) {
    return {
      message: "Cannot connect to the API server. Please check your connection and ensure the backend is running.",
      type: "network",
    }
  }

  return {
    message: error.message || "An unexpected error occurred",
    type: "unknown",
  }
}

export default {
  get: async (url: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${url}`)
    return { data: await handleJsonResponse(response) }
  },
  post: async (url: string, data: any) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${url}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
    return { data: await handleJsonResponse(response) }
  },
  delete: async (url: string) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}${url}`, {
      method: "DELETE",
    })
    return { data: await handleJsonResponse(response) }
  },
}
