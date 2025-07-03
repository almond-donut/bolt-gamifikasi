import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Send, Calendar, Clock, Users, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Quiz {
  id: string
  title: string
  description: string
  question_count: number
}

interface Class {
  id: string
  class_name: string
}

interface Assignment {
  id: string
  quiz: {
    title: string
  }
  class: {
    class_name: string
  }
  due_date: string
  status: 'active' | 'expired' | 'draft'
  created_at: string
  submission_count: number
  total_students: number
}

export const QuizAssignment: React.FC = () => {
  const { user } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignForm, setShowAssignForm] = useState(false)
  const [formData, setFormData] = useState({
    quiz_id: '',
    class_id: '',
    due_date: ''
  })

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return

    try {
      // Fetch teacher's quizzes
      const { data: quizzesData } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          questions(id)
        `)
        .eq('created_by', user.id)

      const quizzesWithCount = quizzesData?.map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        question_count: (quiz.questions as any[])?.length || 0
      })) || []

      // Fetch teacher's classes
      const { data: classesData } = await supabase
        .from('classes')
        .select('id, class_name')
        .eq('teacher_id', user.id)

      // Fetch assignments
      const { data: assignmentsData } = await supabase
        .from('quiz_assignments')
        .select(`
          id,
          due_date,
          status,
          created_at,
          quizzes(title),
          classes(class_name)
        `)
        .eq('assigned_by', user.id)
        .order('created_at', { ascending: false })

      const assignmentsWithStats = assignmentsData?.map(assignment => ({
        id: assignment.id,
        quiz: assignment.quizzes as any,
        class: assignment.classes as any,
        due_date: assignment.due_date,
        status: assignment.status as 'active' | 'expired' | 'draft',
        created_at: assignment.created_at,
        submission_count: 0, // TODO: Calculate actual submissions
        total_students: 0 // TODO: Calculate actual student count
      })) || []

      setQuizzes(quizzesWithCount)
      setClasses(classesData || [])
      setAssignments(assignmentsWithStats)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignQuiz = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await supabase
        .from('quiz_assignments')
        .insert({
          quiz_id: formData.quiz_id,
          class_id: formData.class_id,
          due_date: formData.due_date || null,
          assigned_by: user.id,
          status: 'active'
        })

      if (error) throw error

      toast.success('Quiz assigned successfully!')
      setShowAssignForm(false)
      setFormData({ quiz_id: '', class_id: '', due_date: '' })
      fetchData()
    } catch (error) {
      console.error('Error assigning quiz:', error)
      toast.error('Failed to assign quiz')
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const { error } = await supabase
        .from('quiz_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error

      toast.success('Assignment deleted successfully!')
      fetchData()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      toast.error('Failed to delete assignment')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      draft: 'bg-yellow-100 text-yellow-800'
    }
    return badges[status as keyof typeof badges] || badges.draft
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Assignment</h1>
          <p className="text-gray-600">Assign quizzes to your classes</p>
        </div>
        <button
          onClick={() => setShowAssignForm(true)}
          className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Send className="w-5 h-5" />
          <span>Assign Quiz</span>
        </button>
      </div>

      {/* Assign Quiz Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Quiz to Class</h3>
            <form onSubmit={handleAssignQuiz} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Quiz
                </label>
                <select
                  value={formData.quiz_id}
                  onChange={(e) => setFormData({ ...formData, quiz_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a quiz...</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.id} value={quiz.id}>
                      {quiz.title} ({quiz.question_count} questions)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Class
                </label>
                <select
                  value={formData.class_id}
                  onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Assign Quiz
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Current Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Assignments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {assignment.quiz.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Assigned to: {assignment.class.class_name}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(assignment.status)}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(assignment.status)}`}>
                    {assignment.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {assignment.due_date 
                      ? `Due: ${new Date(assignment.due_date).toLocaleDateString()}`
                      : 'No due date'
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{assignment.submission_count}/{assignment.total_students} submitted</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Assigned: {new Date(assignment.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-100 transition-colors">
                  View Results
                </button>
                <button
                  onClick={() => handleDeleteAssignment(assignment.id)}
                  className="px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {assignments.length === 0 && (
          <div className="text-center py-12">
            <Send className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start by assigning a quiz to your classes.</p>
          </div>
        )}
      </div>
    </div>
  )
}