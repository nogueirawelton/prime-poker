# Pendências — Prime Poker

Tudo o que falta para o site e a área do jogador saírem do mock e irem ao ar.

**Como usar:** cada etapa tem **👤 Você** (painel do WP, servidor, decisões) e
**🤖 Claude** (código no Next e no plugin `wp_plugin/prime-poker`). Quando a
sua parte estiver feita, confirme a etapa: eu executo a minha e deixo
funcionando, com typecheck, lint e teste real.

Legenda: `[ ]` pendente · `[x]` feito · ❓ decisão sua antes de começar.

**Ordem sugerida:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

---

## Etapa 0 — Infra e base do WordPress ✅ concluída (16/09/2026)

Precisa estar certa antes de qualquer outra etapa.

**👤 Você**
- [x] Confirmar os plugins instalados e ativos: WPGraphQL, ACF PRO, WPGraphQL for ACF,
      WPGraphQL JWT Authentication, Yoast SEO, WPGraphQL Yoast SEO, Contact Form 7.
- [x] Subir a versão atual de `wp_plugin/prime-poker` (1.6.0) e ativar "Prime Poker".
- [x] `wp-config.php`: definir `GRAPHQL_JWT_AUTH_SECRET_KEY` (string longa e aleatória).
- [x] Mandar o valor do segredo para as variáveis de ambiente do deploy (`WP_JWT_SECRET`)
      — **produção e staging** — e para o seu `.env.local`.
- [x] Preencher no deploy: `NEXT_PUBLIC_ADMIN_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SITE_NAME`.
- [x] Configurar SMTP (ex.: WP Mail SMTP + Brevo/SES/Gmail) e enviar um e-mail de teste.
      *(estava no TASKS.md)*
- [x] Garantir que o deploy da branch `staging` tenha uma URL própria (ex.: `staging.primepokerteam.com.br`).
- [x] ❓ Onde está hospedado o Next → **Vercel**.

**🤖 Claude**
- [x] Rodar uma bateria de queries contra o WP (home, SEO, posts, login) e apontar qualquer
      campo que esteja faltando no schema.
- [x] Conferir o `.env.example` — está em dia; variáveis novas entram na etapa que as cria.

**Resultado da verificação (16/09/2026)**
- Schema: `page`, `post(s)`, `postsTotal`, `offset`, `categories.postCount`, `viewer`,
  `instrutores`, `depoimentos`, `playerTier*`, `registeredDate`, SEO do Yoast — ✅.
- Mutations: `login`, `refreshJwtAuthToken`, `registerUser`, `createComment`,
  `sendPasswordResetEmail`, `resetUserPassword` — ✅.
- Queries reais do front: HOME (todos os 8 grupos preenchidos), SEO, POSTS (10 posts),
  paginação por offset, POST_SLUGS, CATEGORIES, POST, COMMENTS — ✅ sem erros.
- Login com credencial falsa devolve a mensagem do WP, já traduzida pelo front — ✅.
- ⚠️ SEO da home: `canonical` = `https://prime-poker.vercel.app`, `metaDesc` vazio e sem
  imagem OG → movido para a etapa 2.

**✅ Pronto quando:** a home e o blog carregam com dados reais, e o login devolve o token.

---

## Etapa 1 — Formulários (Contact Form 7) ✅ concluída (17/09/2026)

**👤 Você**
- [x] Formulário **169** (inscrição) — nomes confirmados, idênticos aos do front:
      `nome_completo`, `email`, `numero_whatsapp`, `onde_mora`, `idade`, `ocupacao`,
      `fonte_de_renda`, `discord`, `nick_poker_stars`, `outros_sites`, `disponibilidade`,
      `jogou_em_time`, `porque_se_inscreveu`, `indicacao`, `utm_source`, `utm_medium`, `utm_campaign`.
