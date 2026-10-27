import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { ProvedorApp, useAplicativo } from '../contextos/ContextoApp';
import { ProvedorSessao } from '../contextos/ContextoSessao';
import { ProvedorVagas } from '../contextos/ContextoVagas';
import { Aviso } from '../componentes/Interface';
import { cores } from '../tema';

function Navegacao() {
  const { pronto, erroLocal } = useAplicativo();
  if (!pronto) return <View style={{ flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator accessibilityLabel="Carregando suas preferências" color={cores.primaria} /></View>;
  return <View style={{ flex: 1, backgroundColor: cores.fundo }}><StatusBar style="dark" />{erroLocal ? <Aviso erro>{erroLocal}</Aviso> : null}<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.fundo } }} /></View>;
}
export default function LayoutRaiz() { return <ProvedorApp><ProvedorSessao><ProvedorVagas><Navegacao /></ProvedorVagas></ProvedorSessao></ProvedorApp>; }
