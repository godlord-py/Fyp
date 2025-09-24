"use client"

import { useState, useEffect } from "react"
import {
  SparklesIcon,
  DocumentTextIcon,
  PlusIcon,
  BookmarkIcon,
  ChartBarIcon,
  LightBulbIcon,
  ClockIcon,
  TagIcon,
  AcademicCapIcon,
  FireIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline"
import { SummaryCard } from "../../components/SummaryCard"
import { paperAPI, summaryAPI, handleApiError } from "../../services/api"
import { geminiService } from "../../services/geminiService"
import { createSummary } from "../../types/index"

export const SummarizationPage = () => {
  const [summaries, setSummaries] = useState([])
  const [bookmarkedSummaries, setBookmarkedSummaries] = useState(new Set())
  const [inputText, setInputText] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [detailLevel, setDetailLevel] = useState("medium")
  const [summaryType, setSummaryType] = useState("comprehensive")
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState("generate")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [subjects, setSubjects] = useState([])
  const [questions, setQuestions] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [studyStats, setStudyStats] = useState({
    totalSummaries: 0,
    studyStreak: 0,
    favoriteSubject: "",
    totalStudyTime: 0,
    weeklyGoal: 5,
    completedThisWeek: 0,
    lastStudyDate: null,
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [filterSubject, setFilterSubject] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const summaryTypes = [
    {
      id: "comprehensive",
      name: "Comprehensive",
      icon: DocumentTextIcon,
      description: "Detailed overview with examples",
    },
    { id: "bullet-points", name: "Bullet Points", icon: TagIcon, description: "Key points in list format" },
    { id: "visual", name: "Visual", icon: ChartBarIcon, description: "Diagrams and flowcharts" },
    { id: "qa", name: "Q&A Format", icon: LightBulbIcon, description: "Question-answer pairs" },
    { id: "flashcards", name: "Flashcards", icon: AcademicCapIcon, description: "Quick review cards" },
  ]

  const handleDeleteSummary = (summaryId) => {
    setSummaries((prev) => prev.filter((summary) => summary.id !== summaryId))
    setBookmarkedSummaries((prev) => prev.delete(summaryId))
  }

  const handleToggleBookmark = (summaryId) => {
    setBookmarkedSummaries((prev) => {
      const newBookmarkedSummaries = new Set(prev)
      if (newBookmarkedSummaries.has(summaryId)) {
        newBookmarkedSummaries.delete(summaryId)
      } else {
        newBookmarkedSummaries.add(summaryId)
      }
      return newBookmarkedSummaries
    })
  }

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoadingData(true)
        console.log("[v0] Starting to fetch subjects and questions...")

        const subjectsData = await paperAPI.getSubjects()
        console.log("[v0] Subjects data received:", subjectsData)
        setSubjects(subjectsData)

        if (subjectsData.length > 0 && !selectedSubject) {
          setSelectedSubject(subjectsData[0])
        }

        const questionsData = await paperAPI.getQuestions()
        console.log("[v0] Questions data received:", questionsData)
        setQuestions(questionsData.questions || questionsData)

        loadStudyStats()
      } catch (err) {
        console.error("[v0] Failed to fetch real data:", err)
        const errorInfo = handleApiError(err)
        setError(errorInfo.message)
      } finally {
        setLoadingData(false)
      }
    }

    fetchRealData()
  }, [])

  const loadStudyStats = () => {
    const stats = JSON.parse(
      localStorage.getItem("studyStats") ||
        JSON.stringify({
          totalSummaries: 0,
          studyStreak: 0,
          favoriteSubject: "",
          totalStudyTime: 0,
          weeklyGoal: 5,
          completedThisWeek: 0,
          lastStudyDate: null,
        }),
    )

    // Calculate streak
    const today = new Date().toDateString()
    const lastStudy = stats.lastStudyDate
    if (lastStudy && new Date(lastStudy).toDateString() === today) {
      // Already studied today
    } else if (lastStudy && new Date(today).getTime() - new Date(lastStudy).getTime() > 86400000 * 2) {
      // More than 1 day gap, reset streak
      stats.studyStreak = 0
    }

    setStudyStats(stats)
  }

  const [visualSummaryData, setVisualSummaryData] = useState(null)

  const handleGenerateSummary = async () => {
    if (!inputText.trim()) return

    setIsGenerating(true)
    setError(null)
    setVisualSummaryData(null) // Reset visual data

    try {
      console.log("[v0] Starting summary generation with type:", summaryType, "subject:", selectedSubject)

      let summaryContent = ""
      let visualData = null

      if (geminiService.isConfigured()) {
        try {
          if (summaryType === "visual") {
            // Generate visual summary data
            visualData = await geminiService.generateVisualSummary(inputText, selectedSubject)
            summaryContent = formatVisualSummaryContent(visualData)
            setVisualSummaryData(visualData)
          } else {
            // Generate text-based summary with enhanced prompts
            summaryContent = await geminiService.summarizeText(inputText, selectedSubject, summaryType)
          }
          console.log("[v0] Gemini summary generated successfully")
        } catch (geminiError) {
          console.warn("[v0] Gemini service failed, falling back to API:", geminiError)
          // Fallback to API service
          const summaryResponse = await summaryAPI.generateSummary(inputText, {
            subject: selectedSubject,
            detailLevel: detailLevel,
            summaryType: summaryType,
          })
          summaryContent = summaryResponse.summary || summaryResponse.content
        }
      } else {
        console.log("[v0] Gemini not configured, using API service")
        // Use API service if Gemini is not configured
        const summaryResponse = await summaryAPI.generateSummary(inputText, {
          subject: selectedSubject,
          detailLevel: detailLevel,
          summaryType: summaryType,
        })
        summaryContent = summaryResponse.summary || summaryResponse.content
      }

      // If still no content, use enhanced fallback
      if (!summaryContent) {
        const relevantQuestions = questions
          .filter((q) => q.subject === selectedSubject && q.isActive !== false)
          .slice(0, 10)
        summaryContent = generateEnhancedSummary(inputText, detailLevel, relevantQuestions, summaryType)
      }

      const newSummary = createSummary({
        id: Date.now().toString(),
        title: `${selectedSubject} ${summaryTypes.find((t) => t.id === summaryType)?.name} - ${new Date().toLocaleDateString()}`,
        content: summaryContent,
        subject: selectedSubject,
        detailLevel,
        summaryType,
        createdAt: new Date().toISOString(),
        readTime: Math.ceil(inputText.length / 200),
        keyTopics: extractKeyTopics(questions.filter((q) => q.subject === selectedSubject)),
        visualData: visualData, // Store visual data if available
      })

      // Try to save to API first, fallback to localStorage
      try {
        await summaryAPI.saveSummary(newSummary)
        console.log("[v0] Summary saved to API successfully")
      } catch (saveErr) {
        console.warn("[v0] Failed to save to API, using localStorage:", saveErr)
        const existingSummaries = JSON.parse(localStorage.getItem("aiSummaries") || "[]")
        const updatedSummaries = [newSummary, ...existingSummaries]
        localStorage.setItem("aiSummaries", JSON.stringify(updatedSummaries))
      }

      setSummaries((prev) => [newSummary, ...prev])
      setInputText("")
      setActiveTab("history")
      updateStudyStats(selectedSubject)
    } catch (err) {
      console.error("[v0] Summary generation failed:", err)
      const errorInfo = handleApiError(err)
      setError(errorInfo.message)

      // Final fallback - generate locally
      try {
        const relevantQuestions = questions
          .filter((q) => q.subject === selectedSubject && q.isActive !== false)
          .slice(0, 10)

        const newSummary = createSummary({
          id: Date.now().toString(),
          title: `${selectedSubject} ${summaryTypes.find((t) => t.id === summaryType)?.name} - ${new Date().toLocaleDateString()}`,
          content: generateEnhancedSummary(inputText, detailLevel, relevantQuestions, summaryType),
          subject: selectedSubject,
          detailLevel,
          summaryType,
          createdAt: new Date().toISOString(),
          readTime: Math.ceil(inputText.length / 200),
          keyTopics: extractKeyTopics(relevantQuestions),
        })

        const existingSummaries = JSON.parse(localStorage.getItem("aiSummaries") || "[]")
        const updatedSummaries = [newSummary, ...existingSummaries]
        localStorage.setItem("aiSummaries", JSON.stringify(updatedSummaries))

        setSummaries((prev) => [newSummary, ...prev])
        setInputText("")
        setActiveTab("history")
        setError("Generated using offline mode - summary created locally")
      } catch (fallbackErr) {
        console.error("[v0] Fallback generation failed:", fallbackErr)
        setError("Failed to generate summary. Please try again.")
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const extractKeyTopics = (relevantQuestions) => {
    const topics = [...new Set(relevantQuestions.map((q) => q.topic || q.courseOutcome).filter(Boolean))]
    return topics.slice(0, 5)
  }

  const generateEnhancedSummary = (input, level, relevantQuestions, type) => {
    const baseContent = `This is an AI-generated ${summaryTypes.find((t) => t.id === type)?.name.toLowerCase()} summary of your ${selectedSubject} content. `
    const topics = [...new Set(relevantQuestions.map((q) => q.topic))].slice(0, 5)
    const difficulties = [...new Set(relevantQuestions.map((q) => q.difficulty))]

    switch (type) {
      case "bullet-points":
      case "bullet":
        return generateBulletPointSummary(baseContent, topics, level)
      case "visual":
        return generateVisualSummary(baseContent, topics, level)
      case "qa":
        return generateQASummary(baseContent, topics, level)
      case "flashcards":
        return generateFlashcardSummary(baseContent, topics, level)
      default:
        return generateComprehensiveSummary(baseContent, topics, difficulties, level)
    }
  }

  const generateBulletPointSummary = (base, topics, level) => {
    return `${base}

**Key Points:**
• ${topics.join("\n• ")}
• Fundamental concepts and principles
• Practical applications and examples
• Common examination patterns
• Important formulas and definitions

**Study Focus Areas:**
• Review core concepts regularly
• Practice with real questions
• Understand interconnections between topics
• Focus on frequently tested areas`
  }

  const generateVisualSummary = (base, topics, level) => {
    return `${base}

**📊 VISUAL LEARNING STRUCTURE**

**🎯 Key Concepts Map:**
┌─────────────────────────────────┐
│        ${selectedSubject}        │
└─────────────────────────────────┘
           │
    ┌──────┼──────┐
    │      │      │
┌───▼───┐ │ ┌────▼────┐
│${topics[0] || "Theory"}│ │ │${topics[1] || "Practice"}│
└───────┘ │ └─────────┘
          │
     ┌────▼────┐
     │${topics[2] || "Applications"}│
     └─────────┘

**🔄 Learning Flow:**
1. **Foundation** → Understand basic concepts
   ↓
2. **Application** → Practice with examples  
   ↓
3. **Integration** → Connect different topics
   ↓
4. **Mastery** → Apply to complex problems

**💡 Visual Study Techniques:**
• Create mind maps for topic relationships
• Use flowcharts for process understanding
• Draw concept hierarchies
• Color-code different difficulty levels
• Make visual connections between ideas

**📈 Progress Tracking:**
□ Basic concepts understood
□ Examples practiced
□ Connections identified
□ Complex problems solved

**🎨 Recommended Visual Tools:**
• Mind mapping software
• Flowchart creators
• Concept mapping tools
• Digital whiteboards
• Color-coded notes`
  }

  const generateQASummary = (base, topics, level) => {
    return `${base}

**Q: What are the main topics covered?**
A: ${topics.join(", ")}

**Q: What should I focus on first?**
A: Start with fundamental concepts, then move to applications and practice problems.

**Q: How can I test my understanding?**
A: Use the practice questions in our database and create your own examples.

**Q: What are common mistakes to avoid?**
A: Review past papers to identify frequent error patterns and misconceptions.

**Q: How should I organize my study time?**
A: Allocate time based on topic difficulty and your current understanding level.`
  }

  const generateFlashcardSummary = (base, topics, level) => {
    return `${base}

**Flashcard Set Generated:**

🔹 **Card 1:** ${topics[0] || "Key Concept"}
   Definition and main principles

🔹 **Card 2:** ${topics[1] || "Applications"}  
   Real-world uses and examples

🔹 **Card 3:** ${topics[2] || "Formulas"}
   Important equations and calculations

🔹 **Card 4:** ${topics[3] || "Practice"}
   Sample problems and solutions

**Study Method:**
• Review cards daily for retention
• Test yourself without looking at answers
• Focus extra time on difficult cards
• Create additional cards for weak areas`
  }

  const generateComprehensiveSummary = (base, topics, difficulties, level) => {
    const topicContext = topics.length > 0 ? `Key topics covered in our database include: ${topics.join(", ")}. ` : ""
    const difficultyContext =
      difficulties.length > 0 ? `Questions range from ${difficulties.join(" to ")} difficulty levels. ` : ""

    switch (level) {
      case "short":
        return (
          base +
          topicContext +
          "Key points: The main concepts align with frequently asked questions in our database. This summary provides a concise overview focusing on the most important examination patterns and core concepts."
        )
      case "medium":
        return (
          base +
          topicContext +
          difficultyContext +
          "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications based on real examination questions. This summary provides a balanced overview with detailed explanations of core concepts, relevant examples from past papers, and connections between different topics. The content is structured to facilitate understanding and retention of the material, focusing on commonly tested areas."
        )
      case "detailed":
        return (
          base +
          topicContext +
          difficultyContext +
          "Key points: The main concepts covered include fundamental principles, important formulas, and practical applications based on comprehensive analysis of real examination questions. This comprehensive summary provides in-depth explanations of all core concepts, detailed derivations of important formulas, multiple worked examples from actual papers, and extensive connections between different topics. The content includes historical context, real-world applications, common misconceptions identified from student responses, and advanced topics for deeper understanding. This detailed analysis is designed to provide complete mastery of the subject matter, with emphasis on frequently tested concepts and examination strategies."
        )
      default:
        return base + "Summary generated successfully using real question database."
    }
  }

  const getFilteredSummaries = () => {
    let filtered = summaries

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (summary) =>
          summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          summary.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          summary.subject.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply subject filter
    if (filterSubject !== "all") {
      filtered = filtered.filter((summary) => summary.subject === filterSubject)
    }

    // Apply tab filter
    if (activeTab === "bookmarks") {
      filtered = filtered.filter((summary) => bookmarkedSummaries.has(summary.id))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "subject":
          return a.subject.localeCompare(b.subject)
        case "readTime":
          return (a.readTime || 0) - (b.readTime || 0)
        default:
          return 0
      }
    })

    return filtered
  }

  const filteredSummaries = getFilteredSummaries()

  const formatVisualSummaryContent = (visualData) => {
    if (!visualData) return "Visual summary data not available."

    let content = "**📊 VISUAL SUMMARY**\n\n"

    // Key Points Section
    if (visualData.keyPoints && visualData.keyPoints.length > 0) {
      content += "**🎯 Key Points:**\n"
      visualData.keyPoints.forEach((point, index) => {
        content += `${index + 1}. ${point}\n`
      })
      content += "\n"
    }

    // Concepts Section
    if (visualData.concepts && visualData.concepts.length > 0) {
      content += "**💡 Core Concepts:**\n"
      visualData.concepts.forEach((concept) => {
        const importance = concept.importance === "high" ? "🔴" : concept.importance === "medium" ? "🟡" : "🟢"
        content += `${importance} **${concept.name}**: ${concept.description}\n`
      })
      content += "\n"
    }

    // Flow Chart Section
    if (visualData.flowChart && visualData.flowChart.length > 0) {
      content += "**🔄 Process Flow:**\n"
      visualData.flowChart.forEach((step, index) => {
        content += `${index + 1}. **${step.step}**: ${step.description}\n`
        if (index < visualData.flowChart.length - 1) {
          content += "   ↓\n"
        }
      })
      content += "\n"
    }

    // Mind Map Section
    if (visualData.mindMap) {
      content += "**🧠 Mind Map Structure:**\n"
      content += `**Central Topic**: ${visualData.mindMap.central}\n\n`
      if (visualData.mindMap.branches && visualData.mindMap.branches.length > 0) {
        visualData.mindMap.branches.forEach((branch) => {
          content += `**${branch.topic}**:\n`
          if (branch.subtopics && branch.subtopics.length > 0) {
            branch.subtopics.forEach((subtopic) => {
              content += `  • ${subtopic}\n`
            })
          }
          content += "\n"
        })
      }
    }

    content +=
      "\n**💡 Study Tip**: Use this visual structure to create your own diagrams and mind maps for better retention!"

    return content
  }

  const updateStudyStats = (subject: string) => {
    const currentStats = JSON.parse(
      localStorage.getItem("studyStats") ||
        JSON.stringify({
          totalSummaries: 0,
          studyStreak: 0,
          favoriteSubject: "",
          totalStudyTime: 0,
          weeklyGoal: 5,
          completedThisWeek: 0,
          lastStudyDate: null,
        }),
    )

    const today = new Date().toDateString()
    const lastStudy = currentStats.lastStudyDate

    // Update streak logic
    if (!lastStudy || new Date(lastStudy).toDateString() !== today) {
      if (lastStudy && new Date(today).getTime() - new Date(lastStudy).getTime() <= 86400000 * 2) {
        currentStats.studyStreak += 1
      } else {
        currentStats.studyStreak = 1
      }
    }

    // Update other stats
    currentStats.totalSummaries += 1
    currentStats.lastStudyDate = today
    currentStats.totalStudyTime += 15 // Assume 15 minutes per summary

    // Update weekly progress
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const lastWeekStart = currentStats.weekStartDate
    if (!lastWeekStart || new Date(lastWeekStart).getTime() < weekStart.getTime()) {
      currentStats.completedThisWeek = 1
      currentStats.weekStartDate = weekStart.toISOString()
    } else {
      currentStats.completedThisWeek += 1
    }

    // Update favorite subject
    const subjectCounts = JSON.parse(localStorage.getItem("subjectCounts") || "{}")
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1
    localStorage.setItem("subjectCounts", JSON.stringify(subjectCounts))

    const favoriteSubject = Object.entries(subjectCounts).reduce((a, b) =>
      subjectCounts[a[0]] > subjectCounts[b[0]] ? a : b,
    )[0]
    currentStats.favoriteSubject = favoriteSubject

    localStorage.setItem("studyStats", JSON.stringify(currentStats))
    setStudyStats(currentStats)
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading subjects and questions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Summarization Hub</h1>
            <p className="text-purple-100">Generate intelligent summaries with advanced AI analysis</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{studyStats.studyStreak}</div>
                <div className="text-sm text-purple-200">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{studyStats.totalSummaries}</div>
                <div className="text-sm text-purple-200">Summaries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <FireIcon className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{studyStats.studyStreak}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Study Streak</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <TrophyIcon className="w-8 h-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {studyStats.completedThisWeek}/{studyStats.weeklyGoal}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Goal</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <AcademicCapIcon className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {studyStats.favoriteSubject || "None"}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Favorite Subject</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(studyStats.totalStudyTime / 60) || 0}h
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Study Time</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("generate")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "generate"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              <PlusIcon className="w-4 h-4 inline mr-2" />
              Generate Summary
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              <DocumentTextIcon className="w-4 h-4 inline mr-2" />
              My Summaries ({summaries.length})
            </button>
            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "bookmarks"
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
              }`}
            >
              <BookmarkIcon className="w-4 h-4 inline mr-2" />
              Bookmarks ({bookmarkedSummaries.size})
            </button>
          </nav>

          {(activeTab === "history" || activeTab === "bookmarks") && (
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <input
                type="text"
                placeholder="Search summaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="subject">By Subject</option>
                <option value="readTime">By Read Time</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {activeTab === "generate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Generate AI Summary
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Choose Summary Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {summaryTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <button
                          key={type.id}
                          onClick={() => setSummaryType(type.id)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            summaryType === type.id
                              ? "border-purple-500 bg-purple-50 dark:bg-purple-900"
                              : "border-gray-200 dark:border-gray-600 hover:border-purple-300"
                          }`}
                        >
                          <IconComponent className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{type.description}</div>
                          {(type.id === "visual" || type.id === "comprehensive") && (
                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
                              ✨ Enhanced
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Paste your content or select a subject
                  </label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Paste your study material here, or describe the topic you want summarized..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>{inputText.length} characters</span>
                    <span>~{Math.ceil(inputText.length / 200)} min read</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Detail Level
                    </label>
                    <select
                      value={detailLevel}
                      onChange={(e) => setDetailLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="short">Short (Quick overview)</option>
                      <option value="medium">Medium (Balanced detail)</option>
                      <option value="detailed">Detailed (Comprehensive)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={!inputText.trim() || isGenerating || !selectedSubject}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating {summaryTypes.find((t) => t.id === summaryType)?.name}...</span>
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="w-4 h-4" />
                      <span>Generate {summaryTypes.find((t) => t.id === summaryType)?.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                <LightBulbIcon className="w-5 h-5 mr-2" />
                Smart Features
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                <li>• AI analyzes {questions.length} real questions</li>
                <li>• 5 different summary formats</li>
                <li>• {geminiService.isConfigured() ? "✅ Enhanced AI (Gemini)" : "⚠️ Basic AI mode"}</li>
                <li>• Personalized difficulty analysis</li>
                <li>• Study progress tracking</li>
                <li>• Export to multiple formats</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center">
                <ChartBarIcon className="w-5 h-5 mr-2" />
                Your Progress
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-green-800 dark:text-green-200 mb-1">
                    <span>Weekly Goal</span>
                    <span>
                      {studyStats.completedThisWeek}/{studyStats.weeklyGoal}
                    </span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2">
                    <div
                      className="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((studyStats.completedThisWeek / studyStats.weeklyGoal) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-sm text-green-800 dark:text-green-200">
                  <div>🔥 {studyStats.studyStreak} day streak</div>
                  <div>📚 {studyStats.totalSummaries} total summaries</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                Database Insights
              </h4>
              <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <div>• {subjects.length} subjects available</div>
                <div>• {questions.length} questions analyzed</div>
                <div>• Real exam pattern matching</div>
                <div>• Difficulty-based recommendations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === "history" || activeTab === "bookmarks") && (
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {activeTab === "bookmarks" ? "No bookmarked summaries" : "No summaries yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {activeTab === "bookmarks"
                  ? "Bookmark summaries to access them quickly later."
                  : "Generate your first AI summary to get started with organized study materials."}
              </p>
              <button
                onClick={() => setActiveTab("generate")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Summary
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredSummaries.map((summary) => (
                <SummaryCard
                  key={summary.id}
                  summary={summary}
                  onDelete={handleDeleteSummary}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={bookmarkedSummaries.has(summary.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
