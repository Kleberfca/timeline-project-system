-- database/add-tracao-phase.sql
-- Script de migração para adicionar a fase "Tração" ao sistema
-- Execute este script no SQL Editor do Supabase após o schema.sql inicial

-- ============================================
-- 1. ATUALIZAR CONSTRAINT DA TABELA FASES
-- ============================================

-- Primeiro, remover a constraint existente
ALTER TABLE fases 
DROP CONSTRAINT IF EXISTS fases_nome_check;

-- Adicionar nova constraint incluindo 'tracao'
ALTER TABLE fases 
ADD CONSTRAINT fases_nome_check 
CHECK (nome IN ('diagnostico', 'posicionamento', 'tracao'));

-- ============================================
-- 2. INSERIR A NOVA FASE
-- ============================================

INSERT INTO fases (nome, ordem) VALUES 
    ('tracao', 3)
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- 3. INSERIR ETAPAS DA FASE TRAÇÃO
-- ============================================

-- Obter o ID da fase Tração e inserir suas etapas
INSERT INTO etapas (fase_id, nome, descricao, ordem)
SELECT 
    f.id,
    etapa.nome,
    etapa.descricao,
    etapa.ordem
FROM fases f,
LATERAL (VALUES
    -- Tráfego e Comercial
    ('Tráfego e Comercial - Construção do funil', 
     'Desenvolvimento e estruturação do funil de vendas para otimização de conversões', 1),
    
    ('Tráfego e Comercial - Planejamento de campanha', 
     'Planejamento estratégico de campanhas de marketing e tráfego', 2),
    
    -- Gestor de tráfego
    ('Gestor de tráfego - Anúncios com foco em performance', 
     'Criação e gestão de anúncios otimizados para performance e conversão', 3),
    
    -- Comercial
    ('Comercial - Implantação ou reestruturação de CRM', 
     'Implementação ou melhoria do sistema de gestão de relacionamento com cliente', 4),
    
    ('Comercial - Script de prospecção', 
     'Desenvolvimento de scripts eficazes para abordagem e prospecção de clientes', 5),
    
    ('Comercial - Estruturação de pitch comercial por persona', 
     'Criação de apresentações comerciais personalizadas para cada perfil de cliente', 6),
    
    ('Comercial - Diretrizes de argumentação de vendas', 
     'Definição de argumentos e técnicas de vendas para superar objeções', 7),
    
    ('Comercial - Treinamento de time comercial', 
     'Capacitação e desenvolvimento da equipe de vendas', 8),
    
    ('Comercial - CRM (trabalho de base/conversão)', 
     'Trabalho de base para conversão de não compra e estratégias de recompra', 9),
    
    ('Comercial - Pesquisa com clientes', 
     'Realização de pesquisas para entender satisfação e necessidades dos clientes', 10)
) AS etapa(nome, descricao, ordem)
WHERE f.nome = 'tracao'
ON CONFLICT (fase_id, ordem) DO NOTHING;

-- ============================================
-- 4. ATUALIZAR PROJETOS EXISTENTES (OPCIONAL)
-- ============================================

-- Para projetos existentes, adicionar as etapas da fase Tração
-- Este bloco é opcional e só deve ser executado se você quiser
-- adicionar a fase Tração aos projetos já existentes

/*
-- Descomentar se quiser aplicar a projetos existentes
INSERT INTO projeto_timeline (projeto_id, etapa_id, status, observacoes)
SELECT 
    p.id as projeto_id,
    e.id as etapa_id,
    'pendente' as status,
    'Etapa adicionada com a nova fase Tração' as observacoes
FROM projetos p
CROSS JOIN etapas e
JOIN fases f ON f.id = e.fase_id
WHERE f.nome = 'tracao'
  AND p.ativo = true
  AND NOT EXISTS (
    SELECT 1 FROM projeto_timeline pt 
    WHERE pt.projeto_id = p.id AND pt.etapa_id = e.id
  );
*/

-- ============================================
-- 5. VERIFICAR INSERÇÕES
-- ============================================

-- Verificar se a fase foi criada
SELECT * FROM fases WHERE nome = 'tracao';

-- Verificar se as etapas foram criadas
SELECT f.nome as fase, e.nome as etapa, e.ordem 
FROM etapas e 
JOIN fases f ON f.id = e.fase_id 
WHERE f.nome = 'tracao' 
ORDER BY e.ordem;

-- ============================================
-- ROLLBACK (SE NECESSÁRIO)
-- ============================================

/*
-- Para reverter as mudanças, execute:

-- 1. Remover registros da timeline
DELETE FROM projeto_timeline 
WHERE etapa_id IN (
    SELECT e.id FROM etapas e 
    JOIN fases f ON f.id = e.fase_id 
    WHERE f.nome = 'tracao'
);

-- 2. Remover etapas
DELETE FROM etapas 
WHERE fase_id = (SELECT id FROM fases WHERE nome = 'tracao');

-- 3. Remover fase
DELETE FROM fases WHERE nome = 'tracao';

-- 4. Restaurar constraint original
ALTER TABLE fases 
DROP CONSTRAINT IF EXISTS fases_nome_check;

ALTER TABLE fases 
ADD CONSTRAINT fases_nome_check 
CHECK (nome IN ('diagnostico', 'posicionamento'));
*/