- [x] Formulário **1016** (newsletter): `email`, `utm_source`, `utm_medium`, `utm_campaign`.
- [x] ❓ Newsletter → **só e-mail por enquanto**.
- [x] **Corrigir o `mail_failed`** (os dois formulários) — resolvido trocando o SMTP: o CF7 recebe os dados, mas o
      `wp_mail()` falha. Conferir, nesta ordem:
      1. WP Mail SMTP → *Ferramentas → Teste de e-mail*: o teste passa? Se não, o log de erro diz o motivo.
      2. CF7 → cada formulário → aba **E-mail**: o **De** (From) precisa ser um endereço do domínio
         autenticado no SMTP (ex.: `site@primepokerteam.com.br`), nunca `[email]` do visitante —
         use o `[email]` só no **Responder para** (Reply-To).
      3. Na mesma aba, sem aviso de erro de configuração (tags inexistentes como `[your-name]`).
      4. WP Mail SMTP → *Log de e-mails* (ou *Debug Events*): mensagem exata da falha.
- [x] Confirmar que os e-mails "TESTE Claude 2 — ignorar" (inscrição) e `teste-newsletter@…` (newsletter) chegaram com todos os campos e as 3 UTMs.
- [ ] Apagar os envios de teste marcados "TESTE Claude — ignorar", se o Flamingo/CFDB guardar.

**🤖 Claude**
- [x] Conferir os nomes dos campos (schema, UTMs em `utils/utm.ts`) contra o CF7 — batem 1:1.
- [x] CORS do endpoint do CF7: libera `primepokerteam.com.br`, a URL da Vercel e a de staging.
- [x] Validar e-mail de verdade no formulário de inscrição (antes aceitava qualquer texto com 2+ caracteres).
- [x] Front já trata `mail_failed`: mostra o erro ao usuário em vez de anunciar sucesso.
- [x] Reenviar os dois formulários após a correção e confirmar `mail_sent` — ✅ os dois (17/09/2026).

**✅ Pronto quando:** as duas submissões chegam por e-mail com todos os campos preenchidos.

---

## Etapa 2 — Home, SEO e Instagram (conteúdo) ✅ concluída (17/09/2026)

**👤 Você / cliente**
- [x] Página com slug `home` com todos os grupos ACF `homeFields` preenchidos
      *(verificado na etapa 0: os 8 grupos respondem)*
- [x] CPTs **Instrutor** e **Depoimento** com "Show in GraphQL" e conteúdo cadastrado.
- [x] ~~**Cliente:** Yoast da home (título, **descrição** e **imagem OG** — hoje vazios).~~ → fora do escopo: o cliente configura depois, sem data.
- [x] ~~**Cliente:** em Configurações → Geral, trocar **Endereço do site (URL)** para
      `https://primepokerteam.com.br` (NÃO mexer em "Endereço do WordPress"). Hoje o
      canonical sai `https://prime-poker.vercel.app`.~~ → fora do escopo: o cliente configura depois.
- [x] ❓ Instagram → serviço próprio (`controles.internit.com.br/apps/instagram-api`), URL fixa.
- [x] ❓ `utils/get-seo.ts`: `authors` do metadata → **manter como está** (Welton Nogueira).

**🤖 Claude**
- [x] Validar a home com dados reais: build de produção OK, home responde 200 com
      todos os blocos e o feed do Instagram (16 posts).
- [x] `app/sitemap.ts`: home, `/blog/`, categorias com posts e todos os posts (com `lastmod`
      em UTC). URLs com `/` final por causa do `trailingSlash`. 17 URLs hoje.
- [x] `app/robots.ts`: em produção libera o site e bloqueia `/player/`, `/login/`,
      `/cadastro/`, `/api/`, apontando o sitemap. **Fora de produção (staging e previews
      da Vercel) bloqueia tudo**, para o staging não ser indexado.
- [x] `app/not-found.tsx`: 404 com a identidade do site (logo, "Essa mão não existe",
      botão para o início). Responde HTTP 404 com `noindex`.
- [x] Aplicar a decisão sobre o `authors` do SEO — nada a mudar.
- [x] ~~Depois que o cliente ajustar o Yoast: conferir canonical, descrição e OG da home.~~ → sai junto com a parte do cliente.

**✅ Pronto quando:** a home fica 100% com dados do WP e o sitemap/robots respondem.

---

## Etapa 3 — Cache e revalidação ao publicar ✅ concluída (17/09/2026)

