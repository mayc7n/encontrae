import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

const banco = new PGlite();
const primeiroUsuario = '11111111-1111-4111-8111-111111111111';
const segundoUsuario = '22222222-2222-4222-8222-222222222222';
let vagaId = '';

before(async () => {
  await banco.exec(`create schema auth; create role anon; create role authenticated;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
    insert into auth.users values ('${primeiroUsuario}'), ('${segundoUsuario}');`);
  await banco.exec(await readFile(new URL('../supabase/migrations/202610270001_inicial.sql', import.meta.url), 'utf8'));
});
after(async () => banco.close());

async function entrar(usuario: string | null) {
  await banco.exec('reset role');
  await banco.query("select set_config('request.jwt.claim.sub', $1, false)", [usuario ?? '']);
  await banco.exec(`set role ${usuario ? 'authenticated' : 'anon'}`);
}
async function publicar() {
  return banco.query<{ id: string }>(`insert into public.vagas (titulo, empresa, cidade, bairro, modalidade, remuneracao, descricao, telefone, consentimento)
    values ('Auxiliar de cozinha', 'Restaurante local', 'Pinhais', 'Centro', 'CLT', 'A combinar', 'Preparo de alimentos de segunda a sexta-feira.', '5541999991234', true) returning id`);
}

test('autor cria pendente; visitante e outro autor não leem', async () => {
  await entrar(primeiroUsuario);
  const resultado = await publicar();
  vagaId = resultado.rows[0]!.id;
  assert.equal((await banco.query('select * from public.vagas')).rows.length, 1);
  await entrar(null);
  assert.equal((await banco.query('select * from public.vagas')).rows.length, 0);
  await entrar(segundoUsuario);
  assert.equal((await banco.query('select * from public.vagas')).rows.length, 0);
});
test('autor não aprova nem altera a propriedade do próprio anúncio', async () => {
  await entrar(primeiroUsuario);
  await assert.rejects(banco.query("update public.vagas set status = 'aprovada' where id = $1", [vagaId]));
  await assert.rejects(banco.query('update public.vagas set "usuarioId" = $1 where id = $2', [segundoUsuario, vagaId]));
});
test('aprovação permite leitura pública e expiração remove do mural', async () => {
  await banco.exec('reset role');
  await banco.query("update public.vagas set status = 'aprovada' where id = $1", [vagaId]);
  await entrar(null);
  assert.equal((await banco.query('select * from public.vagas')).rows.length, 1);
  await banco.exec('reset role');
  await banco.query('update public.vagas set "expiraEm" = now() - interval \'1 hour\' where id = $1', [vagaId]);
  await entrar(null);
  assert.equal((await banco.query('select * from public.vagas')).rows.length, 0);
  await banco.exec('reset role');
  await banco.query('update public.vagas set "expiraEm" = now() + interval \'1 day\' where id = $1', [vagaId]);
});
test('denúncia fica privada e não aceita duplicação por usuário', async () => {
  await entrar(segundoUsuario);
  await banco.query('insert into public.denuncias ("vagaId", motivo) values ($1, $2)', [vagaId, 'Contato suspeito ou anúncio enganoso']);
  assert.equal((await banco.query('select * from public.denuncias')).rows.length, 0);
  await assert.rejects(banco.query('insert into public.denuncias ("vagaId", motivo) values ($1, $2)', [vagaId, 'Contato suspeito ou anúncio enganoso']));
  await entrar(primeiroUsuario);
  assert.equal((await banco.query('select * from public.denuncias')).rows.length, 0);
});
test('somente autor encerra e não pode reabrir anúncio', async () => {
  await entrar(segundoUsuario);
  assert.equal((await banco.query("update public.vagas set status = 'encerrada' where id = $1 returning id", [vagaId])).rows.length, 0);
  await entrar(primeiroUsuario);
  assert.equal((await banco.query("update public.vagas set status = 'encerrada' where id = $1 returning id", [vagaId])).rows.length, 1);
  await assert.rejects(banco.query("update public.vagas set status = 'aprovada' where id = $1", [vagaId]));
});
test('limite diário e validação existem no servidor', async () => {
  await entrar(primeiroUsuario);
  for (let indice = 0; indice < 4; indice++) await publicar();
  await assert.rejects(publicar(), /limite/i);
  await entrar(segundoUsuario);
  await assert.rejects(banco.query(`insert into public.vagas (titulo, empresa, cidade, bairro, modalidade, remuneracao, descricao, telefone, consentimento)
    values ('Vaga inválida', 'Empresa', 'Pinhais', 'Centro', 'CLT', 'A combinar', 'Descrição com mais de trinta caracteres aqui.', '123', false)`));
});
