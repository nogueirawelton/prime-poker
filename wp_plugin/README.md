# Plugins do WordPress

Plugins próprios do Prime Poker Team. Ficam versionados junto do front para
que a mudança no WP e a mudança no Next andem no mesmo commit — o schema
GraphQL é contrato entre os dois.

Esta pasta **não** faz parte do build do Next.js.

## `prime-poker`

Customizações do WordPress para o Prime Poker Team. Hoje cobre a área do
jogador e as aulas; áreas novas entram como subpastas de `includes/`, cada uma no seu
sub-namespace.

### Tipos de Jogador

Cria e mantém os tiers da área do jogador: **Player Free**, **Player Basic**,
**Player Gold** e **Player Platinum**.

### Atualizando de uma versão anterior à 1.5.0

A pasta mudou de `prime-poker-players/` para `prime-poker/`. O WordPress
identifica um plugin ativo pelo caminho `pasta/arquivo.php`, então ele vai
tratar isto como um plugin novo e **desativar o antigo**: suba a pasta nova,
apague a antiga e ative "Prime Poker".

Nada é perdido nessa troca — roles, tiers e metadados vivem no banco, e a
desativação do plugin nunca os remove.

### Instalação

Copie `prime-poker/` para `wp-content/plugins/` (ou envie um zip da
pasta pelo painel) e ative. A ativação cria as quatro roles.

Não exige nenhuma configuração no `wp-config.php`.

### Tiers e capabilities

As capabilities são **cumulativas**: cada tier herda as do anterior.

| Tier | Slug da role | Capabilities |
|---|---|---|
| Player Free | `player_free` | `read`, `access_player_area`, `view_content_free` |
| Player Basic | `player_basic` | + `view_content_basic` |
| Player Gold | `player_gold` | + `view_content_gold` |
| Player Platinum | `player_platinum` | + `view_content_platinum` |

**Gate por capability, nunca por nome de role.** Pergunte "pode ver conteúdo
gold?" (`user_can( $user, 'view_content_gold' )`), não "é gold ou platinum?".
É o que permite inserir um tier no meio da hierarquia depois sem revisar
nenhuma condicional — no PHP ou no Next.

`access_player_area` está em todos os tiers e responde "esta pessoa é
jogador?" independentemente do plano.

### Como mexer nos tiers

1. Edite `DEFINITIONS` em `includes/Players/Tiers.php` — é a fonte de verdade única.
2. **Suba `ROLES_VERSION`** em `prime-poker.php`.

O passo 2 não é opcional. Roles do WordPress moram no banco
(`wp_options.wp_user_roles`), não no código: sem a troca de versão a alteração
nunca chega ao banco e o ambiente segue com as roles antigas, sem erro nenhum.

Slugs são permanentes. Renomear um deixa os usuários existentes com uma role
órfã que não concede nada — silenciosamente.

### API

```php
use PrimePoker\Players\Membership;
use PrimePoker\Players\Tiers;

Membership::get_tier( $user_id );                    // 'player_gold' | null
Membership::set_tier( $user_id, Tiers::GOLD, $ts );  // $ts = expiração UTC, ou null
Membership::expires_at( $user_id );                  // timestamp | null
Membership::is_expired( $user_id );
Membership::has_at_least( $user_id, Tiers::BASIC );
```

Toda troca de tier deve passar por `set_tier()`: é o único ponto que mantém
role e metadados coerentes e dispara o hook de mudança.

### Hooks

| Hook | Tipo | Para quê |
|---|---|---|
| `prime_player_tier_changed` | action | Integrações: e-mail transacional, CRM, gateway. Recebe `$user_id, $novo, $anterior, $origem`. |
| `prime_player_registered` | action | Cadastro novo pelo front. Ponto para um e-mail de boas-vindas próprio. |
| `prime_players_tiers` | filter | Acrescentar tiers sem editar o plugin. |
| `prime_players_default_tier` | filter | Tier de entrada de um cadastro novo. |
| `prime_players_expiration_tier` | filter | Para onde rebaixar quem venceu. |
| `prime_players_admin_redirect_url` | filter | Destino do jogador que tenta abrir o `wp-admin`. |
| `prime_players_signup_redirect_url` | filter | Destino de quem abrir o formulário de cadastro do WP. |
| `prime_players_token_ttl` | filter | Validade do authToken JWT, em segundos (padrão 3600). |
| `prime_players_suppress_signup_emails` | filter | Devolver `false` para reativar os e-mails padrão do WP no cadastro. |

