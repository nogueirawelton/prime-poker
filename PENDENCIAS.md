# Pendências — Prime Poker

Tudo o que falta para o site e a área do jogador saírem do mock e irem ao ar.

**Como usar:** cada etapa tem **👤 Você** (painel do WP, servidor, decisões) e
**🤖 Claude** (código no Next e no plugin `wp_plugin/prime-poker`). Quando a
sua parte estiver feita, confirme a etapa: eu executo a minha e deixo
funcionando, com typecheck, lint e teste real.

Legenda: `[ ]` pendente · `[x]` feito · ❓ decisão sua antes de começar.

**Ordem sugerida:** 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13

**Onde estamos:** etapas 0 a 12 concluídas e validadas no ar. Falta a 13 (lançamento
na master). Bloqueio conhecido: os links de Facebook, X e YouTube do rodapé.

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
- [x] Apagar os envios de teste marcados "TESTE Claude — ignorar" (feito em 19/09/2026).

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
- [x] ⚠️ O `6c3f6d2` foi **antes** do botão na barra superior: o `Revalidation.php` com o
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

## Etapa 4 — Cliente GraphQL autenticado + perfil ✅ concluída (17/09/2026)

Base de todas as etapas da área do jogador.

**👤 Você**
- [x] Usuários de teste criados por mim via `registerUser` (todos entram como Player Free):
      `teste.free@` (id 9), `teste.basic@` (10), `teste.gold@` (11), `teste.platinum@` (12)
      — domínio `primepokerteam.com.br`. Senhas geradas na sessão (fora do repo); guardar num gerenciador.
- [x] No painel: mudar o tier de `teste.basic`, `teste.gold` e `teste.platinum` — conferido
      pelo token de cada um (basic, gold, platinum).
- [x] ~~`WP_JWT_SECRET` diferente do WP~~ → **falso alarme**: o `.env.local` está certo (valor
      entre aspas; meu teste lia as aspas junto). Conferido do jeito que o Next lê: idêntico.
- [x] Na Vercel (produção e staging): conferir que `WP_JWT_SECRET` é o mesmo valor do
      `wp-config.php`. Lá o valor vai **sem aspas** (a UI da Vercel não interpreta o `.env`).
- [x] Teste rápido na staging: logar com `teste.free` e entrar na área do jogador — ✅ você confirmou.

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
- [x] `graphql/auth-client.ts`: `authQuery`/`authMutate` sem cache, com
      `Authorization: Bearer` do cookie. Se o WP recusar, confere o token localmente:
      sessão inválida → `/login`; sessão válida → o erro sobe como erro de verdade
      (não manda alguém logado para o login por causa de uma query quebrada).
- [x] `services/profile.ts` → `getProfile()` real via `viewer` (`graphql/queries/player/VIEWER.ts`),
      deduplicado por requisição (menu + painel = uma ida ao WP). Conta sem usuário no WP → `/login`.
- [x] Cor do selo por tier no front (free cinza, basic azul, gold âmbar, platinum violeta);
      rótulo vem do WP. Usuário sem tier (equipe) não mostra selo.
- [x] Menu do header com nome, iniciais e tier (atrás de Suspense; o fallback é o menu
      funcional com "Minha conta"). TODO do código removido.
- [x] Card do perfil não repete o e-mail como `@usuario` quando são iguais.
- [x] `utils/initials.ts`: a mesma função estava copiada em 5 componentes — unificada.
- [x] Testado no build de produção com os 4 usuários: `/player/` e `/player/aulas/` → 200,
      nome, e-mail, tier, iniciais e "Membro desde" corretos; sem cookie → 307 `/login`.

**⚠️ Achado (seu, no WP):** o **modo debug do WPGraphQL está ligado em produção** — erros
devolvem `debugMessage` com detalhes internos ("Signature verification failed", "Expired token").
Desligar em *GraphQL → Settings → Enable GraphQL Debug Mode*. O front não depende disso.
- [x] Desligar o debug do WPGraphQL — conferido: erros não trazem mais `debugMessage`.

**✅ Pronto quando:** cada usuário de teste vê o próprio nome, e-mail, tier e vencimento.

---

## Etapa 5 — Recuperação de senha + e-mail de boas-vindas ✅ concluída (17/09/2026)

**👤 Você**
- [x] SMTP funcionando (etapa 0).
- [x] ❓ Texto e assunto do e-mail → **a critério do Claude**.
- [x] Commit + push na `staging`.
- [x] Subir o plugin **1.9.0** no WP.
- [x] Em *Configurações → Cache do site*, garantir a **produção na primeira linha** (é o
      destino padrão dos links) e a staging na segunda.
- [x] Testar na staging com um e-mail que você recebe (os `teste.*@primepokerteam.com.br`
      provavelmente não têm caixa — troque o e-mail de um deles no painel ou use sua conta):
      1. Login → "Esqueci minha senha" → informar o e-mail.
      2. Conferir o e-mail: visual, assunto, link apontando para a **staging**.
      3. Abrir o link, salvar a nova senha → volta para o login → entrar com a nova.
      4. Abrir o mesmo link de novo → deve dizer que é inválido/já usado.
- [x] Testar o **cadastro** na staging com um e-mail seu: a conta é criada rápido (o e-mail
      sai depois da resposta) e chega "Boas-vindas ao Prime Poker Team!" com o seu nome e o
      botão apontando para a staging.
- [x] ❓ Avisar a equipe (admin) a cada cadastro novo → **não**, ninguém é notificado (19/09/2026).
- [x] Me contar o resultado (e mandar print do e-mail, se algo parecer estranho).

**🤖 Claude**
- [x] Conferido no código do WPGraphQL: `sendPasswordResetEmail` usa os filtros
      `retrieve_password_title`/`retrieve_password_message` e responde sucesso mesmo para
      e-mail inexistente (sem enumeração de contas).
