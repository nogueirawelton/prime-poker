# Plugins do WordPress

Plugins próprios do Prime Poker Team. Ficam versionados junto do front para
que a mudança no WP e a mudança no Next andem no mesmo commit — o schema
GraphQL é contrato entre os dois.

Esta pasta **não** faz parte do build do Next.js.

## `prime-poker`

Customizações do WordPress para o Prime Poker Team. Hoje cobre a área do
jogador; áreas novas entram como subpastas de `includes/`, cada uma no seu
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
- **Nenhum e-mail automático é enviado** nos cadastros pelo front — nem ao
  jogador (o padrão do WP pede para "definir a senha" que ele acabou de
  escolher) nem ao administrador. Os dois envios eram síncronos e respondiam
  por quase todo o tempo da mutation: o cadastro caiu de ~10s para ~1s.
  Para um e-mail de boas-vindas próprio, use o hook `prime_player_registered`.
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

### Desativação e desinstalação

Desativar remove só o agendamento do cron — roles e dados dos jogadores ficam.

Desinstalar remapeia todos os jogadores para `subscriber` **antes** de remover
as roles (remover sem remapear deixaria contas sem role nenhuma, capazes de
logar e de nada mais), e então apaga os metadados e a option de versão.

## Pendências no WordPress

Independentes deste plugin, mas necessárias para a área do jogador funcionar:

1. **Cadastro está desabilitado.** *Configurações → Geral → Qualquer pessoa
   pode se registrar*. Sem isso o `registerUser` responde
   `"User registration is currently not allowed."` e nenhuma conta é criada.
   O WPGraphQL lê essa option direto, sem filtro para contornar — não há como
   liberar só o cadastro via GraphQL. Ligar a option publica também o
   formulário nativo do `wp-login.php`, que este plugin passa a redirecionar
   para o front.
2. **Não há autenticação.** O schema não tem mutation de `login` — falta um
   plugin de JWT. Enquanto isso, o front não consegue abrir sessão e portanto
   não consegue ler o tier de ninguém.

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
