-- Financeiro: caixa da empresa (MP Seminovos)
-- Migração aditiva: não altera as políticas existentes da tabela veiculos.

-- 1) Campos novos em veiculos
alter table veiculos
  add column if not exists placa text,
  add column if not exists em_troca boolean not null default false,
  add column if not exists vendido_em timestamptz,
  add column if not exists fipe_codigo text,
  add column if not exists fipe_valor numeric(12,2),
  add column if not exists fipe_consultado_em timestamptz;

create unique index if not exists veiculos_placa_key on veiculos (placa) where placa is not null;

-- 2) Formas de pagamento
create table if not exists formas_pagamento (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

insert into formas_pagamento (nome) values
  ('PIX'),
  ('Dinheiro'),
  ('Cartão de débito'),
  ('Cartão de crédito'),
  ('Transferência'),
  ('Boleto'),
  ('Financiamento'),
  ('Troca')
on conflict (nome) do nothing;

-- 3) Categorias financeiras
create table if not exists categorias_financeiras (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  tipo text not null check (tipo in ('entrada', 'saida', 'ambos')),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

insert into categorias_financeiras (nome, tipo) values
  ('Venda de veículo', 'entrada'),
  ('Compra de veículo', 'saida'),
  ('Manutenção', 'saida'),
  ('Documentação', 'saida'),
  ('Estética', 'saida'),
  ('Comissão', 'saida'),
  ('Outros', 'ambos')
on conflict (nome) do nothing;

-- 4) Lançamentos (fluxo de caixa)
-- Compra, gastos e venda de um veículo são lançamentos ligados a ele por veiculo_id.
create table if not exists lancamentos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('entrada', 'saida')),
  valor numeric(12,2) not null check (valor > 0),
  data date not null default current_date,
  descricao text not null,
  categoria_id uuid references categorias_financeiras (id),
  forma_pagamento_id uuid references formas_pagamento (id),
  veiculo_id uuid references veiculos (id) on delete set null,
  nota_fiscal_url text,
  created_at timestamptz not null default now()
);

create index if not exists lancamentos_data_idx on lancamentos (data);
create index if not exists lancamentos_veiculo_idx on lancamentos (veiculo_id);

-- 5) View de resultado por veículo (calculada, não guardada)
create or replace view veiculos_financeiro with (security_invoker = true) as
select
  v.id as veiculo_id,
  v.placa,
  v.marca,
  v.modelo,
  v.ano,
  v.preco as valor_venda_previsto,
  v.fipe_valor,
  v.vendido,
  v.em_troca,
  coalesce(sum(l.valor) filter (where l.tipo = 'saida'), 0) as custo_total,
  coalesce(sum(l.valor) filter (where l.tipo = 'entrada'), 0) as valor_recebido,
  coalesce(sum(l.valor) filter (where l.tipo = 'entrada'), 0)
    - coalesce(sum(l.valor) filter (where l.tipo = 'saida'), 0) as resultado
from veiculos v
left join lancamentos l on l.veiculo_id = v.id
group by v.id;

-- 6) Segurança: RLS ligado e sem políticas públicas.
-- Só o servidor (service role) lê e escreve estas tabelas.
alter table formas_pagamento enable row level security;
alter table categorias_financeiras enable row level security;
alter table lancamentos enable row level security;
