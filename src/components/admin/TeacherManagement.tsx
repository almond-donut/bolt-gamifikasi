import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Key, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface Teacher {
  id: string
  full_name: string
  email: string
  created_at: string
  temp_password?: string
}

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: ''
  })
  const [tempPassword, setTempPassword] = useState('')
  const [showTempPassword, setShowTempPassword] = useState(false)

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTeachers(data || [])
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast.error('Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const tempPassword = generatePassword()
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: tempPassword,
        email_confirm: true
      })

      if (authError) throw authError

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.full_name,
          email: formData.email,
          role: 'teacher',
          temp_password: tempPassword,
          must_change_password: true
        })

      if (profileError) throw profileError

      setTempPassword(tempPassword)
      setShowTempPassword(true)
      setFormData({ full_name: '', email: '' })
      await fetchTeachers()
      toast.success('Teacher added successfully!')
    } catch (error: any) {
      console.error('Error adding teacher:', error)
      toast.error(error.message || 'Failed to add teacher')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (teacherId: string) => {
    try {
      const newPassword = generatePassword()
      
      const { error } = await supabase.auth.admin.updateUserById(teacherId, {
        password: newPassword
      })

      if (error) throw error

      await supabase
        .from('profiles')
        .update({
          temp_password: newPassword,
          must_change_password: true
        })
        .eq('id', teacherId)

      setTempPassword(newPassword)
      setShowTempPassword(true)
      toast.success('Password reset successfully!')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast.error(error.message || 'Failed to reset password')
    }
  }

  const handleDelete = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return

    try {
      const { error } = await supabase.auth.admin.deleteUser(teacherId)
      if (error) throw error

      await fetchTeachers()
      toast.success('Teacher deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting teacher:', error)
      toast.error(error.message || 'Failed to delete teacher')
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
        <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Add Teacher Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Teacher</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Add Teacher
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Temporary Password Display */}
      {showTempPassword && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Temporary Password Generated</h4>
          <div className="flex items-center space-x-2">
            <code className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
              {tempPassword}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(tempPassword)}
              className="text-sm text-yellow-700 hover:text-yellow-900"
            >
              Copy
            </button>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Please provide this temporary password to the teacher. They will be required to change it on first login.
          </p>
          <button
            onClick={() => setShowTempPassword(false)}
            className="text-sm text-yellow-700 hover:text-yellow-900 mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Teachers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{teacher.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(teacher.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleResetPassword(teacher.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Teacher"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}