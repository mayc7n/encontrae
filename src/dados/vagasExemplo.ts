import type { Vaga } from '../dominio/modelos';

// Exemplos de interface, sem contato ou candidatura reais.
const base = { status: 'aprovada' as const, demonstracao: true, telefone: '', criadoEm: '2026-10-27T12:00:00Z', expiraEm: '2099-01-01T00:00:00Z' };
export const vagasExemplo: Vaga[] = [
  { ...base, id: 'demo-cozinha', titulo: 'Auxiliar de cozinha', empresa: 'Restaurante · exemplo', cidade: 'Pinhais', bairro: 'Centro', modalidade: 'CLT', remuneracao: 'R$ 1.900 / mês', descricao: 'Exemplo de anúncio para demonstrar o aplicativo. Apoio no preparo de alimentos e organização da cozinha. Jornada de segunda a sexta. Esta oportunidade não está disponível para candidatura.' },
  { ...base, id: 'demo-jardim', titulo: 'Cuidados com jardim', empresa: 'Morador · exemplo', cidade: 'Pinhais', bairro: 'Weissópolis', modalidade: 'Bico', remuneracao: 'R$ 180 / diária', descricao: 'Exemplo de serviço pontual: manutenção de jardim residencial, com materiais fornecidos pelo contratante. Combine horário e escopo antes de aceitar. Este anúncio é demonstrativo.' },
  { ...base, id: 'demo-atendimento', titulo: 'Atendente de loja', empresa: 'Comércio · exemplo', cidade: 'Curitiba', bairro: 'Cajuru', modalidade: 'CLT', remuneracao: 'R$ 1.850 / mês', descricao: 'Exemplo de oportunidade para atendimento ao público e organização de produtos. Ensino médio completo. Este anúncio é apenas demonstrativo e não recebe candidaturas.' },
  { ...base, id: 'demo-estagio', titulo: 'Estágio administrativo', empresa: 'Escritório · exemplo', cidade: 'Curitiba', bairro: 'Centro', modalidade: 'Estágio', remuneracao: 'R$ 1.200 / mês', descricao: 'Exemplo de estágio com apoio em rotinas administrativas e atendimento. Jornada de seis horas. Este anúncio demonstra os filtros e a página de detalhes do aplicativo.' },
];
