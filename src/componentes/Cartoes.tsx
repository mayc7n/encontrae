import { memo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useAplicativo } from '../contextos/ContextoApp';
import type { Servico, Vaga } from '../dominio/modelos';
import { cores } from '../tema';
import { Icone, Texto, type NomeIcone } from './Interface';

export const iconesCategorias: Record<Servico['categoria'], NomeIcone> = { Documentos: 'document-text-outline', Saúde: 'medkit-outline', Assistência: 'heart-outline', Cidade: 'business-outline', Trabalho: 'briefcase-outline' };
export function Favorito({ id }: { id: string }) {
  const { favoritos, alternarFavorito } = useAplicativo();
  const salvo = favoritos.includes(id);
  return <Pressable accessibilityRole="button" accessibilityLabel={salvo ? 'Remover dos favoritos' : 'Salvar nos favoritos'} accessibilityState={{ selected: salvo }} onPress={() => alternarFavorito(id)} style={estilos.favorito}><Icone nome={salvo ? 'bookmark' : 'bookmark-outline'} tamanho={21} /></Pressable>;
}
export const CartaoServico = memo(function CartaoServico({ servico }: { servico: Servico }) {
  return <View style={estilos.cartao}><Pressable accessibilityRole="button" accessibilityLabel={`Ver serviço ${servico.titulo}`} onPress={() => router.push(`/servico/${servico.id}`)} style={estilos.corpoServico}>
    <View style={estilos.icone}><Icone nome={iconesCategorias[servico.categoria]} /></View><View style={{ flex: 1, gap: 3 }}><Texto style={estilos.titulo}>{servico.titulo}</Texto><Texto style={estilos.legenda}>{servico.categoria} · {servico.cidade}</Texto></View>
  </Pressable><Favorito id={`servico:${servico.id}`} /></View>;
});
export const CartaoVaga = memo(function CartaoVaga({ vaga }: { vaga: Vaga }) {
  return <View style={estilos.vaga}><View style={estilos.linha}><View style={estilos.etiqueta}><Texto style={estilos.textoEtiqueta}>{vaga.modalidade}</Texto></View>{vaga.demonstracao && <Texto style={estilos.exemplo}>EXEMPLO</Texto>}<View style={{ flex: 1 }} /><Favorito id={`vaga:${vaga.id}`} /></View>
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver vaga ${vaga.titulo}`} onPress={() => router.push(`/vaga/${vaga.id}`)} style={{ gap: 10 }}>
      <View style={{ gap: 3 }}><Texto style={[estilos.titulo, { fontSize: 19 }]}>{vaga.titulo}</Texto><Texto style={estilos.legenda}>{vaga.empresa}</Texto></View>
      <View style={estilos.linha}><Icone nome="location-outline" tamanho={15} cor={cores.secundario} /><Texto style={estilos.legenda}>{vaga.bairro} · {vaga.cidade}</Texto></View>
      <View style={[estilos.linha, { justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: cores.borda, paddingTop: 12 }]}><Texto style={{ fontWeight: '700', fontSize: 15 }}>{vaga.remuneracao}</Texto><Icone nome="arrow-forward" tamanho={20} /></View>
    </Pressable>
  </View>;
});
const estilos = StyleSheet.create({
  cartao: { backgroundColor: cores.superficie, borderRadius: 18, borderWidth: 1, borderColor: cores.borda, padding: 12, flexDirection: 'row', alignItems: 'center' }, corpoServico: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1, minHeight: 60 },
  icone: { backgroundColor: cores.primariaClara, width: 46, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, titulo: { fontSize: 15, fontWeight: '700', lineHeight: 22 }, legenda: { color: cores.secundario, fontSize: 12, lineHeight: 19 }, favorito: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  vaga: { padding: 18, gap: 9, backgroundColor: cores.superficie, borderRadius: 20, borderWidth: 1, borderColor: cores.borda }, linha: { flexDirection: 'row', alignItems: 'center', gap: 7 }, etiqueta: { backgroundColor: cores.primariaClara, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 7 }, textoEtiqueta: { fontSize: 11, fontWeight: '700', color: cores.primaria }, exemplo: { color: cores.secundario, fontSize: 10, fontWeight: '600', letterSpacing: 1 },
});
