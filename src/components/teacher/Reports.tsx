import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Trophy, Users, BarChart3, Calendar, Download, Filter } from 'lucide-react'

interface TopStudent {
  id: string
  full_name: string
  class_name: string
  total_score: number
  rank: number
}

interface QuizSubmission {
  id: string
  student_name: string
  quiz_title: string
  score: number
  submitted_at: string
}

interface ClassPerformance {
  class_name: string
  average_score: number
  total_submissions: number
  total_students: number
}

export const Reports: React.FC = () => {
  const { user } = useAuth()
  const [topStudents, setTopStudents] = useState<TopStudent[]>([])
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>([])
  const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('all')

  useEffect(() => {
    fetchReportsData()
  }, [user, selectedPeriod])

  const fetchReportsData = async () => {
    if (!user) return

    try {
      // Fetch teacher's classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id, class_name')
        .eq('teacher_id', user.id)

      const classIds = classes?.map(c => c.id) || []

      // Fetch top performing students
      const { data: studentsData } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          points,
          classes(class_name)
        `)
        .eq('role', 'student')
        .in('class_id', classIds)
        .order('points', { ascending: false })
        .limit(10)

      const processedTopStudents = studentsData?.map((student, index) => ({
        id: student.id,
        full_name: student.full_name,
        class_name: (student.classes as any)?.class_name || 'No Class',
        total_score: student.points,
        rank: index + 1
      })) || []

      // Fetch quiz submissions
      const { data: submissionsData } = await supabase
        .from('student_submissions')
        .select(`
          id,
          score,
          submitted_at,
          profiles(full_name),
          quiz_assignments(
            quizzes(title)
          )
        `)
        .in('quiz_assignments.class_id', classIds)
        .order('submitted_at', { ascending: false })
        .limit(20)

      const processedSubmissions = submissionsData?.map(submission => ({
        id: submission.id,
        student_name: (submission.profiles as any)?.full_name || 'Unknown',
        quiz_title: (submission.quiz_assignments as any)?.quizzes?.title || 'Unknown Quiz',
        score: submission.score,
        submitted_at: submission.submitted_at
      })) || []

      setTopStudents(processedTopStudents)
      setQuizSubmissions(processedSubmissions)
    } catch (error) {
      console.error('Error fetching reports data:', error)
    } finally {
      setLoading(false)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Analyze student performance and track progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{topStudents.length}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Active Students</h3>
          <p className="text-xs text-gray-500">Students in your classes</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{quizSubmissions.length}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Submissions</h3>
          <p className="text-xs text-gray-500">Quiz attempts this period</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">
              {quizSubmissions.length > 0 
                ? Math.round(quizSubmissions.reduce((acc, sub) => acc + sub.score, 0) / quizSubmissions.length)
                : 0
              }%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
          <p className="text-xs text-gray-500">Across all quizzes</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">
              {quizSubmissions.filter(sub => {
                const submissionDate = new Date(sub.submitted_at)
                const today = new Date()
                const diffTime = today.getTime() - submissionDate.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return diffDays <= 7
              }).length}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">This Week</h3>
          <p className="text-xs text-gray-500">Recent submissions</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Students */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Students</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Leaderboard of students with the highest total scores.</p>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.rank}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{student.class_name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{student.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {topStudents.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
              <p className="mt-1 text-sm text-gray-500">Students will appear here once they start taking quizzes.</p>
            </div>
          )}
        </div>

        {/* Student Quiz Submissions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Student Quiz Submissions</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Detailed scores for each quiz submitted by your students.</p>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {quizSubmissions.map((submission) => (
              <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{submission.student_name}</h4>
                  <p className="text-sm text-gray-600">{submission.quiz_title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(submission.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">{submission.score}</div>
                  <div className="text-sm text-gray-500">Score</div>
                </div>
              </div>
            ))}
          </div>

          {quizSubmissions.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
              <p className="mt-1 text-sm text-gray-500">Quiz submissions will appear here once students start taking quizzes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}