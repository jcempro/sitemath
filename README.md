# SiteMath

Biblioteca TypeScript para executar a linguagem SiteMath no cliente e permitir a detecção precisa de blocos válidos durante o build de um gerenciador de conteúdo.

O contrato atual está em [RCF.md](RCF.md). O estado técnico em andamento está em [handoff.md](handoff.md). O runtime v0.1 é cliente, distribuído como UMD/CommonJS e sem dependências de produção. A documentação estática está em `docs/` e é publicada independentemente em GitHub Pages.

## Operação local

O projeto requer Node.js 24 ou superior. A fonte de produto, automação e testes usa TypeScript estrito; JavaScript só permanece em fixtures que exercitam targets JavaScript.

- `npm run build`
- `npm test`
- `npm run check`
- `npm run dev`
- `npm run test:targets:web`
- `npm run test:targets:jekyll`
- `npm run test:targets`
- `npm run validate:package`
- `npm run release:publish <versão>`
- `npm run agent:setup`
- `npm run agent:doctor`
- `npm run agent:handoff`
- `npm run agent:status`

O desenvolvimento ocorre em `dev`. O comando de release cria o único gatilho padrão `release`; o workflow valida, publica o tarball no NPM e somente depois cria a GitHub Release. É necessário configurar o segredo `NPM_TOKEN` no repositório antes de uma publicação real.

## Matriz de desenvolvimento

As fixtures em `tests/targets/` verificam o artefato `dist/sitemath.js` em HTML estático, Vite JavaScript, Vite TypeScript, Vite React, Vite Preact e Jekyll com Markdown. Cada alvo possui uma página declarada e uma página controle sem declaração. Vite, TypeScript, React, Preact e seus plugins ficam em `devDependencies`; Jekyll e as gemas compatíveis com o Ruby local ficam somente no `Gemfile` da fixture.

## Uso

Inclua `dist/sitemath.js` e declare um bloco com linguagem exata `sitemath` no Markdown, ou um elemento HTML `script[type="text/x-sitemath"]`. O runtime é iniciado por `SiteMath.mount(document)`.

```sitemath
field nome: text = { label: "Nome", placeholder: "Informe o nome" };
field aceite: checkbox = { label: "Aceito os termos", required: true };
on.change([nome], () => { if (nome != "") { notify.info(nome); } });
```

Para integração de build, `require("@jcem/sitemath").createNodeAdapter()` expõe os detectores Markdown e HTML sem executar o script encontrado. O pacote inclui `dist/sitemath.d.ts` para consumo tipado.

## Documentação pública

A versão Web do README e da API está em `docs/index.html`. Ela contém os links diretos para o [repositório GitHub](https://github.com/jcempro/sitemath), [site do autor](https://jeancarloem.com) e [pacote no NPM](https://www.npmjs.com/package/@jcem/sitemath). O workflow `pages.yml` publica somente esse site estático em `main`; ele não participa do ciclo de release.

## Baseline de navegador

O bundle resolve a consulta Browserslist `baseline widely available with downstream` a cada build e usa ES2022 como piso sintático, sem polyfills automáticos. A política corresponde à janela de 30 meses de recursos interoperáveis da Baseline Web Platform.
