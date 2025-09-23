import mongoose from "mongoose"

// Sub-schema for tables within a question
const TableDataSchema = new mongoose.Schema(
  {
    headers: [String],
    rows: [[String]], // Defines an array of string arrays
  },
  { _id: false },
) // _id is not needed for this sub-document

// Schema for an individual question
const QuestionSchema = new mongoose.Schema({
  question_number: {
    type: String,
    required: true,
    trim: true,
  },
  question_text: {
    type: String,
    required: true,
    trim: true,
  },
  marks: {
    type: Number,
    required: true,
  },
  course_outcome: {
    type: String,
    trim: true,
  },
  table_data: {
    type: TableDataSchema, // Optional field for tables
    required: false,
  },
  image_description: {
    type: String, // Optional field for image context
    trim: true,
    required: false,
  },
})

// Main schema for the entire question paper
const PaperSchema = new mongoose.Schema(
  {
    college_name: {
      type: String,
      required: true,
      default: "G. H. Raisoni College of Engineering, Nagpur",
    },
    is_autonomous: {
      type: Boolean,
      default: true,
    },
    examination_name: {
      type: String,
      required: true,
      trim: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    course_level: {
      type: String,
      trim: true,
    },
    term: {
      type: String,
      trim: true,
    },
    subject_code: {
      type: String,
      required: true,
      trim: true,
    },
    subject_name: {
      type: String,
      required: true,
      trim: true,
    },
    departments: [
      {
        type: String,
        trim: true,
      },
    ],
    duration_minutes: {
      type: Number,
    },
    max_marks: {
      type: Number,
      required: true,
    },
    instructions: [
      {
        type: String,
        trim: true,
      },
    ],
    questions: [QuestionSchema], // An array of embedded question documents
  },
  { timestamps: true },
) // Adds createdAt and updatedAt timestamps

// Create a compound index to ensure paper uniqueness based on subject and session
// New, more specific index
PaperSchema.index({ subject_code: 1, session: 1, term: 1 }, { unique: true })

export default mongoose.model("Paper", PaperSchema)
