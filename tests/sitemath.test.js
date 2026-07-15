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

test("runtime cliente atualiza campo readonly de forma assincrona", async () => {
  class Element {
    constructor(tagName) { this.tagName = tagName; this.children = []; this.listeners = {}; this.attributes = {}; }
    append(child) { this.children.push(child); return child; }
    insertAdjacentElement(_position, child) { document.forms.push(child); return child; }
    addEventListener(name, listener) { (this.listeners[name] ||= []).push(listener); }
    dispatchEvent() { return true; }
    setAttribute(name, value) { this.attributes[name] = value; }
  }
  const script = new Element("script");
  script.textContent = `field idade: number = { label: "Idade" }; field aceite: checkbox = { label: "Aceite" }; field total: number = { label: "Total", readonly: true }; on.change([idade, aceite], () => { if (aceite) { total = idade * 2; } });`;
  const document = { forms: [], createElement: (tagName) => new Element(tagName), querySelectorAll: () => [script] };
  const [instance] = SiteMath.mount(document);
  const controls = document.forms[0].children.map((wrapper) => wrapper.children.at(-1));
  const idade = controls[0]; const aceite = controls[1];
  idade.value = "21"; aceite.checked = true;
  for (const listener of idade.listeners.change) listener({});
  for (const listener of aceite.listeners.change) listener({});
  await Promise.resolve(); await Promise.resolve();
  assert.equal(instance.fields.total, 42);
});
