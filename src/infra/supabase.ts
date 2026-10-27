import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { validarLinkExterno } from '../dominio/regras';

const enderecoSupabase = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const chavePublica = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

function chavePermitida(chave: string): boolean {
  if (chave.startsWith('sb_publishable_')) return true;
  try {
    const conteudo = chave.split('.')[1];
    if (!conteudo) return false;
    return JSON.parse(atob(conteudo.replace(/-/g, '+').replace(/_/g, '/'))).role === 'anon';
  } catch { return false; }
}
export const modoDemonstracao = !enderecoSupabase && !chavePublica;
export const erroConfiguracao = !modoDemonstracao && (!validarLinkExterno(enderecoSupabase) || !chavePermitida(chavePublica))
  ? 'O serviço de anúncios está indisponível por configuração incompleta. O catálogo de serviços continua disponível.' : '';

// Sessões web duram a aba. No celular, tokens usam Keychain/Keystore.
const armazenamentoSessao = {
  async getItem(chave: string): Promise<string | null> {
    if (Platform.OS === 'web') return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(chave);
    return SecureStore.getItemAsync(chave);
  },
  async setItem(chave: string, valor: string): Promise<void> {
    if (Platform.OS === 'web') { if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(chave, valor); return; }
    await SecureStore.setItemAsync(chave, valor);
  },
  async removeItem(chave: string): Promise<void> {
    if (Platform.OS === 'web') { if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(chave); return; }
    await SecureStore.deleteItemAsync(chave);
  },
};
export const supabase = !modoDemonstracao && !erroConfiguracao ? createClient(enderecoSupabase, chavePublica, {
  auth: { storage: armazenamentoSessao, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, lock: processLock },
}) : null;
