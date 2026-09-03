-- Adiciona colunas que podem estar faltando na tabela veiculos
-- Execute no SQL Editor do Supabase se os campos não existirem

ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS fipe_preco numeric;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'Seminovo';
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS vendido_em timestamptz;
ALTER TABLE veiculos ADD COLUMN IF NOT EXISTS oculto boolean NOT NULL DEFAULT false;

-- Garante que a tabela configuracoes existe
CREATE TABLE IF NOT EXISTS configuracoes (
  id          uuid primary key default gen_random_uuid(),
  nome_loja   text not null default 'MP Seminovos',
  whatsapp    text not null default '',
  endereco    text not null default '',
  horario     text not null default '',
  instagram   text not null default '',
  facebook    text not null default '',
  updated_at  timestamptz not null default now()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "leitura publica configuracoes"
  ON configuracoes FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "escrita configuracoes"
  ON configuracoes FOR ALL USING (true) WITH CHECK (true);
