import { z } from 'zod';
import { cidades, modalidades, type Cidade } from './regras';

export type CategoriaServico = 'Documentos' | 'Saúde' | 'Assistência' | 'Cidade' | 'Trabalho';
export interface Servico {
  id: string; titulo: string; cidade: Cidade; categoria: CategoriaServico; descricao: string; orgao: string;
  orientacoes: string[]; documentos: string[]; fonte: string; conferidoEm: string; telefone?: string; endereco?: string;
}
export const esquemaVagaPublica = z.object({
  id: z.string(), titulo: z.string(), empresa: z.string(), cidade: z.enum(cidades), bairro: z.string(),
  modalidade: z.enum(modalidades), remuneracao: z.string(), descricao: z.string(), telefone: z.string(),
  status: z.enum(['pendente', 'aprovada', 'rejeitada', 'encerrada']), criadoEm: z.string(), expiraEm: z.string(), demonstracao: z.boolean().optional(),
});
export type Vaga = z.infer<typeof esquemaVagaPublica>;
