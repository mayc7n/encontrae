import { View } from 'react-native';
import { Cabecalho, Secao, Tela, Texto, Titulo, Vazio } from '../../componentes/Interface';
import { CartaoServico, CartaoVaga } from '../../componentes/Cartoes';
import { useAplicativo } from '../../contextos/ContextoApp';
import { useVagas } from '../../contextos/ContextoVagas';
import { servicos } from '../../dados/servicos';
import { cores } from '../../tema';

export default function Salvos() {
  const { favoritos } = useAplicativo();
  const { vagas } = useVagas();
  const servicosSalvos = servicos.filter((item) => favoritos.includes(`servico:${item.id}`));
  const vagasSalvas = vagas.filter((item) => favoritos.includes(`vaga:${item.id}`));
  return <Tela><Cabecalho /><Titulo>Guarde para depois.</Titulo><Texto style={{ color: cores.secundario }}>Seus favoritos de Pinhais e Curitiba, neste aparelho.</Texto>
    {servicosSalvos.length + vagasSalvas.length === 0 && <Vazio titulo="Seu cantinho de favoritos" descricao="Toque no marcador de um serviço ou vaga para encontrar aqui depois. Vagas encerradas deixam de aparecer." />}
    {servicosSalvos.length > 0 && <View style={{ gap: 12 }}><Secao titulo="Serviços" />{servicosSalvos.map((item) => <CartaoServico key={item.id} servico={item} />)}</View>}
    {vagasSalvas.length > 0 && <View style={{ gap: 12 }}><Secao titulo="Oportunidades" />{vagasSalvas.map((item) => <CartaoVaga key={item.id} vaga={item} />)}</View>}
  </Tela>;
}
