import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Trophy, Users, Target, TrendingUp, Medal, Crown, Award } from 'lucide-react'

interface LeaderboardStudent {
  id: string
  full_name: string
  points: number
  level: number
  streak_days: number
  class_name: string
  rank: number
}

interface LeaderboardStats {
  yourRank: number
  averageScore: number
  topScore: number
  totalStudents: number
}

export const Leaderboard: React.FC = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState<LeaderboardStudent[]>([])
  const [stats, setStats] = useState<LeaderboardStats>({
    yourRank: 0,
    averageScore: 0,
    topScore: 0,
    totalStudents: 0
  })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'class' | 'school'>('class')

  useEffect(() => {
    fetchLeaderboard()
  }, [user, viewMode])

  const fetchLeaderboard = async () => {
    if (!user?.profile) return

    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          points,
          classes(class_name)
        `)
        .eq('role', 'student')

      if (viewMode === 'class' && user.profile.class_id) {
        query = query.eq('class_id', user.profile.class_id)
      }

      const { data, error } = await query.order('points', { ascending: false })

      if (error) throw error

      const processedStudents = data?.map((student, index) => ({
        id: student.id,
        full_name: student.full_name,
        points: student.points,
        level: Math.floor(student.points / 100) + 1,
        streak_days: 0, // TODO: Calculate actual streak
        class_name: (student.classes as any)?.class_name || 'No Class',
        rank: index + 1
      })) || []

      const userRank = processedStudents.findIndex(s => s.id === user.id) + 1
      const averageScore = processedStudents.length > 0 
        ? Math.round(processedStudents.reduce((acc, s) => acc + s.points, 0) / processedStudents.length)
        : 0
      const topScore = processedStudents.length > 0 ? processedStudents[0].points : 0

      setStudents(processedStudents)
      setStats({
        yourRank: userRank,
        averageScore,
        topScore,
        totalStudents: processedStudents.length
      })
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-gray-500">#{rank}</span>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 3:
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
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
        <div className="flex items-center space-x-3">
          <Trophy className="w-6 h-6 text-yellow-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
            <p className="text-gray-600">See how you rank against your classmates</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('class')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'class'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>My Class</span>
          </button>
          <button
            onClick={() => setViewMode('school')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'school'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>School</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">#{stats.yourRank}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Your Rank</h3>
          <p className="text-xs text-gray-500">Out of {stats.totalStudents}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="w-6 h-6 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.averageScore}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
          <p className="text-xs text-gray-500">Class average</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.topScore}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Top Score</h3>
          <p className="text-xs text-gray-500">Highest points</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">{stats.totalStudents}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600">Total Students</h3>
          <p className="text-xs text-gray-500">In {viewMode}</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {viewMode === 'class' ? 'Class' : 'School'} Rankings
            </h3>
          </div>
          <p className="text-sm text-gray-600">Top performers across all {viewMode === 'class' ? 'your class' : 'classes'}</p>
        </div>

        <div className="divide-y divide-gray-200">
          {students.map((student) => (
            <div
              key={student.id}
              className={`p-6 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                student.id === user?.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${getRankBadge(student.rank)}`}>
                  {getRankIcon(student.rank)}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {student.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {student.full_name}
                      {student.id === user?.id && (
                        <span className="ml-2 text-sm text-blue-600 font-medium">(You)</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">{student.class_name}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-right">
                <div>
                  <div className="text-sm font-medium text-gray-900">Level {student.level}</div>
                  <div className="text-xs text-gray-500">Current level</div>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-900">{student.streak_days}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-blue-600">{student.points}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {viewMode === 'class' ? 'No classmates to display' : 'No students in the school yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}