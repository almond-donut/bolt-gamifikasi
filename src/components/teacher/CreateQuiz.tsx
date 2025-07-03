import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface QuizForm {
  title: string
  description: string
}

export const CreateQuiz: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<QuizForm>({
    title: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          title: formData.title,
          description: formData.description,
          created_by: user.id
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Quiz created successfully!')
      navigate(`/teacher/quizzes/${data.id}/questions`)
    } catch (error) {
      console.error('Error creating quiz:', error)
      toast.error('Failed to create quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/teacher/quizzes')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Quizzes</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600">Enter the basic information for your new quiz.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., English Greetings and Introductions Quiz"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe what this quiz covers..."
          />
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/teacher/quizzes')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Creating...' : 'Create Quiz'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}