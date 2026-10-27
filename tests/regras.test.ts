import assert from 'node:assert/strict';
import { test } from 'node:test';
import { criarLinkWhatsApp, filtrarItens, lerPreferencias, validarLinkExterno, validarVaga } from '../src/dominio/regras.ts';

test('busca ignora acentos, espaços e maiúsculas sem ignorar a cidade', () => {
  const itens = [
    { titulo: 'Assistência social', cidade: 'Pinhais', categoria: 'Assistência', descricao: 'Atendimento no Centro' },
    { titulo: 'Assistência social', cidade: 'Curitiba', categoria: 'Assistência', descricao: 'CRAS' },
  ];
  assert.deepEqual(filtrarItens(itens, '  ASSISTENCIA ', 'Pinhais', 'Todas'), [itens[0]]);
  assert.equal(filtrarItens(itens, 'centro', 'Todas', 'Saúde').length, 0);
});

test('WhatsApp normaliza celular brasileiro e codifica mensagem', () => {
  assert.equal(criarLinkWhatsApp('(41) 99999-1234', 'Olá & vaga?'), 'https://wa.me/5541999991234?text=Ol%C3%A1%20%26%20vaga%3F');
  assert.equal(criarLinkWhatsApp('+55 41 99999-1234', 'Oi'), 'https://wa.me/5541999991234?text=Oi');
  assert.throws(() => criarLinkWhatsApp('javascript:alert(1)', 'Oi'));
  assert.throws(() => criarLinkWhatsApp('12345', 'Oi'));
});

test('links externos recusam scripts, HTTP, credenciais e destinos locais', () => {
  assert.equal(validarLinkExterno('https://www.curitiba.pr.gov.br/servicos'), true);
  for (const link of ['javascript:alert(1)', 'http://site.com', 'https://usuario:senha@site.com', 'https://localhost', 'https://127.0.0.1', 'https://192.168.1.1', 'https://[::1]', 'https://10.0.0.1']) {
    assert.equal(validarLinkExterno(link), false, link);
  }
});

test('vaga exige contato válido, consentimento e descrição útil', () => {
  const vaga = { titulo: 'Auxiliar de cozinha', empresa: 'Restaurante local', cidade: 'Pinhais', bairro: 'Centro', modalidade: 'CLT', remuneracao: 'A combinar', descricao: 'Preparação de alimentos de segunda a sexta-feira.', telefone: '(41) 99999-1234', consentimento: true };
  assert.equal(validarVaga(vaga).success, true);
  for (const alteracao of [{ telefone: '123' }, { consentimento: false }, { cidade: 'Londrina' }, { titulo: ' ' }, { descricao: 'Oi' }]) {
    assert.equal(validarVaga({ ...vaga, ...alteracao }).success, false);
  }
});

test('preferências corrompidas não derrubam o aplicativo', () => {
  assert.equal(lerPreferencias('{quebrado').cidade, 'Pinhais');
  assert.deepEqual(lerPreferencias('{"favoritos":[null,42],"cidade":"Outra"}').favoritos, []);
  assert.deepEqual(lerPreferencias('{"cidade":"Curitiba","favoritos":["servico:156"]}'), { cidade: 'Curitiba', favoritos: ['servico:156'] });
});
