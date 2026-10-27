import { z } from 'zod';

export const cidades = ['Pinhais', 'Curitiba'] as const;
export type Cidade = (typeof cidades)[number];
export const modalidades = ['CLT', 'Bico', 'Estágio', 'Autônomo'] as const;

export function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
}

type ItemBuscavel = { titulo: string; cidade: string; categoria?: string; modalidade?: string; descricao: string; bairro?: string; empresa?: string };
export function filtrarItens<T extends ItemBuscavel>(itens: readonly T[], busca: string, cidade: string, categoria: string): T[] {
  const termos = normalizarTexto(busca).split(/\s+/).filter(Boolean);
  return itens.filter((item) => {
    const conteudo = normalizarTexto([item.titulo, item.descricao, item.bairro, item.empresa, item.categoria, item.modalidade].join(' '));
    return (cidade === 'Todas' || item.cidade === cidade)
      && (categoria === 'Todas' || (item.categoria ?? item.modalidade) === categoria)
      && termos.every((termo) => conteudo.includes(termo));
  });
}

export function normalizarTelefone(telefone: string): string {
  if (!/^[+\d\s().-]+$/.test(telefone)) throw new Error('Informe um celular válido com DDD.');
  let numeros = telefone.replace(/\D/g, '');
  if (numeros.length === 13 && numeros.startsWith('55')) numeros = numeros.slice(2);
  if (!/^[1-9]\d9\d{8}$/.test(numeros)) throw new Error('Informe um celular válido com DDD.');
  return `55${numeros}`;
}

export function criarLinkWhatsApp(telefone: string, mensagem: string): string {
  return `https://wa.me/${normalizarTelefone(telefone)}?text=${encodeURIComponent(mensagem)}`;
}

export function validarLinkExterno(link: string): boolean {
  try {
    const endereco = new URL(link);
    const dominio = endereco.hostname.toLowerCase();
    return endereco.protocol === 'https:' && !endereco.username && !endereco.password
      && !endereco.port && dominio.includes('.') && !dominio.endsWith('.local')
      && !dominio.endsWith('.localhost') && !/^[\d.]+$/.test(dominio) && !dominio.includes(':');
  } catch { return false; }
}

export const esquemaVaga = z.object({
  titulo: z.string().trim().min(5, 'Escreva um título com pelo menos 5 caracteres.').max(80),
  empresa: z.string().trim().min(2, 'Informe o nome do anunciante.').max(80),
  cidade: z.enum(cidades),
  bairro: z.string().trim().min(2, 'Informe o bairro.').max(60),
  modalidade: z.enum(modalidades),
  remuneracao: z.string().trim().min(2, 'Informe a remuneração ou “A combinar”.').max(60),
  descricao: z.string().trim().min(30, 'Descreva a oportunidade com pelo menos 30 caracteres.').max(2000),
  telefone: z.string().transform((valor, contexto) => {
    try { return normalizarTelefone(valor); }
    catch { contexto.addIssue({ code: 'custom', message: 'Informe um celular válido com DDD.' }); return z.NEVER; }
  }),
  consentimento: z.literal(true, { error: 'Autorize a divulgação do contato para continuar.' }),
});
export function validarVaga(entrada: unknown) { return esquemaVaga.safeParse(entrada); }
export type DadosVaga = z.output<typeof esquemaVaga>;
export type FormularioVaga = Omit<z.input<typeof esquemaVaga>, 'consentimento'> & { consentimento: boolean };

const esquemaPreferencias = z.object({ cidade: z.enum(cidades).catch('Pinhais'), favoritos: z.array(z.string().max(100)).max(500).catch([]) });
export type Preferencias = z.infer<typeof esquemaPreferencias>;
export function lerPreferencias(texto: string | null): Preferencias {
  try { return esquemaPreferencias.parse(JSON.parse(texto ?? '{}')); }
  catch { return { cidade: 'Pinhais', favoritos: [] }; }
}
export function criarRascunho(cidade: Cidade): FormularioVaga {
  return { titulo: '', empresa: '', cidade, bairro: '', modalidade: 'CLT', remuneracao: '', descricao: '', telefone: '', consentimento: false };
}
export function lerRascunho(texto: string | null, cidade: Cidade): FormularioVaga {
  const esquemaRascunho = z.object({
    titulo: z.string().max(80), empresa: z.string().max(80), cidade: z.enum(cidades), bairro: z.string().max(60),
    modalidade: z.enum(modalidades), remuneracao: z.string().max(60), descricao: z.string().max(2000), telefone: z.string().max(25), consentimento: z.boolean(),
  });
  try { return esquemaRascunho.parse(JSON.parse(texto ?? 'null')); }
  catch { return criarRascunho(cidade); }
}
