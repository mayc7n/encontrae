import { router } from 'expo-router';
import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Aviso, Botao, Busca, Cabecalho, Filtros, Tela, Texto, Titulo, Vazio } from '../../componentes/Interface';
import { CartaoVaga } from '../../componentes/Cartoes';
import { useAplicativo } from '../../contextos/ContextoApp';
import { useVagas } from '../../contextos/ContextoVagas';
import { filtrarItens, modalidades } from '../../dominio/regras';
import { cores } from '../../tema';

export default function Vagas() {
  const { cidade } = useAplicativo();
  const { vagas, demonstracao, carregando, erro, atualizar } = useVagas();
  const [busca, definirBusca] = useState('');
  const [modalidade, definirModalidade] = useState('Todas');
  const buscaAdiada = useDeferredValue(busca);
  const resultado = useMemo(() => filtrarItens(vagas, buscaAdiada, cidade, modalidade), [vagas, buscaAdiada, cidade, modalidade]);
  return <Tela rolar={false}><Cabecalho /><View style={{ gap: 7 }}><Titulo>Seu próximo começo.</Titulo><Texto style={{ color: cores.secundario }}>Vagas e bicos de quem está perto.</Texto></View><Busca valor={busca} aoAlterar={definirBusca} placeholder="Buscar cargo, bairro ou empresa" /><View><Filtros opcoes={['Todas', ...modalidades]} selecionado={modalidade} aoSelecionar={definirModalidade} /></View>
    {demonstracao && <Aviso>Modo demonstração: os anúncios abaixo são exemplos. Para oportunidades reais, consulte a Agência do Trabalhador em Serviços.</Aviso>}
    {erro && <View style={{ gap: 8 }}><Aviso erro>{erro}</Aviso><Botao titulo="Tentar novamente" aoPressionar={() => void atualizar()} secundario /></View>}
    <FlatList data={resultado} keyExtractor={(item) => item.id} renderItem={({ item }) => <CartaoVaga vaga={item} />} refreshing={carregando} onRefresh={() => void atualizar()} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled" ListEmptyComponent={<Vazio titulo={carregando ? 'Carregando oportunidades' : 'Nenhuma vaga por aqui ainda'} descricao="Tente outro filtro ou volte mais tarde." />} />
    <Botao titulo="Anunciar oportunidade" icone="add-circle-outline" aoPressionar={() => router.push('/anunciar')} />
  </Tela>;
}
