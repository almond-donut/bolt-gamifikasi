import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LoginForm } from './components/auth/LoginForm'
import { Layout } from './components/layout/Layout'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { TeacherManagement } from './components/admin/TeacherManagement'
import { TeacherDashboard } from './components/teacher/TeacherDashboard'
import { StudentList } from './components/teacher/StudentList'
import { QuizManagement } from './components/teacher/QuizManagement'
import { CreateQuiz } from './components/teacher/CreateQuiz'
import { QuestionManagement } from './components/teacher/QuestionManagement'
import { CreateQuestion } from './components/teacher/CreateQuestion'
import { QuizAssignment } from './components/teacher/QuizAssignment'
import { MaterialManagement } from './components/teacher/MaterialManagement'
import { Reports } from './components/teacher/Reports'
import { Settings } from './components/teacher/Settings'
import { StudentDashboard } from './components/student/StudentDashboard'
import { AssignedQuizzes } from './components/student/AssignedQuizzes'
import { QuizResults } from './components/student/QuizResults'
import { Leaderboard } from './components/student/Leaderboard'

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.profile?.role || '')) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

const AppRoutes: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return <LoginForm />
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to={`/${user.profile?.role}`} replace />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/teachers" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TeacherManagement />
          </ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/students" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <StudentList />
          </ProtectedRoute>
        } />
        <Route path="/teacher/quizzes" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <QuizManagement />
          </ProtectedRoute>
        } />
        <Route path="/teacher/quizzes/create" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CreateQuiz />
          </ProtectedRoute>
        } />
        <Route path="/teacher/quizzes/:quizId/questions" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <QuestionManagement />
          </ProtectedRoute>
        } />
        <Route path="/teacher/quizzes/:quizId/questions/create" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <CreateQuestion />
          </ProtectedRoute>
        } />
        <Route path="/teacher/materials" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <MaterialManagement />
          </ProtectedRoute>
        } />
        <Route path="/teacher/assignment" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <QuizAssignment />
          </ProtectedRoute>
        } />
        <Route path="/teacher/reports" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Reports />
          </ProtectedRoute>
        } />
        <Route path="/teacher/settings" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Settings />
          </ProtectedRoute>
        } />
        
        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/quizzes" element={
          <ProtectedRoute allowedRoles={['student']}>
            <AssignedQuizzes />
          </ProtectedRoute>
        } />
        <Route path="/student/results" element={
          <ProtectedRoute allowedRoles={['student']}>
            <QuizResults />
          </ProtectedRoute>
        } />
        <Route path="/student/leaderboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <Leaderboard />
          </ProtectedRoute>
        } />
        
        <Route path="/unauthorized" element={
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-gray-900">Unauthorized</h1>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        } />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App