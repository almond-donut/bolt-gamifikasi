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
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ES</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">English Spark</h1>
            <p className="text-xs text-gray-500">SMK Wiworotomo Purwokerto</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-gray-600" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
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
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  )
}