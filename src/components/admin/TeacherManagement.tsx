import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Key, Eye, EyeOff, X, Copy } from 'lucide-react'
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
  const [showCredentials, setShowCredentials] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Siswa',
    class: '',
    nis: '',
    phone: ''
  })
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  })

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

  const generateCredentials = () => {
    const username = `siswa${formData.full_name.toLowerCase().replace(/\s+/g, '')}340`
    const password = '•••••••'
    return { username, password }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const creds = generateCredentials()
      setCredentials(creds)
      setShowCredentials(true)
      setShowAddForm(false)
      
      toast.success('Pengguna berhasil ditambahkan!')
      setFormData({
        full_name: '',
        email: '',
        role: 'Siswa',
        class: '',
        nis: '',
        phone: ''
      })
    } catch (error: any) {
      console.error('Error adding user:', error)
      toast.error('Gagal menambahkan pengguna')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Disalin ke clipboard!')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Manajemen Pengguna
          </h1>
          <p className="text-gray-600 mt-2">Kelola akun siswa dan guru dengan mudah</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="clay-card px-4 py-2">
            <input
              type="text"
              placeholder="Cari pengguna..."
              className="clay-input border-none bg-transparent"
            />
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="clay-button-secondary flex items-center space-x-2 px-4 py-3"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Pengguna</span>
          </button>
          <button className="clay-button-tertiary p-3">
            <Edit2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* User Type Tabs */}
      <div className="flex space-x-1 clay-card p-1 w-fit">
        <button className="clay-button-primary px-6 py-2 text-sm">
          Siswa <span className="clay-badge bg-white/20 text-white ml-2">0</span>
        </button>
        <button className="clay-nav-item px-6 py-2 text-sm">
          Guru <span className="clay-badge bg-gray-100 text-gray-600 ml-2">0</span>
        </button>
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="clay-modal p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Tambah Pengguna Baru
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="clay-button-tertiary p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Masukkan data pengguna. Username dan password akan dibuat otomatis.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="clay-input"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="clay-input"
                  placeholder="Masukkan email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peran
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="clay-select"
                  >
                    <option value="Siswa">Siswa</option>
                    <option value="Guru">Guru</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kelas
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="clay-select"
                  >
                    <option value="">Pilih kelas</option>
                    <option value="X-1">X-1</option>
                    <option value="X-2">X-2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIS (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.nis}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  className="clay-input"
                  placeholder="Nomor Induk Siswa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon (Opsional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="clay-input"
                  placeholder="Nomor telepon"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="clay-button-tertiary flex-1 py-3"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="clay-button-secondary flex-1 py-3"
                >
                  Tambah Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentials && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="clay-modal p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Kredensial Pengguna
              </h3>
              <button
                onClick={() => setShowCredentials(false)}
                className="clay-button-tertiary p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Salin dan berikan kredensial ini kepada cobacoba. <strong>Kredensial hanya ditampilkan sekali!</strong>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama:
                </label>
                <div className="clay-card p-3 font-mono text-lg">
                  cobacoba
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peran:
                </label>
                <span className="clay-badge bg-gray-900 text-white px-3 py-1">Siswa</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username:
                </label>
                <div className="flex items-center space-x-2">
                  <div className="clay-card p-3 font-mono flex-1">
                    {credentials.username}
                  </div>
                  <button
                    onClick={() => copyToClipboard(credentials.username)}
                    className="clay-button-tertiary p-3"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password:
                </label>
                <div className="flex items-center space-x-2">
                  <div className="clay-card p-3 font-mono flex-1">
                    {credentials.password}
                  </div>
                  <button className="clay-button-tertiary p-3">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => copyToClipboard(credentials.password)}
                    className="clay-button-tertiary p-3"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="clay-card p-4 mt-6 bg-yellow-50">
              <p className="text-sm text-yellow-800">
                <strong>Catatan:</strong> Pengguna akan diminta mengganti password saat login pertama.
              </p>
            </div>

            <button
              onClick={() => setShowCredentials(false)}
              className="clay-button-secondary w-full py-3 mt-6"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      <div className="clay-card p-12 text-center">
        <div className="clay-icon w-16 h-16 clay-purple mx-auto mb-4">
          <Users className="w-8 h-8 text-purple-700" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada siswa.</h3>
        <p className="text-gray-600 mb-6">Mulai dengan menambahkan siswa pertama Anda.</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="clay-button-secondary px-6 py-3"
        >
          Tambah Siswa Pertama
        </button>
      </div>
    </div>
  )
}