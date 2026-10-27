import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Cabecalho, Icone, Secao, Tela, Texto } from '../../componentes/Interface';
import { CartaoServico, CartaoVaga } from '../../componentes/Cartoes';
import { useAplicativo } from '../../contextos/ContextoApp';
import { useVagas } from '../../contextos/ContextoVagas';
import { servicos } from '../../dados/servicos';
import { cores } from '../../tema';

export default function Inicio() {
  const { cidade } = useAplicativo();
  const { vagas, demonstracao } = useVagas();
  const servicosLocais = servicos.filter((item) => item.cidade === cidade).slice(0, 3);
  const vagasLocais = vagas.filter((item) => item.cidade === cidade).slice(0, 2);
  return <Tela><Cabecalho />
    <View style={estilos.hero}>
      <View style={estilos.selo}><View style={estilos.ponto} /><Texto style={estilos.textoSelo}>PERTO DE VOCÊ, EM {cidade.toLocaleUpperCase('pt-BR')}</Texto></View>
      <Texto accessibilityRole="header" style={estilos.chamada}>Seu bairro.</Texto><Texto accessibilityRole="header" style={[estilos.chamada, { color: cores.primaria }]}>Mais possibilidades.</Texto>
      <Texto style={estilos.descricao}>Serviços que ajudam. Oportunidades que aproximam. Tudo começa por aqui.</Texto>
      <Pressable accessibilityRole="button" accessibilityLabel="Buscar serviços na cidade" onPress={() => router.push('/servicos')} style={estilos.busca}><Icone nome="search-outline" /><Texto style={{ color: cores.secundario, fontSize: 14, flex: 1 }}>Do que você precisa hoje?</Texto><View style={estilos.seta}><Icone nome="arrow-forward" tamanho={18} cor={cores.branco} /></View></Pressable>
    </View>
    <View style={estilos.atalhos}>
      <Pressable accessibilityRole="button" accessibilityLabel="Explorar serviços" onPress={() => router.push('/servicos')} style={[estilos.atalho, { backgroundColor: cores.primaria }]}>
        <View style={estilos.linha}><Icone nome="grid-outline" tamanho={25} cor={cores.destaque} /><Icone nome="arrow-forward" tamanho={18} cor={cores.branco} /></View>
        <Texto style={[estilos.tituloAtalho, { color: cores.branco }]}>Resolver{`\n`}o dia a dia</Texto><Texto style={{ color: '#DCE8FF', fontSize: 12 }}>Serviços públicos</Texto>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Explorar vagas" onPress={() => router.push('/vagas')} style={[estilos.atalho, { backgroundColor: cores.destaque }]}>
        <View style={estilos.linha}><Icone nome="briefcase-outline" tamanho={25} /><Icone nome="arrow-forward" tamanho={18} /></View>
        <Texto style={estilos.tituloAtalho}>Encontrar{`\n`}uma oportunidade</Texto><Texto style={{ color: cores.primariaEscura, fontSize: 12 }}>Vagas e bicos</Texto>
      </Pressable>
    </View>
    <View style={{ gap: 10 }}><Secao titulo="Sua cidade, mais fácil" acao="Ver serviços" aoPressionar={() => router.push('/servicos')} />{servicosLocais.map((servico) => <CartaoServico key={servico.id} servico={servico} />)}</View>
    <View style={{ gap: 12 }}><Secao titulo="Oportunidades por perto" acao="Ver vagas" aoPressionar={() => router.push('/vagas')} />{demonstracao && <Texto style={{ color: cores.secundario, fontSize: 12 }}>Prévia do mural · anúncios ilustrativos</Texto>}{vagasLocais.map((vaga) => <CartaoVaga key={vaga.id} vaga={vaga} />)}{vagasLocais.length === 0 && <Texto style={{ color: cores.secundario }}>Novas oportunidades aparecerão aqui após aprovação.</Texto>}</View>
    <View style={estilos.convite}><View style={estilos.iconeConvite}><Icone nome="megaphone-outline" tamanho={24} /></View><View style={{ flex: 1, gap: 4 }}><Texto style={{ fontWeight: '700' }}>Tem uma oportunidade?</Texto><Texto style={{ fontSize: 13, color: cores.secundario }}>Conecte seu negócio a quem está perto.</Texto><Pressable accessibilityRole="button" accessibilityLabel="Criar anúncio" onPress={() => router.push('/anunciar')} style={{ paddingVertical: 10 }}><Texto style={{ color: cores.primaria, fontWeight: '700', fontSize: 13 }}>Criar anúncio ↗</Texto></Pressable></View></View>
    <Texto style={estilos.rodape}>Feito para aproximar Pinhais e Curitiba.{`\n`}Guia independente. Sem vínculo com as prefeituras.</Texto>
  </Tela>;
}
const estilos = StyleSheet.create({
  hero: { paddingTop: 12, gap: 3 }, selo: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 16 }, ponto: { width: 6, height: 6, borderRadius: 3, backgroundColor: cores.primaria }, textoSelo: { fontSize: 10, fontWeight: '700', letterSpacing: 1.3, color: cores.primaria },
  chamada: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -1.3 }, descricao: { color: cores.secundario, fontSize: 14, lineHeight: 23, maxWidth: 380, marginTop: 11, marginBottom: 18 }, busca: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: cores.superficie, padding: 10, paddingLeft: 16, borderRadius: 17, borderWidth: 1, borderColor: cores.borda }, seta: { width: 37, height: 37, borderRadius: 12, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  atalhos: { flexDirection: 'row', gap: 12 }, atalho: { flex: 1, borderRadius: 22, padding: 18, minHeight: 180, gap: 8 }, linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, tituloAtalho: { fontWeight: '700', fontSize: 19, lineHeight: 25, letterSpacing: -0.5 },
  convite: { backgroundColor: '#EAF1FF', borderRadius: 20, padding: 20, flexDirection: 'row', gap: 15 }, iconeConvite: { width: 47, height: 47, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: cores.superficie }, rodape: { textAlign: 'center', fontSize: 11, lineHeight: 18, color: cores.secundario, paddingVertical: 8 },
});