**👤 Você**
- [x] ❓ Segredo na rota → **decisão: a rota fica aberta** (sem `REVALIDATE_SECRET`).
- [x] Commit + push do código na `staging` (feito por você: `6c3f6d2`)
- [ ] ⚠️ O `6c3f6d2` foi **antes** do botão na barra superior: o `Revalidation.php` com o
      botão ainda não está commitado nem no WP. Commitar e subir o plugin de novo
      (mesma versão 1.7.0, só substituir o arquivo). (o front novo precisa estar no ar
      para aceitar várias tags e a tag `seo`).
- [x] Subir o plugin **1.7.0** (`wp_plugin/prime-poker`) no WP.
- [x] Em **Configurações → Cache do site**, cadastrar os endereços (um por linha):
      `https://primepokerteam.com.br` e a URL da staging.
- [x] Clicar em **Limpar cache agora** (Configurações → Cache do site) — funcionou.
- [x] ~~Me passar a URL da staging~~ → dispensado: você validou o fluxo direto no WP.

**🤖 Claude**
- [x] `lib/cache-tags.ts`: tags `posts`, `categories`, `seo` e as por item
      `post:<slug>` / `comments:<id>` aceitas pelo endpoint.
- [x] `/api/revalidate`: aceita várias tags na mesma chamada (`?tag=a&tag=b`), valida
      todas e responde 400 listando as desconhecidas.
- [x] `services/blog.ts` usando as constantes de tag (contrato único com o plugin).
- [x] **Falha corrigida:** o SEO do Yoast da home era cacheado só sob `cms` — editar o
      Yoast não o atualizaria. Agora fica sob `seo`, disparada ao salvar páginas.
- [x] Plugin `includes/Cache/Revalidation.php`: hooks de post (publicar, editar,
      despublicar, lixeira, excluir), categorias, tags e comentários; envio único e
      sem bloqueio no fim da requisição; tela *Configurações → Cache do site* com
      botão "Limpar cache agora"; option removida na desinstalação.
- [x] Botão **Limpar cache** na barra superior do WP (editores e administradores), com
      aviso do resultado por endereço em qualquer tela do painel.
- [x] Mapeamento com os slugs reais dos CPTs (`instructor`, `testimonial`), conferidos no WP.
- [x] Testes: endpoint local (várias tags, tag inválida, sem tag, sem barra final) e
      lógica do plugin com WP simulado (12 cenários: rascunho não dispara, comentário
      pendente não dispara, lixeira dispara, CPT novo cai em `cms`…).
- [x] README do plugin atualizado (tabela de mudança → tags).
- [x] Após o deploy e a configuração: limpeza de cache validada por você no WP (17/09/2026).

**✅ Pronto quando:** você publica ou edita no WP e o site reflete a mudança em segundos.

---

## Etapa 4 — Cliente GraphQL autenticado + perfil

Base de todas as etapas da área do jogador.

**👤 Você**
- [x] Usuários de teste criados por mim via `registerUser` (todos entram como Player Free):
      `teste.free@` (id 9), `teste.basic@` (10), `teste.gold@` (11), `teste.platinum@` (12)
      — domínio `primepokerteam.com.br`. Senhas geradas na sessão (fora do repo); guardar num gerenciador.
- [x] No painel: mudar o tier de `teste.basic`, `teste.gold` e `teste.platinum` — conferido
      pelo token de cada um (basic, gold, platinum).
- [x] ~~`WP_JWT_SECRET` diferente do WP~~ → **falso alarme**: o `.env.local` está certo (valor
      entre aspas; meu teste lia as aspas junto). Conferido do jeito que o Next lê: idêntico.
- [ ] Na Vercel (produção e staging): conferir que `WP_JWT_SECRET` é o mesmo valor do
      `wp-config.php`. Lá o valor vai **sem aspas** (a UI da Vercel não interpreta o `.env`).
- [ ] Teste rápido na staging (depois do deploy com o ajuste de relógio): logar com
      `teste.free` e ver se entra na área do jogador.

**🤖 Claude**
- [x] Verificado: login dos 4 usuários OK (authToken + refreshToken) e query `viewer`
      autenticada devolve nome, e-mail, `registeredDate` e tier.
- [x] Verificação da assinatura: os 4 tokens validam com o segredo local e um segredo
      errado é recusado.
