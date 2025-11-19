import { paperAPI } from "./api"

export interface MockPaper {
  id: string
  title: string
  subjectName: string
  subjectCode: string
  paperNumber: number
  questions: any[]
  totalMarks: number
  duration: number
  description: string
}

export const mockPaperService = {
  /**
   * Fetch all papers from backend and generate mock papers
   * Groups questions by subject, creates papers with 10 questions each
   */
  async generateMockPapers(): Promise<MockPaper[]> {
    try {
      const response = await paperAPI.getPapers()
      const papers = response.papers || []

      // Group papers by subject_name
      const groupedBySubject: { [key: string]: any[] } = {}

      papers.forEach((paper: any) => {
        const subjectName = paper.subject_name || "General"
        const subjectCode = paper.subject_code || "GEN"

        if (!groupedBySubject[subjectName]) {
          groupedBySubject[subjectName] = []
        }

        groupedBySubject[subjectName].push({
          ...paper,
          subjectName,
          subjectCode,
        })
      })

      // Generate mock papers (10 questions per mock paper)
      const mockPapers: MockPaper[] = []
      const QUESTIONS_PER_PAPER = 10

      Object.entries(groupedBySubject).forEach(([subjectName, subjectPapers]) => {
        // Collect all questions from this subject across all papers
        const allQuestions: any[] = []

        subjectPapers.forEach((paper: any) => {
          if (paper.questions && Array.isArray(paper.questions)) {
            allQuestions.push(...paper.questions)
          }
        })

        // Create mock papers with 10 questions each
        const paperCount = Math.ceil(allQuestions.length / QUESTIONS_PER_PAPER)

        for (let i = 0; i < paperCount; i++) {
          const startIdx = i * QUESTIONS_PER_PAPER
          const endIdx = startIdx + QUESTIONS_PER_PAPER
          const mockQuestions = allQuestions.slice(startIdx, endIdx)

          if (mockQuestions.length > 0) {
            const totalMarks = mockQuestions.reduce((sum: number, q: any) => sum + (q.marks || 0), 0)

            mockPapers.push({
              id: `mock-${subjectName.replace(/\s+/g, "-")}-${i + 1}`,
              title: `Mock ${subjectName} Paper ${i + 1}`,
              subjectName,
              subjectCode: subjectPapers[0]?.subjectCode || "GEN",
              paperNumber: i + 1,
              questions: mockQuestions,
              totalMarks,
              duration: mockQuestions.length * 1, // 1 minute per question baseline
              description: `${mockQuestions.length} questions from ${subjectName}`,
            })
          }
        }
      })

      // Sort by subject name then paper number
      mockPapers.sort((a, b) => {
        if (a.subjectName !== b.subjectName) {
          return a.subjectName.localeCompare(b.subjectName)
        }
        return a.paperNumber - b.paperNumber
      })

      return mockPapers
    } catch (error) {
      console.error("[v0] Error generating mock papers:", error)
      throw error
    }
  },
}
