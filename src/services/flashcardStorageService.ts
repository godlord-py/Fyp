// SRS (Spaced Repetition System) with SM-2 algorithm for flashcard persistence
import type { Flashcard } from "./flashcardService"

export interface FlashcardWithSRS extends Flashcard {
  learnState: "new" | "learning" | "reviewing" | "mastered"
  interval: number // Days until next review
  easeFactor: number // SM-2 ease factor (starting at 2.5)
  repetitions: number // Number of times reviewed
  lastReviewDate: string | null
  nextReviewDate: string | null
}

export interface StudySession {
  id: string
  sessionName: string
  cardIds: string[]
  startDate: string
  endDate?: string
  totalCards: number
  cardsLearned: number
  cardsReviewed: number
}

const STORAGE_KEY = "flashcards_srs"
const SESSIONS_KEY = "flashcard_sessions"

export const flashcardStorageService = {
  // Initialize flashcards with SRS data
  initializeFlashcards(flashcards: Flashcard[]): FlashcardWithSRS[] {
    return flashcards.map((card) => ({
      ...card,
      learnState: "new",
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewDate: null,
      nextReviewDate: null,
    }))
  },

  // Save flashcards to localStorage
  saveFlashcards(flashcards: FlashcardWithSRS[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flashcards))
      console.log("[v0] Flashcards saved to storage")
    } catch (error) {
      console.error("[v0] Error saving flashcards:", error)
    }
  },

  // Load flashcards from localStorage
  loadFlashcards(): FlashcardWithSRS[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("[v0] Error loading flashcards:", error)
      return []
    }
  },

  // Update card learning state using SM-2 algorithm
  updateCardReview(
    card: FlashcardWithSRS,
    quality: number, // 0-5: how well user knew the answer
  ): FlashcardWithSRS {
    const now = new Date()
    if (isNaN(now.getTime())) {
      console.error("[v0] Invalid date in updateCardReview")
      return card
    }

    const newReps = card.repetitions + 1
    let newInterval = 1
    let newEase = card.easeFactor

    // SM-2 Algorithm
    newEase = Math.max(1.3, card.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

    if (quality >= 3) {
      // Correct answer
      if (card.repetitions === 0) {
        newInterval = 1
      } else if (card.repetitions === 1) {
        newInterval = 3
      } else {
        newInterval = Math.round(card.interval * newEase)
      }
    } else {
      // Incorrect answer - reset
      newInterval = 1
    }

    if (newInterval < 1) newInterval = 1
    if (!isFinite(newInterval)) newInterval = 1

    const nextReviewDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000)

    if (isNaN(nextReviewDate.getTime())) {
      console.error("[v0] Invalid nextReviewDate calculated", { newInterval, now })
      return card
    }

    return {
      ...card,
      repetitions: newReps,
      easeFactor: newEase,
      interval: newInterval,
      lastReviewDate: now.toISOString(),
      nextReviewDate: nextReviewDate.toISOString(),
      learnState: quality >= 4 ? "mastered" : quality >= 3 ? "reviewing" : newReps > 2 ? "learning" : "new",
    }
  },

  // Get cards due for review
  getCardsDueForReview(flashcards: FlashcardWithSRS[]): FlashcardWithSRS[] {
    const now = new Date()
    return flashcards.filter((card) => {
      if (card.learnState === "new") return true
      if (card.learnState === "mastered") return false
      if (card.nextReviewDate) {
        return new Date(card.nextReviewDate) <= now
      }
      return true
    })
  },

  // Create study session
  createSession(sessionName: string, cardIds: string[]): StudySession {
    const session: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      sessionName,
      cardIds,
      startDate: new Date().toISOString(),
      totalCards: cardIds.length,
      cardsLearned: 0,
      cardsReviewed: 0,
    }

    try {
      const sessions = this.loadSessions()
      sessions.push(session)
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    } catch (error) {
      console.error("[v0] Error creating session:", error)
    }

    return session
  },

  // Load all sessions
  loadSessions(): StudySession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error("[v0] Error loading sessions:", error)
      return []
    }
  },

  // Export flashcards to CSV
  exportToCSV(flashcards: FlashcardWithSRS[]): string {
    const headers = [
      "Front",
      "Back",
      "Subject",
      "Difficulty",
      "Learn State",
      "Repetitions",
      "Ease Factor",
      "Next Review Date",
    ]
    const rows = flashcards.map((card) => [
      `"${card.front.replace(/"/g, '""')}"`,
      `"${card.back.replace(/"/g, '""')}"`,
      card.subject,
      card.difficulty,
      card.learnState,
      card.repetitions,
      card.easeFactor.toFixed(2),
      card.nextReviewDate ? new Date(card.nextReviewDate).toLocaleDateString() : "Today",
    ])

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
  },

  // Import flashcards from CSV
  importFromCSV(csvContent: string): FlashcardWithSRS[] {
    const lines = csvContent.trim().split("\n")
    const headers = lines[0].split(",")
    const flashcards: FlashcardWithSRS[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length >= 4) {
        flashcards.push({
          id: Math.random().toString(36).substr(2, 9),
          front: values[0],
          back: values[1],
          subject: values[2],
          difficulty: (values[3] as any) || "medium",
          source: "Imported from CSV",
          learnState: (values[4] as any) || "new",
          repetitions: Number.parseInt(values[5]) || 0,
          easeFactor: Number.parseFloat(values[6]) || 2.5,
          interval: 1,
          lastReviewDate: null,
          nextReviewDate: values[7] || null,
        })
      }
    }

    return flashcards
  },

  // Helper: Parse CSV line with quoted values
  parseCSVLine(line: string): string[] {
    const result = []
    let current = ""
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          current += '"'
          i++
        } else {
          insideQuotes = !insideQuotes
        }
      } else if (char === "," && !insideQuotes) {
        result.push(current)
        current = ""
      } else {
        current += char
      }
    }

    result.push(current)
    return result
  },

  // Clear all data
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SESSIONS_KEY)
  },
}
