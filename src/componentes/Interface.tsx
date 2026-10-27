import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState, type ComponentProps, type PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type TextProps, type TextInputProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAplicativo } from '../contextos/ContextoApp';
import { cidades } from '../dominio/regras';
import { cores } from '../tema';

export type NomeIcone = ComponentProps<typeof Ionicons>['name'];
export function Icone({ nome, tamanho = 22, cor = cores.primaria }: { nome: NomeIcone; tamanho?: number; cor?: ComponentProps<typeof Ionicons>['color'] }) {
  return <Ionicons name={nome} size={tamanho} color={cor} accessible={false} />;
}
export function Texto({ style, ...propriedades }: TextProps) { return <Text {...propriedades} style={[estilos.texto, style]} />; }
export function Titulo({ children }: PropsWithChildren) { return <Texto accessibilityRole="header" style={estilos.titulo}>{children}</Texto>; }

export function Botao({ titulo, aoPressionar, icone, secundario = false, carregando = false, desabilitado = false }: { titulo: string; aoPressionar: () => void; icone?: NomeIcone; secundario?: boolean; carregando?: boolean; desabilitado?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={titulo} accessibilityState={{ disabled: desabilitado || carregando, busy: carregando }} disabled={desabilitado || carregando} onPress={aoPressionar} style={({ pressed }) => [estilos.botao, secundario && estilos.botaoSecundario, (pressed || desabilitado || carregando) && { opacity: 0.6 }]}>
    {carregando ? <ActivityIndicator color={secundario ? cores.primaria : cores.branco} /> : icone ? <Icone nome={icone} cor={secundario ? cores.primaria : cores.branco} tamanho={19} /> : null}
    <Texto style={[estilos.textoBotao, secundario && { color: cores.primaria }]}>{titulo}</Texto>
  </Pressable>;
}

export function Aviso({ children, erro = false }: PropsWithChildren<{ erro?: boolean }>) {
  return <View accessibilityRole={erro ? 'alert' : 'text'} style={[estilos.aviso, erro && { backgroundColor: '#FCECEC' }]}><Icone nome={erro ? 'alert-circle-outline' : 'information-circle-outline'} cor={erro ? cores.erro : cores.primaria} /><Texto style={[{ flex: 1, fontSize: 13, lineHeight: 20 }, erro && { color: cores.erro }]}>{children}</Texto></View>;
}

export function Tela({ children, rolar = true, estilo }: PropsWithChildren<{ rolar?: boolean; estilo?: ViewStyle }>) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={estilos.tela}>{rolar
    ? <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[estilos.conteudo, estilo]}>{children}</ScrollView>
    : <View style={[estilos.conteudo, { flex: 1 }, estilo]}>{children}</View>}</SafeAreaView>;
}

export function Cabecalho({ voltar = false }: { voltar?: boolean }) {
  const { cidade, escolherCidade } = useAplicativo();
  const [escolhendo, definirEscolhendo] = useState(false);
  return <View style={{ gap: 12 }}>
    <View style={estilos.cabecalho}>
      {voltar ? <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={estilos.botaoIcone}><Icone nome="arrow-back" /></Pressable>
        : <View style={estilos.marca}><View style={estilos.simbolo}><Icone nome="location" cor={cores.destaque} tamanho={21} /></View><Texto style={estilos.logotipo}>encontra<Text style={{ color: cores.primaria }}>ê</Text><Text style={{ color: cores.primaria }}>.</Text></Texto></View>}
      <Pressable accessibilityRole="button" accessibilityLabel="Escolher cidade" accessibilityState={{ expanded: escolhendo }} onPress={() => definirEscolhendo(!escolhendo)} style={estilos.cidade}>
        <Icone nome="location-outline" tamanho={16} /><Texto style={{ fontSize: 13, fontWeight: '600' }}>{cidade}</Texto><Icone nome="chevron-down" tamanho={14} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Minha conta" onPress={() => router.push('/conta')} style={estilos.botaoIcone}><Icone nome="person-outline" tamanho={19} /></Pressable>
    </View>
    {escolhendo && <View style={estilos.linha}>{cidades.map((item) => <Chip key={item} titulo={item} ativo={cidade === item} aoPressionar={() => { escolherCidade(item); definirEscolhendo(false); }} />)}</View>}
  </View>;
}