### GraphQL

Campos acrescentados ao tipo `User`: `playerTier`, `playerTierLabel`,
`playerTierExpiresAt`. Visíveis apenas para o próprio usuário e para quem tem
`list_users` — tier é informação comercial.

Para gatear conteúdo no front, prefira o campo `capabilities` que o WPGraphQL
já expõe, pelo mesmo motivo da seção acima.

### Comportamentos automáticos

- **Cadastro novo entra como Player Free.** Feito no `user_register`, não pela
  option `default_role`: o `registerUser` do WPGraphQL ignora a role enviada na
  mutation e força o padrão do site. A role padrão (`subscriber`) é removida.
- **Os e-mails padrão do WordPress não são enviados** nos cadastros pelo front
  — nem ao jogador (o padrão do WP pede para "definir a senha" que ele acabou
  de escolher) nem ao administrador. O jogador recebe o de boas-vindas próprio. Os dois envios eram síncronos e respondiam
  por quase todo o tempo da mutation: o cadastro caiu de ~10s para ~1s.
- **O authToken JWT vale 1 hora** em vez dos 300s padrão do
  wp-graphql-jwt-authentication. O front renova sozinho, mas cada renovação é
  uma ida ao WordPress: a 300s isso acontecia a cada 5 minutos de navegação.
  Só se aplica se o plugin JWT estiver instalado.
- **`wp-login.php?action=register` redireciona para a tela de login**, fechando
  a segunda porta de cadastro que a option `users_can_register` publica. Para
  levar ao formulário do front, use `prime_players_signup_redirect_url` e some
  o host a `allowed_redirect_hosts` — o `wp_safe_redirect()` recusa host
  externo.
- **Contas de equipe não recebem tier.** Um usuário criado pelo painel com
  outra role passa batido.
- **Cron diário rebaixa tiers vencidos** para Player Free, em lotes de 200.
- **Jogadores não entram no `wp-admin`.** Quem também é da equipe (tem
  `edit_posts`) continua com acesso normal.

### E-mails do site

Layout único em `includes/Mail/Layout.php` (HTML com tabelas e estilos inline,
sem imagem). O endereço do site para os links sai de `includes/Front.php`: o
front informa o próprio endereço no cabeçalho `X-Prime-Front-Url`, aceito só
se estiver em *Configurações → Cache do site*; senão vale o **primeiro** da
lista.

#### Boas-vindas

`includes/Players/Welcome.php`. Sai para quem se cadastra **pelo front**
(quem é criado pelo painel recebe a notificação normal do WordPress).

- Enviado no `shutdown`, depois de `fastcgi_finish_request()` quando existir:
  a resposta do cadastro chega ao front antes do envio, e o nome gravado pelo
  WPGraphQL (depois do `prime_player_registered`) já está disponível.
- Saudação pelo primeiro nome, tier inicial e botão para `{site}/login/`.
- Filtro `prime_players_send_welcome_email` para desligar.

### Redefinição de senha

`includes/Players/PasswordReset.php`. Vale para o `sendPasswordResetEmail` do
WPGraphQL, o "Perdeu a senha?" do `wp-login.php` e o "Enviar redefinição de
senha" da lista de usuários — os três passam pelos mesmos filtros do núcleo.

- **E-mail em HTML** (layout comum), botão e link de reserva, apontando para
  `{site}/redefinir-senha/?key=…&login=…`. Sem nenhum endereço configurado,
  o e-mail padrão do WordPress é mantido.
- A lista de endereços permitidos impede que alguém peça a redefinição de uma
  conta alheia informando o próprio domínio e receba a chave pelo e-mail
  legítimo.
- **Sessões encerradas ao trocar a senha** (redefinição ou painel): o segredo
  JWT do usuário é regenerado. O plugin JWT grava esse segredo no refresh
  token, mas só confere se ele foi *revogado*, nunca se ainda é o atual — por
  isso o filtro `graphql_jwt_auth_validate_token` passa a recusar refresh
  token com segredo antigo. O access token em uso vale até expirar (1 hora).

### Aulas

`includes/Lessons/`. CPT `aula` (GraphQL `aula`/`aulas`) e taxonomia `trilha`
(GraphQL `trilha`/`trilhas`). Os slugs são dados gravados no banco: não
renomear.

**Registro pelo ACF**, como os outros CPTs do site: `wp_plugin/acf/aulas.json`
traz o tipo, a taxonomia e os dois grupos de campos. Importar em
*ACF → Ferramentas → Importar*. O plugin cuida só do comportamento (acesso,
GraphQL, vídeo, validações).

