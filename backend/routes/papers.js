import express from "express"
import Paper from "../models/Paper.js"

const router = express.Router()

// Get all papers with optional filtering
router.get("/papers", async (req, res) => {
  try {
    const { subject, session, search, page = 1, limit = 20 } = req.query

    const query = {}

    // Add filters
    if (subject && subject !== "All") {
      query.subject_name = new RegExp(subject, "i")
    }

    if (session && session !== "All") {
      query.session = session
    }

    if (search) {
      query.$or = [
        { subject_name: new RegExp(search, "i") },
        { subject_code: new RegExp(search, "i") },
        { examination_name: new RegExp(search, "i") },
      ]
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    const papers = await Paper.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number.parseInt(limit))

    const total = await Paper.countDocuments(query)

    res.json({
      papers,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
        total,
      },
    })
  } catch (error) {
    console.error("Error fetching papers:", error)
    res.status(500).json({ error: "Failed to fetch papers" })
  }
})

// Get paper by ID
router.get("/papers/:id", async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id)

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" })
    }

    res.json(paper)
  } catch (error) {
    console.error("Error fetching paper:", error)
    res.status(500).json({ error: "Failed to fetch paper" })
  }
})

// Get questions from all papers with filtering
router.get("/questions", async (req, res) => {
  try {
    const { subject, topic, difficulty, type, search, page = 1, limit = 50 } = req.query

    const matchStage = {}

    // Add filters
    if (subject && subject !== "All") {
      matchStage.subject_name = new RegExp(subject, "i")
    }

    if (search) {
      matchStage.$or = [
        { "questions.question_text": new RegExp(search, "i") },
        { subject_name: new RegExp(search, "i") },
        { subject_code: new RegExp(search, "i") },
      ]
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Aggregate pipeline to flatten questions
    const pipeline = [
      { $match: matchStage },
      { $unwind: "$questions" },
      {
        $project: {
          id: "$questions._id",
          questionText: "$questions.question_text",
          questionNumber: "$questions.question_number",
          marks: "$questions.marks",
          courseOutcome: "$questions.course_outcome",
          tableData: "$questions.table_data",
          imageDescription: "$questions.image_description",
          subject: "$subject_name",
          subjectCode: "$subject_code",
          session: "$session",
          year: {
            $cond: {
              if: { $gte: [{ $strLenCP: "$session" }, 4] },
              then: {
                $toInt: {
                  $substr: ["$session", { $subtract: [{ $strLenCP: "$session" }, 4] }, 4],
                },
              },
              else: { $toInt: "$session" },
            },
          },
          paper: {
            id: "$_id",
            examinationName: "$examination_name",
            maxMarks: "$max_marks",
          },
        },
      },
      { $sort: { year: -1, questionNumber: 1 } },
      { $skip: skip },
      { $limit: Number.parseInt(limit) },
    ]

    const questions = await Paper.aggregate(pipeline)

    // Get total count
    const countPipeline = [{ $match: matchStage }, { $unwind: "$questions" }, { $count: "total" }]

    const countResult = await Paper.aggregate(countPipeline)
    const total = countResult[0]?.total || 0

    res.json({
      questions,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / Number.parseInt(limit)),
        total,
      },
    })
  } catch (error) {
    console.error("Error fetching questions:", error)
    res.status(500).json({ error: "Failed to fetch questions" })
  }
})

// Get unique subjects
router.get("/subjects", async (req, res) => {
  try {
    const subjects = await Paper.distinct("subject_name")
    res.json(subjects.sort())
  } catch (error) {
    console.error("Error fetching subjects:", error)
    res.status(500).json({ error: "Failed to fetch subjects" })
  }
})

// Get unique sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Paper.distinct("session")
    res.json(sessions.sort().reverse())
  } catch (error) {
    console.error("Error fetching sessions:", error)
    res.status(500).json({ error: "Failed to fetch sessions" })
  }
})

// Get dashboard statistics
router.get("/stats/dashboard", async (req, res) => {
  try {
    const totalPapers = await Paper.countDocuments()

    const questionStats = await Paper.aggregate([{ $unwind: "$questions" }, { $count: "total" }])

    const totalQuestions = questionStats[0]?.total || 0

    const subjectStats = await Paper.aggregate([
      { $group: { _id: "$subject_name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    const sessionStats = await Paper.aggregate([
      { $group: { _id: "$session", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 5 },
    ])

    res.json({
      totalPapers,
      totalQuestions,
      topSubjects: subjectStats,
      recentSessions: sessionStats,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Failed to fetch statistics" })
  }
})

export default router
