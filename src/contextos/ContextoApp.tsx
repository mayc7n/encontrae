import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { lerPreferencias, type Cidade, type Preferencias } from '../dominio/regras';

type EstadoApp = Preferencias & { pronto: boolean; erroLocal: string; escolherCidade: (cidade: Cidade) => void; alternarFavorito: (id: string) => void; limparErro: () => void };
const contextoApp = createContext<EstadoApp | null>(null);
const chavePreferencias = 'encontrae.preferencias.v1';

export function ProvedorApp({ children }: PropsWithChildren) {
  const [preferencias, definirPreferencias] = useState<Preferencias>({ cidade: 'Pinhais', favoritos: [] });
  const [pronto, definirPronto] = useState(false);
  const [erroLocal, definirErroLocal] = useState('');
  const filaGravacao = useRef(Promise.resolve());
  const leituraValida = useRef(false);

  useEffect(() => {
    let ativo = true;
    AsyncStorage.getItem(chavePreferencias).then((texto) => {
      if (!ativo) return;
      definirPreferencias(lerPreferencias(texto));
      leituraValida.current = true;
    }).catch(() => { if (ativo) definirErroLocal('Não foi possível recuperar seus favoritos. Tente reabrir o app.'); })
      .finally(() => { if (ativo) definirPronto(true); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (!pronto || !leituraValida.current) return;
    filaGravacao.current = filaGravacao.current.then(() => AsyncStorage.setItem(chavePreferencias, JSON.stringify(preferencias)))
      .catch(() => definirErroLocal('Não foi possível salvar no aparelho. Suas alterações podem ser perdidas ao sair.'));
  }, [preferencias, pronto]);

  const escolherCidade = useCallback((cidade: Cidade) => definirPreferencias((atual) => ({ ...atual, cidade })), []);
  const alternarFavorito = useCallback((id: string) => definirPreferencias((atual) => ({
    ...atual, favoritos: atual.favoritos.includes(id) ? atual.favoritos.filter((item) => item !== id) : [...atual.favoritos, id].slice(-500),
  })), []);

  return <contextoApp.Provider value={{ ...preferencias, pronto, erroLocal, escolherCidade, alternarFavorito, limparErro: () => definirErroLocal('') }}>{children}</contextoApp.Provider>;
}
export function useAplicativo() {
  const contexto = useContext(contextoApp);
  if (!contexto) throw new Error('O contexto do aplicativo não foi inicializado.');
  return contexto;
}
