import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { z } from 'zod';
import { Aviso, Botao, Cabecalho, Campo, Secao, Tela, Texto, Titulo } from '../componentes/Interface';
import { useSessao } from '../contextos/ContextoSessao';
import { useAgora } from '../contextos/useAgora';
import { useVagas } from '../contextos/ContextoVagas';
import type { Vaga } from '../dominio/modelos';
import { encerrarVaga, listarVagas } from '../infra/repositorioVagas';
import { erroConfiguracao, supabase } from '../infra/supabase';
import { cores } from '../tema';

const rotulosStatus = { pendente: 'Em análise', aprovada: 'Publicado', rejeitada: 'Não aprovado', encerrada: 'Encerrado' };
export default function Conta() {
  const { sessao, carregando, erro: erroSessao } = useSessao();
  const { atualizar } = useVagas();
  const agora = useAgora();
  const [email, definirEmail] = useState('');
  const [codigo, definirCodigo] = useState('');
  const [codigoEnviado, definirCodigoEnviado] = useState(false);
  const [espera, definirEspera] = useState(0);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState('');
  const [mensagem, definirMensagem] = useState('');
  const [resultadoAnuncios, definirAnuncios] = useState<{ usuarioId: string; anuncios: Vaga[] } | null>(null);
  const [confirmacao, definirConfirmacao] = useState('');
  const [excluindo, definirExcluindo] = useState(false);
  const trava = useRef(false);
  const usuarioId = sessao?.user.id;
  const anuncios = resultadoAnuncios?.usuarioId === usuarioId ? resultadoAnuncios?.anuncios ?? [] : [];
  const carregarAnuncios = useCallback(() => {
    if (!usuarioId) return Promise.resolve();
    return listarVagas(usuarioId).then((dados) => definirAnuncios({ usuarioId, anuncios: dados }))
      .catch(() => definirErro('Não foi possível carregar seus anúncios. Use “Atualizar anúncios”.'));
  }, [usuarioId]);
  useEffect(() => { void carregarAnuncios(); }, [carregarAnuncios]);
  useEffect(() => {
    if (espera <= 0) return;
    const temporizador = setTimeout(() => definirEspera((atual) => atual - 1), 1000);
    return () => clearTimeout(temporizador);
  }, [espera]);

  async function executar(acao: () => Promise<void>) {
    if (trava.current) return;
    trava.current = true; definirOcupado(true); definirErro(''); definirMensagem('');
    try { await acao(); }
    catch (falha) { definirErro(falha instanceof Error ? falha.message : 'Não foi possível concluir. Tente novamente.'); }
    finally { trava.current = false; definirOcupado(false); }
  }
  async function enviarCodigo() {
    if (!supabase) return;
    const resultado = z.email().safeParse(email.trim());
    if (!resultado.success) throw new Error('Informe um e-mail válido.');
    const { error: falha } = await supabase.auth.signInWithOtp({ email: resultado.data });
    if (falha) throw new Error('Não foi possível enviar o código. Confira o e-mail e aguarde antes de tentar novamente.');
    definirEmail(resultado.data); definirCodigoEnviado(true); definirEspera(60); definirMensagem('Confira seu e-mail e digite o código recebido.');
  }
  async function confirmarCodigo() {
    if (!supabase) return;
    if (!/^\d{6,8}$/.test(codigo.trim())) throw new Error('Digite o código numérico recebido por e-mail.');
    const { error: falha } = await supabase.auth.verifyOtp({ email, token: codigo.trim(), type: 'email' });
    if (falha) throw new Error('Código inválido ou expirado. Confira o código ou solicite outro.');
    definirCodigo(''); definirCodigoEnviado(false); definirMensagem('Acesso confirmado. Você já pode enviar seu anúncio.');
  }
  async function sair() {
    const resultado = await supabase?.auth.signOut({ scope: 'local' });
    if (resultado?.error) throw new Error('Não foi possível sair. Tente novamente.');
    definirAnuncios(null); definirExcluindo(false); definirConfirmacao('');
  }
  async function excluirConta() {
    if (!supabase || confirmacao !== 'EXCLUIR') return;
    const { error: falha } = await supabase.rpc('excluirMinhaConta');
    if (falha) throw new Error('Não foi possível excluir a conta. Tente novamente.');
    await sair(); await atualizar();
    try { await AsyncStorage.removeItem('encontrae.rascunho.v1'); } catch { /* A exclusão no servidor já foi concluída. */ }
    definirMensagem('Conta e anúncios excluídos.');
  }
  return <Tela><Cabecalho voltar /><Titulo>Seu espaço no bairro.</Titulo>
    {(erro || erroSessao || erroConfiguracao) && <Aviso erro>{erro || erroSessao || erroConfiguracao}</Aviso>}{mensagem && <Aviso>{mensagem}</Aviso>}
    {!supabase ? <><Aviso>Você pode explorar serviços e salvar favoritos sem uma conta. O mural está em demonstração; o cadastro de anunciantes ainda não está aberto.</Aviso><Botao titulo="Preparar um anúncio" aoPressionar={() => router.push('/anunciar')} /></> : sessao ? <>
      <Texto style={{ color: cores.secundario }}>Você entrou como {sessao.user.email}</Texto><Botao titulo="Criar anúncio" aoPressionar={() => router.push('/anunciar')} />
      <Secao titulo="Meus anúncios" />{anuncios.length === 0 && <Texto style={{ color: cores.secundario }}>Você ainda não tem anúncios disponíveis.</Texto>}
      {anuncios.map((anuncio) => <View key={anuncio.id} style={{ padding: 16, borderRadius: 16, backgroundColor: cores.superficie, gap: 10, borderWidth: 1, borderColor: cores.borda }}><Texto style={{ fontWeight: '700' }}>{anuncio.titulo}</Texto><Texto style={{ color: cores.secundario, fontSize: 13 }}>{new Date(anuncio.expiraEm).getTime() <= agora && anuncio.status === 'aprovada' ? 'Expirado' : rotulosStatus[anuncio.status]} · {anuncio.cidade}</Texto>{anuncio.status !== 'encerrada' && <Botao titulo={`Encerrar: ${anuncio.titulo}`} secundario desabilitado={ocupado} aoPressionar={() => void executar(async () => { await encerrarVaga(anuncio.id); await carregarAnuncios(); await atualizar(); definirMensagem('Anúncio encerrado.'); })} />}</View>)}
      <Botao titulo="Atualizar anúncios" secundario carregando={ocupado} aoPressionar={() => void executar(carregarAnuncios)} /><Botao titulo="Sair da conta" secundario desabilitado={ocupado} aoPressionar={() => void executar(sair)} />
      {excluindo ? <><Aviso erro>A exclusão é permanente. Sua conta, anúncios e denúncias serão removidos. Digite EXCLUIR para confirmar.</Aviso><Campo rotulo="Confirmação de exclusão" value={confirmacao} onChangeText={definirConfirmacao} autoCapitalize="characters" /><Botao titulo="Excluir permanentemente minha conta" desabilitado={confirmacao !== 'EXCLUIR'} carregando={ocupado} aoPressionar={() => void executar(excluirConta)} /><Botao titulo="Cancelar exclusão" secundario desabilitado={ocupado} aoPressionar={() => definirExcluindo(false)} /></> : <Botao titulo="Excluir minha conta" secundario desabilitado={ocupado} aoPressionar={() => definirExcluindo(true)} />}
    </> : <>
      <Texto style={{ color: cores.secundario }}>Entre com um código por e-mail para anunciar ou denunciar uma oportunidade. Sem senha para memorizar.</Texto>
      <Campo rotulo="Seu e-mail" placeholder="voce@exemplo.com" value={email} onChangeText={definirEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!codigoEnviado && !ocupado && !carregando} />
      {codigoEnviado && <><Campo rotulo="Código recebido por e-mail" placeholder="Digite o código" value={codigo} onChangeText={definirCodigo} keyboardType="number-pad" maxLength={8} autoComplete="one-time-code" editable={!ocupado} /><Botao titulo="Confirmar código" carregando={ocupado} aoPressionar={() => void executar(confirmarCodigo)} /><Botao titulo="Usar outro e-mail" secundario desabilitado={ocupado} aoPressionar={() => { definirCodigoEnviado(false); definirCodigo(''); }} /></>}
      <Botao titulo={espera > 0 ? `Reenviar em ${espera}s` : codigoEnviado ? 'Reenviar código' : 'Receber código por e-mail'} secundario={codigoEnviado} carregando={ocupado} desabilitado={espera > 0 || carregando} aoPressionar={() => void executar(enviarCodigo)} />
    </>}
    <Botao titulo="Privacidade e uso" secundario aoPressionar={() => router.push('/privacidade')} />
  </Tela>;
}
