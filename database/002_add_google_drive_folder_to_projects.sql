-- database/migrations/002_add_google_drive_folder_to_projects.sql
-- Adiciona campo para pasta do Google Drive nos projetos

-- Adicionar campo na tabela projetos
ALTER TABLE public.projetos 
ADD COLUMN IF NOT EXISTS google_drive_folder_id TEXT,
ADD COLUMN IF NOT EXISTS google_drive_folder_url TEXT;

-- Adicionar comentários
COMMENT ON COLUMN public.projetos.google_drive_folder_id IS 'ID da pasta do projeto no Google Drive';
COMMENT ON COLUMN public.projetos.google_drive_folder_url IS 'URL completa da pasta do projeto no Google Drive';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_projetos_google_drive_folder ON public.projetos(google_drive_folder_id);

-- Adicionar campos base64 na tabela sistema_config
ALTER TABLE public.sistema_config
ADD COLUMN IF NOT EXISTS logo_base64 TEXT,
ADD COLUMN IF NOT EXISTS favicon_base64 TEXT;

-- Comentários
COMMENT ON COLUMN public.sistema_config.logo_base64 IS 'Logo em formato base64 (alternativa ao Google Drive)';
COMMENT ON COLUMN public.sistema_config.favicon_base64 IS 'Favicon em formato base64 (alternativa ao Google Drive)';

-- Criar função para validar tamanho de base64 (máximo 1MB)
CREATE OR REPLACE FUNCTION check_base64_size()
RETURNS TRIGGER AS $$
BEGIN
    -- Verifica tamanho do logo (máximo 500KB em base64 ≈ 680KB)
    IF NEW.logo_base64 IS NOT NULL AND length(NEW.logo_base64) > 700000 THEN
        RAISE EXCEPTION 'Logo muito grande. Máximo permitido: 500KB';
    END IF;
    
    -- Verifica tamanho do favicon (máximo 100KB em base64 ≈ 136KB)
    IF NEW.favicon_base64 IS NOT NULL AND length(NEW.favicon_base64) > 150000 THEN
        RAISE EXCEPTION 'Favicon muito grande. Máximo permitido: 100KB';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para validar tamanho
DROP TRIGGER IF EXISTS check_base64_size_trigger ON public.sistema_config;
CREATE TRIGGER check_base64_size_trigger
    BEFORE INSERT OR UPDATE ON public.sistema_config
    FOR EACH ROW
    EXECUTE FUNCTION check_base64_size();

-- Atualizar view para incluir novos campos
DROP VIEW IF EXISTS public.v_sistema_config;
CREATE VIEW public.v_sistema_config AS
SELECT
    sc.*,
    u.nome as updated_by_nome,
    u.email as updated_by_email,
    -- Prioriza base64 sobre URLs do Drive
    COALESCE(sc.logo_base64, sc.logo_url) as logo_atual,
    COALESCE(sc.favicon_base64, sc.favicon_url) as favicon_atual,
    CASE 
        WHEN sc.logo_base64 IS NOT NULL THEN 'base64'
        WHEN sc.logo_url IS NOT NULL THEN 'drive'
        ELSE NULL
    END as logo_source,
    CASE 
        WHEN sc.favicon_base64 IS NOT NULL THEN 'base64'
        WHEN sc.favicon_url IS NOT NULL THEN 'drive'
        ELSE NULL
    END as favicon_source
FROM public.sistema_config sc
LEFT JOIN public.users u ON sc.updated_by = u.id;

-- Permissões
GRANT SELECT ON public.v_sistema_config TO authenticated;

-- Criar função helper para obter pasta do projeto ou usar estrutura padrão
CREATE OR REPLACE FUNCTION get_project_folder_id(
    p_projeto_id UUID,
    p_default_structure JSONB DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_folder_id TEXT;
BEGIN
    -- Busca pasta configurada no projeto
    SELECT google_drive_folder_id INTO v_folder_id
    FROM public.projetos
    WHERE id = p_projeto_id;
    
    -- Se tem pasta configurada, retorna ela
    IF v_folder_id IS NOT NULL THEN
        RETURN v_folder_id;
    END IF;
    
    -- Se não tem e foi passada estrutura padrão, retorna da estrutura
    IF p_default_structure IS NOT NULL THEN
        RETURN p_default_structure->>'etapaFolderId';
    END IF;
    
    -- Retorna NULL se não tem nenhuma configuração
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;