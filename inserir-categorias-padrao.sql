-- =====================================================
-- INSERIR CATEGORIAS PADRÃO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Verificar categorias existentes
SELECT 
  COUNT(*) as total_categorias,
  COUNT(*) FILTER (WHERE is_active = true) as categorias_ativas
FROM categorias_produtos;

-- Inserir categorias padrão (ignora se já existirem)
INSERT INTO categorias_produtos (nome, descricao, is_active) VALUES
  ('Peças', 'Peças e componentes para motos', true),
  ('Acessórios', 'Acessórios para motos', true),
  ('Lubrificantes', 'Óleos e lubrificantes', true),
  ('Pneus', 'Pneus e câmaras', true),
  ('Elétrica', 'Componentes elétricos', true),
  ('Freios', 'Sistema de freios', true),
  ('Suspensão', 'Componentes de suspensão', true),
  ('Motor', 'Peças de motor', true),
  ('Transmissão', 'Componentes de transmissão', true),
  ('Filtros', 'Filtros de ar, óleo e combustível', true),
  ('Escapamento', 'Sistema de escapamento', true),
  ('Carroceria', 'Carenagem e peças de carroceria', true),
  ('Outros', 'Outros produtos', true)
ON CONFLICT (nome) DO NOTHING;

-- Exibir categorias inseridas
SELECT 
  id,
  nome,
  descricao,
  is_active,
  created_at
FROM categorias_produtos 
WHERE is_active = true
ORDER BY nome;

-- Resumo
SELECT 
  '✅ Categorias inseridas com sucesso!' as status,
  COUNT(*) as total_categorias_ativas
FROM categorias_produtos 
WHERE is_active = true;
