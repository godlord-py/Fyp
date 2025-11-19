import React, { createContext, useContext, useState, useEffect } from "react"

interface BookmarkedQuestion {
  id: string
  [key: string]: any
}

interface BookmarkContextType {
  bookmarkedQuestions: BookmarkedQuestion[]
  addBookmark: (question: BookmarkedQuestion) => void
  removeBookmark: (questionId: string) => void
  isBookmarked: (questionId: string) => boolean
  clearAllBookmarks: () => void
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([])

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("bookmarked_questions")
    if (saved) {
      try {
        setBookmarkedQuestions(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load bookmarks:", e)
      }
    }
  }, [])

  // Save to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem("bookmarked_questions", JSON.stringify(bookmarkedQuestions))
  }, [bookmarkedQuestions])

  const addBookmark = (question: BookmarkedQuestion) => {
    setBookmarkedQuestions((prev) => {
      if (prev.some((q) => q.id === question.id)) return prev
      return [...prev, question]
    })
  }

  const removeBookmark = (questionId: string) => {
    setBookmarkedQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const isBookmarked = (questionId: string) => {
    return bookmarkedQuestions.some((q) => q.id === questionId)
  }

  const clearAllBookmarks = () => {
    setBookmarkedQuestions([])
  }

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedQuestions,
        addBookmark,
        removeBookmark,
        isBookmarked,
        clearAllBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  )
}

export const useBookmarks = () => {
  const context = useContext(BookmarkContext)
  if (!context) {
    throw new Error("useBookmarks must be used within BookmarkProvider")
  }
  return context
}
