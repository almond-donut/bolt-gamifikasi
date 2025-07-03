export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'teacher' | 'student'
          class_id: string | null
          points: number
          avatar_url: string | null
          created_at: string
          temp_password: string | null
          must_change_password: boolean
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role: 'admin' | 'teacher' | 'student'
          class_id?: string | null
          points?: number
          avatar_url?: string | null
          created_at?: string
          temp_password?: string | null
          must_change_password?: boolean
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'admin' | 'teacher' | 'student'
          class_id?: string | null
          points?: number
          avatar_url?: string | null
          created_at?: string
          temp_password?: string | null
          must_change_password?: boolean
        }
      }
      classes: {
        Row: {
          id: string
          class_name: string
          teacher_id: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          class_name: string
          teacher_id: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          class_name?: string
          teacher_id?: string
          description?: string | null
          created_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_by?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          question_type: 'multiple_choice' | 'fill_in_the_blank'
          media_type: 'image' | 'youtube' | 'none'
          media_url: string | null
          options: any
          difficulty: 'easy' | 'medium' | 'hard'
          points_value: number
        }
        Insert: {
          id?: string
          quiz_id: string
          question_text: string
          question_type: 'multiple_choice' | 'fill_in_the_blank'
          media_type?: 'image' | 'youtube' | 'none'
          media_url?: string | null
          options?: any
          difficulty?: 'easy' | 'medium' | 'hard'
          points_value?: number
        }
        Update: {
          id?: string
          quiz_id?: string
          question_text?: string
          question_type?: 'multiple_choice' | 'fill_in_the_blank'
          media_type?: 'image' | 'youtube' | 'none'
          media_url?: string | null
          options?: any
          difficulty?: 'easy' | 'medium' | 'hard'
          points_value?: number
        }
      }
      quiz_assignments: {
        Row: {
          id: string
          quiz_id: string
          class_id: string
          due_date: string | null
          assigned_by: string
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          class_id: string
          due_date?: string | null
          assigned_by: string
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          class_id?: string
          due_date?: string | null
          assigned_by?: string
          created_at?: string
        }
      }
      student_submissions: {
        Row: {
          id: string
          assignment_id: string
          student_id: string
          score: number | null
          submitted_at: string
          answers: any
        }
        Insert: {
          id?: string
          assignment_id: string
          student_id: string
          score?: number | null
          submitted_at?: string
          answers?: any
        }
        Update: {
          id?: string
          assignment_id?: string
          student_id?: string
          score?: number | null
          submitted_at?: string
          answers?: any
        }
      }
      material_folders: {
        Row: {
          id: string
          folder_name: string
          class_id: string
          teacher_id: string
          created_at: string
        }
        Insert: {
          id?: string
          folder_name: string
          class_id: string
          teacher_id: string
          created_at?: string
        }
        Update: {
          id?: string
          folder_name?: string
          class_id?: string
          teacher_id?: string
          created_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          title: string
          file_url: string
          description: string | null
          folder_id: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          file_url: string
          description?: string | null
          folder_id: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          file_url?: string
          description?: string | null
          folder_id?: string
          uploaded_by?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string | null
          points_reward: number
          trigger_condition: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon_url?: string | null
          points_reward: number
          trigger_condition: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon_url?: string | null
          points_reward?: number
          trigger_condition?: string
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          is_read: boolean
          link_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          is_read?: boolean
          link_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}