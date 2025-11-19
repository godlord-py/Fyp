// Bookmark management utility - uses localStorage similar to solution-service pattern
const BOOKMARKS_STORAGE_KEY = "pyq_bookmarks"

export interface BookmarkedQuestion {
  id: string
  questionNumber: number
  subject: string
  topic: string
  difficulty: string
  marks: number
  questionText: string
  type: string
  subjectCode: string
  session: string
  isImportant?: boolean
  tags?: string[]
  tableData?: { headers: string[]; rows: string[][] }
  imageDescription?: string
  courseOutcome?: string
}

export const bookmarkService = {
  // Get all bookmarked questions
  getBookmarks: (): BookmarkedQuestion[] => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading bookmarks:", error)
      return []
    }
  },

  // Add a question to bookmarks
  addBookmark: (question: BookmarkedQuestion): void => {
    try {
      const bookmarks = bookmarkService.getBookmarks()
      // Avoid duplicates
      if (!bookmarks.find((q) => q.id === question.id)) {
        bookmarks.push(question)
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks))
      }
    } catch (error) {
      console.error("Error adding bookmark:", error)
    }
  },

  // Remove a question from bookmarks
  removeBookmark: (questionId: string): void => {
    try {
      const bookmarks = bookmarkService.getBookmarks()
      const filtered = bookmarks.filter((q) => q.id !== questionId)
      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("Error removing bookmark:", error)
    }
  },

  // Check if a question is bookmarked
  isBookmarked: (questionId: string): boolean => {
    const bookmarks = bookmarkService.getBookmarks()
    return bookmarks.some((q) => q.id === questionId)
  },

  // Clear all bookmarks
  clearAllBookmarks: (): void => {
    try {
      localStorage.removeItem(BOOKMARKS_STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing bookmarks:", error)
    }
  },
}