- [x] Plugin `Players/PasswordReset.php`: e-mail em HTML (assunto "Redefinição de senha —
      Prime Poker Team", saudação pelo nome, botão, validade de 24h, link de reserva) com
      link para `/redefinir-senha/` do front.
- [x] **Segurança:** o link só aponta para endereços cadastrados no WP; um domínio
      informado por terceiros cai no endereço de produção.
- [x] **Falha do plugin JWT corrigida:** trocar a senha não derrubava sessões (o refresh
      token com segredo antigo continuava aceito por até 30 dias). Agora redefinir a senha
      ou trocá-la no painel gira o segredo e o refresh antigo é recusado.
- [x] `password-recovery-dialog.tsx`: `setTimeout` (TODO) trocado pela action
      `requestPasswordReset`, mantendo a mensagem neutra; só falha de rede vira erro.
- [x] Página `(auth)/redefinir-senha` + `reset-password-form.tsx`: nova senha e confirmação
      (mín. 8, como no cadastro); link vencido/usado/incompleto troca o formulário por
      "Pedir um novo link"; sucesso limpa os cookies deste navegador e leva ao login.
- [x] `robots.ts` bloqueia `/redefinir-senha/`.
- [x] **E-mail de boas-vindas** (`Players/Welcome.php`, pedido em 17/09/2026): só para
      cadastro pelo front; enviado depois da resposta (`fastcgi_finish_request`) para não
      deixar o cadastro lento e para já ter o nome gravado; saudação pelo nome (neutra se não
      houver), tier inicial, botão para o login do ambiente de origem.
- [x] Layout de e-mail e resolução do endereço do front extraídos (`Mail/Layout.php`,
      `Front.php`) — redefinição de senha e boas-vindas usam os mesmos.
- [x] Action de cadastro envia `X-Prime-Front-Url`.
- [x] **Logout lento corrigido** (apontado por você): o `revalidatePath("/", "layout")` invalidava
      o cache do servidor para todos a cada saída, e a home era remontada consultando o WP. Removido
      — apagar os cookies na Server Action já limpa o cache do navegador. Adicionado overlay
      "Saindo…" enquanto a saída não termina. Validado por você.
- [x] Testes: plugin com WP simulado (16 cenários — link por ambiente, domínio de atacante,
      HTML só no e-mail certo, giro do segredo, refresh antigo recusado, revogado intacto);
      mensagem real do WP para chave inválida casa com a tradução; página no build de
      produção sem parâmetros (link incompleto) e com parâmetros (formulário com key e
      login decodificado).
- [x] Fluxo real na staging validado por você (redefinição e boas-vindas).

**✅ Pronto quando:** você recebe o e-mail, troca a senha e entra com a nova; e um cadastro
novo recebe o e-mail de boas-vindas.

---

## Manutenção — código em inglês ✅ concluída (17/09/2026)

Regra registrada no `CLAUDE.md`: todo código em inglês; comentários, textos de interface, rotas,
valores de URL/dados e contratos externos (CF7, ACF, WP) continuam em português.

- [x] Front: ~2.500 identificadores renomeados com análise do TypeScript (não busca-e-troca),
      com checagem de conflito de escopo, sombreamento e chaves duplicadas antes de aplicar.
- [x] 23 arquivos/pastas de código renomeados (`services/lessons.ts`, `components/pages/player/lessons/`,
      `dashboard/`, `notifications/`…); pastas de rota em `src/app` intactas.
- [x] Nomes de campos de formulário (`password`, `name`, `lastName`, `confirmPassword`,
      `acceptTerms`, `text`) trocados nos dois lados; `path` dos erros do zod corrigido.
- [x] Plugin PHP: variáveis, método `count_posts` e chaves do layout de e-mail em inglês.
- [x] Verificado: typecheck, lint (só avisos/erros que já existiam em arquivos não tocados),
      `php -l`, testes simulados do plugin, build de produção e páginas reais com usuário logado
      (painel, aulas com filtros/ordenação/datas, aula, notificações com `?filtro=`, blog, login,
      cadastro, redefinição, sitemap).

---

## Etapa 6 — Aulas: estrutura no WP ✅ concluída (19/09/2026, plugin 1.11.1)

Substitui o mock de `services/lessons.ts` e `services/lesson-detail.ts`.

**👤 Você**
- [x] ❓ **Hospedagem dos vídeos** → **Bunny Stream** (19/09/2026). Comparado com Drive +
      Vercel (sem qualidade adaptativa, cota diária do Google e US$ 0,15/GB acima de 1 TB na
      Vercel) e Panda (a partir de ~US$ 15/mês): o Bunny cobra ~US$ 0,005/GB entregue e
      US$ 0,01/GB guardado — ~US$ 6–8/mês para ~1 TB/mês. Player com qualidade adaptativa e
      API de eventos (progresso da etapa 8); link assinado pelo WP, com validade.
- [x] ❓ **Regras de acesso** → **tier mínimo por aula + card com cadeado** e convite ao
      upgrade para quem está abaixo. Vídeo e materiais nunca saem do WP para ele.
- [x] ❓ **Trilhas** → **o cliente cadastra** no painel (nome, selo, cor, ordem). Nenhuma
      vem pronta. Níveis fixos: Iniciante, Intermediário, Avançado.
- [x] ❓ Registro em código ou pelo ACF → **pelo ACF**, como os outros CPTs do site
      (19/09/2026). Editor clássico, sem Gutenberg.
- [x] Commit + push na `staging`.
- [x] Subir o plugin **1.11.0** no WP (substitui a 1.10.0, que registrava as aulas por
      código — aulas já cadastradas não se perdem: slugs e chaves dos campos são os mesmos).
- [x] **ACF → Ferramentas → Importar** o arquivo `wp_plugin/acf/aulas.json` (4 itens:
      tipo Aulas, taxonomia Trilhas, grupos "Dados da aula" e "Aparência da trilha").
      Conferir: menu **Aulas** com editor clássico e o bloco **Dados da aula**, e nenhum
      aviso vermelho "a configuração do ACF não bate" nas telas de aulas.
- [x] Cadastrar as trilhas (em *Aulas → Trilhas*): nome, selo (opcional), cor e ordem.
- [x] **Bunny Stream** (cliente ou você, com o cartão do cliente):
      1. Criar a conta em bunny.net → *Stream* → **Add Video Library** (ex.: "Prime Poker Aulas").
      2. Na biblioteca → *Security*: ligar **Embed view token authentication** e, em
         **Allowed domains**, cadastrar `primepokerteam.com.br` e o domínio da staging.
      3. Subir os vídeos (dá para importar por link — *Upload → Fetch from URL*).
      4. No `wp-config.php` (produção), acrescentar — e me avisar quando estiver lá:
         ```php
         define( 'PRIME_POKER_BUNNY_LIBRARY_ID', '…' ); // biblioteca → API → Library ID
         define( 'PRIME_POKER_BUNNY_TOKEN_KEY', '…' );  // biblioteca → Security → Token authentication key
         ```
         A chave **não** vai para a Vercel nem para o repositório: quem assina é o WP.
- [x] Cadastrar **pelo menos 3 aulas de teste** completas (título, descrição, trilha,
      imagem destacada, instrutor, nível, duração, tier mínimo, Video ID do Bunny, materiais),
      com **tiers mínimos diferentes** (uma free, uma gold, uma platinum).
- [x] Me avisar: eu rodo a verificação real com os 4 usuários de teste.

**🤖 Claude**
- [x] Plugin `includes/Lessons/` (em inglês, pela regra do projeto; os slugs `aula` e
      `trilha` são dados e ficam em português):
      - `wp_plugin/acf/aulas.json`: CPT `aula` (editor clássico, imagem, resumo,
        comentários, revisões), taxonomia `trilha` (hierárquica) e os grupos
        `lessonFields` e `trackFields`, para importar no ACF.
      - `Content.php`: slugs e remoção dos sitemaps do WordPress e do Yoast.
      - `Fields.php`: aviso no painel se o JSON não foi importado ou se um campo que o
        código lê foi renomeado/removido.
        Duração digitada `25:30`/`1:05:00` e gravada em segundos (ordenação numérica);
        vídeo validado ao salvar (aceita o Video ID do Bunny ou o link do player).
      - `Access.php`: visitante não vê aulas no GraphQL nem no REST; jogador de qualquer
        tier vê a listagem; assistir exige a capability do tier mínimo (equipe vê tudo).
      - `GraphQL.php`: `where` com `offset`, `track`, `instructor`, `from`/`to`, `sort`
        (`NEWEST`, `OLDEST`, `MOST_VIEWED`, `SHORTEST`, `LONGEST`); `lessonsTotal`; na
        `Aula`: `canWatch`, `minimumTier(Label)`, `duration`, `viewCount` e os protegidos
        `video { provider id url }` e `materials { name url fileSize mimeType }`
        (`null` sem acesso); mutation `registerLessonView`.
      - `Views.php`: visualizações em meta, 1 por jogador a cada 12h por aula.
- [x] **Conferido no código do WPGraphQL:** CPT não público vira privado para quem não
      tem `edit_posts` — por isso a aula é `public` e o gate fica no `graphql_data_is_private`.
      E o filtro de query roda depois do WPGraphQL, então a ordenação própria não é sobrescrita.
- [x] Revalidação: aula e trilha → tag nova `lessons` (antes cairiam em `cms`, que limpa
      tudo); instrutor → `home` + `lessons`. Tag aceita pelo front (`lib/cache-tags.ts`).
- [x] `Tiers::content_capability()` para achar a capability de um tier sem repetir a lista.
- [x] Testes com WP simulado (128 cenários de aulas + revalidação + checagem do ACF
      contra o próprio `aulas.json`): acesso por tier nas
      7 combinações de usuário × 4 aulas, visitante/assinante escondidos no GraphQL e no
      REST, filtros e ordens, datas inválidas ignoradas, vídeo e materiais só com acesso,
      anexo apagado some da lista, formatos de ID/link do Bunny, token assinado conferido
      com o exemplo da documentação do Bunny, dedupe de visualização,
      conversão e validação da duração. `php -l`, typecheck e lint OK.
- [x] README do plugin: seção **Aulas** e tabela de revalidação.
- [x] Verificação real no WP (19/09/2026), 3 aulas (free, gold, platinum) × 4 usuários:
      - acesso: cada tier recebe vídeo e materiais só das aulas do seu tier para baixo; os
        outros recebem `null` — ✅ nos 12 casos. Visitante: lista vazia, total 0, REST 401;
      - Bunny: link assinado abre o player; sem token e com token adulterado são recusados;
        domínio fora da lista também é recusado ✅;
      - filtros (trilha, instrutor, busca, datas, offset), as 5 ordens, `lessonsTotal` e
        `registerLessonView` (conta 1x, repetição ignorada, visitante recusado) ✅.
- [x] Ajuste após o teste: duração digitada só com número passa a valer **minutos**
      (`25` = 25:00); antes valia segundos. As 3 aulas de teste estão certas (5, 10 e 20 s
      são os vídeos de placeholder) — valores já gravados não mudam.

**Observações do teste real (para a etapa 7):**
- O Bunny responde HTTP 200 mesmo quando recusa (página de "403" dentro): não dá para
  checar o link só pelo status.
- O ACF devolve os `select` como lista: `level: ["avancado"]`, `color: ["vermelho"]`. O
  front pega o primeiro item.

**👤 Pendências que ficaram (não bloqueiam a etapa 7):**
- [x] Subir o plugin **1.11.1** (só a regra da duração).
- [x] Bunny → *Allowed domains*: `localhost` liberado (conferido: o player abre a partir de
      `localhost` e de `prime-poker.vercel.app`).
- [ ] Bunny → *Allowed domains*: acrescentar **`primepokerteam.com.br`** — hoje recusado;
      sem isso nenhum vídeo toca no lançamento. Tirar `localhost` no lançamento.
      ↳ Mesmo item da etapa 13; é lá que ele fecha.
- [x] Reimportado o `aulas.json` com o texto de ajuda novo da duração (19/09/2026).

**✅ Pronto quando:** a query `aulas` devolve as aulas de teste com filtros e ordenação,
e um usuário free não recebe o vídeo de uma aula gold.

---

## Etapa 7 — Aulas: front ligado no WP ✅ concluída (19/09/2026, plugin 1.12.1)

**👤 Você**
- [x] Commit + push na `staging`.
- [x] Subir o plugin **1.12.0** (sugestão de aula no blog + correção de slug numérico).
- [x] Abrir a **Aula 01** no painel e clicar em **Atualizar** (sem mudar nada): o slug
      dela é `1108` (foi publicada antes de ter título) e dá 404 no site. Ao salvar, o
      plugin troca por `aula-01`.
- [x] Testar no navegador (staging ou `localhost`) com os usuários de cada tier:
      - listagem, filtros da sidebar e do painel ⚙, busca, ordens;
      - cards com cadeado e o tier exigido; página da aula bloqueada;
      - **o vídeo toca** no player do Bunny (não consegui abrir navegador aqui);
      - **o contador de visualizações sobe** ao abrir uma aula (1× por jogador a cada 12h);
      - material de apoio da Aula 01 abrindo em nova aba;
      - menu ⋮ do card → "Copiar link".
- [x] Me dizer o que ficou estranho — nada apontado.

**🤖 Claude**
- [x] `services/lessons.ts` ligado no WP: `listLessons` (filtros, ordem e paginação no
      servidor, total na mesma ida), `getCatalog` (acervo de 100 em 100), aula por slug com
      descrição, vídeo e materiais. Listagem e aula por jogador vão pelo `authQuery`, sem
      cache; trilhas, instrutores e a sugestão do blog são públicos e cacheados sob `lessons`.
- [x] Tipos e utilitários que o navegador usa separados em `lib/lessons.ts` (o serviço é
      `server-only`).
- [x] Trilhas e instrutores do filtro vindos do WP; trilha vazia não aparece; ordem pelo
      campo `order`. Na sidebar, cada trilha ganha a bolinha da sua cor.
- [x] Cor da trilha → selo, capa e bolinha da sidebar (`lib/lessons.ts`: `badgeStyle`,
      `coverStyle`, `dotStyle`).
- [x] Filtro de instrutor na URL por **ID** (`?instrutor=106`): os slugs dos instrutores no
      WP estão desatualizados (o Caio Brick tem slug `carlos-gto`).
- [x] Card: imagem destacada (gradiente da trilha quando não há), cadeado + tier exigido
      para quem está abaixo, sem trilha/instrutor/duração quando não informados.
- [x] Página da aula: player do Bunny (iframe com o link assinado), aviso "Aula exclusiva
      para Player Gold ou superior" no lugar do vídeo para quem não tem acesso, "vídeo em
      breve" para aula sem vídeo, descrição do editor, materiais reais.
- [x] Materiais: tamanho formatado (`2,3 MB`), abrem em nova aba (o `download` não funciona
      em link de outro domínio); sem acesso, aviso no lugar da lista.
- [x] Visualização contada ao abrir a aula (action chamada pelo navegador, não na
      renderização — o prefetch de links contaria aulas que ninguém abriu).
- [x] Cor da trilha por **seletor de cor** do ACF (pedido em 19/09/2026), no lugar da
      lista fechada (`vermelho`, `esmeralda`…): qualquer cor serve, e o texto do selo fica
      preto ou branco conforme o brilho dela. As classes fixas do Tailwind deram lugar a
      estilo em linha calculado do hex.
- [x] Ícone por trilha na sidebar (pedido em 19/09/2026): campo de texto **Ícone** em
      *Aparência da trilha* com o nome do ícone no Phosphor; vazio mantém a bolinha da cor,
      nome errado aparece como interrogação vermelha. Renderizado no servidor — o
      `DynamicIcon` importa o catálogo inteiro do Phosphor e a sidebar é componente cliente.
      **Exige reimportar o `aulas.json` ANTES de subir o front** (sem o campo, o build cai).
- [x] Avatar do instrutor no card: foto cadastrada no Instrutor quando existe; sem foto,
      as iniciais do **nome real** — o apelido entre aspas (`Renato “rbmrenato” Barbosa`)
      é ignorado, e quem só tem apelido ainda ganha uma letra (pedido em 19/09/2026).
- [x] Correção (apontada por você): os `select` do painel de filtros abriam com texto
      branco sobre fundo branco — a lista era desenhada pelo sistema, que ignora o tema.
      Trocados pelo **Select do Radix**, com o mesmo visual do Popover que os contém e do
      menu dos cards.
- [x] Menu ⋮ do card: **copiar link** e **compartilhar** (onde o sistema oferece).
      *Salvar* e *marcar como assistida* ficaram para a etapa 8: hoje esse estado é mock
      em memória, e o card não teria como mostrar se a aula já está salva.
- [x] Blog → aula sugerida real (campo público `lessonSuggestion` no plugin). Se falhar
      (plugin antigo, WP fora), o post mostra a chamada institucional em vez de quebrar —
      criado `optionalQuery` no cliente GraphQL: com `"use cache"`, o erro precisa ser
      capturado dentro da função cacheada, senão derruba o prerender.
- [x] Painel do jogador: progresso por trilha com as trilhas e o acervo reais.
- [x] Plugin 1.12.0: `lessonSuggestion` e slug numérico trocado pelo título ao salvar.
- [x] Verificado: typecheck, lint (sem erro novo), build de produção, testes do plugin
      com WP simulado (sugestão, slug), e no build de produção com os usuários free e gold:
      visitante → login; listagem, trilha, instrutor, busca, 2 ordens e data (7 cenários ×
      2 tiers, total e cadeados certos); aula bloqueada para free com o tier certo; iframe
      com link assinado para gold; painel sem NaN; post do blog de pé com o plugin antigo.
- [x] Verificado por você no navegador: vídeo e contador (não consegui abrir navegador aqui).
- [x] Verificado depois da reimportação do `aulas.json` (19/09/2026): build de produção
      passa com os campos novos; as duas trilhas chegam com cor em hex (`#b70101`,
      `#7213d8`) e ícone (`strategy`, `brain`), que a sidebar renderiza como SVG; selo
      com texto branco sobre as duas cores; tiers retestados nos três usuários —
      free vê só a Aula 01, gold 01 e 02, platinum as três.

**Observações:**
- A busca do WordPress procura em título e conteúdo, não no nome do instrutor: o texto de
  ajuda da busca foi ajustado. Para achar por instrutor, o filtro ⚙.
- "Continue assistindo" some até a etapa 8 (não há progresso gravado ainda).
- Enquanto o plugin 1.12.0 não subir, os posts do blog revalidam a cada minuto (a falha
  da sugestão fica em cache só por minutos). Com o plugin no ar, volta a 1 hora.

**✅ Pronto quando:** listagem, busca, filtros, rolagem infinita e página da aula
funcionam só com dados do WP.

---

## Etapa 8 — Progresso, salvas e concluídas ✅ concluída (20/09/2026, plugin 1.13.0)

**Decisões (19/09/2026):**
- **Sequência de estudo**: conta o dia em que o jogador **abriu qualquer aula** que pode
  assistir. Exigir minutos assistidos dependeria de o player avisar antes de a aba
  fechar — quem estudou perderia o dia por um detalhe técnico.
- **Conclusão automática aos 90%** do vídeo, com marcar/desmarcar na mão por cima.
  Desmarcar desliga a conclusão automática daquela aula (senão o próximo aviso do
  player remarcaria tudo).

**👤 Você**
- [x] Subir o plugin **1.13.0** (módulo `Lessons/Progress.php` + os campos e mutations
      novos). **Antes do front**: sem ele, as telas do jogador quebram, porque a
      listagem pede `watchedSeconds`, `saved` e `completed`.
- [x] Testar no navegador com um usuário de cada tier:
      - assistir um trecho, sair, voltar (de preferência em outro navegador) e conferir
        se retoma do mesmo ponto;
      - deixar o vídeo passar de 90% e ver a aula virar "Assistida" sozinha;
      - salvar/dessalvar e marcar/desmarcar pelo botão da aula e pelo menu ⋮ do card;
      - "Continue assistindo" na sidebar apontando para a última aula em andamento;
      - painel: concluídas por trilha, horas assistidas e a sequência de dias.

**🤖 Claude**
- [x] Plugin `Lessons/Progress.php`: posição por aula, salvas, concluídas, desmarcadas
      na mão e dias de estudo, tudo em user meta indexada por ID de aula (uma leitura
      serve a listagem inteira).
- [x] Plugin GraphQL: `watchedSeconds`, `saved` e `completed` na `Aula`; `studyStreak`
      no `User` (só para o próprio); `continueWatching` na raiz; mutations
      `registerLessonProgress`, `toggleLessonSaved` e `toggleLessonCompleted`.
      Nomes em inglês, como o resto do plugin.
- [x] `services/lesson-detail.ts` e `services/profile.ts`: fim dos `Set` em memória e da
      sequência fixa `7`. As dúvidas seguem mock até a etapa 9.
- [x] `LessonPlayer`: player.js do Bunny ligado ao iframe — retoma no `ready`, grava a
      cada 15s de vídeo, ao pausar e ao terminar. Guarda contra ligar dois players no
      mesmo iframe (o script e o iframe podem ficar prontos em qualquer ordem).
- [x] "Continuar assistindo", progresso por trilha e horas assistidas com dados reais.
- [x] Menu ⋮ do card: **Salvar** e **Marcar assistida** (esta só para aula destrancada),
      mais o selo "Assistida" sobre a capa.
- [x] Rever uma aula concluída começa do início, não dos créditos.
- [x] Verificado: typecheck, lint, build de produção e 32 casos do `Progress` em WP
      simulado (conclusão aos 90%, aula sem duração, desmarcar na mão, ordem das
      salvas, retomada, aula apagada, sequência com buraco e virada de dia).
- [x] Correções encontradas no seu teste (20/09/2026):
      - **`pause` e `ended` do player.js do Bunny não recebem dados** — só o `timeupdate`
        traz `{seconds, duration}`. Eu tinha escrito os três iguais, então pausar mandava
        `NaN` e a action descartava: nada era gravado, e a conclusão automática no fim do
        vídeo nunca chegou a rodar. Agora o último ponto informado fica guardado e é ele
        que vale ao pausar e ao terminar. O progresso também é gravado ao **sair da aula
        por navegação** — clicar em outro link não pausa o vídeo.
      - **O carregando aparecia no botão errado**: os dois botões dividiam um único
        `useTransition`, e só o de concluir trocava o ícone pelo spinner, então salvar
        parecia estar concluindo a aula. Um estado por botão.
      - **O iframe recarregava a cada `refresh()`**: o link do Bunny é assinado com a hora
        atual, então cada leitura devolve um endereço diferente para o mesmo vídeo, e
        salvar reiniciava o vídeo do zero. O link é fixado na primeira renderização da
        aula (vale 6 horas, bem mais que uma sessão).
- [x] Verificado no ar: mutations isoladas no WordPress (salvar não mexe em concluída),
      progresso de 2s fazendo o `continueWatching` responder, e o fluxo completo no
      navegador por você.

**✅ Pronto quando:** você assiste um trecho, sai, volta em outro navegador e continua
do mesmo ponto; salvas e concluídas persistem.

---

## Etapa 9 — Dúvidas nas aulas ✅ concluída (20/09/2026, plugin 1.17.0)

**Decisões (20/09/2026):** a **equipe responde em nome do instrutor** (ninguém precisa de
usuário novo no WP); as dúvidas são **visíveis para todos os jogadores** da aula; e
**sem moderação prévia** — só jogador pagante escreve, e a equipe apaga ou edita pelo painel.

**👤 Você**
- [x] Subir o plugin **1.15.0** (`Lessons/Questions.php`). **Antes do front**: a página da
      aula passa a pedir `text`, `authorLabel`, `isInstructor`, `likeCount` e `liked` nos
      comentários.
- [x] Apagar a dúvida de teste que você mandou com a 1.14.0 — ela ficou sem a marca de
      pergunta e continuaria aparecendo como instrutor.
- [x] Responder sempre pelo botão **Responder** do comentário, nunca criando um comentário
      solto: é o `comment_parent` que prende a resposta à pergunta na tela.
- [x] Testar: perguntar como jogador no site, responder pelo painel em *Comentários* e
      conferir que a resposta aparece com o nome do **instrutor da aula** e o selo.
- [x] Conferir que aula trancada não mostra o campo de pergunta.

**🤖 Claude**
- [x] Plugin `Lessons/Questions.php`: as dúvidas são comentários do CPT aula — aprovação
      automática, leitura fechada a jogador logado (GraphQL e `/wp/v2/comments`), e
      perguntar exige poder **assistir** à aula, não só vê-la.
- [x] Plugin GraphQL: `isInstructor`, `authorLabel` e `text` no `Comment`; mutation
      `askLessonQuestion`. O `authorLabel` é o que faz a resposta da equipe sair assinada
      pelo instrutor da aula.
- [x] `sendQuestion` e a listagem usando os comentários reais; a conversa de exemplo
      (`initialQuestions`) saiu, e a seção abre vazia com o convite a perguntar.
- [x] Aula trancada mostra "Libere o acesso a esta aula para perguntar" no lugar do campo.
- [x] Correção apontada por você (20/09/2026): eu decidia "é resposta do instrutor" só
      pela capability de quem escreveu, então **a sua própria pergunta pelo site saiu
      assinada como instrutor** — você é da equipe. O que separa pergunta de resposta
      agora é por onde o comentário entrou: o que vem do site ganha a meta
      `_prime_poker_question` e nunca é tratado como resposta (plugin 1.14.1).
- [x] Conversas aninhadas (pedido em 20/09/2026): lista corrida, sem caixas — a resposta
      aparece recuada sob a pergunta. O elo vem do
      **Responder** do painel (`parentDatabaseId`); resposta de resposta sobe para a
      pergunta original, e resposta órfã (pergunta apagada) vira um bloco próprio em vez
      de sumir. O plugin liga os comentários aninhados à força — com a opção desligada,
      o Responder soltaria a resposta no fim da lista.
- [x] Curtir e responder na conversa (pedido em 20/09/2026): saiu o "Aguardando resposta".
      **Curtir** vale para qualquer mensagem, pergunta ou resposta — uma por jogador, com
      desfazer, contagem ao lado. **Responder** aparece só na resposta do instrutor a uma
      dúvida do próprio jogador (campo `isMine`): serve para continuar a sua dúvida quando
      a resposta não bastou, não para conversar na dúvida dos outros — quem quer perguntar
      abre a sua. A resposta entra dentro da conversa (`parentId` na mutation, validado
      contra a aula) e continua marcada como pergunta, então não sai assinada pelo
      instrutor.
- [x] Verificado: typecheck, lint, build, a forma da consulta conferida contra o schema
      real (a conexão `comments` na `Aula` e o `orderby: COMMENT_DATE` existem) e 8 casos
      da regra pergunta/resposta em WP simulado (incluindo alguém da equipe perguntando
      pelo site e aula sem instrutor cadastrado), 7 das curtidas (alternância, dois
      jogadores na mesma dúvida, dúvida inexistente) e 8 da montagem das conversas
      (resposta de resposta, resposta órfã, fora de ordem, ciclo, lista vazia).
- [x] Correção apontada por você (20/09/2026): o campo de resposta aparecia e sumia na
      hora. O efeito que fecha o campo depois do envio rodava já na montagem — campo
      recém-aberto está "parado e sem erro", que era a condição de fechar. Agora ele só
      age depois de um envio de verdade. O mesmo furo existia no formulário de nova
      dúvida, invisível porque lá ele só limpava um campo já vazio.
- [x] Notificar o jogador quando a dúvida for respondida — entregue na etapa 10, que é
      onde as notificações nasceram.

**✅ Pronto quando:** você pergunta em staging, responde pelo WP e a resposta aparece como instrutor.

---

## Etapa 10 — Notificações ✅ concluída (20/09/2026, plugin 1.17.0)

**Decisões (20/09/2026):** três tipos — **nova aula**, **resposta à minha dúvida** e
**aviso da equipe**. Conquistas ficaram de fora: é o tipo que mais vira ruído e o que
menos leva o jogador a fazer algo. Alcance do aviso: **por tier ou para um jogador
específico**.

**👤 Você**
- [x] Importar `wp_plugin/acf/notificacoes.json` em *ACF → Ferramentas → Importar*.
- [x] Subir o plugin **1.17.0**. **Antes do front**, como sempre.
- [x] Criar 2–3 avisos de teste em *Notificações*: um para todos, um por tier e um para
      um jogador específico.
- [x] Testar: publicar uma aula nova e conferir que o aviso chega a quem tem o tier dela;
      responder uma dúvida e conferir que quem perguntou é avisado.

**🤖 Claude**
- [x] CPT `notificacao` pelo JSON do ACF (`type`, `description`, `link`, `minimum_tier`,
      `user`), fora do GraphQL — o front lê pelo tipo próprio do plugin, que já aplica o
      público-alvo.
- [x] `Notifications/Content.php`: quem recebe o quê (recado individual ignora o tier;
      tier vale pela capability acumulada; equipe alcança todos) e o estado de leitura em
      user meta, por jogador.
- [x] `Notifications/Triggers.php`: aviso automático ao **publicar** uma aula (só na
      passagem para publicada, senão cada correção avisaria o time inteiro) e ao a equipe
      **responder uma dúvida** (a réplica do próprio jogador não notifica).
- [x] `Notifications/GraphQL.php`: `myNotifications(filter, first, offset)`,
      `notificationsUnread`, mutations `markNotification` e `markAllNotificationsRead`.
- [x] `services/notifications.ts` ligado no WP: caiu o mock em memória, que sumia a cada
      restart e não era compartilhado entre instâncias. Sino, painel e página de
      notificações passam a usar dados reais sem mudar de forma.
- [x] Tipo `conquista` removido da interface, junto com o ícone de troféu.
- [x] Verificado: typecheck, lint, build e 17 casos do público-alvo em WP simulado
      (tier acumulado, recado individual ignorando o tier, recado de outro não vazando,
      equipe alcançando tudo, filtros lidas/não lidas, "marcar todas" mexendo só no que
      o jogador vê, limite e offset).
- [x] Correções apontadas por você (20/09/2026), fora do escopo da etapa mas no
      mesmo caminho:
      - **jogador sem o tier conseguia concluir a aula e curtir comentários**. As duas
        mutations agora exigem poder assistir, e os botões somem da tela. **Salvar
        continua valendo** em aula trancada: é a lista de desejos de quem vai pedir
        upgrade, como você observou.
      - **filtro de aulas por nível de acesso** (`?plano=player_gold`): novo select no
        painel de filtros, alimentado por `playerTiers` do plugin. Vai pelo
        `optionalQuery` — é um filtro a mais, então com plugin antigo no ar ele some
        do painel em vez de derrubar a listagem.
- [x] Ação de leitura escrita, não só o ✓ (pedido em 20/09/2026): sozinho, o ícone
      tanto podia dizer "isto está lido" quanto "clique para marcar". Virou
      "Marcar como lida" / "Marcar como não lida" embaixo de cada notificação.
- [x] Página de notificações em blocos por período (pedido em 20/09/2026): Hoje,
      Ontem, Últimos 7 dias, Últimos 30 dias e Mais antigas, com o título grudado no
      topo enquanto o bloco rola. Agrupei por data, e não por tipo: a lista é
      cronológica e é assim que se procura nela ("o que chegou hoje", "o que perdi na
      semana") — por tipo, coisas que aconteceram juntas ficariam separadas.
      O corte é por dia do calendário, então 23h de ontem é "Ontem" mesmo fazendo
      três horas.
- [x] Painel de filtros revisto (pedido em 20/09/2026): entrou o filtro por **Nível**
      (iniciante, intermediário, avançado, `?nivel=`); "Partição" virou **Trilha**, que
      é o nome da taxonomia no WordPress; "Nível de acesso" virou **Tier**, para não
      confundir com o nível da aula; e **Data** e **Ordenar por** foram para o fim.
      Ordem final: Trilha, Nível, Instrutor, Tier, Data, Ordenar por.
- [x] Esqueleto na barra de busca, no botão de filtros e na faixa de trilhas do mobile
      (pedido em 20/09/2026): os fallbacks só reservavam altura, sem mostrar nada. Agora
      espelham a forma real (`h-14` no campo, `size-14` no botão, pílulas de larguras
      diferentes nos chips) para nada pular quando o conteúdo entra. Conferido no HTML
      servido: os três aparecem no stream.
- [x] Painel de filtros deixou de ser popover de 20rem e virou um **collapsible em
      largura cheia**, abrindo abaixo da busca com animação de altura (pedido em
      20/09/2026): com seis filtros, a coluna estreita virava uma tira alta demais.
      Agora eles se espalham em grade (2 colunas no tablet, 4 no desktop): os cinco
      selects ocupam uma célula cada e a Data ocupa duas, com "de" e "até" lado a lado
      — empilhados, ela ficava mais alta que a linha e abria buracos na grade. O
      "Limpar filtros" saiu da grade e foi para um rodapé à direita, separado por um
      traço: é ação, não filtro.
- [x] Verificar no ar depois que o plugin 1.17.0 subir.

**✅ Pronto quando:** publicar uma aula gera a notificação, e o "lida" persiste entre dispositivos.

---

## Aula relacionada no post ✅ concluída (20/09/2026, plugin 1.18.1)

> ⚠️ **Refeita na etapa 11 (plugin 1.19.0).** O que está descrito aqui vale como
> histórico: o palpite por título saiu, `lessonSuggestion` virou
> `relatedLesson(postId)` e a dúvida do último item — "o nome do campo é outro?" —
> foi respondida: o nome está certo (`relatedlesson`, conferido no schema do
> WPGraphQL); o que estava errado era o campo estar **vazio** nos posts do ar.

Ficou pendente desde a etapa 7 ("a aula no blog deixa pro final q vamos relacionar no
post com a aula").

**👤 Você**
- [x] Criar o campo **Aula relacionada** (ACF `relatedlesson`, relacionamento) no post.
- [x] ~~Subir o plugin **1.18.1**~~ — superado pela 1.19.2 (etapa 11).
- [x] ~~Conferir se a aula escolhida aparece no post~~ — respondido na etapa 11: o nome
      do campo estava certo; o campo é que estava vazio nos posts.

**🤖 Claude**
- [x] `lessonSuggestion` passou a aceitar `postId` e a honrar a escolha do painel antes
      de palpitar pelo título. A relação **precisa** passar pelo plugin: lida direto do
      ACF, ela volta vazia para visitante — a aula é privada e quem lê o blog não está
      logado. Confirmei isso no ar: anônimo recebe `nodes: []`, jogador logado recebe a
      aula.
- [x] Aula relacionada despublicada, apagada ou apontando para algo que não é aula cai
      no palpite, em vez de virar link quebrado no post.
- [x] A consulta passou a levar também a tag `posts`: a resposta agora depende de um
      campo do post, e sem isso trocar a aula no painel só apareceria quando o cache
      expirasse sozinho.
- [x] Verificado: typecheck, lint, build e 11 casos em WP simulado (escolha ganhando do
      palpite, ID gravado como string, aula em rascunho, aula apagada, relação para
      não-aula, sem palavra em comum, e a chamada sem `postId`).
- [x] A chamada agora aparece também **dentro do post**, no fim do texto
      (`LessonCallout`), e não só na coluna lateral — que some no celular. O link vai
      direto para `/player/aulas/<slug>`: quem não entrou cai no login, quem entrou sem
      o plano vê o cadeado com o tier necessário. A lateral continua como estava.
- [x] A leitura da escolha do painel passou a tentar o ACF (`get_field`) antes da meta
      crua. **Motivo (revisto na etapa 11):** os posts `cash-game-x-torneios` e
      `gestao-de-banca` respondem `relatedlesson: { nodes: [] }` — campo presente e
      **vazio**, e não "gravado com outro nome", como se supôs aqui. O nome do campo
      está certo.

---

## Etapa 11 — Planos, upgrade e perfil ✅ concluída (20/09/2026, plugin 1.19.2)

**Decisões (20/09/2026):** **sem gateway de pagamento** — quem muda o tier é você,
pelo painel. **Sem vencimento** por enquanto, então nada de e-mail de expiração. O
botão de upgrade abre um **diálogo que manda o pedido pelo Contact Form 7**.

A etapa mudou de nome: sem cobrança e sem vencimento, o que sobrou dela é o pedido
de upgrade e a tela de perfil.

**👤 Você**
- [x] ❓ Como o jogador vira Basic/Gold/Platinum → **manual, no painel**.
- [x] ❓ O que acontece no vencimento → **não haverá vencimento por enquanto**.
- [x] ❓ Para onde leva o botão de upgrade → **diálogo com formulário, pelo CF7**.
- [x] Subir o plugin **1.19.2**. **Antes do front**, como sempre — esta versão mexe
      no `viewer`, que a área do jogador inteira lê.
- [x] Criar no *Contato → Formulários* um formulário **Pedido de upgrade** com os
      campos `nome_completo`, `email`, `numero_whatsapp`, `plano_atual`,
      `plano_desejado`, `aula` e `mensagem` → **ID 1147**, já no código (constante
      `FORM_ID`, como o da inscrição). Confira que o formulário tem os sete campos
      com esses nomes: o CF7 recusa o envio quando falta um obrigatório.
- [x] Conferir no post se a **Aula relacionada** está mesmo gravada: no ar, os posts
      `cash-game-x-torneios` e `gestao-de-banca` tinham o campo presente mas **vazio**
      (o WPGraphQL devolvia `relatedlesson: { nodes: [] }`, e não `null`). Abrir o
      post, escolher a aula e **Atualizar** resolve — sem escolha não há chamada.
- [x] Testar o perfil: trocar a foto, mudar o WhatsApp, trocar a senha e entrar de
      novo com ela.

**🤖 Claude**
- [x] **Aula relacionada, sempre a escolhida.** O palpite por palavras do título saiu
      (`Lessons/Suggestion.php` virou `Lessons/Related.php`, e `lessonSuggestion`
      virou `relatedLesson(postId)`). Era ele o culpado do que você viu: com o campo
      vazio no post, o plugin caía no palpite — e como as aulas do ar hoje são de
      teste, o post de gestão de banca não tinha palavra em comum com nenhuma e
      voltava vazio. Agora, sem escolha no painel, não há chamada nenhuma.
- [x] A leitura da escolha ganhou um terceiro caminho: `get_field()`, depois a meta
      crua, e por fim uma **varredura pelos campos de relação do próprio post** —
      achados pela chave da definição do ACF (`_<campo>` → `field_abc123`), e não
      por qualquer número que bata com o ID de uma aula. Assim o campo funciona
      mesmo que tenha sido criado com outro nome.
- [x] **Perfil editável** em `/player/perfil`: foto, nome, e-mail, WhatsApp, cidade,
      apresentação e troca de senha. O nome de usuário fica de fora de propósito —
      é com ele que o jogador entra no site.
- [x] `Players/Profile.php` no plugin: campos `playerPhone`, `playerCity` e
      `playerAvatarUrl` no `User` (só para o dono e para quem administra usuários),
      mutations `updatePlayerProfile` e `updatePlayerPassword`, e a rota REST
      `prime-poker/v1/avatar` para a foto — multipart não passa pelo GraphQL, e
      mandar a imagem em base64 dentro do JSON custaria um terço a mais de tráfego.
- [x] A troca de senha **exige a senha atual**: o token do jogador vive num cookie, e
      sem essa conferência quem pegasse o cookie ficaria com a conta. Quem esqueceu a
      senha continua indo pelo "esqueci minha senha", que confere o e-mail.
- [x] A foto vira anexo da biblioteca e entra no filtro de avatar do WordPress, então
      o painel, os comentários e os e-mails passam a mostrá-la também. Trocar a foto
      apaga a anterior — senão cada troca deixaria um arquivo órfão. O tipo do arquivo
      é conferido **pelo conteúdo**, nunca pelo cabeçalho que o navegador manda.
- [x] **Diálogo de upgrade** (`UpgradeDialog`), aberto pelo botão na aula trancada e
      no perfil. Nome, e-mail e WhatsApp já vêm preenchidos do perfil; o plano
      desejado já vem marcado com o tier que a aula exige; a aula de origem vai junto
      no e-mail, para a equipe saber do que o jogador está falando.
- [x] Vencimento no perfil **só quando existe**: hoje nenhum tier expira, e um "sem
      vencimento" fixo na tela seria ruído. O campo já está pronto para o dia em que
      houver cobrança recorrente — o `Expiration` do plugin continua agendado e sem
      nada para fazer enquanto ninguém tiver data.
- [x] Menu da área logada revisto: `/player` virou **Painel** (é o que ele sempre foi)
      e **Meu perfil** passou a apontar para a tela nova. A foto do jogador aparece no
      gatilho do menu e no card do painel.
- [x] Verificado: typecheck, lint, build e **37 casos em WordPress simulado** — 13 da
      aula relacionada (ACF, meta crua, campo com outro nome, aula em rascunho,
      apagada, relação para não-aula, lista com item inválido, ID escalar, objeto
      `WP_Post`, varredura ignorando `_thumbnail_id`) e 24 do perfil (campo ausente
      preservando o resto, campo vazio limpando, HTML removido, limites de tamanho,
      e-mail de outra conta recusado, o próprio e-mail não conflitando consigo, senha
      atual errada, senha curta).
- [x] Correções apontadas por você (20/09/2026), já no ar em 1.19.0:
      - **"Body exceeded 1 MB limit" ao enviar a foto**. O limite é do Next, não do
        WordPress: Server Action tem 1 MB de corpo por padrão, e um arquivo atravessa
        essa fronteira codificado, ocupando mais que o tamanho em disco. Subiu para
        **20 MB** (`serverActions.bodySizeLimit`), e o teto da foto no plugin foi
        junto. Se o PHP do servidor recusar antes (`upload_max_filesize`), a mensagem
        agora diz isso e mostra o limite real — antes dizia "nenhuma imagem recebida".
      - **"Faça login para editar o seu perfil" com você logado**. Era capability: a
        equipe não tem `access_player_area` — ela vive nas roles de tier —, então um
        administrador logado na área batia na porta fechada. Agora vale a mesma dupla
        do resto do plugin (`access_player_area` **ou** `edit_posts`), nas mutations e
        na rota da foto.
- [x] **Foto nas dúvidas da aula** (pedido em 20/09/2026), em 1.19.2: novo campo
      `authorAvatar` no comentário. Ele acompanha o `authorLabel`, e pelo mesmo
      motivo — a resposta da equipe sai em nome do instrutor da aula, então a cara
      dela é a **imagem destacada do instrutor**, e não a de quem digitou; a pergunta
      do jogador sai com a foto que ele enviou no perfil. Sem foto, voltam as
      iniciais. O campo devolve `null` de propósito em vez de usar `get_avatar_url()`
      do WordPress: aquele nunca volta vazio — sem Gravatar ele entrega a silhueta
      cinza, e a conversa viraria uma fileira delas.
- [x] Verificado no ar com o plugin 1.19.2 e o formulário 1147 no lugar.

**Etapa fechada por você em 20/09/2026.** O que ficou por testar no dia a dia, e
que só o uso mostra: o e-mail do pedido de upgrade chegando à caixa certa, e a
foto de perfil aparecendo nas dúvidas das aulas antigas (as que já tinham
comentários antes da 1.19.2).

**Fora do escopo, por decisão sua:** integração com gateway (Hotmart, Kiwify, Stripe,
Mercado Pago), e-mail de aviso de vencimento e página pública de planos. O gancho do
plugin (`Membership::set_tier()` e a action `prime_player_tier_changed`) continua de
pé para o dia em que houver cobrança.

**✅ Pronto quando:** o jogador edita o perfil e a foto, o pedido de upgrade chega no
e-mail da equipe, e a aula relacionada escolhida no painel aparece no post.

---

## Etapa 12 — Painel de acompanhamento ✅ concluída (20/09/2026, plugin 1.20.0)

**Decisões (20/09/2026):** as **duas visões, em abas** (acervo e jogadores); dúvidas
sem resposta com **destaque de ação**; e **exportação CSV das duas listas**.

**👤 Você**
- [x] Subir o plugin **1.20.0**.
- [x] Abrir **Prime Poker** no menu do painel e conferir se os números batem com o
      que você sabe da base → **tudo ok em 20/09/2026.**
- [x] Baixar os dois CSVs e abrir no Excel.

**🤖 Claude**
- [x] Menu **Prime Poker** no painel, com três abas: **Visão geral**, **Aulas** e
      **Jogadores**. A divisão é essa porque são três perguntas diferentes — "como vai
      o mês", "o que gravar em seguida" e "com quem falar" — e numa tela só nenhuma
      ficaria respondida.
- [x] **Dúvidas esperando resposta no topo da visão geral**, da mais antiga para a
      mais nova, com botão que abre o comentário direto para responder. É o único
      número do painel que pede uma ação hoje; o resto é acompanhamento.
- [x] Visão geral: jogadores, novos em 30 dias, ativos em 7 dias, sumidos há 30+,
      aulas publicadas, visualizações, conclusões e dúvidas em aberto. Mais a
      distribuição por plano e a tabela de notificações com **alcance e leitura**.
- [x] Aba **Aulas**: por aula, quem pode ver, visualizações, quantos começaram,
      quantos concluíram e dúvidas (com as em aberto destacadas). Clicando na aula,
      **a lista de quem assistiu**, separando quem começou de quem concluiu.
- [x] Aba **Jogadores**: nome, contato, plano, entrada, último estudo, concluídas, em
      andamento e sequência. O nome leva para a ficha do usuário no WordPress.
- [x] **Exportação CSV** das duas listas, do mesmo retrato que está na tela — a
      planilha nunca discorda do que a pessoa acabou de ver. Sai com `;` e BOM,
      porque o Excel em português lê o CSV com o separador da região e sem a BOM
      mostra os acentos como lixo.
- [x] **Uma passada só, com cache de 15 minutos** e botão "Atualizar agora". O
      progresso de cada jogador mora em user meta serializada, ótima para ler o
      progresso de UMA pessoa — que é o que o site faz o tempo todo — e péssima para
      perguntar "quem concluiu a aula 42": não há como o banco responder isso sem
      abrir a meta de todo mundo. Então abrimos uma vez, calculamos tudo e
      guardamos. Os jogadores são lidos em lotes de 200 para a memória não crescer
      com a base.
- [x] O cache se joga fora sozinho quando uma dúvida chega, um comentário muda de
      status, alguém se cadastra ou um tier muda. **Assistir aula não invalida**: é o
      evento mais frequente da área, e refazer a conta a cada play tiraria todo o
      sentido do cache.
- [x] **Duas permissões.** A tela pede `edit_posts` (a equipe); a aba de jogadores e
      o CSV deles pedem `list_users`, porque ali aparecem e-mail e WhatsApp de gente
      real — quem edita aulas não precisa disso para editar aulas.
- [x] `Questions::from_team()` virou pública: o painel precisa da **mesma** regra para
      separar dúvida de resposta. Uma segunda definição de "veio da equipe" contaria
      dúvidas em aberto que não existem — a réplica do próprio jogador, por exemplo,
      não fecha a dúvida dele.
- [x] "Podem ver" é o denominador da conclusão, e não o total de jogadores: cobrar
      audiência de quem nem tem o tier faria toda aula Platinum parecer um fracasso.
- [x] Verificado: **32 casos em WordPress simulado** — equipe fora da lista de
      jogadores, contagem por tier, ativos/sumidos/nunca estudou, aula em rascunho
      fora, conclusão sem posição contando como início, alcance por tier, recado
      individual alcançando uma pessoa mesmo pedindo Platinum, linha aberta pela
      equipe não contando como dúvida, réplica do próprio jogador não fechando a
      dúvida, e o cache servindo e sendo esquecido.

**Limite conhecido:** "último estudo" é o último dia em que a pessoa **abriu uma
aula**, não o último login. O WordPress não guarda data de login, e o site é
headless — quem entra pelo front nem passa pela tela de login do painel. Para ter
último acesso de verdade, o plugin precisaria gravar um carimbo a cada autenticação;
diga se vale a pena.

**✅ Pronto quando:** a equipe abre o painel, vê as dúvidas em aberto e baixa as duas
planilhas.

## Etapa 13 — Lançamento (master)

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
- [x] Varredura de mocks (20/09/2026): **nada de dado inventado sobrou** no front. Os
      `Set`/`Map` em memória de salvas, concluídas, dúvidas e notificações foram embora
      nas etapas 8, 9 e 10; a sequência fixa `7` e o `getContinueWatching` que devolvia
      `null` também. Não há `TODO`, `FIXME` nem conversa de exemplo no código. Sobrou
      só o que está listado abaixo.
- [ ] **Rodapé: Facebook, X e YouTube apontam para `#`** (`shared/footer/index.tsx`).
      Só o Instagram tem endereço. ⏳ Aguardando os links (20/09/2026). Enquanto isso
      os três ficam como estão — link para `#` é melhor que link para uma página que
      não existe, mas **não deve ir ao ar assim**.
- [x] Arquivos sem uso: **`ui/form/select-input.tsx` e `ui/form/text-area.tsx`
      apagados** (20/09/2026). Eram estilizados para o fundo claro da landing e nunca
      chegaram a ser usados; o que a área do jogador precisava virou o `dark-select`.
      **`ui/icon.tsx` ficou**: a nota antiga estava errada — ele é usado, só que
      indiretamente (home → `ui/loading.tsx` → `Icon`).
- [ ] Rodar `typecheck`, `lint` e `build` uma última vez antes do merge.
- [ ] Fazer o merge staging → master sem desfazer nada da master.
- [ ] Conferir no Bunny: `primepokerteam.com.br` nos *Allowed domains* e `localhost` removido.

**✅ Pronto quando:** tudo publicado em produção, com login, aulas e blog funcionando.

---

## Decisões em aberto (resumo dos ❓)

| # | Etapa | Decisão |
|---|---|---|
| ~~2~~ | 1 | ~~Nomes finais dos campos do formulário de inscrição~~ → confirmados |
| ~~3~~ | 1 | ~~Newsletter~~ → só e-mail |
| ~~4~~ | 2 | ~~Serviço/URL do feed do Instagram~~ → serviço próprio, URL fixa |
| ~~6~~ | 6 | ~~Onde hospedar os vídeos~~ → Bunny Stream |
| ~~7~~ | 6 | ~~Regra de acesso por tier e o que o bloqueado vê~~ → tier mínimo + cadeado |
| ~~8~~ | 6 | ~~Trilhas e níveis definitivos~~ → cliente cadastra as trilhas |
| ~~9~~ | 8 | ~~Regra da sequência de estudo~~ → conta o dia com qualquer aula aberta; conclusão automática aos 90% |
| ~~10~~ | 9 | ~~Quem responde as dúvidas, visibilidade e moderação~~ → equipe em nome do instrutor, visíveis para todos, sem moderação |
| ~~11~~ | 10 | ~~Tipos de notificação e direcionamento~~ → aula, resposta e aviso; por tier ou jogador |
| ~~12~~ | 11 | ~~Como o jogador muda de plano (manual ou gateway)~~ → manual, no painel |
| ~~13~~ | 11 | ~~Aviso de vencimento e destino do upgrade~~ → sem vencimento; upgrade por diálogo no CF7 |
