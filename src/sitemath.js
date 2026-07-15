/* SiteMath v0.1 — runtime cliente sem avaliacao de JavaScript externo. */
(function (rootFactory) {
  const api = rootFactory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof window !== "undefined") window.SiteMath = api;
}(function () {
  "use strict";

  const LANGUAGE_ID = "jcem.pro/sitemath";
  const SCRIPT_TYPE = "text/x-sitemath";
  const FIELD_TYPES = new Set(["text", "textarea", "number", "checkbox", "radio", "select", "date", "hidden"]);
  const DEFAULT_CONFIG = Object.freeze({ maxIterations: 500, onNotify: null, price: null });

  class SiteMathError extends Error {
    constructor(code, message, token) {
      super(message);
      this.code = code;
      this.line = token ? token.line : 0;
      this.column = token ? token.column : 0;
    }
  }

  function tokenize(source) {
    const tokens = [];
    let index = 0; let line = 1; let column = 1;
    const add = (type, value, startLine, startColumn) => tokens.push({ type, value, line: startLine, column: startColumn });
    const step = () => { const value = source[index++]; if (value === "\n") { line += 1; column = 1; } else column += 1; return value; };
    while (index < source.length) {
      const value = source[index];
      if (/\s/u.test(value)) { step(); continue; }
      if (value === "/" && source[index + 1] === "/") { while (index < source.length && step() !== "\n") {} continue; }
      const startLine = line; const startColumn = column;
      if (value === '"' || value === "'") {
        const quote = step(); let result = ""; let closed = false;
        while (index < source.length) {
          const current = step();
          if (current === quote) { closed = true; break; }
          if (current === "\\") {
            const escaped = step();
            result += ({ n: "\n", r: "\r", t: "\t", "\\": "\\", '"': '"', "'": "'" })[escaped] || escaped;
          } else result += current;
        }
        if (!closed) throw new SiteMathError("UNTERMINATED_STRING", "String nao terminada.", { line: startLine, column: startColumn });
        add("string", result, startLine, startColumn); continue;
      }
      if (/[0-9]/u.test(value)) {
        let number = ""; while (/[0-9.]/u.test(source[index] || "")) number += step();
        if (!/^\d+(?:\.\d+)?$/u.test(number)) throw new SiteMathError("INVALID_NUMBER", "Numero invalido.", { line: startLine, column: startColumn });
        add("number", Number(number), startLine, startColumn); continue;
      }
      if (/[A-Za-z_]/u.test(value)) {
        let identifier = ""; while (/[A-Za-z0-9_]/u.test(source[index] || "")) identifier += step();
        add("identifier", identifier, startLine, startColumn); continue;
      }
      const two = source.slice(index, index + 2);
      if (["=>", "<=", ">=", "==", "!=", "&&", "||", "++", "--", "+=", "-="].includes(two)) { step(); step(); add("operator", two, startLine, startColumn); continue; }
      if ("{}[]();,:.=+-*/%!<>".includes(value)) { step(); add("operator", value, startLine, startColumn); continue; }
      throw new SiteMathError("INVALID_CHARACTER", `Caractere invalido: ${value}`, { line: startLine, column: startColumn });
    }
    tokens.push({ type: "eof", value: "", line, column });
    return tokens;
  }

  class Parser {
    constructor(source) { this.tokens = tokenize(source); this.index = 0; }
    current() { return this.tokens[this.index]; }
    match(value) { if (this.current().value === value) { this.index += 1; return true; } return false; }
    expect(value, code) { const token = this.current(); if (!this.match(value)) throw new SiteMathError(code || "EXPECTED_TOKEN", `Esperado: ${value}`, token); return token; }
    identifier() { const token = this.current(); if (token.type !== "identifier") throw new SiteMathError("EXPECTED_IDENTIFIER", "Identificador esperado.", token); this.index += 1; return token.value; }
    parse() {
      const fields = []; const events = [];
      while (this.current().type !== "eof") {
        const keyword = this.identifier();
        if (keyword === "field") fields.push(this.field());
        else if (keyword === "on") events.push(this.event());
        else throw new SiteMathError("INVALID_DECLARATION", `Declaracao invalida: ${keyword}`, this.current());
      }
      return { languageId: LANGUAGE_ID, fields, events };
    }
    field() {
      const id = this.identifier(); this.expect(":"); const type = this.identifier();
      if (!FIELD_TYPES.has(type)) throw new SiteMathError("INVALID_FIELD_TYPE", `Tipo de campo invalido: ${type}`, this.current());
      this.expect("="); const options = this.literal(); this.expect(";");
      if (!options || Array.isArray(options) || typeof options !== "object") throw new SiteMathError("INVALID_FIELD_OPTIONS", "Campo exige objeto de propriedades.", this.current());
      if (type !== "hidden" && typeof options.label !== "string") throw new SiteMathError("MISSING_FIELD_LABEL", `Campo ${id} exige label.`, this.current());
      if (options.placeholder && !["text", "textarea"].includes(type)) throw new SiteMathError("INVALID_PLACEHOLDER", "placeholder so e valido em text e textarea.", this.current());
      return { id, type, options };
    }
    event() {
      this.expect("."); const name = this.identifier(); this.expect("(");
      let dependencies = [];
      if (name === "change") { this.expect("["); if (!this.match("]")) { while (true) { dependencies.push(this.identifier()); if (this.match("]")) break; this.expect(","); } } this.expect(","); }
      this.expect("("); if (!this.match(")")) { this.identifier(); this.expect(")"); }
      this.expect("=>"); const body = this.block(); this.expect(")"); this.expect(";");
      if (!["init", "change", "submit", "error"].includes(name)) throw new SiteMathError("INVALID_EVENT", `Evento invalido: ${name}`, this.current());
      return { name, dependencies, body };
    }
    block() { this.expect("{"); const result = []; while (!this.match("}")) result.push(this.statement()); return result; }
    statement() {
      const token = this.current();
      if (token.value === "if") { this.index += 1; this.expect("("); const test = this.expression(); this.expect(")"); const consequent = this.block(); const alternate = this.match("else") ? this.block() : []; return { kind: "if", test, consequent, alternate }; }
      if (token.value === "return") { this.index += 1; this.expect(";"); return { kind: "return" }; }
      if (token.value === "for") return this.forStatement();
      const left = this.expression();
      if (["=", "+=", "-="].includes(this.current().value)) { const operator = this.current().value; this.index += 1; const right = this.expression(); this.expect(";"); return { kind: "assign", left, operator, right }; }
      this.expect(";"); return { kind: "expression", expression: left };
    }
    forStatement() {
      this.expect("for"); this.expect("(");
      if (this.match("let")) {
        const id = this.identifier(); this.expect(":"); this.expect("number"); this.expect("="); const init = this.expression(); this.expect(";"); const test = this.expression(); this.expect(";");
        const updateId = this.identifier(); const update = this.current().value; if (!["++", "--", "+=", "-="].includes(update)) throw new SiteMathError("INVALID_FOR_UPDATE", "Incremento invalido.", this.current()); this.index += 1;
        const updateValue = ["+=", "-="].includes(update) ? this.expression() : null; this.expect(")");
        return { kind: "for", id, init, test, updateId, update, updateValue, body: this.block() };
      }
      this.expect("const"); const id = this.identifier(); this.expect("of"); const iterable = this.expression(); this.expect(")");
      return { kind: "forOf", id, iterable, body: this.block() };
    }
    literal() {
      const token = this.current();
      if (token.type === "string" || token.type === "number") { this.index += 1; return token.value; }
      if (token.value === "true" || token.value === "false" || token.value === "null") { this.index += 1; return token.value === "true" ? true : token.value === "false" ? false : null; }
      if (this.match("[")) { const values = []; if (this.match("]")) return values; while (true) { values.push(this.literal()); if (this.match("]")) return values; this.expect(","); if (this.match("]")) return values; } }
      if (this.match("{")) { const object = {}; if (this.match("}")) return object; while (true) { const key = this.identifier(); this.expect(":"); object[key] = this.literal(); if (this.match("}")) return object; this.expect(","); if (this.match("}")) return object; } }
      throw new SiteMathError("INVALID_LITERAL", "Literal invalido.", token);
    }
    expression(minimum = 0) {
      let left = this.primary();
      const precedence = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };
      while (precedence[this.current().value] >= minimum) { const operator = this.current().value; const level = precedence[operator]; this.index += 1; left = { kind: "binary", operator, left, right: this.expression(level + 1) }; }
      return left;
    }
    primary() {
      const token = this.current(); let node;
      if (token.value === "!" || token.value === "-") { this.index += 1; node = { kind: "unary", operator: token.value, value: this.primary() }; }
      else if (token.value === "(") { this.index += 1; node = this.expression(); this.expect(")"); }
      else if (token.type === "string" || token.type === "number" || ["true", "false", "null"].includes(token.value)) { node = { kind: "literal", value: this.literal() }; }
      else if (token.type === "identifier") { this.index += 1; node = { kind: "identifier", name: token.value }; }
      else throw new SiteMathError("INVALID_EXPRESSION", "Expressao invalida.", token);
      while (true) {
        if (this.match(".")) node = { kind: "member", object: node, property: this.identifier() };
        else if (this.match("(")) { const args = []; if (!this.match(")")) { while (true) { args.push(this.expression()); if (this.match(")")) break; this.expect(","); } } node = { kind: "call", callee: node, args }; }
        else break;
      }
      return node;
    }
  }

  function getReference(node, scope) {
    if (node.kind === "identifier") return { target: Object.prototype.hasOwnProperty.call(scope.fields || {}, node.name) ? scope.fields : scope, key: node.name };
    if (node.kind === "member") { const object = evaluate(node.object, scope); return { target: object, key: node.property }; }
    throw new SiteMathError("INVALID_REFERENCE", "Referencia invalida.");
  }
  function evaluate(node, scope) {
    if (node.kind === "literal") return node.value;
    if (node.kind === "identifier") { if (Object.prototype.hasOwnProperty.call(scope.fields || {}, node.name)) return scope.fields[node.name]; if (!(node.name in scope)) throw new SiteMathError("UNKNOWN_IDENTIFIER", `Identificador desconhecido: ${node.name}`); return scope[node.name]; }
    if (node.kind === "member") { const reference = getReference(node, scope); return reference.target == null ? undefined : reference.target[reference.key]; }
    if (node.kind === "unary") { const value = evaluate(node.value, scope); return node.operator === "!" ? !value : -Number(value); }
    if (node.kind === "binary") { const a = evaluate(node.left, scope); const b = evaluate(node.right, scope); return ({ "+": () => a + b, "-": () => a - b, "*": () => a * b, "/": () => a / b, "%": () => a % b, "==": () => a === b, "!=": () => a !== b, "<": () => a < b, ">": () => a > b, "<=": () => a <= b, ">=": () => a >= b, "&&": () => a && b, "||": () => a || b })[node.operator](); }
    if (node.kind === "call") { const reference = getReference(node.callee, scope); if (typeof reference.target[reference.key] !== "function") throw new SiteMathError("INVALID_CALL", "Chamada invalida."); return reference.target[reference.key](...node.args.map((argument) => evaluate(argument, scope))); }
    throw new SiteMathError("INVALID_EXPRESSION", "Expressao nao avaliavel.");
  }
  function execute(statements, scope, budget) {
    for (const statement of statements) {
      if (--budget.left < 0) throw new SiteMathError("ITERATION_LIMIT", "Limite de iteracoes excedido.");
      if (statement.kind === "return") return true;
      if (statement.kind === "expression") evaluate(statement.expression, scope);
      if (statement.kind === "assign") { const reference = getReference(statement.left, scope); if (reference.target !== scope && reference.target !== scope.fields) throw new SiteMathError("INVALID_ASSIGNMENT", "Atribuicao nao permitida."); const value = evaluate(statement.right, scope); reference.target[reference.key] = statement.operator === "+=" ? reference.target[reference.key] + value : statement.operator === "-=" ? reference.target[reference.key] - value : value; }
      if (statement.kind === "if" && execute(evaluate(statement.test, scope) ? statement.consequent : statement.alternate, scope, budget)) return true;
      if (statement.kind === "for") { scope[statement.id] = evaluate(statement.init, scope); while (evaluate(statement.test, scope)) { if (execute(statement.body, scope, budget)) return true; scope[statement.updateId] = statement.update === "++" ? scope[statement.updateId] + 1 : statement.update === "--" ? scope[statement.updateId] - 1 : statement.update === "+=" ? scope[statement.updateId] + evaluate(statement.updateValue, scope) : scope[statement.updateId] - evaluate(statement.updateValue, scope); } }
      if (statement.kind === "forOf") { const values = evaluate(statement.iterable, scope); if (!values || typeof values[Symbol.iterator] !== "function") throw new SiteMathError("INVALID_ITERABLE", "Colecao invalida."); for (const value of values) { scope[statement.id] = value; if (execute(statement.body, scope, budget)) return true; } }
    }
    return false;
  }

  function parse(source) { return new Parser(String(source || "")).parse(); }
  function fencedBlocks(markdown) { return [...String(markdown || "").matchAll(/^```sitemath\s*\n([\s\S]*?)^```\s*$/gmu)].map((match) => match[1]); }
  function htmlBlocks(html) { return [...String(html || "").matchAll(/<script\b[^>]*\btype\s*=\s*["']text\/x-sitemath["'][^>]*>([\s\S]*?)<\/script>/giu)].map((match) => match[1]); }
  function detect(source, kind) { const blocks = kind === "html" ? htmlBlocks(source) : fencedBlocks(source); const results = blocks.map((code) => { try { return { valid: true, ast: parse(code) }; } catch (error) { return { valid: false, error: diagnostic(error) }; } }); return { languageId: LANGUAGE_ID, found: blocks.length, valid: results.filter((result) => result.valid).length, results }; }
  function diagnostic(error) { return { code: error.code || "RUNTIME_ERROR", message: error.message, line: error.line || 0, column: error.column || 0 }; }

  function createRuntime(document, config) {
    const merged = { ...DEFAULT_CONFIG, ...(config || {}) };
    const scripts = [...document.querySelectorAll(`script[type="${SCRIPT_TYPE}"]`)];
    return scripts.map((script) => mountBlock(script, document, merged));
  }
  function mountBlock(script, document, config) {
    let ast;
    try { ast = parse(script.textContent || ""); } catch (error) { emit(script, "sitemath:error", diagnostic(error)); return { error: diagnostic(error) }; }
    const form = document.createElement("form"); form.className = "sitemath"; form.noValidate = true; script.insertAdjacentElement("afterend", form);
    const fields = {}; const controls = {};
    for (const field of ast.fields) renderField(document, form, field, fields, controls);
    const handlers = Object.fromEntries(ast.events.map((event) => [event.name, event]));
    const notify = Object.fromEntries(["info", "success", "error", "debug"].map((level) => [level, (message) => { const payload = { level, message: String(message) }; emit(form, "sitemath:notify", payload); if (typeof config.onNotify === "function") config.onNotify(payload); }]));
    const run = (name, event) => Promise.resolve().then(() => {
      const handler = handlers[name]; if (!handler) return;
      const scope = { ...fields, fields, event: event || {}, notify, min: Math.min, max: Math.max, sum: (values) => [...values].reduce((total, value) => total + Number(value), 0), price: (value) => { if (typeof config.price !== "function") throw new SiteMathError("PRICE_RESOLVER_MISSING", "Resolvedor price ausente."); return config.price(value); }, limit: (values, limit) => [...values].slice(0, Math.max(0, Math.min(Number(limit), config.maxIterations))) };
      execute(handler.body, scope, { left: Number(config.maxIterations) || 500 });
      syncControls(ast.fields, fields, controls);
    }).catch((error) => { const payload = diagnostic(error); emit(form, "sitemath:error", payload); const handler = handlers.error; if (handler && name !== "error") run("error", payload); });
    for (const [id, control] of Object.entries(controls)) control.addEventListener("change", () => { fields[id] = readControl(control); run("change", { type: "change", field: id }); });
    form.addEventListener("submit", (event) => { const wrapped = { preventDefault: () => event.preventDefault() }; run("submit", wrapped); });
    run("init", { type: "init" });
    return { ast, fields, form, run };
  }
  function renderField(document, form, field, values, controls) {
    const options = field.options; const id = `sitemath-${field.id}`; values[field.id] = options.value == null ? (field.type === "checkbox" ? false : "") : options.value;
    if (field.type === "hidden") { const input = document.createElement("input"); input.type = "hidden"; input.name = field.id; input.value = values[field.id]; form.append(input); controls[field.id] = input; return; }
    const wrapper = document.createElement("div"); wrapper.className = `sitemath-field sitemath-${field.type}`; const label = document.createElement("label"); label.htmlFor = id; label.textContent = options.label; wrapper.append(label);
    const tip = typeof options.tip === "string" ? document.createElement("small") : null; if (tip) { tip.id = `${id}-tip`; tip.textContent = options.tip; wrapper.append(tip); }
    let control;
    if (field.type === "textarea") control = document.createElement("textarea");
    else if (field.type === "radio" || field.type === "select") { control = document.createElement("select"); for (const option of options.options || []) { const element = document.createElement("option"); element.value = option.value; element.textContent = option.label; control.append(element); } }
    else { control = document.createElement("input"); control.type = field.type === "checkbox" ? "checkbox" : field.type; }
    control.id = id; control.name = field.id; control.required = options.required === true; control.readOnly = options.readonly === true; if (tip) control.setAttribute("aria-describedby", tip.id); if (options.placeholder) control.placeholder = options.placeholder; if (options.min != null) control.min = options.min; if (options.max != null) control.max = options.max; writeControl(control, values[field.id]); wrapper.append(control); form.append(wrapper); controls[field.id] = control;
  }
  function readControl(control) { return control.type === "checkbox" ? control.checked : control.type === "number" ? Number(control.value || 0) : control.value; }
  function writeControl(control, value) { if (control.type === "checkbox") control.checked = Boolean(value); else control.value = value == null ? "" : value; }
  function syncControls(definitions, fields, controls) { for (const field of definitions) if (controls[field.id]) writeControl(controls[field.id], fields[field.id]); }
  function emit(element, name, detail) { if (typeof CustomEvent !== "undefined") element.dispatchEvent(new CustomEvent(name, { detail })); }

  return Object.freeze({ LANGUAGE_ID, SCRIPT_TYPE, SiteMathError, configure: (config) => Object.freeze({ ...DEFAULT_CONFIG, ...(config || {}) }), createNodeAdapter: () => Object.freeze({ languageId: LANGUAGE_ID, detectMarkdown: (source) => detect(source, "markdown"), detectHtml: (source) => detect(source, "html") }), detectHtml: (source) => detect(source, "html"), detectMarkdown: (source) => detect(source, "markdown"), mount: createRuntime, parse });
}));