- Editor **clássico** (`show_in_rest` desligado no JSON). Ligar "Show in REST
  API" no painel troca para o editor de blocos; o plugin continua fechando
  `/wp/v2/aula` para quem não é da equipe.
- Os campos ficam editáveis no painel, mas o código lê as metas pelo **nome**
  e valida pela **chave**. Renomear um campo não dá erro — o valor só some do
  site. Por isso `Fields::problems()` confere chaves e nomes e mostra um aviso
  vermelho nas telas de aulas, trilhas e do ACF quando algo não bate (ou quando
  o JSON não foi importado).
- **Importar o JSON antes de subir o front.** Campo novo no `aulas.json` é
  contrato: o front consulta os campos pelo nome, e um campo que ainda não
  existe no WordPress derruba o build (a consulta de trilhas é feita na
  geração das páginas).
- Mudou algo de propósito no painel? Exporte de novo (*ACF → Ferramentas →
  Exportar*, os 4 itens) e substitua o `aulas.json`, para o repositório não
  ficar para trás.

| Grupo (GraphQL) | Campo (meta) | No GraphQL do ACF | Observação |
|---|---|---|---|
| `lessonFields` | `instructor` | sim | Post Object → Instrutor |
| | `level` | sim | `iniciante`, `intermediario`, `avancado` |
| | `duration` | não | Digitada `25:30` ou `1:05:00`, gravada em segundos. Sai em `Aula.duration` |
| | `minimum_tier` | não | Sai em `Aula.minimumTier`; vazio ou inválido vale Player Free |
| | `video_provider` | não | Hoje só `bunny` (Bunny Stream) |
| | `video_id` | não | Video ID do Bunny (GUID) ou link do player; validado ao salvar |
| | `materials` (`name`, `file`) | não | Repeater; sai em `Aula.materials` |
| `trackFields` | `badge` | sim | Selo curto; vazio usa o nome da trilha |
| | `icon` | sim | Nome do ícone no Phosphor (`strategy`, `brain`…) para a sidebar; vazio mostra a bolinha da cor |
| | `color` | sim | Seletor de cor (hex). O front usa no selo, na bolinha da barra lateral e no degradê da capa; o texto do selo vira preto ou branco conforme o brilho da cor |
| | `order` | sim | Posição no filtro |

Vídeo, materiais e tier mínimo ficam **fora** do GraphQL do ACF de propósito:
por lá qualquer jogador leria o vídeo de qualquer aula.

**Acesso** (`Lessons/Access.php`):

- **Ver a aula** (título, trilha, duração, capa): qualquer jogador
  (`access_player_area`) ou equipe (`edit_posts`). Visitante não vê nada no
  GraphQL (filtro `graphql_data_is_private`) nem no REST (`/wp/v2/aula` só para
  a equipe; o REST continua ligado por causa do editor de blocos).
- **Assistir** (`video`, `materials`): só com a capability do tier mínimo
  (`view_content_gold` para uma aula gold — cumulativa, então platinum também
  passa). Para os outros os campos voltam `null`: o dado não sai do WordPress.
- O CPT é `public` porque o WPGraphQL trata como privado, para quem não tem
  `edit_posts`, todo post de tipo não público. Não há página no WordPress
  (`publicly_queryable` falso, sem rewrite) e a aula fica fora dos sitemaps do
  WordPress e do Yoast.
- Os arquivos de material ficam em `wp-content/uploads`, com URL pública: o
  gate esconde o link, mas quem já tem o link baixa sem login.
- **Slug numérico é trocado pelo título ao salvar.** Aula publicada antes de
  ter título recebe o ID como slug, e o painel não mostra o campo de slug (a
  aula não tem página no WordPress). Além de feio na URL, o `aula(idType:
  SLUG)` do WPGraphQL não encontra slug numérico — a aula dava 404 no site.

**Vídeo (Bunny Stream)** (`Lessons/Bunny.php`). No `wp-config.php`:

```php
define( 'PRIME_POKER_BUNNY_LIBRARY_ID', '123456' );   // Stream → biblioteca → API → Library ID
define( 'PRIME_POKER_BUNNY_TOKEN_KEY', '…' );         // Stream → biblioteca → Security → Token authentication key
```

- `Aula.video.url` é o link do player (`iframe.mediadelivery.net/embed/…`)
  assinado com `token = SHA256(chave + id do vídeo + expires)`, válido por 6
  horas. Só é gerado para quem pode assistir; a chave nunca sai do servidor.
