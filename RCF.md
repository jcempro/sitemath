# RCF — SiteMath

## 1. Escopo e precedência

Este RCF define o produto SiteMath; `AGENTS.md` define o processo da IA. O produto é uma linguagem declarativa embutível em conteúdo gerenciado, com runtime obrigatório no navegador e integração opcional de detecção no build. Código, sintaxe e adaptador Node v0.1 existem; extensão semântica não registrada não deve ser inferida.

## 2. Execução cliente

Todo script SiteMath DEVE executar no cliente. O documento base DEVE continuar utilizável quando o runtime falhar; elementos declarados devem ter estrutura HTML acessível. Processamento assíncrono DEVE evitar bloquear a interface; Worker PODE ser usado para cálculo sem DOM, com retorno ordenado e cancelável. O runtime DEVE expor gatilhos de ciclo de vida, eventos declarados, notificações e leitura dos campos declarados.

## 3. Campos

Cada campo DEVE declarar identificador estável e tipo. Tipos iniciais reconhecíveis incluem `checkbox`, `radio`, `text`, `number`, `textarea`, `select`, `date` e `hidden`; tipo desconhecido DEVE falhar com diagnóstico, sem coerção silenciosa. A especificação futura deve definir valor padrão, validação, máscara, acessibilidade e o vínculo entre campo e script sem duplicar a estrutura visual do anfitrião.

## 4. Segurança e limites

Toda execução DEVE possuir limite de iterações. O default é `500` por execução; a precedência é API explícita, variável exportada, arquivo de configuração e default. Valor inválido, zero, negativo ou acima do máximo seguro declarado DEVE falhar de forma previsível. O limite deve abranger ciclos aninhados e múltiplos blocos presentes no mesmo artigo, com contagem isolada por execução e diagnóstico acionável ao excedê-lo.

## 5. Identificação e detecção

O identificador canônico da linguagem é `jcem.pro/sitemath`; `sitemath` é somente alias explícito. Markdown DEVE usar bloco cercado com linguagem exata `sitemath`; HTML DEVE usar `script[type="text/x-sitemath"]`; o manifesto usa a chave `sitemath`. Detectores DEVEM reconhecer somente esses identificadores exatos e candidatos estruturalmente válidos, evitando falso positivo em texto comum, exemplos escapados e código de outras linguagens.

## 6. Manifesto e adaptadores de build

`package.json.sitemath` DEVE declarar schema, identificadores, estratégia de detecção, requisitos do runtime e adaptadores. A biblioteca PODE oferecer adaptadores plugáveis para gerenciadores de conteúdo; cada adaptador DEVE declarar runtime de build compatível, função de detecção, entradas, saída, versão do contrato e falha segura. O servidor DEVE poder avaliar o detector antes de incluir a biblioteca, incluindo-a somente nas páginas com blocos SiteMath válidos. Adaptador incompatível com o runtime do gerenciador NÃO DEVE ser selecionado.

## 7. Qualidade e rastreabilidade

A implementação DEVE ser modular, acessível, testável e sem dependências desnecessárias. A fonte de produto DEVE usar TypeScript puro, com `strict` ativo e TSDoc/JSDoc em toda API pública, tipo exportado, erro público, adaptador e função de ciclo de vida. Build e runtime DEVEM validar os mesmos marcadores canônicos. Alteração de sintaxe, manifesto, limite, eventos ou modo de execução DEVE atualizar este RCF, testes, documentação, memória e adaptadores aplicáveis no mesmo ciclo.

## 8. Gramática SiteMath v0.1

SiteMath usa superfície TypeScript-like, parser próprio e execução restrita; NÃO interpreta JavaScript ou TypeScript arbitrário. Espaços e quebras de linha não possuem significado sintático. Toda declaração ou instrução DEVE terminar em `;`, exceto bloco fechado por `}`. Blocos usam `{` e `}`.

Declaração de campo: `field <id>: <tipo> = { <propriedades> };`. Tipos v0.1: `text`, `textarea`, `number`, `checkbox`, `radio`, `select`, `date` e `hidden`. Propriedades usam objeto TypeScript-like, com `label`, `required`, `readonly`, `placeholder`, `tip`, `options`, `min`, `max` e `value` quando aplicáveis. `label` é obrigatório, exceto em `hidden`; `placeholder` só é válido em `text` e `textarea`; `tip` é texto puro e não substitui rótulo ou erro. `radio` e `select` usam `options: [{ label: string, value: string }]`.

Eventos v0.1: `on.init(() => { ... });`, `on.change([campo, ...], () => { ... });`, `on.submit((event) => { ... });` e `on.error((error) => { ... });`. Condições usam `if`/`else`; a linguagem NÃO possui `when`. `event.preventDefault()` só é válido em `on.submit`.

