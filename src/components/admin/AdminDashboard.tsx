import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, GraduationCap, BookOpen, FileText, Trophy, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface DashboardStats {
  totalTeachers: number
  totalStudents: number
  totalClasses: number
  totalQuizzes: number
  totalMaterials: number
  totalAchievements: number
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachers: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalQuizzes: 0,
    totalMaterials: 0,
    totalAchievements: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [teachers, students, classes, quizzes, materials, achievements] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'teacher'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('classes').select('id', { count: 'exact' }),
        supabase.from('quizzes').select('id', { count: 'exact' }),
        supabase.from('materials').select('id', { count: 'exact' }),
        supabase.from('achievements').select('id', { count: 'exact' })
      ])

      setStats({
        totalTeachers: teachers.count || 0,
        totalStudents: students.count || 0,
        totalClasses: classes.count || 0,
        totalQuizzes: quizzes.count || 0,
        totalMaterials: materials.count || 0,
        totalAchievements: achievements.count || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Total Classes', value: stats.totalClasses, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Total Quizzes', value: stats.totalQuizzes, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Total Materials', value: stats.totalMaterials, icon: FileText, color: 'text-teal-600', bg: 'bg-teal-50' },
    { title: 'Achievements', value: stats.totalAchievements, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' }
  ]

  const userDistribution = [
    { name: 'Teachers', value: stats.totalTeachers, color: '#3B82F6' },
    { name: 'Students', value: stats.totalStudents, color: '#10B981' }
  ]

  const contentData = [
    { name: 'Quizzes', value: stats.totalQuizzes },
    { name: 'Materials', value: stats.totalMaterials },
    { name: 'Classes', value: stats.totalClasses },
    { name: 'Achievements', value: stats.totalAchievements }
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          <span>Platform Overview</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bg}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {userDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">System initialized</p>
              <p className="text-sm text-gray-500">Platform ready for use</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}