- Na biblioteca do Bunny, ligar **Embed view token authentication** — sem
  isso o link funciona mesmo sem token — e restringir os **domínios
  permitidos** ao site (produção e staging).
- Sem `LIBRARY_ID`, `url` volta `null`; sem `TOKEN_KEY`, o link sai sem
  assinatura. Nos dois casos o painel mostra um aviso nas telas de aulas.

**GraphQL:**

```graphql
aulas(first: 12, where: {
  offset: 12, search: "icm", track: "torneios", instructor: 42,
  from: "2026-09-01", to: "2026-09-19", sort: MOST_VIEWED
}) { nodes { databaseId slug title canWatch minimumTier minimumTierLabel
             duration viewCount video { provider id url } materials { name url fileSize mimeType }
             watchedSeconds saved completed
             lessonFields { level instructor { nodes { databaseId ... on Instrutor { title } } } }
             trilhas { nodes { slug name trackFields { badge color icon order } } } } }

lessonsTotal(search: "icm", track: "torneios", instructor: 42, from: "…", to: "…")

continueWatching { slug title watchedSeconds duration }
viewer { studyStreak }

mutation { registerLessonView(input: { lessonId: 123 }) { viewCount } }
mutation { registerLessonProgress(input: { lessonId: 123, seconds: 340 }) { watchedSeconds completed } }
mutation { toggleLessonSaved(input: { lessonId: 123 }) { saved } }
mutation { toggleLessonCompleted(input: { lessonId: 123 }) { completed } }
```

- `lessonSuggestion(subject, track, postId)`: a **única leitura pública** de
  aulas, para o post do blog divulgar uma aula. Devolve só `slug`, `title`,
  `instructor` (nome) e `duration`.
  - Com `postId`, **a escolha do painel vem primeiro**: o campo *Aula
    relacionada* do post (ACF `relatedlesson`). Ela precisa passar por aqui
    porque a relação lida direto do ACF volta vazia para visitante — a aula é
    privada, e quem lê o blog não está logado.
  - Sem escolha (ou com a aula despublicada), cai no palpite: a aula publicada
    com mais palavras do título em comum com o assunto (siglas de 3 letras como
    ICM contam; palavras vazias não). A trilha de mesmo slug desempata. Sem
    palavra em comum: `null`.
- Filtro `level`: `iniciante`, `intermediario` ou `avancado`.
- Filtro `tier`: slug do tier mínimo da aula (`player_gold`). A lista para o
  select sai de `playerTiers { slug label }`, pública — os nomes já aparecem
  no selo de cada aula trancada.
- `sort`: `NEWEST` (padrão), `OLDEST`, `MOST_VIEWED`, `SHORTEST`, `LONGEST`.
  Filtro vazio ou malformado (data inexistente, offset negativo) é ignorado.
- `lessonsTotal` devolve 0 para quem não é jogador.
- Visualizações em `_prime_poker_views` (toda aula nasce com 0, para não sumir
  da ordem `MOST_VIEWED`). O mesmo jogador conta uma vez a cada 12 horas por
  aula.

**Progresso do jogador** (`includes/Lessons/Progress.php`)

Tudo em user meta, em arrays indexados pelo ID da aula — a listagem inteira
lê o estado de uma vez só:

| Meta | Guarda |
| --- | --- |
| `_prime_poker_position` | onde parou em cada aula, em segundos |
| `_prime_poker_position_at` | quando foi esse último avanço |
| `_prime_poker_completed` | quando concluiu cada aula |
| `_prime_poker_saved` | quando salvou cada aula |
| `_prime_poker_uncompleted` | aulas desmarcadas na mão |
| `_prime_poker_study_days` | dias em que estudou (últimos 400) |

- **Salvar vale para aula trancada** — é a lista de desejos de quem ainda vai
  pedir upgrade. **Concluir e curtir, não**: as duas mutations exigem poder
  assistir, porque concluir uma aula trancada contaria no progresso da trilha
  sem ela ter sido vista.
- **Conclusão automática aos 90%** da duração cadastrada. Aula sem duração no
  painel nunca conclui sozinha — não há como saber o que são 90%.
- Desmarcar na mão também **desliga a conclusão automática** daquela aula,
  senão o próximo aviso do player marcaria tudo de novo. Marcar na mão religa.
- A posição segue o vídeo, inclusive para trás: voltar para rever um trecho e
  sair retoma dali.
