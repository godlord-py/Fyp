import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import uploadRoutes from "./routes/upload.js"
import paperRoutes from "./routes/papers.js"
import summaryRoutes from "./routes/summaries.js"
import adminRoutes from "./routes/admin.js"
import authRoutes from "./routes/auth.js"

const app = express()

// --- MongoDB Connection with retry logic ---
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://admin:1234@cluster0.w1rkjmb.mongodb.net/questionPaperDB?retryWrites=true&w=majority",
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      },
    )
    console.log("✅ MongoDB connected successfully")
  } catch (err) {
    console.error("❌ MongoDB connection error:", err)
    console.log("🔄 Retrying connection in 5 seconds...")
    setTimeout(connectDB, 5000)
  }
}

connectDB()

mongoose.connection.on("disconnected", () => {
  console.log("❌ MongoDB disconnected")
})

mongoose.connection.on("reconnected", () => {
  console.log("✅ MongoDB reconnected")
})

// --- Middleware ---
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL,
    ].filter(Boolean), // Remove any undefined values
    credentials: true,
  }),
)
app.use(express.json())

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// --- Routes ---
app.use("/api", uploadRoutes)
app.use("/api", paperRoutes)
app.use("/api", summaryRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/auth", authRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  })
})

app.use((err, req, res, next) => {
  console.error("Server error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" })
  })
  
  
// --- Server Startup ---
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`)
})

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully")
  server.close(() => {
    mongoose.connection.close()
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully")
  server.close(() => {
    mongoose.connection.close()
    process.exit(0)
  })
})
