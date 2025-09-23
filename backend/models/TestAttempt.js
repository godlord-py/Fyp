import mongoose from "mongoose"

const testAttemptSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        answer: {
          type: String,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        timeSpent: {
          type: Number, // in seconds
          default: 0,
        },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number, // in seconds
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["completed", "abandoned"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
testAttemptSchema.index({ userId: 1, testId: 1 })
testAttemptSchema.index({ completedAt: -1 })

export default mongoose.model("TestAttempt", testAttemptSchema)
