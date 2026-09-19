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
- [] ❓ Avisar a equipe (admin) a cada cadastro novo? Hoje ninguém é notificado — **em aberto, não bloqueia**.
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

## Etapa 6 — Aulas: estrutura no WP 🟡 código pronto (19/09/2026) — falta a sua parte

Substitui o mock de `services/lessons.ts` e `services/lesson-detail.ts`.

**👤 Você**
- [x] ❓ **Hospedagem dos vídeos** → **Google Drive + player próprio**. O Drive vira
      armazenamento; o site toca o arquivo no player dele (com progresso, etapa 8), e o
      acesso é conferido no servidor. Aceito: sem qualidade adaptativa e sujeito à cota
      diária de downloads do Drive. O campo `video_provider` permite migrar (Panda/Bunny)
      depois sem mudar o schema.
- [x] ❓ **Regras de acesso** → **tier mínimo por aula + card com cadeado** e convite ao
      upgrade para quem está abaixo. Vídeo e materiais nunca saem do WP para ele.
- [x] ❓ **Trilhas** → **o cliente cadastra** no painel (nome, selo, cor, ordem). Nenhuma
      vem pronta. Níveis fixos: Iniciante, Intermediário, Avançado.
- [x] ~~Importar o JSON do ACF~~ → **dispensado**: os campos são registrados pelo próprio
      plugin (aparecem no ACF como grupos "locais", sem edição).
- [ ] Commit + push na `staging`.
- [ ] Subir o plugin **1.10.0** no WP. Conferir que aparecem os menus **Aulas** e
      **Aulas → Trilhas**, e na tela da aula o bloco **Dados da aula**.
- [ ] Cadastrar as trilhas (em *Aulas → Trilhas*): nome, selo (opcional), cor e ordem.
- [ ] Juntar os vídeos numa **pasta do Drive** só para as aulas (a etapa 7 vai
      compartilhá-la com uma conta de serviço do Google — ainda não precisa mexer em
      permissão).
- [ ] Cadastrar **pelo menos 3 aulas de teste** completas (título, descrição, trilha,
      imagem destacada, instrutor, nível, duração, tier mínimo, link do Drive, materiais),
      com **tiers mínimos diferentes** (uma free, uma gold, uma platinum).
- [ ] Me avisar: eu rodo a verificação real com os 4 usuários de teste.

**🤖 Claude**
- [x] Plugin `includes/Lessons/` (em inglês, pela regra do projeto; os slugs `aula` e
      `trilha` são dados e ficam em português):
      - `Content.php`: CPT `aula` (editor, imagem, resumo, comentários, revisões) e
        taxonomia `trilha` (hierárquica, seletor em caixas). Sem página no WP e fora dos
        sitemaps do WordPress e do Yoast.
      - `Fields.php`: grupos ACF `lessonFields` e `trackFields` registrados em código.
        Duração digitada `25:30`/`1:05:00` e gravada em segundos (ordenação numérica);
        link do Drive validado ao salvar (aceita link de compartilhamento ou ID).
      - `Access.php`: visitante não vê aulas no GraphQL nem no REST; jogador de qualquer
        tier vê a listagem; assistir exige a capability do tier mínimo (equipe vê tudo).
      - `GraphQL.php`: `where` com `offset`, `track`, `instructor`, `from`/`to`, `sort`
        (`NEWEST`, `OLDEST`, `MOST_VIEWED`, `SHORTEST`, `LONGEST`); `lessonsTotal`; na
        `Aula`: `canWatch`, `minimumTier(Label)`, `duration`, `viewCount` e os protegidos
        `video { provider id }` e `materials { name url fileSize mimeType }`
        (`null` sem acesso); mutation `registerLessonView`.
      - `Views.php`: visualizações em meta, 1 por jogador a cada 12h por aula.
- [x] **Conferido no código do WPGraphQL:** CPT não público vira privado para quem não
      tem `edit_posts` — por isso a aula é `public` e o gate fica no `graphql_data_is_private`.
      E o filtro de query roda depois do WPGraphQL, então a ordenação própria não é sobrescrita.
- [x] Revalidação: aula e trilha → tag nova `lessons` (antes cairiam em `cms`, que limpa
      tudo); instrutor → `home` + `lessons`. Tag aceita pelo front (`lib/cache-tags.ts`).
- [x] `Tiers::content_capability()` para achar a capability de um tier sem repetir a lista.
- [x] Testes com WP simulado (119 cenários de aulas + revalidação): acesso por tier nas
      7 combinações de usuário × 4 aulas, visitante/assinante escondidos no GraphQL e no
      REST, filtros e ordens, datas inválidas ignoradas, vídeo e materiais só com acesso,
      anexo apagado some da lista, formatos de link do Drive, dedupe de visualização,
      conversão e validação da duração. `php -l`, typecheck e lint OK.
