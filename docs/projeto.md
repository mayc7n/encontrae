# Encontraê

## Objetivo e escopo

Aplicativo Android/iOS para moradores de Pinhais e Curitiba encontrarem serviços públicos, vagas e bicos. Contato pelo canal oficial ou pelo contato autorizado do anunciante. O usuário autorizou implementação, decisões técnicas, commits e pushes por etapa.

## Abordagem

React Native + Expo + TypeScript estrito. Uma base para os dois sistemas, desenvolvimento no Windows e prévia web. Flutter/Dart foi considerado; exigiria instalar outra cadeia de ferramentas sem vantagem necessária para este MVP. A implementação seguirá diretamente nesta pasta e no repositório vazio indicado.

Expo Router para navegação; componentes nativos, listas virtualizadas, área segura, textos acessíveis, formulários com validação. Variáveis e funções em português e camelCase. Componentes e tipos em PascalCase por convenção React/TypeScript; nomes exigidos por APIs externas são preservados.

## Entrega

- Início com seleção de cidade, busca e atalhos.
- Catálogo de serviços por categoria, detalhes, fonte e data de conferência, acesso ao site oficial, telefone e mapas quando disponíveis.
- Vagas filtradas por cidade e modalidade, detalhes e contato. Exemplos identificados; nenhum exemplo inicia contato com terceiros.
- Favoritos persistentes no aparelho.
- Conta por código de e-mail, publicação de vagas e acompanhamento dos próprios anúncios quando Supabase estiver configurado.
- Formulário com rascunho local funciona sem backend; informar claramente que rascunho não é publicado.
- Backend Supabase versionado com RLS: leitura pública de vagas aprovadas não expiradas; autor consulta seus próprios anúncios; novos anúncios entram em moderação; denúncias autenticadas e privadas.
- Moderação inicial pelo painel Supabase, reservada ao operador. Nenhuma chave administrativa no app.
- README em português com execução, configuração do backend, builds Android/iOS e limites verificados.

## Dados e segurança

Fontes municipais em `docs/pesquisa-inicial.md`. Integração inicial por links: nenhuma API de protocolo ou sincronização de vagas foi confirmada. Vagas próprias dependem do backend configurado e da moderação. Não coletar CPF, currículo ou localização precisa. HTTPS para links externos; telefone/WhatsApp construídos a partir de números validados. Sessão nativa em armazenamento seguro; preferências e rascunhos locais sem documentos pessoais. Solicitações não são enviadas automaticamente.

## Critérios de aceite

Busca sem distinção de acentos; filtros por cidade/categoria; navegação com voltar; favoritos sobrevivem à reabertura; formulários recusam dados inválidos; links maliciosos são bloqueados; falhas de rede aparecem com opção de tentar novamente. Sem backend, acesso ao catálogo e demonstração de vagas continuam úteis. Rascunhos e exemplos nunca aparecem como publicações reais.

Verificar TypeScript, lint, testes das regras de domínio, exportação Android/iOS/web e interação web. Execução em aparelhos físicos e publicação nas lojas dependem de dispositivos e credenciais externos; não serão declaradas concluídas sem evidência.
