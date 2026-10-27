import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { vagasExemplo } from '../dados/vagasExemplo';
import type { Vaga } from '../dominio/modelos';
import { listarVagas } from '../infra/repositorioVagas';
import { erroConfiguracao, modoDemonstracao, supabase } from '../infra/supabase';
import { useAgora } from './useAgora';

type EstadoVagas = { vagas: Vaga[]; demonstracao: boolean; carregando: boolean; erro: string; atualizar: () => Promise<void> };
const contextoVagas = createContext<EstadoVagas | null>(null);
export function ProvedorVagas({ children }: PropsWithChildren) {
  const [vagas, definirVagas] = useState<Vaga[]>(modoDemonstracao ? vagasExemplo : []);
  const [carregando, definirCarregando] = useState(Boolean(supabase));
  const [erro, definirErro] = useState(erroConfiguracao);
  const requisicao = useRef(0);
  const ativo = useRef(true);
  const agora = useAgora();
  const carregar = useCallback(() => {
    if (!supabase) return Promise.resolve();
    const numero = ++requisicao.current;
    return listarVagas()
      .then((dados) => { if (ativo.current && numero === requisicao.current) { definirVagas(dados); definirErro(''); } })
      .catch(() => { if (ativo.current && numero === requisicao.current) definirErro('Não foi possível atualizar as vagas. Confira a conexão e tente novamente.'); })
      .finally(() => { if (ativo.current && numero === requisicao.current) definirCarregando(false); });
  }, []);
  const atualizar = useCallback(async () => { if (!supabase) return; definirCarregando(true); await carregar(); }, [carregar]);
  useEffect(() => {
    ativo.current = true;
    void carregar();
    const monitor = AppState.addEventListener('change', (estado) => { if (estado === 'active') void atualizar(); });
    return () => { ativo.current = false; monitor.remove(); };
  }, [atualizar, carregar]);
  const vagasAtivas = modoDemonstracao ? vagas : vagas.filter((vaga) => vaga.status === 'aprovada' && new Date(vaga.expiraEm).getTime() > agora);
  return <contextoVagas.Provider value={{ vagas: vagasAtivas, demonstracao: modoDemonstracao, carregando, erro, atualizar }}>{children}</contextoVagas.Provider>;
}
export function useVagas() {
  const contexto = useContext(contextoVagas);
  if (!contexto) throw new Error('O contexto de vagas não foi inicializado.');
  return contexto;
}
