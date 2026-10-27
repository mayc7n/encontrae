import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Switch, View } from 'react-native';
import { Aviso, Botao, Cabecalho, Campo, Filtros, Tela, Texto, Titulo } from '../componentes/Interface';
import { useAplicativo } from '../contextos/ContextoApp';
import { useSessao } from '../contextos/ContextoSessao';
import { cidades, criarRascunho, lerRascunho, modalidades, validarVaga, type FormularioVaga } from '../dominio/regras';
import { publicarVaga } from '../infra/repositorioVagas';
import { supabase } from '../infra/supabase';
import { cores } from '../tema';

export const chaveRascunho = 'encontrae.rascunho.v1';
export default function Anunciar() {
  const { cidade } = useAplicativo();
  const { sessao } = useSessao();
  const [formulario, definirFormulario] = useState<FormularioVaga>(() => criarRascunho(cidade));
  const [erros, definirErros] = useState<Record<string, string>>({});
  const [mensagem, definirMensagem] = useState('');
  const [falha, definirFalha] = useState('');
  const [pronto, definirPronto] = useState(false);
  const [ocupado, definirOcupado] = useState(false);
  const [enviado, definirEnviado] = useState(false);
  const trava = useRef(false);
  const cidadeInicial = useRef(cidade);

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(chaveRascunho).then((texto) => { if (ativo) definirFormulario(lerRascunho(texto, cidadeInicial.current)); })
      .catch(() => { if (ativo) definirFalha('Não foi possível recuperar o rascunho.'); })
      .finally(() => { if (ativo) definirPronto(true); });
    return () => { ativo = false; };
  }, []);

  function alterar<K extends keyof FormularioVaga>(campo: K, valor: FormularioVaga[K]) {
    definirFormulario((atual) => ({ ...atual, [campo]: valor }));
    definirErros((atuais) => ({ ...atuais, [campo]: '' })); definirMensagem('');
  }
  async function salvarRascunho(entrar = false) {
    if (trava.current) return;
    trava.current = true; definirOcupado(true); definirFalha(''); definirMensagem('');
    try {
      await AsyncStorage.setItem(chaveRascunho, JSON.stringify(formulario));
      definirMensagem('Rascunho salvo neste aparelho. Ele ainda não foi publicado.');
      if (entrar) router.push('/conta');
    } catch { definirFalha('Não foi possível salvar o rascunho. Confira o armazenamento do aparelho.'); }
    finally { trava.current = false; definirOcupado(false); }
  }
  async function enviar() {
    if (trava.current || !sessao || enviado) return;
    const resultado = validarVaga(formulario);
    if (!resultado.success) {
      definirErros(Object.fromEntries(resultado.error.issues.map((problema) => [String(problema.path[0]), problema.message])));
      definirFalha('Revise os campos indicados antes de enviar.'); return;
    }
    trava.current = true; definirOcupado(true); definirFalha(''); definirMensagem('');
    try {
      await publicarVaga(resultado.data);
      definirEnviado(true);
      try { await AsyncStorage.removeItem(chaveRascunho); } catch { /* O anúncio já foi enviado; não repetir a publicação. */ }
    } catch (erro) { definirFalha(erro instanceof Error ? erro.message : 'Não foi possível enviar.'); }
    finally { trava.current = false; definirOcupado(false); }
  }
  if (enviado) return <Tela><Cabecalho voltar /><Titulo>Anúncio enviado para análise.</Titulo><Aviso>Seu anúncio ficará público depois da aprovação. Você acompanha o status na sua conta.</Aviso><Botao titulo="Ver meus anúncios" aoPressionar={() => router.replace('/conta')} /></Tela>;
  return <Tela><Cabecalho voltar /><Titulo>Uma oportunidade começa aqui.</Titulo><Texto style={{ color: cores.secundario }}>Descreva o trabalho com clareza e encontre pessoas da região.</Texto>
    {!supabase && <Aviso>O mural está em demonstração. Você pode preparar e salvar um rascunho neste aparelho; ele não será publicado.</Aviso>}
    <Campo rotulo="Título da oportunidade" placeholder="Ex.: Auxiliar de cozinha" value={formulario.titulo} onChangeText={(valor) => alterar('titulo', valor)} maxLength={80} erro={erros.titulo} editable={pronto && !ocupado} />
    <Campo rotulo="Empresa ou anunciante" placeholder="Como você quer ser identificado" value={formulario.empresa} onChangeText={(valor) => alterar('empresa', valor)} maxLength={80} erro={erros.empresa} editable={pronto && !ocupado} />
    <Texto style={{ fontWeight: '600' }}>Cidade</Texto><Filtros opcoes={cidades} selecionado={formulario.cidade} aoSelecionar={(valor) => { if (!ocupado && pronto) alterar('cidade', valor as FormularioVaga['cidade']); }} />
    <Campo rotulo="Bairro" placeholder="Ex.: Centro" value={formulario.bairro} onChangeText={(valor) => alterar('bairro', valor)} maxLength={60} erro={erros.bairro} editable={pronto && !ocupado} />
    <Texto style={{ fontWeight: '600' }}>Tipo de oportunidade</Texto><Filtros opcoes={modalidades} selecionado={formulario.modalidade} aoSelecionar={(valor) => { if (!ocupado && pronto) alterar('modalidade', valor as FormularioVaga['modalidade']); }} />
    <Campo rotulo="Remuneração" placeholder="Ex.: R$ 2.000 / mês ou A combinar" value={formulario.remuneracao} onChangeText={(valor) => alterar('remuneracao', valor)} maxLength={60} erro={erros.remuneracao} editable={pronto && !ocupado} />
    <Campo rotulo="Descrição" placeholder="Atividades, horários, requisitos e condições do trabalho." value={formulario.descricao} onChangeText={(valor) => alterar('descricao', valor)} multiline maxLength={2000} erro={erros.descricao} editable={pronto && !ocupado} />
    <Campo rotulo="WhatsApp com DDD" placeholder="(41) 99999-9999" value={formulario.telefone} onChangeText={(valor) => alterar('telefone', valor)} keyboardType="phone-pad" maxLength={25} erro={erros.telefone} editable={pronto && !ocupado} />
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Switch accessibilityLabel="Autorizar divulgação do contato" value={formulario.consentimento} disabled={ocupado || !pronto} onValueChange={(valor) => alterar('consentimento', valor)} trackColor={{ true: cores.primaria, false: cores.borda }} /><Texto style={{ flex: 1, fontSize: 13 }}>Autorizo a divulgação deste contato e confirmo que as informações são verdadeiras.</Texto></View>
    {erros.consentimento && <Texto style={{ color: cores.erro }}>{erros.consentimento}</Texto>}{falha && <Aviso erro>{falha}</Aviso>}{mensagem && <Aviso>{mensagem}</Aviso>}
    {supabase && (sessao ? <Botao titulo="Enviar para análise" icone="paper-plane-outline" aoPressionar={() => void enviar()} carregando={ocupado} desabilitado={!pronto} /> : <Botao titulo="Entrar para publicar" aoPressionar={() => void salvarRascunho(true)} carregando={ocupado} desabilitado={!pronto} />)}
    <Botao titulo="Salvar rascunho neste aparelho" secundario aoPressionar={() => void salvarRascunho()} carregando={ocupado} desabilitado={!pronto} />
    <Texto style={{ color: cores.secundario, fontSize: 12 }}>Anúncios aprovados ficam disponíveis por até 30 dias. Nunca inclua CPF, dados bancários ou documentos de outras pessoas.</Texto>
  </Tela>;
}