Instruções permitidas: atribuição a campo mutável, `if`/`else`, `return`, chamada a função permitida, `for (let <id>: number = <expr>; <expr>; <incremento>) { ... }` e `for (const <id> of limit(<coleção>, <limite>)) { ... }`. Expressões aceitam literais, arrays, objetos, operadores matemáticos, comparação, booleanos, acesso a membro e funções permitidas. `import`, `new`, `eval`, acesso livre ao DOM, rede, reflexão e execução de código externo são inválidos.

## 9. Runtime e estado

O runtime DEVE executar ações de evento assincronamente, preservando a ordem por instância. Estado de execução é isolado por bloco; campo declarado é exposto por seu identificador e leitura de campo desconhecido falha. `notify.info`, `notify.success`, `notify.error` e `notify.debug` emitem evento estruturado e PODEM chamar notificador configurado. Funções puras iniciais: `min`, `max`, `sum` e `price`; `price` sem resolvedor configurado falha de modo explícito.

Cada ação possui orçamento de iteração próprio. `limit(coleção, N)` restringe aquela iteração a `N`; o runtime também aplica `maxIterations`, cujo default é 500. Excesso interrompe somente a ação corrente, emite diagnóstico e NÃO bloqueia outros blocos. Worker é OPCIONAL para cálculo puro serializável e NÃO PODE acessar DOM; a ausência de Worker NÃO altera eventos, campos ou diagnóstico.

## 10. Acessibilidade e interface

Campo visível DEVE gerar `label` associado. `placeholder` é sugestão de formato; informação essencial deve residir em `label`, `tip` ou erro. `tip` DEVE ser exposto em foco, toque e apontador, por texto associado via `aria-describedby`. Erro deve usar região acessível e preserva o valor preenchido. Nenhuma propriedade textual aceita HTML executável.

## 11. Detecção e adaptador Node

Detector Markdown reconhece somente bloco cercado de linguagem exata `sitemath`; detector HTML reconhece somente `script[type="text/x-sitemath"]`. Ambos DEVEM validar a estrutura antes de indicar inclusão do runtime. O adaptador Node DEVE expor detecção programática para build de CMS, retornar resultado determinístico por arquivo e não executar o script durante a detecção.

## 12. Distribuição e baseline

Fonte de biblioteca reside em `src/**/*.ts`; automação local reside em `scripts/**/*.ts`; testes do produto residem em `tests/**/*.ts`; artefato de biblioteca reside em `dist/`. JavaScript só é admitido como artefato gerado, fixture que representa explicitamente um target JavaScript, ou dependência de terceiro. Build local DEVE compilar TypeScript estrito, gerar bundle UMD autônomo para navegador e CommonJS, emitir declarações, validar sintaxe e não vazar estrutura-fonte no artefato.

O alvo de navegador é a consulta Browserslist exata `baseline widely available with downstream`, cuja definição é a janela móvel de 30 meses. Em 2026-07-14, ela corresponde aproximadamente a recursos interoperáveis até 2024-01-14. O build DEVE resolver essa consulta para alvos do compilador/bundler em cada execução; TypeScript usa `target: ES2022` como piso sintático e NÃO injeta polyfills. Recurso fora da baseline exige fallback local ou nova decisão registrada neste RCF. O runtime v0.1 não possui dependência externa; compilador, bundler, tipos, testes e ferramentas de documentação pertencem exclusivamente a `devDependencies` e não integram a distribuição.

## 13. Matriz de ambientes de teste

Cada alvo suportado DEVE possuir fixture de desenvolvimento verificável. A matriz mínima é: HTML estático JavaScript; Vite JavaScript; Vite TypeScript; Vite React; Vite Preact; e Jekyll com Markdown. Vite, TypeScript, React, Preact e plugins pertencem exclusivamente a `devDependencies` do repositório; Jekyll e plugins Ruby pertencem somente ao `Gemfile` da fixture. Nenhuma fixture, ferramenta ou dependência de teste integra o pacote publicado.

Toda fixture DEVE conter página que declara SiteMath e página sem declaração. A validação DEVE comprovar build do ambiente, detecção exata, inclusão do runtime somente na página declarada, ausência de falso positivo e funcionamento do artefato `dist/` sem importação de `src/`. A matriz PODE reutilizar arquétipos de fixture quando variar somente CSS, SCSS, WASM ou configuração de bundler, desde que o orquestrador registre cada perfil coberto e o ambiente representativo seja executado.

## 14. Site de documentação

