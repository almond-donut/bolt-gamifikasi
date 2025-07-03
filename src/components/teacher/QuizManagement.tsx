import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit2, Trash2, FileText, Clock, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Quiz {
  id: string
  title: string
  description: string
  created_at: string
  question_count: number
  estimated_time: number
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
}

export const QuizManagement: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizzes()
  }, [user])

  const fetchQuizzes = async () => {
    if (!user) return

    try {
      const { data: quizzesData, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          created_at,
          questions(id, difficulty)
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const quizzesWithStats = quizzesData?.map(quiz => {
        const questions = (quiz.questions as any[]) || []
        const difficulties = questions.map(q => q.difficulty)
        const difficultyCount = {
          easy: difficulties.filter(d => d === 'easy').length,
          medium: difficulties.filter(d => d === 'medium').length,
          hard: difficulties.filter(d => d === 'hard').length
        }

        let overallDifficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'easy'
        if (difficultyCount.easy > 0 && difficultyCount.medium > 0 && difficultyCount.hard > 0) {
          overallDifficulty = 'mixed'
        } else if (difficultyCount.hard > difficultyCount.medium && difficultyCount.hard > difficultyCount.easy) {
          overallDifficulty = 'hard'
        } else if (difficultyCount.medium > difficultyCount.easy) {
          overallDifficulty = 'medium'
        }

        return {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          created_at: quiz.created_at,
          question_count: questions.length,
          estimated_time: questions.length * 2, // 2 minutes per question
          difficulty: overallDifficulty
        }
      }) || []

      setQuizzes(quizzesWithStats)
    } catch (error) {
      console.error('Error fetching quizzes:', error)
      toast.error('Failed to load quizzes')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId)

      if (error) throw error

      toast.success('Quiz deleted successfully')
      fetchQuizzes()
    } catch (error) {
      console.error('Error deleting quiz:', error)
      toast.error('Failed to delete quiz')
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
      mixed: 'bg-purple-100 text-purple-800'
    }
    return badges[difficulty as keyof typeof badges] || badges.easy
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
          <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
          <p className="text-gray-600">Create, manage, and track your quizzes all in one place.</p>
        </div>
        <button
          onClick={() => navigate('/teacher/quizzes/create')}
          className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{quiz.description}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadge(quiz.difficulty)}`}>
                {quiz.difficulty}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>{quiz.question_count} Qs</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{quiz.estimated_time}m</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(`/teacher/quizzes/${quiz.id}/questions`)}
                className="flex items-center space-x-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
              >
                <span>Kelola Soal</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/teacher/quizzes/${quiz.id}/edit`)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Quiz"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Quiz"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No quizzes yet</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating your first quiz.</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/teacher/quizzes/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  )
}