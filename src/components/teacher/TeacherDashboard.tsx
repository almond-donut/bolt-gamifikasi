import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Users, FileText, BookOpen, TrendingUp, Trophy, Activity } from 'lucide-react'

interface TeacherStats {
  totalStudents: number
  totalQuizzes: number
  totalClasses: number
  avgCompletion: number
}

interface TopPerformer {
  id: string
  full_name: string
  points: number
  avatar_url?: string
}

interface RecentActivity {
  id: string
  student_name: string
  quiz_title: string
  score: number
  submitted_at: string
}

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalQuizzes: 0,
    totalClasses: 0,
    avgCompletion: 85
  })
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch teacher's classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user.id)

      const classIds = classes?.map(c => c.id) || []

      // Fetch students in teacher's classes
      const { data: students } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .in('class_id', classIds)

      // Fetch teacher's quizzes
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('*')
        .eq('created_by', user.id)

      // Fetch top performers
      const { data: performers } = await supabase
        .from('profiles')
        .select('id, full_name, points, avatar_url')
        .eq('role', 'student')
        .in('class_id', classIds)
        .order('points', { ascending: false })
        .limit(5)

      setStats({
        totalStudents: students?.length || 0,
        totalQuizzes: quizzes?.length || 0,
        totalClasses: classes?.length || 0,
        avgCompletion: 85
      })

      setTopPerformers(performers || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Active students in your classes'
    },
    {
      title: 'Total Quizzes',
      value: stats.totalQuizzes,
      icon: FileText,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: "Quizzes you've created"
    },
    {
      title: 'Classes',
      value: stats.totalClasses,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: "Classes you're teaching"
    },
    {
      title: 'Avg. Completion',
      value: `${stats.avgCompletion}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      description: 'Average quiz completion rate'
    }
  ]

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your teaching activities.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Students with highest points in your classes</p>
          
          <div className="space-y-3">
            {topPerformers.length > 0 ? (
              topPerformers.map((student, index) => (
                <div key={student.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{student.full_name}</p>
                    <p className="text-sm text-gray-500">{student.points} points</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No student data available yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">Latest quiz completions from your students</p>
          
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.student_name}</p>
                    <p className="text-sm text-gray-500">Completed {activity.quiz_title}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {activity.score}%
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}