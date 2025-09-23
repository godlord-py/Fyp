import express from "express"
import multer from "multer"
import fs from "fs"
import pdf2pic from "pdf2pic"
import Tesseract from "tesseract.js"
import pdfPageCounter from "pdf-page-counter"
import Paper from "../models/Paper.js"

const router = express.Router()
const upload = multer({ dest: "uploads/" })

// --- Utility Functions ---

// Find individual papers in the extracted text
function findPapers(text) {
  const paperRegex =
    /((?:G\.?\s*H\.?\s*|GH\s*)Raisoni College of Engineering[\s\S]*?)(?=(?:G\.?\s*H\.?\s*|GH\s*)Raisoni College of Engineering|$)/gi
  const matches = text.match(paperRegex)
  return matches ? matches.filter((p) => p.trim().length > 300) : []
}

// Parse a single paper's text into metadata and questions
function parsePaper(rawText) {
  const getMatch = (regex, text) => (text.match(regex) || [])[1]?.trim() || ""

  const subjectCodeRegex = /\b([A-Z]{4,}\d{3,}(\/[A-Z]{4,}\d{3,})?)\b/
  const subjectNameRegex = /(?:End Semester Examination:.*?-\s*\d{4})\s*([\s\S]*?)\s*(?:Time:|\[Max\. Marks:)/i
  const examRegex = /((?:Winter|Summer)\s*-\s*\d{4})/i
  const maxMarksRegex = /Max\.\s*Marks:\s*(\d+)/i

  const subject_code = getMatch(subjectCodeRegex, rawText)
  const subject_name = getMatch(subjectNameRegex, rawText).replace(/\n/g, " ").replace(/\s+/g, " ")
  const exam = getMatch(examRegex, rawText)
  const max_marks = Number.parseInt(getMatch(maxMarksRegex, rawText)) || 0

  const questions = []
  const qRegex = /(?:\n|^)(?:Q\.?\s?No\.?\s*)?(\d+\s?[a-z]?\))/g
  let matches
  while ((matches = qRegex.exec(rawText)) !== null) {
    const qno = matches[1]
    const nextIndex = qRegex.lastIndex
    const nextMatch = qRegex.exec(rawText)
    const text = rawText.substring(nextIndex, nextMatch ? nextMatch.index : undefined).trim()
    if (qno && text) questions.push({ qno, text, marks: "", co: "" })
    if (nextMatch) qRegex.lastIndex = nextMatch.index
  }

  return { subject_code, subject_name, exam, max_marks, questions }
}

// --- Upload Route ---
router.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded." })

    const pdfPath = req.file.path
    const pdf2picOptions = { density: 150, format: "png", width: 1200 }
    const storeAsImage = pdf2pic.fromPath(pdfPath, pdf2picOptions)

    const pdfBuffer = fs.readFileSync(pdfPath)
    const totalPagesData = await pdfPageCounter(pdfBuffer)
    const totalPages = totalPagesData.numpages

    let fullText = ""

    // Convert each page to image and perform OCR
    for (let i = 1; i <= totalPages; i++) {
      const pageImage = await storeAsImage(i)
      const ocrResult = await Tesseract.recognize(pageImage.path, "eng")
      fullText += ocrResult.data.text + "\n"
      await fs.promises.unlink(pageImage.path) // remove image after OCR
    }

    await fs.promises.unlink(pdfPath) // remove uploaded PDF

    const papers = findPapers(fullText)
    if (papers.length === 0) return res.status(400).json({ error: "Could not find any papers in the PDF." })

    const savedPapersInfo = []
    for (const rawPaper of papers) {
      const parsed = parsePaper(rawPaper)
      if (parsed.subject_code && parsed.questions.length > 0) {
        const newPaper = new Paper(parsed)
        await newPaper.save()
        savedPapersInfo.push({ subject_code: parsed.subject_code, questions_found: parsed.questions.length })
      }
    }

    if (savedPapersInfo.length === 0)
      return res.status(400).json({ message: "PDF processed, but no valid papers with questions found." })

    res.status(201).json({
      message: "PDF processed and papers saved successfully.",
      count: savedPapersInfo.length,
      savedPapers: savedPapersInfo,
    })
  } catch (err) {
    console.error("❌ OCR PDF processing failed:", err)
    if (req.file && fs.existsSync(req.file.path)) await fs.promises.unlink(req.file.path)
    res.status(500).json({ error: "Failed to process the scanned PDF file." })
  }
})

export default router
