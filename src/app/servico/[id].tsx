import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Aviso, Botao, Cabecalho, Icone, Secao, Tela, Texto, Titulo, Vazio } from '../../componentes/Interface';
import { Favorito, iconesCategorias } from '../../componentes/Cartoes';
import { servicos } from '../../dados/servicos';
import { abrirSite, ligar } from '../../infra/contatos';
import { cores } from '../../tema';

export default function DetalheServico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const servico = servicos.find((item) => item.id === id);
  const [erro, definirErro] = useState('');
  async function executar(acao: () => Promise<void>) { definirErro(''); try { await acao(); } catch (falha) { definirErro(falha instanceof Error ? falha.message : 'Não foi possível abrir o canal.'); } }
  if (!servico) return <Tela><Cabecalho voltar /><Vazio titulo="Serviço não encontrado" descricao="Volte ao catálogo e escolha outro serviço." /></Tela>;
  return <Tela><Cabecalho voltar /><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Icone nome={iconesCategorias[servico.categoria]} tamanho={36} /><Favorito id={`servico:${servico.id}`} /></View><Texto style={{ color: cores.primaria, fontWeight: '600', fontSize: 12 }}>{servico.categoria} · {servico.cidade}</Texto><Titulo>{servico.titulo}</Titulo><Texto style={{ color: cores.secundario }}>{servico.descricao}</Texto>
    <Aviso>O atendimento acontece nos canais de {servico.orgao}. O Encontraê é um guia independente.</Aviso>
    <View style={{ gap: 14 }}><Secao titulo="Como acessar" />{servico.orientacoes.map((passo, indice) => <View key={passo} style={{ flexDirection: 'row', gap: 12 }}><Texto style={{ color: cores.primaria, fontWeight: '800' }}>{String(indice + 1).padStart(2, '0')}</Texto><Texto style={{ flex: 1 }}>{passo}</Texto></View>)}</View>
    <View style={{ gap: 8 }}><Secao titulo="Antes de sair de casa" />{servico.documentos.map((documento) => <Texto key={documento} style={{ color: cores.secundario }}>{documento}</Texto>)}</View>
    {erro && <Aviso erro>{erro}</Aviso>}<Botao titulo="Acessar serviço oficial" icone="open-outline" aoPressionar={() => void executar(() => abrirSite(servico.fonte))} />
    {servico.telefone && <Botao titulo={`Ligar: (41) ${servico.telefone.slice(2, 6)}-${servico.telefone.slice(6)}`} icone="call-outline" secundario aoPressionar={() => void executar(() => ligar(servico.telefone!))} />}
    {servico.endereco && <Botao titulo="Abrir no mapa" secundario icone="map-outline" aoPressionar={() => void executar(() => abrirSite(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(servico.endereco!)}`))} />}
    <Texto style={{ fontSize: 12, color: cores.secundario }}>Fonte: {new URL(servico.fonte).hostname}{`\n`}Conferido em {servico.conferidoEm.split('-').reverse().join('/')}. Confirme requisitos e disponibilidade no canal oficial.</Texto>
  </Tela>;
}
