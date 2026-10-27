import { vagasExemplo } from '../dados/vagasExemplo';
export function useVagas() {
  return { vagas: vagasExemplo, demonstracao: true, carregando: false, erro: '', atualizar: async () => {} };
}
