import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Clock, Calendar, CheckCircle, AlertCircle, Play, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface Assignment {
  id: string
  quiz: {
    id: string
    title: string
    description: string
  }
  due_date: string | null
  assigned_at: string
  status: 'pending' | 'completed' | 'overdue'
  completion_status?: {
    score: number
    submitted_at: string
    total_questions: number
  }
  time_estimate: number
  points_possible: number
  daysLeft?: number
  daysOverdue?: number
}

export const AssignedQuizzes: React.FC = () => {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null)

  useEffect(() => {
    fetchAssignments()
  }, [user])

  const fetchAssignments = async () => {
    if (!user?.profile?.class_id) return

    try {
      const { data: assignmentsData, error } = await supabase
        .from('quiz_assignments')
        .select(`
          id,
          due_date,
          created_at,
          quizzes(
            id,
            title,
            description,
            questions(id, points_value)
          ),
          student_submissions(
            score,
            submitted_at
          )
        `)
        .eq('class_id', user.profile.class_id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const processedAssignments = assignmentsData?.map(assignment => {
        const quiz = assignment.quizzes as any
        const submission = (assignment.student_submissions as any[])?.[0]
        const now = new Date()
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
        
        let status: 'pending' | 'completed' | 'overdue' = 'pending'
        let daysLeft, daysOverdue

        if (submission) {
          status = 'completed'
        } else if (dueDate) {
          const diffTime = dueDate.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays < 0) {
            status = 'overdue'
            daysOverdue = Math.abs(diffDays)
          } else {
            daysLeft = diffDays
          }
        }

        const totalQuestions = quiz?.questions?.length || 0
        const pointsPossible = quiz?.questions?.reduce((acc: number, q: any) => acc + (q.points_value || 2), 0) || 0

        return {
          id: assignment.id,
          quiz: {
            id: quiz?.id || '',
            title: quiz?.title || 'Unknown Quiz',
            description: quiz?.description || ''
          },
          due_date: assignment.due_date,
          assigned_at: assignment.created_at,
          status,
          completion_status: submission ? {
            score: submission.score,
            submitted_at: submission.submitted_at,
            total_questions: totalQuestions
          } : undefined,
          time_estimate: totalQuestions * 2, // 2 minutes per question
          points_possible: pointsPossible,
          daysLeft,
          daysOverdue
        }
      }) || []

      setAssignments(processedAssignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
      toast.error('Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = (assignmentId: string) => {
    setShowConfirmModal(assignmentId)
  }

  const confirmStartQuiz = () => {
    if (showConfirmModal) {
      // TODO: Navigate to quiz taking interface
      toast.success('Starting quiz...')
      setShowConfirmModal(null)
    }
  }

  const getStatusBadge = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'completed':
        return (
          <div className="flex items-center space-x-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">completed</span>
          </div>
        )
      case 'overdue':
        return (
          <div className="flex items-center space-x-1 text-red-600">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Overdue</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1 text-blue-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">pending</span>
          </div>
        )
    }
  }

  const getCardStyle = (assignment: Assignment) => {
    switch (assignment.status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'overdue':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true
    if (filter === 'pending') return assignment.status === 'pending' || assignment.status === 'overdue'
    if (filter === 'completed') return assignment.status === 'completed'
    return true
  })

  const pendingCount = assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length
  const completedCount = assignments.filter(a => a.status === 'completed').length

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
          <h1 className="text-2xl font-bold text-gray-900">Assigned Quizzes</h1>
          <p className="text-gray-600">Quizzes assigned by your teacher</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div
            key={assignment.id}
            className={`border-2 rounded-lg p-6 ${getCardStyle(assignment)}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.quiz.title}</h3>
                  {getStatusBadge(assignment)}
                </div>
                <p className="text-gray-600 mb-3">{assignment.quiz.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-600">Time: {assignment.time_estimate}min</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">Points: {assignment.points_possible} each</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-gray-600">
                      Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}
                    </span>
                  </div>
                  {assignment.due_date && (
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-gray-600">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {assignment.status === 'pending' && assignment.daysLeft !== undefined && (
                  <div className="mt-3 text-sm text-blue-600">
                    📅 {assignment.daysLeft} days left
                  </div>
                )}

                {assignment.status === 'overdue' && assignment.daysOverdue !== undefined && (
                  <div className="mt-3 text-sm text-red-600">
                    ⚠️ {assignment.daysOverdue} days overdue
                  </div>
                )}

                {assignment.completion_status && (
                  <div className="mt-3 p-3 bg-green-100 rounded-lg">
                    <div className="flex items-center space-x-2 text-green-800">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium">Completed!</span>
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      Score: {assignment.completion_status.score}/{assignment.completion_status.total_questions} • 
                      Questions: {assignment.completion_status.total_questions} • 
                      Submitted: {new Date(assignment.completion_status.submitted_at).toLocaleDateString()}
                    </div>
                    <button className="mt-2 text-sm text-green-700 hover:text-green-900 font-medium">
                      Review Results
                    </button>
                  </div>
                )}
              </div>

              <div className="ml-6">
                {assignment.status === 'completed' ? (
                  <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                    Open
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartQuiz(assignment.id)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    Start Quiz
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <Play className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No {filter === 'all' ? '' : filter} quizzes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'No quizzes have been assigned yet.'
              : `No ${filter} quizzes to display.`
            }
          </p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Quiz Start</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to take this quiz? Once you start, you have to finish it.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmStartQuiz}
                className="flex-1 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}