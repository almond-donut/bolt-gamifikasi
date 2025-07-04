import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Trophy,
  Settings,
  Home,
  PenTool,
  Target,
  Award,
  BarChart3,
  Send,
  Play,
  TrendingUp
} from 'lucide-react'

export const Sidebar: React.FC = () => {
  const { user } = useAuth()
  const role = user?.profile?.role

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Kelola Pengguna', path: '/admin/teachers' },
    { icon: BookOpen, label: 'Kelola Kelas', path: '/admin/classes' },
    { icon: BarChart3, label: 'Analitik', path: '/admin/analytics' },
    { icon: Trophy, label: 'Pencapaian', path: '/admin/achievements' },
    { icon: Settings, label: 'Pengaturan', path: '/admin/settings' }
  ]

  const teacherNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher' },
    { icon: Users, label: 'Students', path: '/teacher/students' },
    { icon: PenTool, label: 'Quizzes', path: '/teacher/quizzes' },
    { icon: FileText, label: 'Materials', path: '/teacher/materials' },
    { icon: Send, label: 'Assignment', path: '/teacher/assignment' },
    { icon: BarChart3, label: 'Reports', path: '/teacher/reports' },
    { icon: Settings, label: 'Settings', path: '/teacher/settings' }
  ]

  const studentNavItems = [
    { icon: Home, label: 'Dashboard', path: '/student' },
    { icon: Play, label: 'Assigned Quizzes', path: '/student/quizzes' },
    { icon: BarChart3, label: 'Quiz Results', path: '/student/results' },
    { icon: Trophy, label: 'Leaderboard', path: '/student/leaderboard' },
    { icon: FileText, label: 'Study Materials', path: '/student/materials' },
    { icon: Award, label: 'Achievements', path: '/student/achievements' },
    { icon: Users, label: 'Profile', path: '/student/profile' }
  ]

  const getNavItems = () => {
    switch (role) {
      case 'admin':
        return adminNavItems
      case 'teacher':
        return teacherNavItems
      case 'student':
        return studentNavItems
      default:
        return []
    }
  }

  return (
    <aside className="w-64 clay-sidebar min-h-screen p-4 ml-4">
      <div className="mb-8">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4 px-4">
          NAVIGASI
        </h3>
      </div>
      
      <nav className="space-y-1">
        {getNavItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `clay-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="clay-card p-4 flex items-center space-x-3">
          <div className="w-10 h-10 clay-icon clay-pink flex items-center justify-center">
            <span className="text-pink-700 font-bold text-sm">
              {user?.profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.profile?.full_name || 'Administrator'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.profile?.role || 'Admin'}
            </p>
          </div>
          <button className="clay-button-tertiary p-2">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}