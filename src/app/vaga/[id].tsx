import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Aviso, Cabecalho, Secao, Tela, Texto, Titulo, Vazio } from '../../componentes/Interface';
import { Favorito } from '../../componentes/Cartoes';
import { useVagas } from '../../contextos/ContextoVagas';
import { cores } from '../../tema';

export default function DetalheVaga() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { vagas } = useVagas();
  const vaga = vagas.find((item) => item.id === id);
  if (!vaga) return <Tela><Cabecalho voltar /><Vazio titulo="Oportunidade indisponível" descricao="O anúncio pode ter sido encerrado. Consulte outras vagas." /></Tela>;
  return <Tela><Cabecalho voltar /><View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Texto style={{ fontWeight: '700', color: cores.primaria }}>{vaga.modalidade} · {vaga.cidade}</Texto><Favorito id={`vaga:${vaga.id}`} /></View><Titulo>{vaga.titulo}</Titulo><Texto style={{ color: cores.secundario }}>{vaga.empresa} · {vaga.bairro}</Texto><Texto style={{ fontSize: 24, fontWeight: '700' }}>{vaga.remuneracao}</Texto><Secao titulo="Sobre a oportunidade" /><Texto>{vaga.descricao}</Texto>{vaga.demonstracao && <View style={{ gap: 10 }}><Secao titulo="Esta vaga é um exemplo" /><Aviso>Este anúncio é ilustrativo. Não há contato ou candidatura. Consulte oportunidades reais nos canais oficiais em Serviços.</Aviso></View>}</Tela>;
}
