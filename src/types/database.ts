// src/types/database.ts
/**
 * Tipos gerados para o banco de dados Supabase
 * Pode ser gerado automaticamente com: npx supabase gen types typescript
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          nome: string
          role: 'admin' | 'cliente'
          cliente_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          nome: string
          role: 'admin' | 'cliente'
          cliente_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          nome?: string
          role?: 'admin' | 'cliente'
          cliente_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clientes: {
        Row: {
          id: string
          nome: string
          email: string
          telefone: string | null
          empresa: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          email: string
          telefone?: string | null
          empresa?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          email?: string
          telefone?: string | null
          empresa?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      projetos: {
        Row: {
          id: string
          cliente_id: string
          nome: string
          descricao: string | null
          data_inicio: string
          data_fim: string | null
          google_drive_folder_id: string | null
          google_drive_folder_url: string | null
          ativo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cliente_id: string
          nome: string
          descricao?: string | null
          data_inicio: string
          data_fim?: string | null
          google_drive_folder_id?: string | null
          google_drive_folder_url?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          nome?: string
          descricao?: string | null
          data_inicio?: string
          data_fim?: string | null
          google_drive_folder_id?: string | null
          google_drive_folder_url?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      fases: {
        Row: {
          id: string
          nome: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          ordem: number
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          ordem?: number
          created_at?: string
        }
      }
      status_etapas: {
        Row: {
          id: string
          fase_id: string
          nome: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          fase_id: string
          nome: string
          ordem: number
          created_at?: string
        }
        Update: {
          id?: string
          fase_id?: string
          nome?: string
          ordem?: number
          created_at?: string
        }
      }
      projeto_timeline: {
        Row: {
          id: string
          projeto_id: string
          status_etapa_id: string
          status: 'pendente' | 'em_andamento' | 'concluido'
          observacoes: string | null
          data_inicio: string | null
          data_conclusao: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          projeto_id: string
          status_etapa_id: string
          status?: 'pendente' | 'em_andamento' | 'concluido'
          observacoes?: string | null
          data_inicio?: string | null
          data_conclusao?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          projeto_id?: string
          status_etapa_id?: string
          status?: 'pendente' | 'em_andamento' | 'concluido'
          observacoes?: string | null
          data_inicio?: string | null
          data_conclusao?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      arquivos: {
        Row: {
          id: string
          projeto_timeline_id: string
          nome: string
          tipo: 'pdf' | 'doc' | 'docx' | 'xlsx' | 'csv' | 'link'
          tamanho: number | null
          url_google_drive: string
          google_drive_id: string
          google_drive_folder_id: string | null
          google_drive_web_view_link: string | null
          google_drive_web_content_link: string | null
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          projeto_timeline_id: string
          nome: string
          tipo: 'pdf' | 'doc' | 'docx' | 'xlsx' | 'csv' | 'link'
          tamanho?: number | null
          url_google_drive: string
          google_drive_id: string
          google_drive_folder_id?: string | null
          google_drive_web_view_link?: string | null
          google_drive_web_content_link?: string | null
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          projeto_timeline_id?: string
          nome?: string
          tipo?: 'pdf' | 'doc' | 'docx' | 'xlsx' | 'csv' | 'link'
          tamanho?: number | null
          url_google_drive?: string
          google_drive_id?: string
          google_drive_folder_id?: string | null
          google_drive_web_view_link?: string | null
          google_drive_web_content_link?: string | null
          uploaded_by?: string
          created_at?: string
        }
      }
      sistema_config: {
        Row: {
          id: string
          logo_url: string | null
          logo_drive_id: string | null
          logo_base64: string | null
          favicon_url: string | null
          favicon_drive_id: string | null
          favicon_base64: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          logo_url?: string | null
          logo_drive_id?: string | null
          logo_base64?: string | null
          favicon_url?: string | null
          favicon_drive_id?: string | null
          favicon_base64?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          logo_url?: string | null
          logo_drive_id?: string | null
          logo_base64?: string | null
          favicon_url?: string | null
          favicon_drive_id?: string | null
          favicon_base64?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
    Views: {
      v_sistema_config: {
        Row: {
          id: string
          logo_url: string | null
          logo_drive_id: string | null
          logo_base64: string | null
          favicon_url: string | null
          favicon_drive_id: string | null
          favicon_base64: string | null
          updated_at: string
          updated_by: string | null
          updated_by_nome: string | null
          updated_by_email: string | null
          logo_atual: string | null
          favicon_atual: string | null
          logo_source: 'base64' | 'drive' | null
          favicon_source: 'base64' | 'drive' | null
        }
      }
    }
    Functions: {
      get_project_folder_id: {
        Args: {
          p_projeto_id: string
          p_default_structure?: Json
        }
        Returns: string | null
      }
      check_base64_size: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_sistema_config_timestamp: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
  }
}