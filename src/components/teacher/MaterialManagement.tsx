import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { Plus, Edit2, Trash2, FileText, Video, Headphones, Image, Link, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Material {
  id: string
  title: string
  description: string
  type: 'document' | 'video' | 'audio' | 'image' | 'link'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_time: number
  file_url: string | null
  youtube_url: string | null
  created_at: string
}

interface MaterialForm {
  title: string
  description: string
  type: 'document' | 'video' | 'audio' | 'image' | 'link'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimated_time: number
  youtube_url: string
}

export const MaterialManagement: React.FC = () => {
  const { user } = useAuth()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  const [formData, setFormData] = useState<MaterialForm>({
    title: '',
    description: '',
    type: 'video',
    category: '',
    difficulty: 'beginner',
    estimated_time: 0,
    youtube_url: ''
  })

  useEffect(() => {
    fetchMaterials()
  }, [user])

  const fetchMaterials = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaterials(data || [])
    } catch (error) {
      console.error('Error fetching materials:', error)
      toast.error('Failed to load materials')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const materialData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        category: formData.category,
        difficulty: formData.difficulty,
        estimated_time: formData.estimated_time,
        youtube_url: formData.type === 'video' ? formData.youtube_url : null,
        uploaded_by: user.id
      }

      if (editingMaterial) {
        const { error } = await supabase
          .from('materials')
          .update(materialData)
          .eq('id', editingMaterial.id)

        if (error) throw error
        toast.success('Material updated successfully!')
      } else {
        const { error } = await supabase
          .from('materials')
          .insert(materialData)

        if (error) throw error
        toast.success('Material created successfully!')
      }

      resetForm()
      fetchMaterials()
    } catch (error) {
      console.error('Error saving material:', error)
      toast.error('Failed to save material')
    }
  }

  const handleEdit = (material: Material) => {
    setEditingMaterial(material)
    setFormData({
      title: material.title,
      description: material.description,
      type: material.type,
      category: material.category,
      difficulty: material.difficulty,
      estimated_time: material.estimated_time,
      youtube_url: material.youtube_url || ''
    })
    setShowAddForm(true)
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm('Are you sure you want to delete this material?')) return

    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)

      if (error) throw error
      toast.success('Material deleted successfully!')
      fetchMaterials()
    } catch (error) {
      console.error('Error deleting material:', error)
      toast.error('Failed to delete material')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'video',
      category: '',
      difficulty: 'beginner',
      estimated_time: 0,
      youtube_url: ''
    })
    setEditingMaterial(null)
    setShowAddForm(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="w-5 h-5" />
      case 'video':
        return <Video className="w-5 h-5" />
      case 'audio':
        return <Headphones className="w-5 h-5" />
      case 'image':
        return <Image className="w-5 h-5" />
      case 'link':
        return <Link className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    }
    return badges[difficulty as keyof typeof badges] || badges.beginner
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Management</h1>
          <p className="text-gray-600">Add, edit, or delete your study materials.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Material</span>
        </button>
      </div>

      {/* Add/Edit Material Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Introduction to Tenses"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the material..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="audio">Audio</option>
                    <option value="image">Image</option>
                    <option value="link">Link</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grammar, Vocabulary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_time}
                    onChange={(e) => setFormData({ ...formData, estimated_time: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {formData.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    YouTube/Vimeo URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
              )}

              {formData.type !== 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload File
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      className="w-full"
                      accept={
                        formData.type === 'document' ? '.pdf,.doc,.docx,.ppt,.pptx' :
                        formData.type === 'audio' ? '.mp3,.wav,.ogg' :
                        formData.type === 'image' ? '.jpg,.jpeg,.png,.gif' : '*'
                      }
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Choose file or drag and drop
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingMaterial ? 'Update Material' : 'Add Material'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{material.title}</div>
                      <div className="text-sm text-gray-500">{material.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(material.type)}
                      <span className="text-sm text-gray-900 capitalize">{material.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{material.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadge(material.difficulty)}`}>
                      {material.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(material)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit Material"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Material"
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

        {materials.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No materials yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start by adding your first learning material.</p>
          </div>
        )}
      </div>
    </div>
  )
}