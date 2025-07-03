import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Youtube, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface QuestionForm {
  question_text: string
  question_type: 'multiple_choice' | 'fill_in_the_blank'
  difficulty: 'easy' | 'medium' | 'hard'
  points_value: number
  media_type: 'image' | 'youtube' | 'none'
  media_url: string
  explanation: string
  options: {
    choices?: Array<{ text: string; is_correct: boolean }>
    correct_answer?: string
  }
}

export const CreateQuestion: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<QuestionForm>({
    question_text: '',
    question_type: 'multiple_choice',
    difficulty: 'easy',
    points_value: 2,
    media_type: 'none',
    media_url: '',
    explanation: '',
    options: {
      choices: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false }
      ]
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizId) return

    setLoading(true)

    try {
      // Validate form
      if (!formData.question_text.trim()) {
        toast.error('Question text is required')
        return
      }

      if (formData.question_type === 'multiple_choice') {
        const hasCorrectAnswer = formData.options.choices?.some(choice => choice.is_correct)
        if (!hasCorrectAnswer) {
          toast.error('Please select at least one correct answer')
          return
        }
        const hasEmptyChoice = formData.options.choices?.some(choice => !choice.text.trim())
        if (hasEmptyChoice) {
          toast.error('All answer choices must be filled')
          return
        }
      } else if (formData.question_type === 'fill_in_the_blank') {
        if (!formData.options.correct_answer?.trim()) {
          toast.error('Correct answer is required for fill-in-the-blank questions')
          return
        }
      }

      const { error } = await supabase
        .from('questions')
        .insert({
          quiz_id: quizId,
          question_text: formData.question_text,
          question_type: formData.question_type,
          difficulty: formData.difficulty,
          points_value: formData.points_value,
          media_type: formData.media_type,
          media_url: formData.media_url || null,
          options: formData.options
        })

      if (error) throw error

      toast.success('Question created successfully!')
      navigate(`/teacher/quizzes/${quizId}/questions`)
    } catch (error) {
      console.error('Error creating question:', error)
      toast.error('Failed to create question')
    } finally {
      setLoading(false)
    }
  }

  const handleChoiceChange = (index: number, text: string) => {
    const newChoices = [...(formData.options.choices || [])]
    newChoices[index] = { ...newChoices[index], text }
    setFormData({
      ...formData,
      options: { ...formData.options, choices: newChoices }
    })
  }

  const handleCorrectAnswerChange = (index: number) => {
    const newChoices = formData.options.choices?.map((choice, i) => ({
      ...choice,
      is_correct: i === index
    })) || []
    setFormData({
      ...formData,
      options: { ...formData.options, choices: newChoices }
    })
  }

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/teacher/quizzes/${quizId}/questions`)}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Questions</span>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Question</h1>
          <p className="text-gray-600">Enter the name, options, and details for your new question.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Name
          </label>
          <textarea
            value={formData.question_text}
            onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your question here..."
            required
          />
        </div>

        {/* Media Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image/Audio
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Choose File
                  </span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                </label>
                <p className="mt-1 text-xs text-gray-500">No file chosen</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              YouTube URL
            </label>
            <input
              type="url"
              value={formData.media_url}
              onChange={(e) => setFormData({ 
                ...formData, 
                media_url: e.target.value,
                media_type: e.target.value ? 'youtube' : 'none'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., https://www.youtube.com/watch?v=..."
            />
            {formData.media_url && getYouTubeEmbedUrl(formData.media_url) && (
              <div className="mt-3">
                <iframe
                  src={getYouTubeEmbedUrl(formData.media_url)!}
                  className="w-full h-48 rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Explain why the correct answer is right..."
          />
        </div>

        {/* Difficulty and Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ 
                ...formData, 
                difficulty: e.target.value as 'easy' | 'medium' | 'hard',
                points_value: e.target.value === 'easy' ? 2 : e.target.value === 'medium' ? 3 : 5
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Easy (2 pts)</option>
              <option value="medium">Medium (3 pts)</option>
              <option value="hard">Hard (5 pts)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points
            </label>
            <input
              type="number"
              value={formData.points_value}
              onChange={(e) => setFormData({ ...formData, points_value: parseInt(e.target.value) })}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="multiple_choice"
                checked={formData.question_type === 'multiple_choice'}
                onChange={(e) => setFormData({ ...formData, question_type: e.target.value as 'multiple_choice' })}
                className="mr-2"
              />
              Multiple Choice
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="fill_in_the_blank"
                checked={formData.question_type === 'fill_in_the_blank'}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  question_type: e.target.value as 'fill_in_the_blank',
                  options: { correct_answer: '' }
                })}
                className="mr-2"
              />
              Fill in the Blank
            </label>
          </div>
        </div>

        {/* Options */}
        {formData.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options
            </label>
            <div className="space-y-3">
              {formData.options.choices?.map((choice, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    required
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={choice.is_correct}
                      onChange={() => handleCorrectAnswerChange(index)}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Correct</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {formData.question_type === 'fill_in_the_blank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Answer
            </label>
            <input
              type="text"
              value={formData.options.correct_answer || ''}
              onChange={(e) => setFormData({
                ...formData,
                options: { correct_answer: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the correct answer"
              required
            />
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate(`/teacher/quizzes/${quizId}/questions`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  )
}