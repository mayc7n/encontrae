import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from '../infra/supabase';

const contextoSessao = createContext<{ sessao: Session | null; carregando: boolean; erro: string }>({ sessao: null, carregando: true, erro: '' });
export function ProvedorSessao({ children }: PropsWithChildren) {
  const [sessao, definirSessao] = useState<Session | null>(null);
  const [carregando, definirCarregando] = useState(Boolean(supabase));
  const [erro, definirErro] = useState('');
  useEffect(() => {
    if (!supabase) return;
    let ativo = true;
    const cliente = supabase;
    cliente.auth.getSession().then(({ data: dados, error: falha }) => {
      if (!ativo) return;
      if (falha) definirErro('Não foi possível recuperar sua sessão. Entre novamente.');
      definirSessao(dados.session); definirCarregando(false);
    }).catch(() => { if (ativo) { definirErro('Não foi possível recuperar sua sessão.'); definirCarregando(false); } });
    const { data: assinatura } = cliente.auth.onAuthStateChange((_evento, novaSessao) => {
      if (ativo) { definirSessao(novaSessao); definirCarregando(false); }
    });
    if (Platform.OS !== 'web' && AppState.currentState === 'active') cliente.auth.startAutoRefresh();
    const monitor = AppState.addEventListener('change', (estado) => {
      if (Platform.OS !== 'web') { if (estado === 'active') cliente.auth.startAutoRefresh(); else cliente.auth.stopAutoRefresh(); }
    });
    return () => { ativo = false; assinatura.subscription.unsubscribe(); monitor.remove(); if (Platform.OS !== 'web') cliente.auth.stopAutoRefresh(); };
  }, []);
  return <contextoSessao.Provider value={{ sessao, carregando, erro }}>{children}</contextoSessao.Provider>;
}
export function useSessao() { return useContext(contextoSessao); }
