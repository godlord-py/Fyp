import express from "express"
import User from "../models/User.js"
import Question from "../models/Question.js"
import Test from "../models/Test.js"
import TestAttempt from "../models/TestAttempt.js"

const router = express.Router()

// --- User Management Routes ---

// Get all users with filters
router.get("/users", async (req, res) => {
  try {
    const { role, search, active, page = 1, limit = 50 } = req.query

    const query = {}

    if (role && role !== "all") {
      query.role = role
    }

    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    if (active !== undefined) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      if (active === "true") {
        query.lastActive = { $gte: weekAgo }
      } else {
        query.lastActive = { $lt: weekAgo }
      }
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      data: users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ success: false, message: "Failed to fetch users" })
  }
})

// Get user statistics
router.get("/users/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const students = await User.countDocuments({ role: "student" })
    const admins = await User.countDocuments({ role: "admin" })

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const activeUsers = await User.countDocuments({ lastActive: { $gte: weekAgo } })

    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: monthAgo } })

    res.json({
      success: true,
      data: {
        totalUsers,
        students,
        admins,
        activeUsers,
        newUsersThisMonth,
      },
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    res.status(500).json({ success: false, message: "Failed to fetch user statistics" })
  }
})

// Update user
router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Remove sensitive fields
    delete updateData.password
    delete updateData._id

    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({ success: true, data: user })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ success: false, message: "Failed to update user" })
  }
})

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByIdAndDelete(id)

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ success: false, message: "Failed to delete user" })
  }
})

// --- Question Management Routes ---

// Create question
router.post("/questions", async (req, res) => {
  try {
    const questionData = req.body
    const question = new Question(questionData)
    await question.save()

    res.status(201).json({ success: true, data: question })
  } catch (error) {
    console.error("Error creating question:", error)
    res.status(500).json({ success: false, message: "Failed to create question" })
  }
})

// Update question
router.put("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const question = await Question.findByIdAndUpdate(id, updateData, { new: true })

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" })
    }

    res.json({ success: true, data: question })
  } catch (error) {
    console.error("Error updating question:", error)
    res.status(500).json({ success: false, message: "Failed to update question" })
  }
})

// Delete question
router.delete("/questions/:id", async (req, res) => {
  try {
    const { id } = req.params

    const question = await Question.findByIdAndDelete(id)

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" })
    }

    res.json({ success: true, message: "Question deleted successfully" })
  } catch (error) {
    console.error("Error deleting question:", error)
    res.status(500).json({ success: false, message: "Failed to delete question" })
  }
})

// Get question statistics
router.get("/questions/stats", async (req, res) => {
  try {
    const totalQuestions = await Question.countDocuments()

    const bySubject = await Question.aggregate([{ $group: { _id: "$subject", count: { $sum: 1 } } }])

    const byDifficulty = await Question.aggregate([{ $group: { _id: "$difficulty", count: { $sum: 1 } } }])

    const byType = await Question.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }])

    res.json({
      success: true,
      data: {
        totalQuestions,
        bySubject: bySubject.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        byDifficulty: byDifficulty.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
      },
    })
  } catch (error) {
    console.error("Error fetching question stats:", error)
    res.status(500).json({ success: false, message: "Failed to fetch question statistics" })
  }
})

// --- Test Management Routes ---

// Get all tests
router.get("/tests", async (req, res) => {
  try {
    const { subject, status, page = 1, limit = 20 } = req.query

    const query = {}

    if (subject && subject !== "all") {
      query.subject = subject
    }

    if (status && status !== "all") {
      query.status = status
    }

    const tests = await Test.find(query)
      .populate("questions", "questionText subject difficulty type")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Test.countDocuments(query)

    res.json({
      success: true,
      data: tests,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    })
  } catch (error) {
    console.error("Error fetching tests:", error)
    res.status(500).json({ success: false, message: "Failed to fetch tests" })
  }
})

// Create test
router.post("/tests", async (req, res) => {
  try {
    const testData = req.body
    const test = new Test(testData)
    await test.save()

    res.status(201).json({ success: true, data: test })
  } catch (error) {
    console.error("Error creating test:", error)
    res.status(500).json({ success: false, message: "Failed to create test" })
  }
})

// Update test
router.put("/tests/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const test = await Test.findByIdAndUpdate(id, updateData, { new: true })

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" })
    }

    res.json({ success: true, data: test })
  } catch (error) {
    console.error("Error updating test:", error)
    res.status(500).json({ success: false, message: "Failed to update test" })
  }
})

// Delete test
router.delete("/tests/:id", async (req, res) => {
  try {
    const { id } = req.params

    const test = await Test.findByIdAndDelete(id)

    if (!test) {
      return res.status(404).json({ success: false, message: "Test not found" })
    }

    res.json({ success: true, message: "Test deleted successfully" })
  } catch (error) {
    console.error("Error deleting test:", error)
    res.status(500).json({ success: false, message: "Failed to delete test" })
  }
})

// --- Analytics Routes ---

// Get dashboard analytics
router.get("/analytics/dashboard", async (req, res) => {
  try {
    const { timeRange = "7d" } = req.query

    // Calculate date range
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const totalUsers = await User.countDocuments()
    const totalQuestions = await Question.countDocuments()
    const totalTests = await Test.countDocuments()
    const totalAttempts = await TestAttempt.countDocuments()

    const activeUsers = await User.countDocuments({
      lastActive: { $gte: startDate },
    })

    const newUsers = await User.countDocuments({
      createdAt: { $gte: startDate },
    })

    res.json({
      success: true,
      data: {
        totalUsers,
        totalQuestions,
        totalTests,
        totalAttempts,
        activeUsers,
        newUsers,
        timeRange,
      },
    })
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error)
    res.status(500).json({ success: false, message: "Failed to fetch analytics" })
  }
})

// --- Settings Routes ---

// Get settings (mock implementation)
router.get("/settings", async (req, res) => {
  try {
    // In a real app, you'd fetch from a settings collection
    const settings = {
      siteName: "Examind AI",
      siteDescription: "AI-powered exam preparation platform",
      allowRegistration: true,
      requireEmailVerification: true,
      maxTestDuration: 180,
      defaultQuestionsPerTest: 50,
      enableAIAssistant: true,
      enableNotifications: true,
      maintenanceMode: false,
      backupFrequency: "daily",
      sessionTimeout: 30,
      maxFileSize: 10,
    }

    res.json({ success: true, data: settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    res.status(500).json({ success: false, message: "Failed to fetch settings" })
  }
})

// Update settings (mock implementation)
router.put("/settings", async (req, res) => {
  try {
    const settingsData = req.body

    // In a real app, you'd save to a settings collection
    console.log("Settings updated:", settingsData)

    res.json({ success: true, data: settingsData })
  } catch (error) {
    console.error("Error updating settings:", error)
    res.status(500).json({ success: false, message: "Failed to update settings" })
  }
})

export default router