- [x] **Falha real encontrada e corrigida:** o WP emite o token com `nbf` = relógio dele,
      ~2s adiantado. Validado na hora, o token "ainda não valia" → login voltava para a tela
      de login. Criado `lib/jwt.ts` com `clockTolerance: 30`, usado pelo proxy e pelo
      `getSession()`. Testado no build de produção: `/player/` com token recém-emitido → 200;
      sem cookie ou com token adulterado → 307 para `/login`.
- [ ] Criar `authQuery`/`authMutate` em `graphql/`: sem `"use cache"`, com
      `Authorization: Bearer <access_token>` lido do cookie.
- [ ] `services/perfil.ts` → `getPerfil()` real via `viewer { name username email registeredDate playerTier playerTierLabel playerTierExpiresAt }`.
- [ ] Mapear a cor do selo por tier no front.
- [ ] `player-menu.tsx`: trocar "Minha conta" pelo nome e as iniciais do usuário (TODO no código).
- [ ] Tratar token expirado ou sem permissão (redirecionar ao login, sem tela quebrada).

**✅ Pronto quando:** cada usuário de teste vê o próprio nome, e-mail, tier e vencimento.

---

## Etapa 5 — Recuperação de senha

**👤 Você**
- [ ] SMTP funcionando (etapa 0).
- [ ] ❓ Texto e assunto do e-mail de redefinição (ou deixo um padrão e você ajusta).

**🤖 Claude**
- [ ] Plugin: filtro em `retrieve_password_message` para o link apontar para
      `{SITE}/redefinir-senha/?key=…&login=…` em vez do `wp-login.php`.
- [ ] `password-recovery-dialog.tsx`: trocar o `setTimeout` (TODO) pela mutation
      `sendPasswordResetEmail`, mantendo a mensagem neutra.
- [ ] Criar a página `(auth)/redefinir-senha` com a mutation `resetUserPassword`.
- [ ] Testar o fluxo completo com e-mail real.

**✅ Pronto quando:** você recebe o e-mail, troca a senha e entra com a nova.

---

## Etapa 6 — Aulas: estrutura no WP

Substitui o mock de `services/aulas.ts` e `services/aula-detalhe.ts`.

**👤 Você**
- [ ] ❓ **Hospedagem dos vídeos:** YouTube não listado, Vimeo, Panda Video, Bunny ou arquivo no WP?
      (Afeta a proteção: link do YouTube não listado vaza fácil; Panda/Bunny/Vimeo permitem restringir domínio.)
- [ ] ❓ **Regras de acesso:** cada aula tem um tier mínimo? O que o jogador sem acesso vê
      (card com cadeado + CTA de upgrade, ou a aula nem aparece)?
- [ ] ❓ Confirmar as trilhas (hoje: Estratégia, Mental Game, Torneios, Análise de Mãos,
      Fundamentos, Ferramentas, Profissional) e os níveis (Iniciante, Intermediário, Avançado).
- [ ] Depois que eu subir o plugin: importar o JSON do ACF que eu vou gerar
      (ACF → Ferramentas → Importar).
- [ ] Cadastrar as trilhas e **pelo menos 3 aulas de teste** completas (vídeo, duração,
      instrutor, nível, materiais, imagem destacada).

**🤖 Claude**
- [ ] Plugin `includes/Aulas/`: registrar o CPT `aula` (GraphQL `aula`/`aulas`, com editor,
      imagem destacada e comentários) e a taxonomia `trilha`.
- [ ] Gerar o JSON do ACF (`wp_plugin/acf/`):
      - termo `trilha`: `selo`, `cor` (select com chaves fixas), `ordem`;
      - `aulaFields`: `instrutor` (Post Object → Instrutor), `nivel`, `video`, `duracao` (s),
        `tierMinimo`, `materiais` (repeater `nome` + `arquivo`).
- [ ] Plugin GraphQL: `offset`, `instrutor`, `de`/`ate` e `orderby` (recentes, antigas,
      populares, curtas, longas) nas `where` de aulas; `aulasTotal(...)`; contador de
      visualizações em meta.
- [ ] Plugin GraphQL: **proteção no servidor** — `video` e `materiais` devolvem `null`
      sem `view_content_<tierMinimo>`; expor `podeAcessar` na aula.
