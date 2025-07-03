import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { BarChart3, Trophy, Clock, Target, TrendingUp, Zap, Award, Calendar } from 'lucide-react'

interface QuizResult {
  id: string
  quiz_title: string
  score: number
  total_questions: number
  percentage: number
  points_earned: number
  time_spent: number
  submitted_at: string
  difficulty_breakdown: {
    easy: { correct: number; total: number; points: number }
    medium: { correct: number; total: number; points: number }
    hard: { correct: number; total: number; points: number }
  }
}

interface QuizStats {
  totalQuizzes: number
  averageScore: number
  bestScore: number
  pointsEarned: number
  timeSpent: number
}

export const QuizResults: React.FC = () => {
  const { user } = useAuth()
  const [results, setResults] = useState<QuizResult[]>([])
  const [stats, setStats] = useState<QuizStats>({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    pointsEarned: 0,
    timeSpent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQuizResults()
  }, [user])

  const fetchQuizResults = async () => {
    if (!user) return

    try {
      const { data: submissions, error } = await supabase
        .from('student_submissions')
        .select(`
          id,
          score,
          submitted_at,
          answers,
          quiz_assignments(
            quizzes(
              title,
              questions(id, difficulty, points_value)
            )
          )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })

      if (error) throw error

      const processedResults = submissions?.map(submission => {
        const quiz = (submission.quiz_assignments as any)?.quizzes
        const questions = quiz?.questions || []
        const totalQuestions = questions.length
        const percentage = totalQuestions > 0 ? Math.round((submission.score / totalQuestions) * 100) : 0
        
        // Calculate difficulty breakdown
        const difficultyBreakdown = {
          easy: { correct: 0, total: 0, points: 0 },
          medium: { correct: 0, total: 0, points: 0 },
          hard: { correct: 0, total: 0, points: 0 }
        }

        questions.forEach((q: any, index: number) => {
          const difficulty = q.difficulty as 'easy' | 'medium' | 'hard'
          difficultyBreakdown[difficulty].total++
          
          // Assume answers are stored as array of correct/incorrect
          const answers = submission.answers as any[] || []
          if (answers[index] === true) {
            difficultyBreakdown[difficulty].correct++
            difficultyBreakdown[difficulty].points += q.points_value || 2
          }
        })

        const pointsEarned = Object.values(difficultyBreakdown).reduce((acc, d) => acc + d.points, 0)

        return {
          id: submission.id,
          quiz_title: quiz?.title || 'Unknown Quiz',
          score: submission.score,
          total_questions: totalQuestions,
          percentage,
          points_earned: pointsEarned,
          time_spent: 0, // TODO: Calculate actual time
          submitted_at: submission.submitted_at,
          difficulty_breakdown: difficultyBreakdown
        }
      }) || []

      // Calculate overall stats
      const totalQuizzes = processedResults.length
      const averageScore = totalQuizzes > 0 
        ? Math.round(processedResults.reduce((acc, r) => acc + r.percentage, 0) / totalQuizzes)
        : 0
      const bestScore = totalQuizzes > 0 
        ? Math.max(...processedResults.map(r => r.percentage))
        : 0
      const pointsEarned = processedResults.reduce((acc, r) => acc + r.points_earned, 0)
      const timeSpent = processedResults.reduce((acc, r) => acc + r.time_spent, 0)

      setResults(processedResults)
      setStats({
        totalQuizzes,
        averageScore,
        bestScore,
        pointsEarned,
        timeSpent
      })
    } catch (error) {
      console.error('Error fetching quiz results:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'hard':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Zap className="w-4 h-4" />
      case 'medium':
        return <Target className="w-4 h-4" />
      case 'hard':
        return <Award className="w-4 h-4" />
      default:
        return <BarChart3 className="w-4 h-4" />
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quiz Results & Gamification</h1>
        <p className="text-gray-600">Track your learning progress and earning achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Quizzes</h3>
          <p className="text-xs text-gray-500">Completed</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.averageScore}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
          <p className="text-xs text-gray-500">Overall performance</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.bestScore}%</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Best Score</h3>
          <p className="text-xs text-gray-500">Personal best</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.pointsEarned}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Points Earned</h3>
          <p className="text-xs text-gray-500">Total points</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.timeSpent}m</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Time Spent</h3>
          <p className="text-xs text-gray-500">Learning time</p>
        </div>
      </div>

      {/* Performance by Difficulty */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Performance by Difficulty</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">Your success rate across different difficulty levels</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['easy', 'medium', 'hard'].map((difficulty) => {
            const totalCorrect = results.reduce((acc, r) => acc + r.difficulty_breakdown[difficulty as keyof typeof r.difficulty_breakdown].correct, 0)
            const totalQuestions = results.reduce((acc, r) => acc + r.difficulty_breakdown[difficulty as keyof typeof r.difficulty_breakdown].total, 0)
            const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
            const pointsPerQuestion = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 5

            return (
              <div key={difficulty} className="text-center">
                <div className={`flex items-center justify-center space-x-2 mb-2 ${getDifficultyColor(difficulty)}`}>
                  {getDifficultyIcon(difficulty)}
                  <span className="font-medium capitalize">{difficulty} Questions</span>
                  <span className="text-sm text-gray-500">{pointsPerQuestion} points each</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Correct: {totalCorrect}/{totalQuestions}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      difficulty === 'easy' ? 'bg-green-500' :
                      difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-lg font-bold text-gray-900">{percentage}%</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Results */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Results</h3>
        
        <div className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{result.quiz_title}</h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(result.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{result.time_spent}m</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{result.percentage}%</div>
                  <div className="text-sm text-gray-500">{result.points_earned} points earned</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Overall Progress</span>
                  <span>{result.percentage}% ({result.score}/{result.total_questions} correct)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${result.percentage}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-3">Performance by Difficulty:</h5>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(result.difficulty_breakdown).map(([difficulty, data]) => (
                    <div key={difficulty} className="text-center">
                      <div className={`flex items-center justify-center space-x-1 mb-1 ${getDifficultyColor(difficulty)}`}>
                        {getDifficultyIcon(difficulty)}
                        <span className="text-sm font-medium capitalize">{difficulty}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.correct}/{data.total}
                      </div>
                      <div className="text-xs text-gray-500">
                        +{data.points} pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No quiz results yet</h3>
            <p className="mt-1 text-sm text-gray-500">Complete some quizzes to see your results here.</p>
          </div>
        )}
      </div>
    </div>
  )
}