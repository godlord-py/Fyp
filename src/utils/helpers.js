// Date formatting utilities
export const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  
  export const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
  
  // Time formatting utilities
  export const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }
  
  export const formatTimeRemaining = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60
  
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  
  // Text utilities
  export const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + "..."
  }
  
  export const highlightText = (text, searchTerm) => {
    if (!searchTerm) return text
  
    const regex = new RegExp(`(${searchTerm})`, "gi")
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>')
  }
  
  // Array utilities
  export const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key]
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
      return groups
    }, {})
  }
  
  export const sortBy = (array, key, direction = "asc") => {
    return [...array].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
  
      if (direction === "desc") {
        return bVal > aVal ? 1 : -1
      }
      return aVal > bVal ? 1 : -1
    })
  }
  
  // Validation utilities
  export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  export const validateFile = (file, allowedTypes = [], maxSize = 10 * 1024 * 1024) => {
    const errors = []
  
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`)
    }
  
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    }
  }
  
  // Score calculation utilities
  export const calculateScore = (answers, questions) => {
    let correct = 0
    const total = questions.length
  
    questions.forEach((question) => {
      const userAnswer = answers[question.id]
      if (userAnswer && userAnswer.trim() !== "") {
        // For MCQ questions, check exact match
        if (question.type === "mcq" && userAnswer === question.correctAnswer) {
          correct++
        }
        // For subjective questions, we can't auto-grade, so assume correct if answered
        else if (question.type === "subjective" && userAnswer.trim() !== "") {
          // This would need manual grading in a real system
          correct++
        }
      }
    })
  
    return {
      correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    }
  }
  
  // Local storage utilities
  export const storage = {
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      } catch (error) {
        console.error("Error reading from localStorage:", error)
        return defaultValue
      }
    },
  
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.error("Error writing to localStorage:", error)
      }
    },
  
    remove: (key) => {
      try {
        localStorage.removeItem(key)
      } catch (error) {
        console.error("Error removing from localStorage:", error)
      }
    },
  
    clear: () => {
      try {
        localStorage.clear()
      } catch (error) {
        console.error("Error clearing localStorage:", error)
      }
    },
  }
  
  // Debounce utility for search
  export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  
  // Error handling utilities
  export const handleApiError = (error) => {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || error.response.data?.error || "Server error occurred",
        status: error.response.status,
        data: error.response.data,
      }
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: "Network error - please check your connection",
        status: 0,
        data: null,
      }
    } else {
      // Something else happened
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
        data: null,
      }
    }
  }
  
  // Subject and topic mapping utilities
  export const getSubjectTopics = (subject) => {
    const topicMap = {
      Physics: ["Mechanics", "Thermodynamics", "Optics", "Electricity", "Magnetism"],
      Chemistry: ["Organic Chemistry", "Physical Chemistry", "Inorganic Chemistry"],
      Mathematics: ["Calculus", "Algebra", "Trigonometry", "Statistics", "Geometry"],
      "Computer Science": ["Data Structures", "Algorithms", "Database", "Operating Systems", "Networks"],
      Electronics: ["Analog Circuits", "Digital Circuits", "Microprocessors", "Communication Systems"],
    }
  
    return topicMap[subject] || []
  }
  
  export const getDifficultyColor = (difficulty) => {
    const colorMap = {
      easy: "text-green-600 dark:text-green-400",
      medium: "text-orange-600 dark:text-orange-400",
      hard: "text-red-600 dark:text-red-400",
    }
  
    return colorMap[difficulty] || "text-gray-600 dark:text-gray-400"
  }
  
  export const getTypeLabel = (type) => {
    const labelMap = {
      mcq: "MCQ",
      subjective: "Subjective",
      numerical: "Numerical",
      true_false: "True/False",
    }
  
    return labelMap[type] || type
  }
  