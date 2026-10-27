import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Aviso, Botao, Cabecalho, Campo, Secao, Tela, Texto, Titulo, Vazio } from '../../componentes/Interface';
import { Favorito } from '../../componentes/Cartoes';
import { useVagas } from '../../contextos/ContextoVagas';
import { useSessao } from '../../contextos/ContextoSessao';
import { criarLinkWhatsApp } from '../../dominio/regras';
import { abrirSite } from '../../infra/contatos';
import { denunciarVaga } from '../../infra/repositorioVagas';
import { cores } from '../../tema';

export default function DetalheVaga() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vagas, carregando, erro: erroVagas, atualizar } = useVagas();
  const { sessao } = useSessao();
  const [erro, definirErro] = useState('');
  const [motivo, definirMotivo] = useState('');
  const [denunciando, definirDenunciando] = useState(false);
  const [enviado, definirEnviado] = useState(false);
  const [ocupado, definirOcupado] = useState(false);
  const trava = useRef(false);
  const vaga = vagas.find((item) => item.id === id);
  async function executar(acao: () => Promise<void>) {
    if (trava.current) return;
    trava.current = true; definirOcupado(true); definirErro('');
    try { await acao(); } catch (falha) { definirErro(falha instanceof Error ? falha.message : 'Não foi possível concluir.'); }
    finally { trava.current = false; definirOcupado(false); }
  }
  if (!vaga) return <Tela><Cabecalho voltar /><Vazio titulo={carregando ? 'Carregando oportunidade' : 'Oportunidade indisponível'} descricao={erroVagas || 'O anúncio pode ter sido encerrado. Consulte outras vagas.'} />{erroVagas && <Botao titulo="Tentar novamente" aoPressionar={() => void atualizar()} />}</Tela>;
  return <Tela><Cabecalho voltar /><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Texto style={{ fontWeight: '700', color: cores.primaria }}>{vaga.modalidade} · {vaga.cidade}</Texto><Favorito id={`vaga:${vaga.id}`} /></View><Titulo>{vaga.titulo}</Titulo><Texto style={{ color: cores.secundario }}>{vaga.empresa} · {vaga.bairro}</Texto><Texto style={{ fontSize: 24, fontWeight: '700' }}>{vaga.remuneracao}</Texto><Secao titulo="Sobre a oportunidade" /><Texto>{vaga.descricao}</Texto>
    {vaga.demonstracao ? <View style={{ gap: 10 }}><Secao titulo="Esta vaga é um exemplo" /><Aviso>Este anúncio é ilustrativo. Não há contato ou candidatura. Consulte oportunidades reais nos canais oficiais em Serviços.</Aviso></View> : <>
      <Aviso>Você revisa e envia a mensagem no WhatsApp. Nunca pague para participar de uma seleção.</Aviso>
      <Botao titulo="Conversar no WhatsApp" icone="logo-whatsapp" carregando={ocupado} aoPressionar={() => void executar(() => abrirSite(criarLinkWhatsApp(vaga.telefone, `Olá! Vi a oportunidade “${vaga.titulo}” no Encontraê, em ${vaga.cidade}. Ela ainda está disponível?`)))} />
      {enviado ? <Aviso>Denúncia recebida. Ela será analisada pela moderação.</Aviso> : denunciando ? <><Campo rotulo="Motivo da denúncia" value={motivo} onChangeText={definirMotivo} multiline maxLength={500} placeholder="Descreva o problema sem incluir dados pessoais." /><Botao titulo="Enviar denúncia" carregando={ocupado} aoPressionar={() => void executar(async () => { await denunciarVaga(vaga.id, motivo); definirEnviado(true); })} /></> : <Botao titulo="Denunciar anúncio" secundario aoPressionar={() => sessao ? definirDenunciando(true) : router.push('/conta')} />}
      <Texto style={{ fontSize: 12, color: cores.secundario }}>Publicado em {new Date(vaga.criadoEm).toLocaleDateString('pt-BR')}. Disponível até {new Date(vaga.expiraEm).toLocaleDateString('pt-BR')}.</Texto>
    </>}{erro && <Aviso erro>{erro}</Aviso>}
  </Tela>;
}
