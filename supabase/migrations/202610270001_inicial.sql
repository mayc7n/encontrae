-- Aplicar no SQL Editor do projeto Supabase. Nunca usar service_role no app.
begin;

create table public.vagas (
  id uuid primary key default gen_random_uuid(),
  "usuarioId" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  titulo text not null check (char_length(btrim(titulo)) between 5 and 80),
  empresa text not null check (char_length(btrim(empresa)) between 2 and 80),
  cidade text not null check (cidade in ('Pinhais', 'Curitiba')),
  bairro text not null check (char_length(btrim(bairro)) between 2 and 60),
  modalidade text not null check (modalidade in ('CLT', 'Bico', 'Estágio', 'Autônomo')),
  remuneracao text not null check (char_length(btrim(remuneracao)) between 2 and 60),
  descricao text not null check (char_length(btrim(descricao)) between 30 and 2000),
  telefone text not null check (telefone ~ '^55[1-9][0-9]9[0-9]{8}$'),
  consentimento boolean not null check (consentimento = true),
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'rejeitada', 'encerrada')),
  "criadoEm" timestamptz not null default now(),
  "expiraEm" timestamptz not null default now() + interval '30 days'
);
create index "vagasMural" on public.vagas (cidade, "criadoEm" desc) where status = 'aprovada';
create index "vagasAutor" on public.vagas ("usuarioId", "criadoEm" desc);

alter table public.vagas enable row level security;
revoke all on public.vagas from anon, authenticated;
grant select on public.vagas to anon, authenticated;
grant insert (titulo, empresa, cidade, bairro, modalidade, remuneracao, descricao, telefone, consentimento) on public.vagas to authenticated;
grant update (status) on public.vagas to authenticated;

create policy "leituraPublica" on public.vagas for select to anon, authenticated
  using (status = 'aprovada' and "expiraEm" > now());
create policy "leituraDoAutor" on public.vagas for select to authenticated
  using ("usuarioId" = (select auth.uid()));
create policy "publicacaoPendente" on public.vagas for insert to authenticated
  with check ("usuarioId" = (select auth.uid()) and status = 'pendente');
create policy "encerramentoDoAutor" on public.vagas for update to authenticated
  using ("usuarioId" = (select auth.uid()))
  with check ("usuarioId" = (select auth.uid()) and status = 'encerrada');

create function public."limitarPublicacao"() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new."usuarioId"::text, 0));
  if (select count(*) from public.vagas where "usuarioId" = new."usuarioId" and "criadoEm" > now() - interval '24 hours') >= 5 then
    raise exception 'Limite de 5 anúncios a cada 24 horas.';
  end if;
  return new;
end;
$$;
revoke all on function public."limitarPublicacao"() from public;
create trigger "limitePublicacao" before insert on public.vagas for each row execute function public."limitarPublicacao"();

create table public.denuncias (
  id uuid primary key default gen_random_uuid(),
  "usuarioId" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "vagaId" uuid not null references public.vagas(id) on delete cascade,
  motivo text not null check (char_length(btrim(motivo)) between 10 and 500),
  "criadoEm" timestamptz not null default now(),
  unique ("usuarioId", "vagaId")
);
alter table public.denuncias enable row level security;
revoke all on public.denuncias from anon, authenticated;
grant select on public.denuncias to authenticated;
grant insert ("vagaId", motivo) on public.denuncias to authenticated;
create policy "registrarDenuncia" on public.denuncias for insert to authenticated
  with check ("usuarioId" = (select auth.uid()) and exists (
    select 1 from public.vagas where id = "vagaId" and status = 'aprovada' and "expiraEm" > now()
  ));
-- Sem política de SELECT: denúncias ficam visíveis somente para o operador do banco.

create function public."limitarDenuncia"() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(new."usuarioId"::text, 1));
  if (select count(*) from public.denuncias where "usuarioId" = new."usuarioId" and "criadoEm" > now() - interval '24 hours') >= 10 then
    raise exception 'Limite de 10 denúncias a cada 24 horas.';
  end if;
  return new;
end;
$$;
revoke all on function public."limitarDenuncia"() from public;
create trigger "limiteDenuncia" before insert on public.denuncias for each row execute function public."limitarDenuncia"();

-- Exclusão solicitada pelo próprio usuário. O ID vem exclusivamente do JWT.
create function public."excluirMinhaConta"() returns void
language plpgsql security definer set search_path = '' as $$
declare "usuarioAtual" uuid := auth.uid();
begin
  if "usuarioAtual" is null then raise exception 'Entre na conta para continuar.'; end if;
  delete from auth.users where id = "usuarioAtual";
end;
$$;
revoke all on function public."excluirMinhaConta"() from public, anon;
grant execute on function public."excluirMinhaConta"() to authenticated;

commit;
