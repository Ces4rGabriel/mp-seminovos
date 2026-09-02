create table configuracoes (
  id          uuid primary key default gen_random_uuid(),
  nome_loja   text not null default 'MP Seminovos',
  whatsapp    text not null default '',
  endereco    text not null default '',
  horario     text not null default '',
  instagram   text not null default '',
  facebook    text not null default '',
  updated_at  timestamptz not null default now()
);

alter table configuracoes enable row level security;

create policy "leitura publica configuracoes"
  on configuracoes for select using (true);

create policy "escrita configuracoes"
  on configuracoes for all using (true);
