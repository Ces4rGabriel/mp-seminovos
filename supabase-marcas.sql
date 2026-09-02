-- Tabela de marcas
create table marcas (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table marcas enable row level security;

create policy "leitura publica marcas" on marcas
  for select using (true);

create policy "escrita marcas" on marcas
  for all using (true);
