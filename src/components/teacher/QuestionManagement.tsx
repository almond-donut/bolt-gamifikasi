import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Question {
  id: string
  question_text: string
  question_type: 'multiple_choice' | 'fill_in_the_blank'
  difficulty: 'easy' | 'medium' | 'hard'
  points_value: number
  options: any
  media_type: 'image' | 'youtube' | 'none'
  media_url: string | null
}

interface Quiz {
  id: string
  title: string
  description: string
}

export const QuestionManagement: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (quizId) {
      fetchQuizAndQuestions()
    }
  }, [quizId])

  const fetchQuizAndQuestions = async () => {
    if (!quizId) return

    try {
      // Fetch quiz details
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single()

      if (quizError) throw quizError
      setQuiz(quizData)

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('created_at')

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error fetching quiz and questions:', error)
      toast.error('Failed to load quiz data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      toast.success('Question deleted successfully')
      fetchQuizAndQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      toast.error('Failed to delete question')
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    }
    return badges[difficulty as keyof typeof badges] || badges.easy
  }

  const getCorrectAnswer = (question: Question) => {
    if (question.question_type === 'multiple_choice' && question.options?.choices) {
      const correctChoice = question.options.choices.find((choice: any) => choice.is_correct)
      return correctChoice?.text || 'No correct answer set'
    }
    return question.options?.correct_answer || 'No answer set'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Quiz not found</h3>
        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Quizzes
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Quizzes</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Question Management</h1>
            <p className="text-gray-600">Kelola soal untuk quiz: {quiz.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/teacher/quizzes/${quizId}/questions/create`)}
            className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Soal</span>
          </button>
          <button
            onClick={() => navigate('/teacher/quizzes')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Kembali ke Quiz
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">Soal #{index + 1}</span>
                <span className="text-sm font-medium text-gray-900">{question.points_value} point</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadge(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/teacher/quizzes/${quizId}/questions/${question.id}/edit`)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Question"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(question.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question_text}</h3>

            {question.question_type === 'multiple_choice' && question.options?.choices && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {question.options.choices.map((choice: any, choiceIndex: number) => (
                  <div
                    key={choiceIndex}
                    className={`p-3 rounded-lg border-2 ${
                      choice.is_correct
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-700">
                        {String.fromCharCode(65 + choiceIndex)}.
                      </span>
                      <span className="text-gray-900">{choice.text}</span>
                      {choice.is_correct && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {question.question_type === 'fill_in_the_blank' && (
              <div className="mb-4">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm font-medium text-green-800">Correct Answer: </span>
                  <span className="text-green-900">{question.options?.correct_answer}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No questions yet</h3>
          <p className="text-gray-600 mb-6">Start building your quiz by adding questions.</p>
          <button
            onClick={() => navigate(`/teacher/quizzes/${quizId}/questions/create`)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Question
          </button>
        </div>
      )}
    </div>
  )
}