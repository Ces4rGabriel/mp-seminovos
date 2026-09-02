-- Tabela de veículos
create table veiculos (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  ano int not null,
  km int not null default 0,
  preco numeric not null,
  cor text not null default '',
  cambio text not null default 'Manual',
  combustivel text not null default 'Flex',
  descricao text,
  opcionais text[] not null default '{}',
  fotos text[] not null default '{}',
  destaque boolean not null default false,
  vendido boolean not null default false,
  created_at timestamptz not null default now()
);

-- Leitura pública (site público pode buscar veículos)
alter table veiculos enable row level security;

create policy "leitura publica" on veiculos
  for select using (true);

create policy "escrita service role" on veiculos
  for all using (true);

-- Storage bucket para fotos
insert into storage.buckets (id, name, public) values ('veiculos', 'veiculos', true);

create policy "upload publico" on storage.objects
  for insert with check (bucket_id = 'veiculos');

create policy "leitura publica storage" on storage.objects
  for select using (bucket_id = 'veiculos');

create policy "delete storage" on storage.objects
  for delete using (bucket_id = 'veiculos');