- **Sequência de estudo**: conta o dia em que o jogador abriu qualquer aula
  que pode assistir, no fuso do site. Quem estudou ontem mantém a sequência
  até o fim do dia de hoje; dois dias parado zera.
- Aula apagada no painel não é limpa das metas (varrer todos os jogadores
  sairia caro); a leitura ignora ID que não existe mais.

**Dúvidas nas aulas** (`includes/Lessons/Questions.php`)

São **comentários do WordPress** no CPT aula — moderação, resposta e exclusão
saem de graça no painel de sempre, em *Comentários*.

- **Quem responde é a equipe, em nome do instrutor**: a resposta escrita **no
  painel** por quem tem `edit_posts` aparece com o nome do Instrutor cadastrado
  na aula. Aula sem instrutor assina com o nome de quem escreveu.
- O que separa pergunta de resposta é **por onde o comentário entrou**, não
  quem escreveu: o que vem pelo site ganha a meta `_prime_poker_question`.
  Sem isso, alguém da equipe que estudasse uma aula e perguntasse pelo site
  veria a própria pergunta assinada pelo instrutor.
- **Todos os jogadores da aula veem** as dúvidas; visitante anônimo não vê
  nada (nem no GraphQL, nem em `/wp/v2/comments`, que fica fechado para quem
  não é da equipe).
- **Sem moderação prévia**: a dúvida aparece na hora. Spam marcado por plugin
  continua spam.
- Perguntar exige **poder assistir** à aula, não só vê-la.
- No `Comment`, o plugin acrescenta `text` (texto puro, sem o HTML do
  `content`), `authorLabel` (o nome a exibir) e `isInstructor`.
- **Responda pelo botão "Responder"** do comentário, não criando um
  comentário novo: é o `comment_parent` que prende a resposta à pergunta na
  tela do jogador. Os comentários aninhados ficam ligados à força pelo plugin
  (`option_thread_comments`), porque sem isso o Responder do painel soltaria a
  resposta no fim da lista.
- O site mostra a conversa em um nível: resposta de resposta aparece embaixo
  da pergunta original.
- O jogador também responde **pelo site**, dentro da conversa (a mutation
  aceita `parentId`, conferido contra a aula). A resposta dele continua
  marcada como pergunta, então não sai assinada pelo instrutor. No site, o
  botão só aparece na resposta do instrutor a uma dúvida do próprio jogador
  (campo `isMine`): a ideia é continuar a sua dúvida, não conversar na dos
  outros.
- **Curtidas** (`likeCount` / `liked`, mutation `toggleQuestionLike`) valem
  para qualquer mensagem e guardam os IDs de quem curtiu em
  `_prime_poker_likes` — uma por jogador, com desfazer.

```graphql
aula(id: "aula-01", idType: SLUG) {
  comments(first: 100, where: { order: ASC, orderby: COMMENT_DATE }) {
    nodes { databaseId date text authorLabel isInstructor }
  }
}

mutation { askLessonQuestion(input: { lessonId: 123, text: "..." }) { commentId } }
```

### Notificações

CPT `notificacao` (JSON do ACF em `wp_plugin/acf/notificacoes.json`) com os
módulos em `includes/Notifications/`. O CPT **não é exposto no GraphQL**: o
front lê pelo tipo `PlayerNotification`, que já aplica o público-alvo. Um CPT
aberto com um filtro por cima seria uma porta a mais para esquecer de trancar.

**Três tipos**, decididos em 20/09/2026: `aviso` (escrito por você no painel),
`aula` e `suporte` (criados sozinhos — ver abaixo).

**Quem recebe cada aviso:**

| Preenchido | Vai para |
| --- | --- |
| Nada | todos os jogadores |
| Tier mínimo | aquele tier para cima, pela capability acumulada |
| Jogador | só ele — e o tier é ignorado |

A equipe (`edit_posts`) alcança todos os tiers, para conferir o que publicou.

**Automáticas:**

- **Aula publicada** → aviso para quem tem o tier da aula, com link para ela.
  Só na passagem *para* publicada: salvar de novo uma aula já no ar não avisa
  ninguém outra vez.
- **Dúvida respondida** → aviso para quem perguntou, quando a resposta vem da
  equipe. A réplica do próprio jogador na conversa não notifica.

**Lidas** ficam em user meta (`_prime_poker_read_notifications`), não no post:
a mesma notificação é lida por um jogador e não por outro. "Marcar todas"
marca só o que aquele jogador enxerga.

