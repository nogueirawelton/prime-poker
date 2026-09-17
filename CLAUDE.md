@AGENTS.md

# Idioma do código

**Todo código é exclusivamente em inglês.** Vale para variáveis, funções, parâmetros, tipos, interfaces, propriedades, props, componentes, nomes de arquivos e pastas de código, constantes, classes e métodos PHP, variáveis PHP, chaves de arrays internos e nomes de campos de formulário (`name="password"`, `formData.get("password")`).

Continuam em português, por decisão do projeto:

- **Comentários** e documentação (`*.md`).
- **Textos exibidos ao usuário** (JSX, toasts, e-mails, mensagens de erro).
- **Rotas e URLs públicas**: pastas de `src/app` (`/player/aulas`, `/cadastro`, `/redefinir-senha`, `/blog/categoria`…) e âncoras (`#quem-somos`).
- **Valores que aparecem na URL ou vêm de dados**: nomes e valores de parâmetros (`?filtro=nao-lidas`, `?ordem=recentes`, `?de=`/`?ate=`), slugs de trilha (`mental-game`), níveis (`iniciante`), tipos de notificação (`aula`, `aviso`). Mapas indexados por esses valores mantêm as chaves em português.
- **Contratos externos**: campos do Contact Form 7 (`nome_completo`, `numero_whatsapp`…), campos ACF/GraphQL, hooks, options e metas já gravados no WordPress.

Ao criar ou renomear algo, traduza o nome — nunca o valor que trafega na URL ou no banco.
