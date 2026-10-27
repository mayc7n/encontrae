import { useDeferredValue, useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Busca, Cabecalho, Filtros, Tela, Texto, Titulo, Vazio } from '../../componentes/Interface';
import { CartaoServico } from '../../componentes/Cartoes';
import { useAplicativo } from '../../contextos/ContextoApp';
import { servicos } from '../../dados/servicos';
import { filtrarItens } from '../../dominio/regras';
import { cores } from '../../tema';

export default function Servicos() {
  const { cidade } = useAplicativo();
  const [busca, definirBusca] = useState('');
  const [categoria, definirCategoria] = useState('Todas');
  const buscaAdiada = useDeferredValue(busca);
  const resultado = useMemo(() => filtrarItens(servicos, buscaAdiada, cidade, categoria), [buscaAdiada, cidade, categoria]);
  return <Tela rolar={false}><Cabecalho /><View style={{ gap: 7 }}><Titulo>Resolva o dia a dia.</Titulo><Texto style={{ color: cores.secundario }}>O caminho certo para os serviços da sua cidade.</Texto></View><Busca valor={busca} aoAlterar={definirBusca} placeholder="Buscar serviço ou assunto" /><View><Filtros opcoes={['Todas', 'Cidade', 'Saúde', 'Documentos', 'Assistência', 'Trabalho']} selecionado={categoria} aoSelecionar={definirCategoria} /></View>
    <Texto accessibilityLiveRegion="polite" style={{ fontSize: 12, color: cores.secundario }}>{resultado.length} serviços em {cidade}</Texto>
    <FlatList data={resultado} keyExtractor={(item) => item.id} renderItem={({ item }) => <CartaoServico servico={item} />} ItemSeparatorComponent={() => <View style={{ height: 10 }} />} contentContainerStyle={{ paddingBottom: 16 }} keyboardShouldPersistTaps="handled" ListEmptyComponent={<Vazio titulo="Nenhum serviço encontrado" descricao="Tente outro assunto ou mude a categoria." />} />
  </Tela>;
}
