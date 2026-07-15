# SiteMath

Biblioteca em inicialização para executar a linguagem SiteMath no cliente e permitir a detecção precisa de blocos válidos durante o build de um gerenciador de conteúdo.

O contrato atual está em [RCF.md](RCF.md). O estado técnico em andamento está em [handoff.md](handoff.md). O runtime v0.1 é cliente e sem dependências de produção; não há publicação remota.

## Operação local

O projeto requer Node.js 20 ou superior. Os comandos disponíveis nesta inicialização são exclusivamente operacionais:

- `npm run build`
- `npm test`
- `npm run check`
- `npm run dev`
- `npm run test:targets:web`
- `npm run test:targets:jekyll`
- `npm run test:targets`
- `npm run agent:setup`
- `npm run agent:doctor`
- `npm run agent:handoff`
- `npm run agent:status`

O desenvolvimento ocorre em `dev`; não há upstream configurado e nenhum push deve ser feito até nova orientação.

## Matriz de desenvolvimento

As fixtures em `tests/targets/` verificam o artefato `dist/sitemath.js` em HTML estático, Vite JavaScript, Vite TypeScript, Vite React, Vite Preact e Jekyll com Markdown. Cada alvo possui uma página declarada e uma página controle sem declaração. Vite, TypeScript, React, Preact e seus plugins ficam em `devDependencies`; Jekyll e as gemas compatíveis com o Ruby local ficam somente no `Gemfile` da fixture.

## Uso

Inclua `dist/sitemath.js` e declare um bloco com linguagem exata `sitemath` no Markdown, ou um elemento HTML `script[type="text/x-sitemath"]`. O runtime é iniciado por `SiteMath.mount(document)`.

```sitemath
field nome: text = { label: "Nome", placeholder: "Informe o nome" };
field aceite: checkbox = { label: "Aceito os termos", required: true };
on.change([nome], () => { if (nome != "") { notify.info(nome); } });
```

Para integração de build, `require("jcem.pro-sitemath").createNodeAdapter()` expõe os detectores Markdown e HTML sem executar o script encontrado.