O repositório DEVE manter uma página estática de documentação sob `docs/`, derivada do README e da especificação pública, sem dependência de runtime de produção. A página DEVE ser responsiva, semântica, acessível por teclado, legível sem JavaScript e apresentar a sintaxe, API, integração e comandos de desenvolvimento. Ela DEVE conter links visíveis e diretos para o repositório GitHub, o perfil/site do autor e a página do pacote no registro NPM, usando as URLs declaradas no `package.json`.

O workflow de documentação DEVE usar GitHub Pages, executar somente build/validação estáticos e publicar o diretório `docs/`. Seu acionamento em `main` e manual é independente de versão, tag, GitHub Release e NPM. O fluxo representa publicação de documentação, não release de pacote.

## 15. Release e publicação de pacote

O único gatilho de release é o arquivo raiz `release`, criado por `agent:release:trigger <versao>` e consumido pelo workflow `.github/workflows/release.yml`. O workflow DEVE validar worktree e versão explícita, instalar dependências bloqueadas, executar a suíte integral, gerar o pacote, validar o conteúdo com `npm pack --dry-run`, publicar o tarball no NPM e somente após êxito criar a GitHub Release vinculada à tag `v<versao>`. Falha em qualquer etapa DEVE impedir a etapa dependente; a ordem NPM → GitHub Release impede release público sem pacote efetivamente publicado.

O workflow autentica a publicação normal por Trusted Publishing OIDC, com `id-token: write`, repositório `jcempro/sitemath` e workflow `.github/workflows/release.yml` autorizados no NPM. `NPM_TOKEN` NÃO DEVE ser persistido como segredo do repositório. Como o vínculo OIDC exige que o pacote exista no registro, o bootstrap inicial é a única exceção: ele é publicado localmente por mantenedor autenticado e validado com `npm publish --access public`; o cliente npm pode abrir o navegador para concluir a autenticação por chave pública. Nenhum OTP deve ser incorporado ao comando, ao repositório ou à CI. Após êxito confirmado no registro, configura-se explicitamente o vínculo OIDC. O workflow remove o gatilho em commit `release: v<versao>` pela rotina gerenciada, preserva rastreabilidade da tag, e não reutiliza `publish` para release. O pacote NPM DEVE conter somente arquivos declarados em `package.json.files`, limitados a runtime compilado, manifesto de linguagem e declarações de tipo dentro de `dist/`, além dos metadados obrigatórios do NPM. Código-fonte, testes, fixtures, documentação do site, arquivos de ambiente, workflows, governança e ferramentas de desenvolvimento são excluídos.

## 16. FT-003 — TypeScript, documentação e entrega

### Arquitetura aprovada

1. Converter runtime, adaptador Node, scripts locais e testes de produto para TypeScript estrito; preservar apenas fixtures deliberadamente multi-target e artefatos gerados em JavaScript.
2. Resolver `baseline widely available with downstream` em tempo de build e gerar `dist/sitemath.js` no formato UMD, mantendo `window.SiteMath` no navegador e `require()` no adaptador Node.
3. Emitir `dist/sitemath.d.ts` e manifesto a partir de uma única fonte de verdade em `package.json`.
4. Criar `docs/index.html` e recursos locais mínimos; publicar exclusivamente por GitHub Pages.
5. Criar workflows separados: documentação estática em Pages e release atômico NPM → GitHub Release pelo gatilho `release`.

### Testes funcionais

| FT | Critério de aceite |
| --- | --- |
| FT-003.1 | Typecheck estrito aprova runtime, scripts e testes; bundle UMD preserva API cliente e adaptador Node. |
| FT-003.2 | A consulta Browserslist da baseline é resolvida no build; não há polyfill automático, fonte JavaScript ou dependência de produção. |
| FT-003.3 | Site de documentação renderiza sem JavaScript, contém links externos exigidos e passa validação estática. |
| FT-003.4 | Workflow Pages é independente do workflow `release`; release só consome `release`, publica NPM antes de criar GitHub Release e valida higiene do tarball. |
| FT-003.5 | Suíte unitária, matriz de targets, inspeção visual, `npm pack --dry-run` e validação YAML aprovam antes da conclusão. |

## 17. FT-004 — Bootstrap NPM e Trusted Publishing

O pacote inicial `@jeancarloem/sitemath@0.0.1` será publicado localmente após validação integral, exclusivamente para criar o recurso no registro. `package.json.publishConfig` DEVE fixar o registro público e o acesso `public`, enquanto o comando de bootstrap mantém `npm publish --access public` como confirmação explícita. Em seguida, o mantenedor configura a relação OIDC com GitHub Actions pelo repositório `jcempro/sitemath`, workflow `release.yml` e permissão de publicação. A CI passa a usar `id-token: write`, sem segredo `NPM_TOKEN`. A FT valida identidade no registro, relação confiável e inexistência de credenciais persistidas no repositório.
