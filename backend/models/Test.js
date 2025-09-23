import mongoose from "mongoose"

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
        required: true,
      },
    ],
    duration: {
      type: Number,
      required: true,
      min: 5,
      max: 300,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    instructions: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
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

// Virtual for question count
testSchema.virtual("questionCount").get(function () {
  return this.questions.length
})

export default mongoose.model("Test", testSchema)
