import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Trophy, Star, Flame, Hash, Clock, Calendar, Play } from 'lucide-react'

interface StudentStats {
  totalPoints: number
  currentLevel: number
  streakDays: number
  classRank: number
  totalStudents: number
  className: string
}

interface Assignment {
  id: string
  quiz: {
    title: string
  }
  due_date: string | null
  status: 'pending' | 'overdue' | 'completed'
  daysLeft?: number
  daysOverdue?: number
}

interface RecentActivity {
  id: string
  quiz_title: string
  score: number
  total_questions: number
  percentage: number
  submitted_at: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon_url: string | null
  unlocked_at: string
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<StudentStats>({
    totalPoints: 0,
    currentLevel: 1,
    streakDays: 0,
    classRank: 1,
    totalStudents: 1,
    className: ''
  })
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user?.profile) return

    try {
      // Fetch student profile with class info
      const { data: profile } = await supabase
        .from('profiles')
        .select(`
          *,
          classes(class_name)
        `)
        .eq('id', user.id)
        .single()

      // Calculate level from points (every 100 points = 1 level)
      const currentLevel = Math.floor((profile?.points || 0) / 100) + 1
      const nextLevelPoints = currentLevel * 100

      // Fetch assignments for student's class
      const { data: assignmentsData } = await supabase
        .from('quiz_assignments')
        .select(`
          id,
          due_date,
          quizzes(title),
          student_submissions!inner(id)
        `)
        .eq('class_id', profile?.class_id)
        .is('student_submissions.student_id', null)

      // Process assignments
      const processedAssignments = assignmentsData?.map(assignment => {
        const now = new Date()
        const dueDate = assignment.due_date ? new Date(assignment.due_date) : null
        let status: 'pending' | 'overdue' | 'completed' = 'pending'
        let daysLeft, daysOverdue

        if (dueDate) {
          const diffTime = dueDate.getTime() - now.getTime()
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          
          if (diffDays < 0) {
            status = 'overdue'
            daysOverdue = Math.abs(diffDays)
          } else {
            daysLeft = diffDays
          }
        }

        return {
          id: assignment.id,
          quiz: assignment.quizzes as any,
          due_date: assignment.due_date,
          status,
          daysLeft,
          daysOverdue
        }
      }) || []

      // Fetch recent submissions
      const { data: submissions } = await supabase
        .from('student_submissions')
        .select(`
          id,
          score,
          submitted_at,
          quiz_assignments(
            quizzes(
              title,
              questions(id)
            )
          )
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(5)

      const processedActivity = submissions?.map(submission => {
        const quiz = (submission.quiz_assignments as any)?.quizzes
        const totalQuestions = quiz?.questions?.length || 1
        const percentage = Math.round((submission.score / totalQuestions) * 100)

        return {
          id: submission.id,
          quiz_title: quiz?.title || 'Unknown Quiz',
          score: submission.score,
          total_questions: totalQuestions,
          percentage,
          submitted_at: submission.submitted_at
        }
      }) || []

      // Fetch recent achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select(`
          unlocked_at,
          achievements(
            id,
            name,
            description,
            icon_url
          )
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false })
        .limit(3)

      const processedAchievements = userAchievements?.map(ua => ({
        id: (ua.achievements as any).id,
        name: (ua.achievements as any).name,
        description: (ua.achievements as any).description,
        icon_url: (ua.achievements as any).icon_url,
        unlocked_at: ua.unlocked_at
      })) || []

      setStats({
        totalPoints: profile?.points || 0,
        currentLevel,
        streakDays: 0, // TODO: Calculate actual streak
        classRank: 1, // TODO: Calculate actual rank
        totalStudents: 1, // TODO: Get actual class size
        className: (profile?.classes as any)?.class_name || 'No Class'
      })

      setAssignments(processedAssignments)
      setRecentActivity(processedActivity)
      setAchievements(processedAchievements)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressToNextLevel = () => {
    const currentLevelPoints = (stats.currentLevel - 1) * 100
    const nextLevelPoints = stats.currentLevel * 100
    const progress = stats.totalPoints - currentLevelPoints
    const maxProgress = nextLevelPoints - currentLevelPoints
    return (progress / maxProgress) * 100
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
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.profile?.full_name}! 🎓
        </h1>
        <p className="text-gray-600">Ready to continue your English learning journey?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalPoints}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Points</h3>
          <p className="text-xs text-gray-500">Points earned across all quizzes</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">Level {stats.currentLevel}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Current Level</h3>
          <p className="text-xs text-gray-500">Progress to Level {stats.currentLevel + 1}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-6 h-6 text-orange-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.streakDays}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Streak Days</h3>
          <p className="text-xs text-gray-500">Consecutive days of learning</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Hash className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">#{stats.classRank} of {stats.totalStudents}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Class Rank</h3>
          <p className="text-xs text-gray-500">In {stats.className}</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Level {stats.currentLevel}</h3>
              <p className="text-blue-100">{stats.totalPoints} total points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-green-200">
              <Flame className="w-5 h-5" />
              <span className="font-bold">{stats.streakDays} day streak</span>
            </div>
            <p className="text-sm">Rank #{stats.classRank} of {stats.totalStudents}</p>
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm">
            <span>Progress to Level {stats.currentLevel + 1}</span>
            <span>{stats.totalPoints} / {stats.currentLevel * 100} points</span>
          </div>
        </div>
        <div className="w-full bg-blue-400 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-300"
            style={{ width: `${getProgressToNextLevel()}%` }}
          ></div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assigned Quizzes */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Assigned Quizzes</h3>
          <p className="text-sm text-gray-600 mb-4">Quizzes assigned by your teacher</p>
          
          <div className="space-y-3">
            {assignments.slice(0, 2).map((assignment) => (
              <div 
                key={assignment.id} 
                className={`p-4 rounded-lg border-2 ${
                  assignment.status === 'overdue' 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{assignment.quiz.title}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      {assignment.status === 'overdue' ? (
                        <>
                          <span className="text-red-600 font-medium">Overdue</span>
                          <span className="text-red-500">{assignment.daysOverdue} days overdue</span>
                        </>
                      ) : (
                        <>
                          <span className="text-blue-600 font-medium">Pending</span>
                          {assignment.daysLeft && (
                            <span className="text-blue-500">{assignment.daysLeft} days left</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Available Quizzes Section */}
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Play className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Available Quizzes</h4>
            </div>
            <p className="text-sm text-gray-600 mb-4">Take these quizzes to earn points and level up!</p>
            
            <div className="space-y-3">
              {[
                { title: 'Quiz Bahasa Inggris', time: '20min' },
                { title: 'Quiz Penilaian Awal', time: '30min' },
                { title: 'Greetings and Introductions Quiz', time: '10min' }
              ].map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Play className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">{quiz.title}</h5>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.time}</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                    Start Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Recent Activity</h3>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.quiz_title}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    {activity.score}/{activity.total_questions}
                  </div>
                  <div className="text-sm text-gray-500">{activity.percentage}%</div>
                </div>
              </div>
            ))}
            
            {recentActivity.length === 0 && (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            )}
          </div>

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold text-gray-900 mb-3">🏆 Recent Achievements</h4>
              <div className="space-y-2">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-2 bg-yellow-50 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">{achievement.name}</p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}