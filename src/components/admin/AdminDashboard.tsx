import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, GraduationCap, BookOpen, FileText, Trophy, TrendingUp, Plus } from 'lucide-react'
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
    totalStudents: 45,
    totalClasses: 6,
    totalQuizzes: 24,
    totalMaterials: 0,
    totalAchievements: 8
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
        totalStudents: students.count || 45,
        totalClasses: classes.count || 6,
        totalQuizzes: quizzes.count || 24,
        totalMaterials: materials.count || 0,
        totalAchievements: achievements.count || 8
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { 
      title: 'Total Pengguna', 
      value: stats.totalStudents, 
      icon: Users, 
      iconBg: 'clay-blue',
      change: '+12%',
      changeText: 'dari minggu lalu'
    },
    { 
      title: 'Total Kelas', 
      value: stats.totalClasses, 
      icon: BookOpen, 
      iconBg: 'clay-green',
      change: '+8%',
      changeText: 'dari minggu lalu'
    },
    { 
      title: 'Total Kuis', 
      value: stats.totalQuizzes, 
      icon: Target, 
      iconBg: 'clay-purple',
      change: '+15%',
      changeText: 'dari minggu lalu'
    },
    { 
      title: 'Guru Aktif', 
      value: stats.totalAchievements, 
      icon: Award, 
      iconBg: 'clay-orange',
      change: '+5%',
      changeText: 'dari minggu lalu'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Selamat pagi, Administrator SMK Wiworotomo! 🫖
          </h1>
          <p className="text-gray-600 mt-2">Kelola platform pembelajaran dengan mudah</p>
        </div>
        <div className="flex space-x-3">
          <button className="clay-button-secondary flex items-center space-x-2 px-4 py-3">
            <Users className="w-5 h-5" />
            <span>Tambah Pengguna</span>
          </button>
          <button className="clay-button-tertiary flex items-center space-x-2 px-4 py-3">
            <BookOpen className="w-5 h-5" />
            <span>Buat Kelas</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={card.title} className="clay-stats-card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`clay-icon w-12 h-12 ${card.iconBg}`}>
                <card.icon className="w-6 h-6 text-gray-700" />
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">{card.change}</span>
              <span className="text-gray-500">{card.changeText}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Notifications */}
        <div className="clay-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="clay-icon w-8 h-8 clay-orange">
              <Bell className="w-4 h-4 text-orange-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Notifikasi Terbaru</h3>
          </div>
          
          <div className="space-y-4">
            <div className="clay-card p-4">
              <div className="flex items-start space-x-3">
                <div className="clay-icon w-8 h-8 clay-blue">
                  <FileText className="w-4 h-4 text-blue-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Kuis Baru Tersedia</h4>
                  <p className="text-sm text-gray-600">Reading Comprehension Quiz telah ditugaskan</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="clay-badge clay-blue text-blue-700">quiz assigned</span>
                    <span className="clay-notification-dot"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Summary */}
        <div className="clay-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <div className="clay-icon w-8 h-8 clay-yellow">
              <Trophy className="w-4 h-4 text-yellow-700" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Ringkasan Hari Ini</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="clay-icon w-8 h-8 clay-orange">
                  <TrendingUp className="w-4 h-4 text-orange-700" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Streak Hari Ini</p>
                  <p className="text-sm text-gray-600">Target Mingguan</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-orange-600">3 hari</span>
                </div>
                <p className="text-sm text-green-600 font-medium">80% tercapai</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="clay-card p-6">
        <div className="text-center py-12">
          <div className="clay-icon w-16 h-16 clay-purple mx-auto mb-4">
            <Target className="w-8 h-8 text-purple-700" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aktivitas terbaru</h3>
          <p className="text-gray-600">Aktivitas pengguna akan muncul di sini</p>
        </div>
      </div>
    </div>
  )
}