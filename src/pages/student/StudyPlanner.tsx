"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  CalendarIcon,
  PlusIcon,
  FunnelIcon,
  AcademicCapIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  BoltIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from "@heroicons/react/24/outline"
import { TaskCard } from "../../components/TaskCard"
import type { PlannerTask } from "../../types"
import { paperAPI, handleApiError } from "../../services/api"

export const StudyPlanner: React.FC = () => {
  const [tasks, setTasks] = useState<PlannerTask[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<PlannerTask | null>(null)
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "overdue">("all")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "subject">("dueDate")

  const [subjects, setSubjects] = useState([])
  const [questions, setQuestions] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedSubjectsForPlan, setSelectedSubjectsForPlan] = useState([])
  const [showPlanGenerator, setShowPlanGenerator] = useState(false)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pomodoroState, setPomodoroState] = useState({
    isActive: false,
    timeLeft: 25 * 60, // 25 minutes in seconds
    isBreak: false,
    currentTask: null,
    completedPomodoros: 0,
  })

  const [studyAnalytics, setStudyAnalytics] = useState({
    totalStudyTime: 0,
    completedTasks: 0,
    streak: 0,
    weeklyGoal: 10,
    completedThisWeek: 0,
    averageTaskTime: 0,
    productivityScore: 0,
    subjectProgress: {},
  })

  const [activeStudySession, setActiveStudySession] = useState(null)
  const [studySessions, setStudySessions] = useState([])

  const [newTask, setNewTask] = useState<Partial<PlannerTask>>({
    title: "",
    subject: "",
    type: "study",
    dueDate: "",
    priority: "medium",
    completed: false,
  })

  const taskTypes = [
    { id: "study", name: "Study", icon: AcademicCapIcon, color: "blue" },
    { id: "revision", name: "Revision", icon: CheckCircleIcon, color: "green" },
    { id: "test", name: "Test", icon: ExclamationTriangleIcon, color: "red" },
    { id: "project", name: "Project", icon: StarIcon, color: "purple" },
  ]

  const priorities = [
    { id: "low", name: "Low", color: "gray" },
    { id: "medium", name: "Medium", color: "yellow" },
    { id: "high", name: "High", color: "red" },
  ]

  useEffect(() => {
    let interval = null
    if (pomodoroState.isActive && pomodoroState.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoroState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }))
      }, 1000)
    } else if (pomodoroState.timeLeft === 0) {
      // Timer finished
      handlePomodoroComplete()
    }
    return () => clearInterval(interval)
  }, [pomodoroState.isActive, pomodoroState.timeLeft])

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoadingData(true)
        console.log("[v0] Starting to fetch subjects and questions for study planner...")

        const subjectsData = await paperAPI.getSubjects()
        console.log("[v0] Study planner subjects data received:", subjectsData)
        setSubjects(subjectsData)

        if (subjectsData.length > 0 && !newTask.subject) {
          setNewTask((prev) => ({ ...prev, subject: subjectsData[0] }))
        }

        const questionsData = await paperAPI.getQuestions()
        console.log("[v0] Study planner questions data received:", questionsData)
        setQuestions(questionsData.questions || questionsData)

        const savedTasks = localStorage.getItem("studyPlannerTasks")
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        }

        loadStudyAnalytics()
      } catch (err) {
        console.error("[v0] Failed to fetch real data for study planner:", err)
        const errorInfo = handleApiError(err)
        setError(errorInfo.message)
      } finally {
        setLoadingData(false)
      }
    }

    fetchRealData()
  }, [])

  const loadStudyAnalytics = () => {
    const analytics = JSON.parse(
      localStorage.getItem("studyAnalytics") ||
        JSON.stringify({
          totalStudyTime: 0,
          completedTasks: 0,
          streak: 0,
          weeklyGoal: 10,
          completedThisWeek: 0,
          averageTaskTime: 0,
          productivityScore: 85,
          subjectProgress: {},
        }),
    )
    setStudyAnalytics(analytics)

    const sessions = JSON.parse(localStorage.getItem("studySessions") || "[]")
    setStudySessions(sessions)
  }

  const startPomodoro = (task = null) => {
    setPomodoroState({
      isActive: true,
      timeLeft: 25 * 60,
      isBreak: false,
      currentTask: task,
      completedPomodoros: pomodoroState.completedPomodoros,
    })
  }

  const pausePomodoro = () => {
    setPomodoroState((prev) => ({ ...prev, isActive: false }))
  }

  const stopPomodoro = () => {
    setPomodoroState({
      isActive: false,
      timeLeft: 25 * 60,
      isBreak: false,
      currentTask: null,
      completedPomodoros: pomodoroState.completedPomodoros,
    })
  }

  const handlePomodoroComplete = () => {
    const newCompletedPomodoros = pomodoroState.completedPomodoros + 1

    // Update analytics
    const updatedAnalytics = {
      ...studyAnalytics,
      totalStudyTime: studyAnalytics.totalStudyTime + 25,
      completedPomodoros: newCompletedPomodoros,
    }
    setStudyAnalytics(updatedAnalytics)
    localStorage.setItem("studyAnalytics", JSON.stringify(updatedAnalytics))

    // Start break or next pomodoro
    const isLongBreak = newCompletedPomodoros % 4 === 0
    setPomodoroState({
      isActive: true,
      timeLeft: isLongBreak ? 15 * 60 : 5 * 60, // 15 min long break, 5 min short break
      isBreak: true,
      currentTask: pomodoroState.currentTask,
      completedPomodoros: newCompletedPomodoros,
    })
  }

  const startStudySession = (task) => {
    const session = {
      id: Date.now().toString(),
      taskId: task.id,
      taskTitle: task.title,
      subject: task.subject,
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      completed: false,
    }
    setActiveStudySession(session)
  }

  const endStudySession = (completed = false) => {
    if (!activeStudySession) return

    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - new Date(activeStudySession.startTime).getTime()) / 1000 / 60) // minutes

    const completedSession = {
      ...activeStudySession,
      endTime: endTime.toISOString(),
      duration,
      completed,
    }

    const updatedSessions = [...studySessions, completedSession]
    setStudySessions(updatedSessions)
    localStorage.setItem("studySessions", JSON.stringify(updatedSessions))

    // Update analytics
    const updatedAnalytics = {
      ...studyAnalytics,
      totalStudyTime: studyAnalytics.totalStudyTime + duration,
      completedTasks: completed ? studyAnalytics.completedTasks + 1 : studyAnalytics.completedTasks,
      averageTaskTime: Math.round(
        (studyAnalytics.totalStudyTime + duration) / (studyAnalytics.completedTasks + (completed ? 1 : 0)),
      ),
    }
    setStudyAnalytics(updatedAnalytics)
    localStorage.setItem("studyAnalytics", JSON.stringify(updatedAnalytics))

    setActiveStudySession(null)
  }

  const generateIntelligentPlan = async () => {
    if (selectedSubjectsForPlan.length === 0) return

    setGeneratingPlan(true)

    try {
      const generatedTasks = []
      const today = new Date()

      for (const subject of selectedSubjectsForPlan) {
        const subjectQuestions = questions.filter((q) => q.subject === subject || q.subjectName === subject)

        const topicAnalysis = analyzeSubjectTopics(subjectQuestions)
        const difficultyDistribution = analyzeDifficulty(subjectQuestions)

        // Generate comprehensive study plan
        const studyPlan = generateSubjectStudyPlan(subject, topicAnalysis, difficultyDistribution, today)
        generatedTasks.push(...studyPlan)
      }

      const optimizedTasks = optimizeTaskScheduling(generatedTasks)

      setTasks((prev) => [...prev, ...optimizedTasks])
      setShowPlanGenerator(false)
      setSelectedSubjectsForPlan([])
    } catch (err) {
      console.error("Failed to generate plan:", err)
    } finally {
      setGeneratingPlan(false)
    }
  }

  const analyzeSubjectTopics = (subjectQuestions) => {
    const topics = {}
    subjectQuestions.forEach((q) => {
      const topic = q.topic || q.courseOutcome || "General"
      if (!topics[topic]) {
        topics[topic] = {
          name: topic,
          questionCount: 0,
          avgDifficulty: 0,
          marks: [],
          importance: 0,
        }
      }
      topics[topic].questionCount += 1
      topics[topic].marks.push(q.marks || 5)
    })

    // Calculate importance and difficulty
    Object.keys(topics).forEach((topicName) => {
      const topic = topics[topicName]
      topic.avgMarks = topic.marks.reduce((a, b) => a + b, 0) / topic.marks.length
      topic.importance = topic.questionCount * topic.avgMarks
    })

    return Object.values(topics).sort((a, b) => b.importance - a.importance)
  }

  const analyzeDifficulty = (subjectQuestions) => {
    const difficulties = { easy: 0, medium: 0, hard: 0 }
    subjectQuestions.forEach((q) => {
      const difficulty = q.difficulty || (q.marks > 7 ? "hard" : q.marks > 4 ? "medium" : "easy")
      difficulties[difficulty] += 1
    })
    return difficulties
  }

  const generateSubjectStudyPlan = (subject, topics, difficulties, startDate) => {
    const tasks = []
    let taskIndex = 0

    // Phase 1: Foundation building (first week)
    topics.slice(0, 3).forEach((topic, index) => {
      const dueDate = new Date(startDate)
      dueDate.setDate(startDate.getDate() + index * 2 + 1)

      tasks.push({
        id: `${Date.now()}-${subject}-foundation-${taskIndex++}`,
        title: `Foundation: ${topic.name}`,
        subject: subject,
        type: "study",
        dueDate: dueDate.toISOString().split("T")[0],
        priority: topic.importance > 50 ? "high" : "medium",
        completed: false,
        description: `Build strong foundation in ${topic.name}. ${topic.questionCount} questions available for practice.`,
        estimatedTime: Math.max(60, topic.importance * 2), // minutes
        tags: ["foundation", "core-concept"],
      })
    })

    // Phase 2: Deep dive (second week)
    topics.slice(0, 5).forEach((topic, index) => {
      const dueDate = new Date(startDate)
      dueDate.setDate(startDate.getDate() + 7 + index * 2)

      tasks.push({
        id: `${Date.now()}-${subject}-deepdive-${taskIndex++}`,
        title: `Deep Dive: ${topic.name}`,
        subject: subject,
        type: "study",
        dueDate: dueDate.toISOString().split("T")[0],
        priority: "medium",
        completed: false,
        description: `Advanced study of ${topic.name}. Focus on complex problems and applications.`,
        estimatedTime: Math.max(90, topic.importance * 3),
        tags: ["advanced", "problem-solving"],
      })
    })

    // Phase 3: Practice and revision (third week)
    const revisionDate = new Date(startDate)
    revisionDate.setDate(startDate.getDate() + 14)

    tasks.push({
      id: `${Date.now()}-${subject}-revision`,
      title: `Comprehensive Revision - ${subject}`,
      subject: subject,
      type: "revision",
      dueDate: revisionDate.toISOString().split("T")[0],
      priority: "high",
      completed: false,
      description: `Complete revision of all ${subject} topics. Review ${topics.length} major topics.`,
      estimatedTime: 120,
      tags: ["revision", "comprehensive"],
    })

    // Phase 4: Testing (fourth week)
    const testDate = new Date(startDate)
    testDate.setDate(startDate.getDate() + 21)

    tasks.push({
      id: `${Date.now()}-${subject}-test`,
      title: `Practice Test - ${subject}`,
      subject: subject,
      type: "test",
      dueDate: testDate.toISOString().split("T")[0],
      priority: "high",
      completed: false,
      description: `Full practice test covering all ${subject} concepts. Simulate exam conditions.`,
      estimatedTime: 180,
      tags: ["test", "assessment"],
    })

    return tasks
  }

  const optimizeTaskScheduling = (tasks) => {
    // Sort by priority and due date
    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) return

    const task: PlannerTask = {
      id: Date.now().toString(),
      title: newTask.title,
      subject: newTask.subject || subjects[0],
      type: newTask.type as "study" | "revision" | "test" | "project",
      dueDate: newTask.dueDate,
      priority: newTask.priority as "low" | "medium" | "high",
      completed: false,
    }

    setTasks((prev) => [...prev, task])
    setNewTask({
      title: "",
      subject: subjects[0] || "",
      type: "study",
      dueDate: "",
      priority: "medium",
      completed: false,
    })
    setShowAddModal(false)
  }

  const handleEditTask = (task: PlannerTask) => {
    setEditingTask(task)
    setNewTask(task)
    setShowAddModal(true)
  }

  const handleUpdateTask = () => {
    if (!editingTask || !newTask.title || !newTask.dueDate) return

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id
          ? {
              ...task,
              title: newTask.title!,
              subject: newTask.subject!,
              type: newTask.type as "study" | "revision" | "test" | "project",
              dueDate: newTask.dueDate!,
              priority: newTask.priority as "low" | "medium" | "high",
            }
          : task,
      ),
    )

    setEditingTask(null)
    setNewTask({
      title: "",
      subject: subjects[0] || "",
      type: "study",
      dueDate: "",
      priority: "medium",
      completed: false,
    })
    setShowAddModal(false)
  }

  const handleToggleComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (task && !task.completed) {
      // Task being completed
      endStudySession(true)

      // Update weekly progress
      const updatedAnalytics = {
        ...studyAnalytics,
        completedThisWeek: studyAnalytics.completedThisWeek + 1,
        completedTasks: studyAnalytics.completedTasks + 1,
      }
      setStudyAnalytics(updatedAnalytics)
      localStorage.setItem("studyAnalytics", JSON.stringify(updatedAnalytics))
    }

    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const getFilteredTasks = () => {
    let filtered = [...tasks]

    // Apply filter
    switch (filter) {
      case "pending":
        filtered = filtered.filter((task) => !task.completed)
        break
      case "completed":
        filtered = filtered.filter((task) => task.completed)
        break
      case "overdue":
        filtered = filtered.filter((task) => {
          const today = new Date()
          const dueDate = new Date(task.dueDate)
          return dueDate < today && !task.completed
        })
        break
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "subject":
          return a.subject.localeCompare(b.subject)
        default:
          return 0
      }
    })

    return filtered
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const stats = getFilteredTasks().length
  const filteredTasks = getFilteredTasks()

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading subjects and syllabus...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-red-600 dark:text-red-400">{error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Smart Study Planner</h1>
            <p className="text-blue-100">AI-powered scheduling with productivity tracking</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{studyAnalytics.streak}</div>
                <div className="text-sm text-blue-200">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{studyAnalytics.productivityScore}%</div>
                <div className="text-sm text-blue-200">Productivity</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{Math.round(studyAnalytics.totalStudyTime / 60)}h</div>
                <div className="text-sm text-blue-200">Study Time</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-900 dark:text-white">
                {formatTime(pomodoroState.timeLeft)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {pomodoroState.isBreak ? "Break Time" : "Focus Time"}
              </div>
            </div>

            <div className="flex space-x-2">
              {!pomodoroState.isActive ? (
                <button
                  onClick={() => startPomodoro()}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <PlayIcon className="w-4 h-4" />
                  <span>Start</span>
                </button>
              ) : (
                <button
                  onClick={pausePomodoro}
                  className="flex items-center space-x-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <PauseIcon className="w-4 h-4" />
                  <span>Pause</span>
                </button>
              )}

              <button
                onClick={stopPomodoro}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <StopIcon className="w-4 h-4" />
                <span>Stop</span>
              </button>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {pomodoroState.currentTask ? `Working on: ${pomodoroState.currentTask.title}` : "No active task"}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completed: {pomodoroState.completedPomodoros} pomodoros today
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CalendarIcon className="w-6 h-6 text-blue-500 mr-2" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tasks.length}</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tasks.filter((t) => t.completed).length}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <ClockIcon className="w-6 h-6 text-yellow-500 mr-2" />
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {tasks.filter((t) => !t.completed).length}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-2" />
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {
                tasks.filter((t) => {
                  const today = new Date()
                  const dueDate = new Date(t.dueDate)
                  return dueDate < today && !t.completed
                }).length
              }
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FireIcon className="w-6 h-6 text-orange-500 mr-2" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{studyAnalytics.streak}</div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrophyIcon className="w-6 h-6 text-purple-500 mr-2" />
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {studyAnalytics.completedThisWeek}/{studyAnalytics.weeklyGoal}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Goal</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="subject">Sort by Subject</option>
          </select>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowPlanGenerator(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            <BoltIcon className="w-4 h-4" />
            <span>AI Smart Plan</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {filter === "all"
                ? "Create your first study task or generate an AI plan to get started."
                : `No ${filter} tasks at the moment.`}
            </p>
            <div className="flex justify-center space-x-2">
              <button
                onClick={() => setShowPlanGenerator(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Generate AI Plan
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="relative group">
                <TaskCard
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onEdit={handleEditTask}
                />
                <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startPomodoro(task)}
                    className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    title="Start Pomodoro"
                  >
                    <PlayIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => startStudySession(task)}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    title="Start Study Session"
                  >
                    <ClockIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan Generator Modal */}
      {showPlanGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate AI Study Plan</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Subjects ({subjects.length} available)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {subjects.map((subject) => (
                    <label key={subject} className="flex items-center space-x-2 py-1">
                      <input
                        type="checkbox"
                        checked={selectedSubjectsForPlan.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSubjectsForPlan((prev) => [...prev, subject])
                          } else {
                            setSelectedSubjectsForPlan((prev) => prev.filter((s) => s !== subject))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  AI will analyze {questions.length} questions in the database to create an intelligent study plan based
                  on topic difficulty and coverage.
                </p>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowPlanGenerator(false)
                  setSelectedSubjectsForPlan([])
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateIntelligentPlan}
                disabled={selectedSubjectsForPlan.length === 0 || generatingPlan}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generatingPlan ? "Generating..." : "Generate Plan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingTask ? "Edit Task" : "Add New Task"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Task Title</label>
                <input
                  type="text"
                  value={newTask.title || ""}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject</label>
                  <select
                    value={newTask.subject || ""}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, subject: e.target.value }))}
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={newTask.type || "study"}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {taskTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate || ""}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                  <select
                    value={newTask.priority || "medium"}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.id} value={priority.id}>
                        {priority.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingTask(null)
                  setNewTask({
                    title: "",
                    subject: subjects[0] || "",
                    type: "study",
                    dueDate: "",
                    priority: "medium",
                    completed: false,
                  })
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingTask ? handleUpdateTask : handleAddTask}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTask ? "Update Task" : "Add Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
