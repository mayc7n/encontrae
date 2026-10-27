# Plano de implementação — Encontraê

> Execução: skill superpowers:executing-plans, diretamente nesta sessão. Usuário autorizou decisões técnicas, implementação e commit/push por etapa.

**Objetivo:** entregar app Android/iOS com serviços e oportunidades de Pinhais e Curitiba.
**Arquitetura:** Expo Router com componentes reutilizáveis; catálogo local rastreável e repositório Supabase para vagas reais. Modo demonstrativo explícito sem credenciais.
**Tecnologias:** Expo 58, React Native, TypeScript estrito, Supabase, Zod.
**Especificação:** `docs/projeto.md`.

## Restrições globais

PT-BR; variáveis/funções camelCase; componentes/tipos PascalCase; nunca versionar segredos. Fontes oficiais para serviços; exemplos rotulados. Sem falsa promessa de API municipal ou publicação de rascunhos. Commits e pushes por etapa no repositório indicado.

## Pontos de revisão

- Entrada maliciosa em URL/telefone: bloquear antes de abrir aplicativos.
- Busca com acentos e cidade diferente: resultados coerentes.
- Armazenamento local corrompido: recuperar sem travar ou apagar silenciosamente.
- Rede indisponível: mensagem honesta; nunca substituir vagas reais por exemplos silenciosamente.
- Usuário tenta aprovar vaga própria ou ler denúncia alheia: políticas do banco recusam.

## Etapa 1 — Base e regras

Arquivos: `src/dominio/{modelos,regras}.ts`, `tests/regras.test.ts`, configurações Expo/ESLint/TypeScript.
Interfaces: `filtrarItens`, `criarLinkWhatsApp`, `validarLinkExterno`, `esquemaVaga`, `lerPreferencias`.

- [ ] Configurar ferramentas e navegação.
- [ ] Escrever testes de busca, telefone, URLs e validação de formulário; comprovar falha antes da implementação.
- [ ] Implementar regras puras e catálogo com fontes.
- [ ] Tipos, lint e testes passam; commit e push.

## Etapa 2 — Experiência mobile

Arquivos: `src/app/`, `src/componentes/`, `src/contextos/`, `src/dados/`.
Interfaces: contexto para cidade, favoritos e rascunho; telas consomem regras da etapa 1.

- [ ] Criar início, busca, serviços, vagas, salvos e detalhes.
- [ ] Persistir preferências e rascunho; tratar falhas e carregamento.
- [ ] Implementar contatos externos e estados de demonstração.
- [ ] Verificar lint, tipos e exportação; commit e push.

## Etapa 3 — Publicação e acesso

Arquivos: `src/infra/`, telas de conta/anúncio, `supabase/migrations/`, `.env.example`.
Interfaces: listar vagas, publicar vaga pendente, listar vagas próprias, encerrar vaga, denunciar; sessão por código de e-mail.

- [ ] Configurar cliente opcional Supabase e armazenamento de sessão.
- [ ] Adicionar migração com políticas, validação e limites de envio.
- [ ] Formulário, conta e denúncias com erros acionáveis e prevenção de submissão duplicada.
- [ ] Verificar contrato e regras; commit e push.

## Etapa 4 — Entrega

- [ ] Verificar interface web e exportar Android/iOS/web.
- [ ] Revisão independente do conjunto e correção de problemas relevantes.
- [ ] Documentar instalação, moderação, configuração e limites.
- [ ] Confirmar commits no remoto e árvore limpa.
