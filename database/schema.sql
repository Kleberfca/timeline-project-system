-- database/schema.sql
-- Schema completo do banco de dados para o Timeline Project System
-- Execute este script no editor SQL do Supabase

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELAS
-- ============================================

-- Tabela de usuários (integrada com Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cliente')),
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    empresa TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de projetos
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim_prevista DATE,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de fases
CREATE TABLE IF NOT EXISTS fases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT UNIQUE NOT NULL CHECK (nome IN ('diagnostico', 'posicionamento')),
    ordem INTEGER NOT NULL
);

-- Tabela de etapas
CREATE TABLE IF NOT EXISTS etapas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fase_id UUID NOT NULL REFERENCES fases(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    descricao TEXT,
    ordem INTEGER NOT NULL,
    UNIQUE(fase_id, ordem)
);

-- Tabela de timeline do projeto
CREATE TABLE IF NOT EXISTS projeto_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    etapa_id UUID NOT NULL REFERENCES etapas(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido')),
    observacoes TEXT,
    data_inicio TIMESTAMPTZ,
    data_conclusao TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(projeto_id, etapa_id)
);

-- Tabela de arquivos
CREATE TABLE IF NOT EXISTS arquivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_timeline_id UUID NOT NULL REFERENCES projeto_timeline(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('pdf', 'doc', 'docx', 'xlsx', 'csv', 'link')),
    tamanho INTEGER,
    url_google_drive TEXT NOT NULL,
    google_drive_id TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_users_cliente_id ON users(cliente_id);
CREATE INDEX idx_projetos_cliente_id ON projetos(cliente_id);
CREATE INDEX idx_projeto_timeline_projeto_id ON projeto_timeline(projeto_id);
CREATE INDEX idx_projeto_timeline_etapa_id ON projeto_timeline(etapa_id);
CREATE INDEX idx_arquivos_projeto_timeline_id ON arquivos(projeto_timeline_id);
CREATE INDEX idx_arquivos_uploaded_by ON arquivos(uploaded_by);

-- ============================================
-- TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabela
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON projetos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projeto_timeline_updated_at BEFORE UPDATE ON projeto_timeline
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir fases
INSERT INTO fases (nome, ordem) VALUES 
    ('diagnostico', 1),
    ('posicionamento', 2)
ON CONFLICT (nome) DO NOTHING;

-- Inserir etapas da fase Diagnóstico
INSERT INTO etapas (fase_id, nome, ordem)
SELECT 
    f.id,
    etapa.nome,
    etapa.ordem
FROM fases f,
LATERAL (VALUES
    ('Análise da situação atual', 1),
    ('Análise de mercado', 2),
    ('Diagnóstico do processo comercial', 3),
    ('Mapeamento da jornada do cliente', 4),
    ('Avaliação de canais ativos e funil atual', 5),
    ('Persona', 6),
    ('Matriz SWOT', 7),
    ('Benchmark com concorrentes', 8)
) AS etapa(nome, ordem)
WHERE f.nome = 'diagnostico'
ON CONFLICT (fase_id, ordem) DO NOTHING;

-- Inserir etapas da fase Posicionamento
INSERT INTO etapas (fase_id, nome, ordem)
SELECT 
    f.id,
    etapa.nome,
    etapa.ordem
FROM fases f,
LATERAL (VALUES
    ('Proposta de valor', 1),
    ('Visão de futuro', 2),
    ('Plano de ação', 3),
    ('Criação de linha editorial', 4),
    ('Posicionamento', 5)
) AS etapa(nome, ordem)
WHERE f.nome = 'posicionamento'
ON CONFLICT (fase_id, ordem) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeto_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para clientes
CREATE POLICY "Admins can manage clientes" ON clientes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Clients can view own data" ON clientes
    FOR SELECT USING (
        id IN (
            SELECT cliente_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Políticas para projetos
CREATE POLICY "Admins can manage all projects" ON projetos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Clients can view own projects" ON projetos
    FOR SELECT USING (
        cliente_id IN (
            SELECT cliente_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Políticas para timeline
CREATE POLICY "Admins can manage timeline" ON projeto_timeline
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Clients can view timeline" ON projeto_timeline
    FOR SELECT USING (
        projeto_id IN (
            SELECT p.id FROM projetos p
            JOIN users u ON u.cliente_id = p.cliente_id
            WHERE u.id = auth.uid()
        )
    );

-- Políticas para arquivos
CREATE POLICY "Admins can manage files" ON arquivos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Clients can view files" ON arquivos
    FOR SELECT USING (
        projeto_timeline_id IN (
            SELECT pt.id FROM projeto_timeline pt
            JOIN projetos p ON p.id = pt.projeto_id
            JOIN users u ON u.cliente_id = p.cliente_id
            WHERE u.id = auth.uid()
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Função para criar usuário admin
CREATE OR REPLACE FUNCTION create_admin_user(
    user_email TEXT,
    user_name TEXT,
    user_password TEXT
) RETURNS void AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Esta função deve ser executada com privilégios elevados
    -- Use apenas para criar o primeiro admin
    
    -- Criar usuário no auth.users (isso é feito via Supabase Auth)
    -- Aqui apenas inserimos na tabela users
    
    INSERT INTO users (id, email, nome, role)
    VALUES (
        gen_random_uuid(), -- Substitua pelo ID real do usuário criado no Auth
        user_email,
        user_name,
        'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE users IS 'Usuários do sistema integrados com Supabase Auth';
COMMENT ON TABLE clientes IS 'Clientes da empresa';
COMMENT ON TABLE projetos IS 'Projetos dos clientes';
COMMENT ON TABLE fases IS 'Fases fixas do processo (Diagnóstico e Posicionamento)';
COMMENT ON TABLE etapas IS 'Etapas de cada fase';
COMMENT ON TABLE projeto_timeline IS 'Status de cada etapa por projeto';
COMMENT ON TABLE arquivos IS 'Arquivos enviados para cada etapa';

-- ============================================
-- INSTRUÇÕES PÓS-CRIAÇÃO
-- ============================================

-- 1. Execute este script no editor SQL do Supabase
-- 2. Configure as variáveis de ambiente no seu projeto
-- 3. Crie o primeiro usuário admin via Supabase Auth
-- 4. Execute a query abaixo substituindo o ID do usuário criado:
--    UPDATE users SET role = 'admin' WHERE email = 'admin@suaempresa.com';
-- 5. Configure o Storage do Supabase se desejar usar ao invés do Google Drive