- [ ] Revalidação ao publicar/editar aula (etapa 3).
- [ ] Documentar tudo no `wp_plugin/README.md` e subir a versão do plugin.

**✅ Pronto quando:** a query `aulas` devolve as aulas de teste com filtros e ordenação,
e um usuário free não recebe o vídeo de uma aula gold.

---

## Etapa 7 — Aulas: front ligado no WP

**👤 Você**
- [ ] Testar em staging com os usuários de cada tier e me dizer o que ficou estranho.

**🤖 Claude**
- [ ] `services/aulas.ts`: trocar o acervo gerado por queries (`listarAulas`, `getAulaPorSlug`,
      `getAcervo`, `getAulaSugerida`), mantendo as assinaturas — os componentes não mudam.
- [ ] Trilhas e instrutores do filtro vindos do WP (hoje `CATEGORIAS` e `INSTRUTORES` são fixos).
- [ ] Converter a chave de `cor` da trilha nas classes do selo e do gradiente da capa.
- [ ] `aula-card.tsx`: usar a imagem destacada no lugar do gradiente provisório.
- [ ] `aulas/[slug]/page.tsx`: passar a `url` do vídeo para o `AulaPlayer` (hoje nunca passa)
      e usar a descrição do editor.
- [ ] Materiais com link de download real (tamanho vindo da media library).
- [ ] Estado de "sem acesso" conforme a regra definida na etapa 6.
- [ ] `aula-card.tsx`: implementar o menu de ações ⋮ (salvar, marcar como assistida,
      compartilhar) — TODO no código.
- [ ] Post do blog → "aula sugerida" usando as aulas reais.
- [ ] Contabilizar a visualização ao abrir a aula.

**✅ Pronto quando:** listagem, busca, filtros, rolagem infinita e página da aula
funcionam só com dados do WP.

---

## Etapa 8 — Progresso, salvas e concluídas (por usuário)

**👤 Você**
- [ ] ❓ Regra da "sequência de estudo": conta dia com qualquer aula aberta, ou só com
      X minutos assistidos?

**🤖 Claude**
- [ ] Plugin: user meta para progresso por aula, salvas, concluídas e dias de estudo.
- [ ] Plugin GraphQL: campos `meuProgresso`, `salva`, `concluida` na `Aula`; mutations
      `alternarAulaSalva`, `alternarAulaConcluida`, `registrarProgresso`; `viewer.sequenciaEstudo`.
- [ ] `services/aula-detalhe.ts` e `services/perfil.ts`: remover os `Set`/`Map` em memória
      e a sequência fixa `7` (TODO).
- [ ] `AulaPlayer`: enviar o progresso periodicamente (a cada ~15s e ao pausar/sair)
      e retomar de onde parou.
- [ ] "Continuar assistindo", painel de progresso por trilha e horas assistidas com dados reais.

**✅ Pronto quando:** você assiste um trecho, sai, volta em outro navegador e continua
do mesmo ponto; salvas e concluídas persistem.

---

## Etapa 9 — Dúvidas nas aulas

**👤 Você**
- [ ] ❓ Quem responde as dúvidas: o instrutor da aula tem usuário no WP, ou a equipe responde
      pelo painel em nome dele?
- [ ] ❓ Dúvidas são visíveis para todos os jogadores da aula ou só para quem perguntou?
- [ ] ❓ Precisam de moderação antes de aparecer?
- [ ] Se o instrutor tiver usuário: criar os usuários e me dizer como ligar a cada Instrutor.

**🤖 Claude**
- [ ] Plugin: comentários do CPT aula restritos a `access_player_area` (leitura e escrita),
      com aprovação automática ou moderação conforme sua decisão.
- [ ] Plugin GraphQL: `ehInstrutor` no comentário.
- [ ] `enviarDuvida` e a listagem de dúvidas usando os comentários reais (via `authMutate`).
- [ ] Remover a conversa de exemplo (`duvidasIniciais`).
- [ ] Notificar o jogador quando a dúvida for respondida (liga com a etapa 10).

**✅ Pronto quando:** você pergunta em staging, responde pelo WP e a resposta aparece como instrutor.

---

## Etapa 10 — Notificações