```graphql
myNotifications(filter: UNREAD, first: 20) { id type title description date read href }
notificationsUnread

mutation { markNotification(input: { notificationId: 12, read: true }) { unread } }
mutation { markAllNotificationsRead(input: {}) { unread } }
```

### Revalidação do cache do front

O Next guarda as respostas do GraphQL em cache por horas. O módulo
`includes/Cache/Revalidation.php` avisa o front a cada mudança, chamando
`GET {site}/api/revalidate/?tag=…&tag=…` em cada endereço configurado.

**Configuração:** *Configurações → Cache do site* → um endereço por linha
(produção e staging), sem caminho. Só administradores.

**Limpeza manual:** botão **Limpar cache** na barra superior do WordPress (e
**Limpar cache agora** na tela de configurações). Limpa tudo em todos os
endereços e volta para a tela onde a pessoa estava, com um aviso do retorno de
cada endereço. Disponível para editores e administradores
(`edit_others_posts`).

| Mudança no WP | Tags enviadas |
|---|---|
| Post publicado, editado, despublicado, na lixeira ou excluído | `posts`, `categories` |
| Página `home` | `home`, `seo` |
| Outras páginas | `seo` |
| Instrutor (`instructor`) | `home`, `lessons` |
| Depoimento (`testimonial`) | `home` |
| Aula (`aula`) | `lessons` |
| Trilha criada, editada ou excluída | `lessons` |
| Categoria criada, editada ou excluída | `categories`, `posts` |
| Tag criada, editada ou excluída | `home` |
| Comentário aprovado, editado, reprovado ou excluído | `comments:<ID do post>` |
| Qualquer outro tipo com "Show in GraphQL" | `cms` (limpa tudo) |

- Só dispara para o que o site exibe: salvar um rascunho não chama o front.
- As tags de uma requisição são acumuladas e enviadas **uma vez**, no
  `shutdown`, sem bloquear quem clicou em "Publicar". Uma falha na chamada
  nunca impede a publicação — no pior caso o conteúdo aparece quando o cache
  vencer sozinho.
- As tags são contrato com `src/lib/cache-tags.ts`: renomear lá exige renomear
  aqui. Um CPT novo cai em `cms` até ganhar o próprio mapeamento em
  `tags_for_post()`.
- Filtro `prime_poker_revalidate_tags` para acrescentar ou remover tags.

### Desativação e desinstalação

Desativar remove só o agendamento do cron — roles e dados dos jogadores ficam.

Desinstalar remapeia todos os jogadores para `subscriber` **antes** de remover
as roles (remover sem remapear deixaria contas sem role nenhuma, capazes de
logar e de nada mais), e então apaga os metadados, a option de versão e os
endereços da revalidação de cache.

## Pendências no WordPress

Independentes deste plugin, mas necessárias para a área do jogador funcionar:

1. **Cadastro está desabilitado.** *Configurações → Geral → Qualquer pessoa
   pode se registrar*. Sem isso o `registerUser` responde
   `"User registration is currently not allowed."` e nenhuma conta é criada.
   O WPGraphQL lê essa option direto, sem filtro para contornar — não há como
   liberar só o cadastro via GraphQL. Ligar a option publica também o
   formulário nativo do `wp-login.php`, que este plugin passa a redirecionar
   para o front.
2. ~~**Não há autenticação.**~~ Resolvido: o WPGraphQL JWT Authentication
   está instalado e o `login` responde (verificado em 16/09/2026).

## Como o cadastro via WPGraphQL funciona

O `registerUser` não cria o usuário sozinho: delega ao `register_new_user()` do
núcleo, escrito para o formulário do `wp-login.php`. A ordem real importa:

1. `wp_create_user()` com senha **aleatória** → dispara `user_register`, onde o
   plugin atribui o tier inicial;
2. o núcleo grava o aviso `default_password_nag` — o plugin apaga;
3. `register_new_user` dispara e o WP enviaria dois e-mails — o plugin suprime
   ambos;
4. só então o WPGraphQL chama `wp_update_user()` com nome, sobrenome e a senha
   escolhida.

Duas consequências que o front aproveita:

- O passo 4 vem **depois** do `user_register`, e o WPGraphQL remove a role dos
  dados antes de chamá-lo — por isso o tier do passo 1 sobrevive.
- Antes de montar a resposta, o WPGraphQL chama `wp_set_current_user()` com o
  usuário recém-criado. É isso que faz `playerTier` resolver na própria
  mutation, mesmo num cadastro anônimo.