- [x] README do plugin: seção **Aulas** e tabela de revalidação.
- [ ] Após você cadastrar: verificação real no WP com os 4 usuários (free não recebe o
      vídeo da aula gold; filtros, ordens e `lessonsTotal` batem).

**⚠️ Para a etapa 7 (vídeo no Drive):** o Drive só entrega o arquivo com um token do
Google no **cabeçalho** da requisição, e o `<video>` do navegador não manda cabeçalho. O
jeito seguro é a rota do Next buscar o vídeo no Drive e repassar ao navegador — só que aí
**o tráfego do vídeo passa pela Vercel** (cobrado por GB acima da franquia). Antes de
implementar, faço um teste com um vídeo real para medir e te trago o custo estimado.
O redirect direto para o Drive, que eu tinha citado, exigiria o arquivo público "qualquer
pessoa com o link" — aí o link vaza. Você decide com os números na mão.

**✅ Pronto quando:** a query `aulas` devolve as aulas de teste com filtros e ordenação,
e um usuário free não recebe o vídeo de uma aula gold.

---

## Etapa 7 — Aulas: front ligado no WP

**👤 Você**
- [ ] Testar em staging com os usuários de cada tier e me dizer o que ficou estranho.

**🤖 Claude**
- [ ] `services/lessons.ts`: trocar o acervo gerado por queries (`listLessons`, `getLessonBySlug`,
      `getCatalog`, `getSuggestedLesson`), mantendo as assinaturas — os componentes não mudam.
- [ ] Trilhas e instrutores do filtro vindos do WP (hoje `TRACKS` e `INSTRUCTORS` são fixos).
- [ ] Converter a chave de `cor` da trilha nas classes do selo e do gradiente da capa.
- [ ] `lesson-card.tsx`: usar a imagem destacada no lugar do gradiente provisório.
- [ ] Vídeo do Drive: conta de serviço do Google (`GOOGLE_SERVICE_ACCOUNT_*` na Vercel),
      rota `/api/aulas/[slug]/video` que confere o acesso no WP (`canWatch`) e entrega o
      arquivo com suporte a *range* (arrastar a barra). Medir o custo de banda antes (ver
      aviso da etapa 6).
- [ ] `aulas/[slug]/page.tsx`: passar a rota do vídeo para o `LessonPlayer` (hoje nunca
      passa) e usar a descrição do editor.
- [ ] Materiais com link de download real (tamanho vindo da media library).
- [ ] Estado de "sem acesso": card com cadeado e selo do tier mínimo (`minimumTierLabel`);
      na página da aula, o player vira o convite ao upgrade (destino decidido na etapa 11).
- [ ] `lesson-card.tsx`: implementar o menu de ações ⋮ (salvar, marcar como assistida,
      compartilhar) — TODO no código.
- [ ] Post do blog → "aula sugerida" usando as aulas reais.
- [ ] Contabilizar a visualização ao abrir a aula (`registerLessonView`).
- [ ] Trilhas e instrutores do filtro cacheados sob `lessons`; a lista de aulas é por
      jogador (`canWatch`) e usa `authQuery`, sem cache.

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
- [ ] `services/lesson-detail.ts` e `services/profile.ts`: remover os `Set`/`Map` em memória
      e a sequência fixa `7` (TODO).
- [ ] `LessonPlayer`: enviar o progresso periodicamente (a cada ~15s e ao pausar/sair)
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
- [ ] `sendQuestion` e a listagem de dúvidas usando os comentários reais (via `authMutate`).
- [ ] Remover a conversa de exemplo (`initialQuestions`).
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
- [ ] `services/notifications.ts` e `actions/notifications.ts` ligados no WP; sino, painel
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
| ~~6~~ | 6 | ~~Onde hospedar os vídeos~~ → Google Drive + player próprio |
| ~~7~~ | 6 | ~~Regra de acesso por tier e o que o bloqueado vê~~ → tier mínimo + cadeado |
| ~~8~~ | 6 | ~~Trilhas e níveis definitivos~~ → cliente cadastra as trilhas |
| 9 | 8 | Regra da sequência de estudo |
| 10 | 9 | Quem responde as dúvidas, visibilidade e moderação |
| 11 | 10 | Tipos de notificação e direcionamento |
| 12 | 11 | Como o jogador muda de plano (manual ou gateway) |
| 13 | 11 | Aviso de vencimento e destino do upgrade |
