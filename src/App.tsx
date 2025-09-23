"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Layout } from "./components/Layout"
import { Login } from "./pages/Login"
import { Signup } from "./pages/Signup"

// Student pages
import { StudentDashboard } from "./pages/student/StudentDashboard"
import { PYQExplorer } from "./pages/student/PYQExplorer"
import { MockTestSystem } from "./pages/student/MockTestSystem"
import { MockTestGenerator } from "./pages/student/MockTestGenerator"
import { MockTestTaking } from "./pages/student/MockTestTaking"
import { SummarizationPage } from "./pages/student/SummarizationPage"
import { StudyPlanner } from "./pages/student/StudyPlanner"

// Admin pages
import { AdminDashboard } from "./pages/admin/AdminDashboard"
import { ManagePYQs } from "./pages/admin/ManagePYQs"
import { ManageTests } from "./pages/admin/ManageTests"
import { ManageUsers } from "./pages/admin/ManageUsers"
import Analytics from "./pages/admin/Analytics"
import Settings from "./pages/admin/Settings"

const AppRoutes: React.FC = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === "student" ? "/student" : "/admin"} /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to={user.role === "student" ? "/student" : "/admin"} /> : <Signup />}
      />

      {/* Student Routes with Layout */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="pyq" element={<PYQExplorer />} />
        <Route path="mock-test" element={<MockTestSystem />} />
        <Route path="mock-test/generator" element={<MockTestGenerator />} />
        <Route path="mock-test/take/:testId" element={<MockTestTaking />} />
        <Route path="summary" element={<SummarizationPage />} />
        <Route path="planner" element={<StudyPlanner />} />
        
      </Route>

      {/* Admin Routes with Layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pyq" element={<ManagePYQs />} />
        <Route path="tests" element={<ManageTests />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Default redirects */}
      <Route
        path="/"
        element={user ? <Navigate to={user.role === "student" ? "/student" : "/admin"} /> : <Navigate to="/login" />}
      />
    </Routes>
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
