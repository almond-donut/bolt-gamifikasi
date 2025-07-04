import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Bell, LogOut, Sun, Moon, User } from 'lucide-react'

export const Header: React.FC = () => {
  const { user, signOut } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="clay-card h-16 flex items-center justify-between px-6 mx-4 mt-4 mb-6">
      <div className="flex items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 clay-icon clay-purple flex items-center justify-center">
            <span className="text-purple-700 font-bold text-lg">ES</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              English Spark
            </h1>
            <p className="text-xs text-gray-500">SMK Wiworotomo Purwokerto</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="clay-button-tertiary p-3"
        >
          {darkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button className="clay-button-tertiary p-3 relative">
          <Bell className="w-5 h-5" />
          <span className="clay-notification-dot"></span>
        </button>

        <div className="flex items-center space-x-3 clay-card px-4 py-2">
          <div className="w-8 h-8 clay-icon clay-pink flex items-center justify-center">
            <User className="w-4 h-4 text-pink-700" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.profile?.full_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.profile?.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="clay-button-danger p-3"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}