export function Chip({ titulo, ativo, aoPressionar }: { titulo: string; ativo: boolean; aoPressionar: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={titulo} accessibilityState={{ selected: ativo }} onPress={aoPressionar} style={[estilos.chip, ativo && estilos.chipAtivo]}><Texto style={{ fontSize: 13, fontWeight: '600', color: ativo ? cores.branco : cores.secundario }}>{titulo}</Texto></Pressable>;
}
export function Filtros({ opcoes, selecionado, aoSelecionar }: { opcoes: readonly string[]; selecionado: string; aoSelecionar: (opcao: string) => void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 3 }}>{opcoes.map((opcao) => <Chip key={opcao} titulo={opcao} ativo={selecionado === opcao} aoPressionar={() => aoSelecionar(opcao)} />)}</ScrollView>;
}
export function Busca({ valor, aoAlterar, placeholder }: { valor: string; aoAlterar: (texto: string) => void; placeholder: string }) {
  return <View style={estilos.busca}><Icone nome="search-outline" tamanho={22} /><TextInput accessibilityLabel={placeholder} placeholder={placeholder} placeholderTextColor={cores.secundario} value={valor} onChangeText={aoAlterar} returnKeyType="search" style={estilos.entradaBusca} />{valor.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel="Limpar busca" onPress={() => aoAlterar('')} style={{ padding: 8 }}><Icone nome="close" tamanho={18} /></Pressable>}</View>;
}
export function Campo({ rotulo, erro, ...propriedades }: TextInputProps & { rotulo: string; erro?: string }) {
  return <View style={{ gap: 7 }}><Texto style={{ fontSize: 14, fontWeight: '600' }}>{rotulo}</Texto><TextInput accessibilityLabel={rotulo} placeholderTextColor={cores.secundario} {...propriedades} style={[estilos.campo, propriedades.multiline && { minHeight: 128, textAlignVertical: 'top' }, propriedades.style]} />{erro && <Texto accessibilityRole="alert" style={{ color: cores.erro, fontSize: 12 }}>{erro}</Texto>}</View>;
}
export function Secao({ titulo, acao, aoPressionar }: { titulo: string; acao?: string; aoPressionar?: () => void }) {
  return <View style={[estilos.linha, { justifyContent: 'space-between' }]}><Texto accessibilityRole="header" style={estilos.secao}>{titulo}</Texto>{acao && <Pressable accessibilityRole="button" accessibilityLabel={acao} onPress={aoPressionar} style={{ padding: 8 }}><Texto style={{ color: cores.primaria, fontWeight: '600', fontSize: 13 }}>{acao} ↗</Texto></Pressable>}</View>;
}
export function Vazio({ titulo, descricao }: { titulo: string; descricao: string }) {
  return <View style={estilos.vazio}><Icone nome="search-outline" tamanho={32} /><Texto style={estilos.secao}>{titulo}</Texto><Texto style={{ color: cores.secundario, textAlign: 'center' }}>{descricao}</Texto></View>;
}
export const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo }, conteudo: { padding: 22, paddingBottom: 32, gap: 20, width: '100%', maxWidth: 900, alignSelf: 'center' },
  texto: { color: cores.texto, fontSize: 15, lineHeight: 23 }, titulo: { fontSize: 30, lineHeight: 37, fontWeight: '700', letterSpacing: -1 },
  secao: { fontSize: 19, fontWeight: '700', letterSpacing: -0.4 }, linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: 9 }, marca: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  simbolo: { width: 32, height: 34, borderRadius: 11, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' }, logotipo: { fontWeight: '800', fontSize: 23, letterSpacing: -1 },
  cidade: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 }, botaoIcone: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie },
  botao: { minHeight: 50, backgroundColor: cores.primaria, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }, botaoSecundario: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda }, textoBotao: { fontWeight: '600', color: cores.branco, fontSize: 14 },
  chip: { borderRadius: 22, paddingHorizontal: 16, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cores.borda, backgroundColor: cores.superficie }, chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  aviso: { flexDirection: 'row', gap: 10, padding: 15, borderRadius: 14, backgroundColor: cores.aviso, alignItems: 'flex-start' },
  busca: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, borderRadius: 16, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, gap: 10 }, entradaBusca: { flex: 1, minHeight: 54, fontSize: 14, color: cores.texto, paddingVertical: 12, paddingRight: 12 },
  campo: { padding: 14, minHeight: 50, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 12, fontSize: 15, color: cores.texto },
  vazio: { alignItems: 'center', paddingVertical: 38, paddingHorizontal: 15, gap: 12 },
});
