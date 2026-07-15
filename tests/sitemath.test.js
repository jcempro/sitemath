"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const SiteMath = require("../src/sitemath.js");

const validScript = `
field nome: text = { label: "Nome", placeholder: "Informe o nome", tip: "Obrigatorio", required: true };
field plano: radio = { label: "Plano", options: [{ label: "Basico", value: "basic" }] };
field total: number = { label: "Total", readonly: true };
on.init(() => { total = 0; for (let i: number = 0; i < 2; i++) { notify.debug(i); } for (const item of limit(items, 1)) { notify.debug(item); } });
on.change([nome, plano], () => { if (nome != "") { notify.info(nome); } });
on.submit((event) => { if (total <= 0) { event.preventDefault(); return; } });
`;

test("parseia campos tipados, eventos e os dois estilos de for", () => {
  const ast = SiteMath.parse(validScript);
  assert.equal(ast.fields.length, 3);
  assert.equal(ast.events.length, 3);
  assert.equal(ast.events[1].name, "change");
});

test("rejeita placeholder fora de campo textual", () => {
  assert.throws(() => SiteMath.parse('field idade: number = { label: "Idade", placeholder: "0" };'), { code: "INVALID_PLACEHOLDER" });
});

test("detecta somente marcadores exatos e sintaxe valida", () => {
  const markdown = `\`\`\`sitemath\nfield nome: text = { label: "Nome" };\n\`\`\``;
  const html = `<script type="text/x-sitemath">field nome: text = { label: "Nome" };</script>`;
  assert.equal(SiteMath.detectMarkdown(markdown).valid, 1);
  assert.equal(SiteMath.detectHtml(html).valid, 1);
  assert.equal(SiteMath.detectMarkdown('```typescript\nconst x = 1;\n```').found, 0);
});
