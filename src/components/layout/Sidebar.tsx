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
    { icon: Users, label: 'Manage Teachers', path: '/admin/teachers' },
    { icon: GraduationCap, label: 'Manage Students', path: '/admin/students' },
    { icon: BookOpen, label: 'Manage Classes', path: '/admin/classes' },
    { icon: FileText, label: 'Manage Quizzes', path: '/admin/quizzes' },
    { icon: FileText, label: 'Manage Materials', path: '/admin/materials' },
    { icon: Trophy, label: 'Achievements', path: '/admin/achievements' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' }
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {getNavItems().map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}