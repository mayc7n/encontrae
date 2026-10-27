import { esquemaVagaPublica, type Vaga } from '../dominio/modelos';
import { esquemaVaga, type DadosVaga } from '../dominio/regras';
import { supabase } from './supabase';

const camposPublicos = 'id,titulo,empresa,cidade,bairro,modalidade,remuneracao,descricao,telefone,status,criadoEm,expiraEm';
function exigirCliente() { if (!supabase) throw new Error('O serviço de publicação ainda não está disponível.'); return supabase; }
export async function listarVagas(usuarioId?: string): Promise<Vaga[]> {
  let consulta = exigirCliente().from('vagas').select(camposPublicos).order('criadoEm', { ascending: false }).limit(200);
  consulta = usuarioId ? consulta.eq('usuarioId', usuarioId) : consulta.eq('status', 'aprovada').gt('expiraEm', new Date().toISOString());
  const { data: dados, error: erro } = await consulta;
  if (erro) throw new Error('Não foi possível carregar os anúncios. Confira a conexão e tente novamente.');
  return esquemaVagaPublica.array().parse(dados);
}
export async function publicarVaga(entrada: DadosVaga): Promise<void> {
  const dados = esquemaVaga.parse(entrada);
  const { error: erro } = await exigirCliente().from('vagas').insert(dados);
  if (erro) throw new Error(erro.message.includes('Limite') ? 'Você atingiu o limite de 5 anúncios em 24 horas.' : 'Não foi possível enviar o anúncio. Confira sua sessão e tente novamente.');
}
export async function encerrarVaga(id: string): Promise<void> {
  const { data: dados, error: erro } = await exigirCliente().from('vagas').update({ status: 'encerrada' }).eq('id', id).select('id');
  if (erro || !dados?.length) throw new Error('Não foi possível encerrar este anúncio.');
}
export async function denunciarVaga(vagaId: string, motivo: string): Promise<void> {
  if (motivo.trim().length < 10 || motivo.length > 500) throw new Error('Descreva o motivo entre 10 e 500 caracteres.');
  const { error: erro } = await exigirCliente().from('denuncias').insert({ vagaId, motivo: motivo.trim() });
  if (erro) throw new Error(erro.code === '23505' ? 'Você já denunciou este anúncio.' : 'Não foi possível enviar a denúncia. Confira sua sessão e tente novamente.');
}