**👤 Você**
- [ ] ❓ Quais tipos entram na primeira versão: `aula` (nova aula), `aviso` (comunicado),
      `suporte` (resposta de dúvida), `conquista` (trilha concluída, sequência)?
- [ ] ❓ Um aviso pode ser direcionado por tier ou para um usuário específico?
- [ ] Depois do plugin: importar o JSON do ACF e criar 2–3 avisos de teste.

**🤖 Claude**
- [ ] Plugin: CPT `notificacao` + ACF (`tipo`, `descricao`, `link`, `tierMinimo`, `usuario`).
- [ ] Plugin: lidas em user meta; query `minhasNotificacoes(filtro)`, `notificacoesNaoLidas`;
      mutations `marcarNotificacao(id, lida)` e `marcarTodasLidas`.
- [ ] Plugin: gerar a notificação automaticamente ao publicar aula, ao responder dúvida
      e nas conquistas escolhidas.
- [ ] `services/notificacoes.ts` e `actions/notificacoes.ts` ligados no WP; sino, painel
      e página de notificações com dados reais.

**✅ Pronto quando:** publicar uma aula gera a notificação, e o "lida" persiste entre dispositivos.

---

## Etapa 11 — Planos, upgrade e vencimento

**👤 Você**
- [ ] ❓ **Como o jogador vira Basic/Gold/Platinum?** Você altera manualmente no WP,
      ou haverá pagamento (Hotmart, Kiwify, Stripe, Mercado Pago…)?
- [ ] ❓ O que acontece no vencimento (o plugin já rebaixa via `Expiration`): avisar
      por e-mail antes? Quantos dias?
- [ ] ❓ Para onde leva o botão de "fazer upgrade" nas aulas bloqueadas?
- [ ] Se houver gateway: criar a conta e me passar as credenciais **de teste** e o webhook.
- [ ] Confirmar que o cron do WP roda (WP-Cron real ou cron do servidor) — o vencimento depende disso.

**🤖 Claude**
- [ ] Integração com o gateway via webhook → `Membership::set_tier()` (hook `prime_player_tier_changed`).
- [ ] E-mail de aviso de vencimento e e-mail de boas-vindas (`prime_player_registered`).
- [ ] CTA de upgrade no front e exibição do vencimento no perfil.

**✅ Pronto quando:** uma compra de teste muda o tier e libera as aulas na hora.

---

## Etapa 12 — Lançamento (master)

**👤 Você**
- [ ] Revisar tudo em staging e dar o OK final.
- [ ] Conteúdo mínimo publicado: posts do blog, aulas, avisos.
- [ ] Yoast preenchido nos posts principais.

**🤖 Claude**
- [ ] Na master: descomentar os acessos ao blog e à área logada (header, menu mobile,
      rodapé e seção "Últimas do blog" na home).
- [ ] Revisar o grid do rodapé (voltou a ter 3 colunas).
- [ ] ⚠️ O `sitemap.ts` lista o blog. Se staging for mergeada na master **antes** do
      lançamento, comentar o trecho do blog no sitemap na master junto com os links.
- [ ] Remover qualquer mock restante e rodar `typecheck`, `lint` e `build`.
- [ ] Fazer o merge staging → master sem desfazer nada da master.

**✅ Pronto quando:** tudo publicado em produção, com login, aulas e blog funcionando.

---

## Decisões em aberto (resumo dos ❓)

| # | Etapa | Decisão |
|---|---|---|
| 2 | 1 | Nomes finais dos campos do formulário de inscrição |
| 3 | 1 | Newsletter só por e-mail ou integrada a uma ferramenta |
| 4 | 2 | Serviço/URL do feed do Instagram |
| 5 | 5 | Texto do e-mail de redefinição de senha |
| 6 | 6 | Onde hospedar os vídeos |
| 7 | 6 | Regra de acesso por tier e o que o bloqueado vê |
| 8 | 6 | Trilhas e níveis definitivos |
| 9 | 8 | Regra da sequência de estudo |
| 10 | 9 | Quem responde as dúvidas, visibilidade e moderação |
| 11 | 10 | Tipos de notificação e direcionamento |
| 12 | 11 | Como o jogador muda de plano (manual ou gateway) |
| 13 | 11 | Aviso de vencimento e destino do upgrade |
