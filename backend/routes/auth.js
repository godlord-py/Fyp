import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

const router = express.Router()

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here"

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1] // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" })
    }
    req.user = user
    next()
  })
}

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" })
  }
  next()
}

// Register/Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role = "student", class: userClass, subjects } = req.body

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user object
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    }

    // Add student-specific fields
    if (role === "student") {
      if (!userClass) {
        return res.status(400).json({
          success: false,
          message: "Class is required for students",
        })
      }
      userData.class = userClass
      userData.subjects = subjects || []
    }

    // Create user
    const user = new User(userData)
    await user.save()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      subjects: user.subjects,
      createdAt: user.createdAt,
    }

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        token,
        user: userResponse,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Update last active
    await user.updateLastActive()

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Return user data (without password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      subjects: user.subjects,
      lastActive: user.lastActive,
      testsCompleted: user.testsCompleted,
      avgScore: user.avgScore,
    }

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: userResponse,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Verify token route
router.get("/verify", authenticateToken, async (req, res) => {
  try {
    // Find user by ID from token
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    console.error("Token verification error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Profile fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

// Update user profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, subjects, class: userClass } = req.body

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (subjects) updateData.subjects = subjects
    if (userClass && req.user.role === "student") updateData.class = userClass

    const user = await User.findByIdAndUpdate(req.user.userId, updateData, {
      new: true,
    }).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Profile update error:", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
})

export default router
