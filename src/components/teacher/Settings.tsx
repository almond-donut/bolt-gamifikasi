import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { User, Mail, Lock, Bell, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface SettingsForm {
  full_name: string
  email: string
  current_password: string
  new_password: string
  confirm_password: string
  email_notifications: boolean
}

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<SettingsForm>({
    full_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
    email_notifications: true
  })

  useEffect(() => {
    if (user?.profile) {
      setFormData(prev => ({
        ...prev,
        full_name: user.profile?.full_name || '',
        email: user.profile?.email || ''
      }))
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await updateProfile({
        full_name: formData.full_name,
        email: formData.email
      })
      toast.success('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match')
      return
    }

    if (formData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password
      })

      if (error) throw error

      toast.success('Password changed successfully!')
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }))
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast.error(error.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="john.doe@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed"
            >
              Update Profile (Coming Soon)
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Lock className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Changing...' : 'Change Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive email notifications for quiz submissions and other important events.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.email_notifications}
                onChange={(e) => setFormData({ ...formData, email_notifications: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}