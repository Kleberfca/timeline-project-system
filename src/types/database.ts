// src/types/database.ts
/**
 * Tipos gerados automaticamente pelo Supabase
 * Execute: supabase gen types typescript --project-id seu-projeto > src/types/database.ts
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
          data_fim_prevista: string | null
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
          data_fim_prevista?: string | null
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
          data_fim_prevista?: string | null
          ativo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      fases: {
        Row: {
          id: string
          nome: 'diagnostico' | 'posicionamento'
          ordem: number
        }
        Insert: {
          id?: string
          nome: 'diagnostico' | 'posicionamento'
          ordem: number
        }
        Update: {
          id?: string
          nome?: 'diagnostico' | 'posicionamento'
          ordem?: number
        }
      }
      etapas: {
        Row: {
          id: string
          fase_id: string
          nome: string
          descricao: string | null
          ordem: number
        }
        Insert: {
          id?: string
          fase_id: string
          nome: string
          descricao?: string | null
          ordem: number
        }
        Update: {
          id?: string
          fase_id?: string
          nome?: string
          descricao?: string | null
          ordem?: number
        }
      }
      projeto_timeline: {
        Row: {
          id: string
          projeto_id: string
          etapa_id: string
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
          etapa_id: string
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
          etapa_id?: string
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
          uploaded_by?: string
          created_at?: string
        }
      }
    }
  }
}
