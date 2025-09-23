import express from "express"

const router = express.Router()

// In-memory storage for summaries (replace with database in production)
const summaries = []
let nextId = 1

// Get all summaries
router.get("/summaries", async (req, res) => {
  try {
    res.json(summaries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  } catch (error) {
    console.error("Error fetching summaries:", error)
    res.status(500).json({ error: "Failed to fetch summaries" })
  }
})

// Create new summary
router.post("/summaries", async (req, res) => {
  try {
    const { title, content, subject, detailLevel } = req.body

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" })
    }

    const newSummary = {
      id: nextId++,
      title,
      content,
      subject: subject || "General",
      detailLevel: detailLevel || "medium",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    summaries.push(newSummary)
    res.status(201).json(newSummary)
  } catch (error) {
    console.error("Error creating summary:", error)
    res.status(500).json({ error: "Failed to create summary" })
  }
})

// Delete summary
router.delete("/summaries/:id", async (req, res) => {
  try {
    const { id } = req.params
    const summaryIndex = summaries.findIndex((s) => s.id == id)

    if (summaryIndex === -1) {
      return res.status(404).json({ error: "Summary not found" })
    }

    summaries.splice(summaryIndex, 1)
    res.json({ message: "Summary deleted successfully" })
  } catch (error) {
    console.error("Error deleting summary:", error)
    res.status(500).json({ error: "Failed to delete summary" })
  }
})

// Generate summary (mock AI endpoint)
router.post("/summary/generate", async (req, res) => {
  try {
    const { content, subject, detailLevel } = req.body

    if (!content) {
      return res.status(400).json({ error: "Content is required" })
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock AI summary generation
    const generateSummary = (text, level, subj) => {
      const baseContent = `This is an AI-generated summary of your ${subj || "study"} content. `

      switch (level) {
        case "short":
          return (
            baseContent +
            "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications. This summary provides a concise overview of the essential information."
          )
        case "medium":
          return (
            baseContent +
            "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications. This summary provides a balanced overview with detailed explanations of core concepts, relevant examples, and connections between different topics. The content is structured to facilitate understanding and retention of the material."
          )
        case "detailed":
          return (
            baseContent +
            "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications. This comprehensive summary provides in-depth explanations of all core concepts, detailed derivations of important formulas, multiple worked examples, and extensive connections between different topics. The content includes historical context, real-world applications, common misconceptions, and advanced topics for deeper understanding."
          )
        default:
          return baseContent + "Summary generated successfully."
      }
    }

    const summary = generateSummary(content, detailLevel, subject)

    res.json({
      summary,
      wordCount: summary.split(" ").length,
      processingTime: 1.5,
    })
  } catch (error) {
    console.error("Error generating summary:", error)
    res.status(500).json({ error: "Failed to generate summary" })
  }
})

export default router
