import { Tabs } from 'expo-router';
import { Icone } from '../../componentes/Interface';
import { cores } from '../../tema';

export default function LayoutAbas() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: cores.primaria, tabBarInactiveTintColor: cores.secundario, tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda, paddingTop: 8 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
    <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ focused }) => <Icone nome={focused ? 'home' : 'home-outline'} cor={focused ? cores.primaria : cores.secundario} /> }} />
    <Tabs.Screen name="servicos" options={{ title: 'Serviços', tabBarIcon: ({ focused }) => <Icone nome={focused ? 'grid' : 'grid-outline'} cor={focused ? cores.primaria : cores.secundario} /> }} />
    <Tabs.Screen name="vagas" options={{ title: 'Vagas', tabBarIcon: ({ focused }) => <Icone nome={focused ? 'briefcase' : 'briefcase-outline'} cor={focused ? cores.primaria : cores.secundario} /> }} />
    <Tabs.Screen name="salvos" options={{ title: 'Salvos', tabBarIcon: ({ focused }) => <Icone nome={focused ? 'bookmark' : 'bookmark-outline'} cor={focused ? cores.primaria : cores.secundario} /> }} />
  </Tabs>;
}
