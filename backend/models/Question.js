import mongoose from "mongoose"

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    type: {
      type: String,
      enum: ["mcq", "subjective"],
      required: true,
    },
    options: [
      {
        type: String,
        trim: true,
      },
    ],
    correctAnswer: {
      type: String,
      required: function () {
        return this.type === "mcq"
      },
    },
    explanation: {
      type: String,
      trim: true,
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    year: {
      type: Number,
    },
    session: {
      type: String,
    },
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Paper",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for better search performance
questionSchema.index({ subject: 1, topic: 1, difficulty: 1 })
questionSchema.index({ questionText: "text" })

export default mongoose.model("Question", questionSchema)
