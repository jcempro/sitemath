/**
 * Runtime e parser da linguagem declarativa SiteMath.
 *
 * @packageDocumentation
 */

/** Identificador canônico da linguagem SiteMath. */
export const LANGUAGE_ID = "jcem.pro/sitemath";
/** Tipo MIME exato usado em blocos HTML SiteMath. */
export const SCRIPT_TYPE = "text/x-sitemath";

const FIELD_TYPES = new Set<FieldType>(["text", "textarea", "number", "checkbox", "radio", "select", "date", "hidden"]);
const EVENT_NAMES = new Set<EventName>(["init", "change", "submit", "error"]);

/** Tipos de campo reconhecidos pela gramática v0.1. */
export type FieldType = "text" | "textarea" | "number" | "checkbox" | "radio" | "select" | "date" | "hidden";
/** Eventos declarativos reconhecidos pela gramática v0.1. */
export type EventName = "init" | "change" | "submit" | "error";
/** Valores serializáveis aceitos em propriedades de campos. */
export type LiteralValue = string | number | boolean | null | LiteralValue[] | { [key: string]: LiteralValue };

/** Configuração da execução de uma instância SiteMath. */
export interface SiteMathConfig {
  /** Orçamento máximo compartilhado por ação de evento. O padrão é 500. */
  maxIterations?: number;
  /** Recebe cada notificação emitida pelo script. */
  onNotify?: ((notification: SiteMathNotification) => void) | null;
  /** Resolve um preço quando a função declarativa `price()` for usada. */
  price?: ((value: unknown) => unknown) | null;
}

/** Notificação estruturada emitida pelo runtime. */
export interface SiteMathNotification {
  level: "info" | "success" | "error" | "debug";
  message: string;
}

/** Diagnóstico serializável produzido pelo parser ou runtime. */
export interface SiteMathDiagnostic {
  code: string;
  message: string;
  line: number;
  column: number;
}

/** Resultado de validação de um bloco detectado. */
export interface DetectionResult {
  valid: boolean;
  ast?: SiteMathProgram;
  error?: SiteMathDiagnostic;
}

/** Resultado determinístico de detecção para conteúdo HTML ou Markdown. */
export interface DetectionReport {
  languageId: typeof LANGUAGE_ID;
  found: number;
  valid: number;
  results: DetectionResult[];
}

/** Adaptador de build compatível com Node/CommonJS. */
export interface NodeAdapter {
  languageId: typeof LANGUAGE_ID;
  detectMarkdown(source: string): DetectionReport;
  detectHtml(source: string): DetectionReport;
}

/** Campo declarado no programa SiteMath. */
export interface SiteMathField {
  id: string;
  type: FieldType;
  options: Record<string, LiteralValue>;
}

/** Programa parseado da linguagem SiteMath. */
export interface SiteMathProgram {
  languageId: typeof LANGUAGE_ID;
  fields: SiteMathField[];
  events: SiteMathEvent[];
}

type TokenKind = "string" | "number" | "identifier" | "operator" | "eof";
interface Token { type: TokenKind; value: string | number; line: number; column: number; }
type Expression = LiteralExpression | IdentifierExpression | UnaryExpression | BinaryExpression | MemberExpression | CallExpression;
interface LiteralExpression { kind: "literal"; value: LiteralValue; }
interface IdentifierExpression { kind: "identifier"; name: string; }
interface UnaryExpression { kind: "unary"; operator: "!" | "-"; value: Expression; }
interface BinaryExpression { kind: "binary"; operator: string; left: Expression; right: Expression; }
interface MemberExpression { kind: "member"; object: Expression; property: string; }
interface CallExpression { kind: "call"; callee: Expression; args: Expression[]; }
interface AssignStatement { kind: "assign"; left: Expression; operator: "=" | "+=" | "-="; right: Expression; }
interface ExpressionStatement { kind: "expression"; expression: Expression; }
interface ReturnStatement { kind: "return"; }
interface IfStatement { kind: "if"; test: Expression; consequent: Statement[]; alternate: Statement[]; }
interface ForStatement { kind: "for"; id: string; init: Expression; test: Expression; updateId: string; update: "++" | "--" | "+=" | "-="; updateValue: Expression | null; body: Statement[]; }
interface ForOfStatement { kind: "forOf"; id: string; iterable: Expression; body: Statement[]; }
type Statement = AssignStatement | ExpressionStatement | ReturnStatement | IfStatement | ForStatement | ForOfStatement;
interface SiteMathEvent { name: EventName; dependencies: string[]; body: Statement[]; }

/** Erro controlado com posição de origem para diagnóstico do autor. */
export class SiteMathError extends Error {
  /** Código estável para automação e tratamento de erro. */
  readonly code: string;
  /** Linha do token que causou o diagnóstico, ou zero fora do parser. */
  readonly line: number;
  /** Coluna do token que causou o diagnóstico, ou zero fora do parser. */
  readonly column: number;

  /** Cria um erro SiteMath. */
  constructor(code: string, message: string, token?: Pick<Token, "line" | "column">) {
    super(message);
    this.name = "SiteMathError";
    this.code = code;
    this.line = token?.line ?? 0;
    this.column = token?.column ?? 0;
  }
}

const DEFAULT_CONFIG: Required<SiteMathConfig> = Object.freeze({ maxIterations: 500, onNotify: null, price: null });

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;
  let line = 1;
  let column = 1;
  const add = (type: TokenKind, value: string | number, startLine: number, startColumn: number): void => { tokens.push({ type, value, line: startLine, column: startColumn }); };
  const step = (): string => {
    const value = source[index++] ?? "";
    if (value === "\n") { line += 1; column = 1; } else { column += 1; }
    return value;
  };
  while (index < source.length) {
    const value = source[index] ?? "";
    if (/\s/u.test(value)) { step(); continue; }
    if (value === "/" && source[index + 1] === "/") { while (index < source.length && step() !== "\n") { /* comentário */ } continue; }
    const startLine = line;
    const startColumn = column;
    if (value === '"' || value === "'") {
      const quote = step();
      let result = "";
      let closed = false;
      while (index < source.length) {
        const current = step();
        if (current === quote) { closed = true; break; }
        if (current === "\\") {
          const escaped = step();
          result += ({ n: "\n", r: "\r", t: "\t", "\\": "\\", '"': '"', "'": "'" } as Record<string, string>)[escaped] ?? escaped;
        } else { result += current; }
      }
      if (!closed) throw new SiteMathError("UNTERMINATED_STRING", "String nao terminada.", { line: startLine, column: startColumn });
      add("string", result, startLine, startColumn);
      continue;
    }
    if (/[0-9]/u.test(value)) {
      let number = "";
      while (/[0-9.]/u.test(source[index] ?? "")) number += step();
      if (!/^\d+(?:\.\d+)?$/u.test(number)) throw new SiteMathError("INVALID_NUMBER", "Numero invalido.", { line: startLine, column: startColumn });
      add("number", Number(number), startLine, startColumn);
      continue;
    }
    if (/[A-Za-z_]/u.test(value)) {
      let identifier = "";
      while (/[A-Za-z0-9_]/u.test(source[index] ?? "")) identifier += step();
      add("identifier", identifier, startLine, startColumn);
      continue;
    }
    const pair = source.slice(index, index + 2);
    if (["=>", "<=", ">=", "==", "!=", "&&", "||", "++", "--", "+=", "-="].includes(pair)) {
      step(); step(); add("operator", pair, startLine, startColumn); continue;
    }
    if ("{}[]();,:.=+-*/%!<>".includes(value)) { step(); add("operator", value, startLine, startColumn); continue; }
    throw new SiteMathError("INVALID_CHARACTER", `Caractere invalido: ${value}`, { line: startLine, column: startColumn });
  }
  tokens.push({ type: "eof", value: "", line, column });
  return tokens;
}

class Parser {
  private readonly tokens: Token[];
  private index = 0;

  constructor(source: string) { this.tokens = tokenize(source); }
  private current(): Token { return this.tokens[this.index] as Token; }
  private currentValue(): string { return String(this.current().value); }
  private match(value: string): boolean { if (this.currentValue() === value) { this.index += 1; return true; } return false; }
  private expect(value: string, code = "EXPECTED_TOKEN"): Token { const token = this.current(); if (!this.match(value)) throw new SiteMathError(code, `Esperado: ${value}`, token); return token; }
  private identifier(): string { const token = this.current(); if (token.type !== "identifier") throw new SiteMathError("EXPECTED_IDENTIFIER", "Identificador esperado.", token); this.index += 1; return String(token.value); }

  parse(): SiteMathProgram {
    const fields: SiteMathField[] = [];
    const events: SiteMathEvent[] = [];
    while (this.current().type !== "eof") {
      const keyword = this.identifier();
      if (keyword === "field") fields.push(this.field());
      else if (keyword === "on") events.push(this.event());
      else throw new SiteMathError("INVALID_DECLARATION", `Declaracao invalida: ${keyword}`, this.current());
    }
    return { languageId: LANGUAGE_ID, fields, events };
  }

  private field(): SiteMathField {
    const id = this.identifier();
    this.expect(":");
    const candidate = this.identifier();
    if (!FIELD_TYPES.has(candidate as FieldType)) throw new SiteMathError("INVALID_FIELD_TYPE", `Tipo de campo invalido: ${candidate}`, this.current());
    const type = candidate as FieldType;
    this.expect("=");
    const literal = this.literal();
    this.expect(";");
    if (!isRecord(literal) || Array.isArray(literal)) throw new SiteMathError("INVALID_FIELD_OPTIONS", "Campo exige objeto de propriedades.", this.current());
    const options = literal as Record<string, LiteralValue>;
    if (type !== "hidden" && typeof options.label !== "string") throw new SiteMathError("MISSING_FIELD_LABEL", `Campo ${id} exige label.`, this.current());
    if (options.placeholder !== undefined && !["text", "textarea"].includes(type)) throw new SiteMathError("INVALID_PLACEHOLDER", "placeholder so e valido em text e textarea.", this.current());
    return { id, type, options };
  }

  private event(): SiteMathEvent {
    this.expect(".");
    const candidate = this.identifier();
    if (!EVENT_NAMES.has(candidate as EventName)) throw new SiteMathError("INVALID_EVENT", `Evento invalido: ${candidate}`, this.current());
    const name = candidate as EventName;
    this.expect("(");
    const dependencies: string[] = [];
    if (name === "change") {
      this.expect("[");
      if (!this.match("]")) { while (true) { dependencies.push(this.identifier()); if (this.match("]")) break; this.expect(","); } }
      this.expect(",");
    }
    this.expect("(");
    if (!this.match(")")) { this.identifier(); this.expect(")"); }
    this.expect("=>");
    const body = this.block();
    this.expect(")");
    this.expect(";");
    return { name, dependencies, body };
  }

  private block(): Statement[] { this.expect("{"); const statements: Statement[] = []; while (!this.match("}")) statements.push(this.statement()); return statements; }
  private statement(): Statement {
    const value = this.currentValue();
    if (value === "if") {
      this.index += 1; this.expect("("); const test = this.expression(); this.expect(")"); const consequent = this.block(); const alternate = this.match("else") ? this.block() : [];
      return { kind: "if", test, consequent, alternate };
    }
    if (value === "return") { this.index += 1; this.expect(";"); return { kind: "return" }; }
    if (value === "for") return this.forStatement();
    const left = this.expression();
    const operator = this.currentValue();
    if (operator === "=" || operator === "+=" || operator === "-=") { this.index += 1; const right = this.expression(); this.expect(";"); return { kind: "assign", left, operator, right }; }
    this.expect(";");
    return { kind: "expression", expression: left };
  }

  private forStatement(): Statement {
    this.expect("for"); this.expect("(");
    if (this.match("let")) {
      const id = this.identifier(); this.expect(":"); this.expect("number"); this.expect("="); const init = this.expression(); this.expect(";"); const test = this.expression(); this.expect(";");
      const updateId = this.identifier(); const candidate = this.currentValue();
      if (!["++", "--", "+=", "-="].includes(candidate)) throw new SiteMathError("INVALID_FOR_UPDATE", "Incremento invalido.", this.current());
      this.index += 1;
      const update = candidate as ForStatement["update"];
      const updateValue = update === "+=" || update === "-=" ? this.expression() : null;
      this.expect(")");
      return { kind: "for", id, init, test, updateId, update, updateValue, body: this.block() };
    }
    this.expect("const"); const id = this.identifier(); this.expect("of"); const iterable = this.expression(); this.expect(")");
    return { kind: "forOf", id, iterable, body: this.block() };
  }

  private literal(): LiteralValue {
    const token = this.current();
    if (token.type === "string" || token.type === "number") { this.index += 1; return token.value; }
    const value = this.currentValue();
    if (value === "true" || value === "false" || value === "null") { this.index += 1; return value === "true" ? true : value === "false" ? false : null; }
    if (this.match("[")) { const values: LiteralValue[] = []; if (this.match("]")) return values; while (true) { values.push(this.literal()); if (this.match("]")) return values; this.expect(","); if (this.match("]")) return values; } }
    if (this.match("{")) { const object: Record<string, LiteralValue> = {}; if (this.match("}")) return object; while (true) { const key = this.identifier(); this.expect(":"); object[key] = this.literal(); if (this.match("}")) return object; this.expect(","); if (this.match("}")) return object; } }
    throw new SiteMathError("INVALID_LITERAL", "Literal invalido.", token);
  }

  private expression(minimum = 0): Expression {
    let left = this.primary();
    const precedence: Record<string, number> = { "||": 1, "&&": 2, "==": 3, "!=": 3, "<": 4, ">": 4, "<=": 4, ">=": 4, "+": 5, "-": 5, "*": 6, "/": 6, "%": 6 };
    while ((precedence[this.currentValue()] ?? -1) >= minimum) {
      const operator = this.currentValue(); const level = precedence[operator] as number; this.index += 1;
      left = { kind: "binary", operator, left, right: this.expression(level + 1) };
    }
    return left;
  }

  private primary(): Expression {
    const token = this.current();
    let node: Expression;
    const value = this.currentValue();
    if (value === "!" || value === "-") { this.index += 1; node = { kind: "unary", operator: value, value: this.primary() }; }
    else if (value === "(") { this.index += 1; node = this.expression(); this.expect(")"); }
    else if (token.type === "string" || token.type === "number" || ["true", "false", "null"].includes(value)) node = { kind: "literal", value: this.literal() };
    else if (token.type === "identifier") { this.index += 1; node = { kind: "identifier", name: String(token.value) }; }
    else throw new SiteMathError("INVALID_EXPRESSION", "Expressao invalida.", token);
    while (true) {
      if (this.match(".")) node = { kind: "member", object: node, property: this.identifier() };
      else if (this.match("(")) { const args: Expression[] = []; if (!this.match(")")) { while (true) { args.push(this.expression()); if (this.match(")")) break; this.expect(","); } } node = { kind: "call", callee: node, args }; }
      else break;
    }
    return node;
  }
}

interface RuntimeScope { fields: Record<string, unknown>; [key: string]: unknown; }
interface Reference { target: Record<string, unknown>; key: string; }

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function getReference(node: Expression, scope: RuntimeScope): Reference {
  if (node.kind === "identifier") return { target: Object.hasOwn(scope.fields, node.name) ? scope.fields : scope, key: node.name };
  if (node.kind === "member") { const object = evaluate(node.object, scope); if (!isRecord(object)) throw new SiteMathError("INVALID_REFERENCE", "Referencia invalida."); return { target: object, key: node.property }; }
  throw new SiteMathError("INVALID_REFERENCE", "Referencia invalida.");
}

function evaluate(node: Expression, scope: RuntimeScope): unknown {
  if (node.kind === "literal") return node.value;
  if (node.kind === "identifier") { if (Object.hasOwn(scope.fields, node.name)) return scope.fields[node.name]; if (!(node.name in scope)) throw new SiteMathError("UNKNOWN_IDENTIFIER", `Identificador desconhecido: ${node.name}`); return scope[node.name]; }
  if (node.kind === "member") { const reference = getReference(node, scope); return reference.target[reference.key]; }
  if (node.kind === "unary") { const value = evaluate(node.value, scope); return node.operator === "!" ? !value : -Number(value); }
  if (node.kind === "binary") {
    const a = evaluate(node.left, scope); const b = evaluate(node.right, scope);
    const operators: Record<string, () => unknown> = { "+": () => typeof a === "string" || typeof b === "string" ? String(a) + String(b) : Number(a) + Number(b), "-": () => Number(a) - Number(b), "*": () => Number(a) * Number(b), "/": () => Number(a) / Number(b), "%": () => Number(a) % Number(b), "==": () => a === b, "!=": () => a !== b, "<": () => Number(a) < Number(b), ">": () => Number(a) > Number(b), "<=": () => Number(a) <= Number(b), ">=": () => Number(a) >= Number(b), "&&": () => a && b, "||": () => a || b };
    return (operators[node.operator] as () => unknown)();
  }
  if (node.kind === "call") {
    const reference = getReference(node.callee, scope); const callable = reference.target[reference.key];
    if (typeof callable !== "function") throw new SiteMathError("INVALID_CALL", "Chamada invalida.");
    return (callable as (...args: unknown[]) => unknown)(...node.args.map((argument) => evaluate(argument, scope)));
  }
  throw new SiteMathError("INVALID_EXPRESSION", "Expressao nao avaliavel.");
}

function execute(statements: Statement[], scope: RuntimeScope, budget: { left: number }): boolean {
  for (const statement of statements) {
    if (--budget.left < 0) throw new SiteMathError("ITERATION_LIMIT", "Limite de iteracoes excedido.");
    if (statement.kind === "return") return true;
    if (statement.kind === "expression") evaluate(statement.expression, scope);
    if (statement.kind === "assign") {
      const reference = getReference(statement.left, scope);
      if (reference.target !== scope && reference.target !== scope.fields) throw new SiteMathError("INVALID_ASSIGNMENT", "Atribuicao nao permitida.");
      const value = evaluate(statement.right, scope); const current = reference.target[reference.key];
      reference.target[reference.key] = statement.operator === "+=" ? Number(current) + Number(value) : statement.operator === "-=" ? Number(current) - Number(value) : value;
    }
    if (statement.kind === "if" && execute(evaluate(statement.test, scope) ? statement.consequent : statement.alternate, scope, budget)) return true;
    if (statement.kind === "for") {
      scope[statement.id] = evaluate(statement.init, scope);
      while (evaluate(statement.test, scope)) {
        if (execute(statement.body, scope, budget)) return true;
        const current = Number(scope[statement.updateId]); const delta = statement.updateValue === null ? 1 : Number(evaluate(statement.updateValue, scope));
        scope[statement.updateId] = statement.update === "++" ? current + 1 : statement.update === "--" ? current - 1 : statement.update === "+=" ? current + delta : current - delta;
      }
    }
    if (statement.kind === "forOf") {
      const values = evaluate(statement.iterable, scope);
      if (!values || typeof (values as Iterable<unknown>)[Symbol.iterator] !== "function") throw new SiteMathError("INVALID_ITERABLE", "Colecao invalida.");
      for (const value of values as Iterable<unknown>) { scope[statement.id] = value; if (execute(statement.body, scope, budget)) return true; }
    }
  }
  return false;
}

/** Converte código SiteMath em uma árvore sintática validada. */
export function parse(source: string): SiteMathProgram { return new Parser(String(source ?? "")).parse(); }
function fencedBlocks(markdown: string): string[] { return [...String(markdown ?? "").matchAll(/^```sitemath\s*\n([\s\S]*?)^```\s*$/gmu)].map((match) => match[1] ?? ""); }
function htmlBlocks(html: string): string[] { return [...String(html ?? "").matchAll(/<script\b[^>]*\btype\s*=\s*["']text\/x-sitemath["'][^>]*>([\s\S]*?)<\/script>/giu)].map((match) => match[1] ?? ""); }
function detect(source: string, kind: "html" | "markdown"): DetectionReport {
  const blocks = kind === "html" ? htmlBlocks(source) : fencedBlocks(source);
  const results = blocks.map((code): DetectionResult => { try { return { valid: true, ast: parse(code) }; } catch (error) { return { valid: false, error: diagnostic(error) }; } });
  return { languageId: LANGUAGE_ID, found: blocks.length, valid: results.filter((result) => result.valid).length, results };
}
/** Detecta blocos válidos SiteMath em HTML sem executá-los. */
export function detectHtml(source: string): DetectionReport { return detect(source, "html"); }
/** Detecta blocos válidos SiteMath em Markdown sem executá-los. */
export function detectMarkdown(source: string): DetectionReport { return detect(source, "markdown"); }
/** Cria um adaptador Node de detecção compatível com gerenciadores de conteúdo. */
export function createNodeAdapter(): NodeAdapter { return Object.freeze({ languageId: LANGUAGE_ID, detectMarkdown, detectHtml }); }
/** Normaliza uma exceção para o contrato de diagnóstico público. */
export function diagnostic(error: unknown): SiteMathDiagnostic { const value = error as Partial<SiteMathError>; return { code: value.code ?? "RUNTIME_ERROR", message: value.message ?? "Erro de runtime.", line: value.line ?? 0, column: value.column ?? 0 }; }
/** Mescla opções de runtime com os valores padrão imutáveis. */
export function configure(config: SiteMathConfig = {}): Readonly<Required<SiteMathConfig>> { return Object.freeze({ ...DEFAULT_CONFIG, ...config }); }

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
/** Instância montada, exposta para integração e testes controlados. */
export interface MountedSiteMath {
  ast: SiteMathProgram;
  fields: Record<string, unknown>;
  form: HTMLFormElement;
  run(name: EventName, event?: unknown): void;
}

/** Monta todos os blocos HTML SiteMath do documento no cliente. */
export function mount(document: Document, config?: SiteMathConfig): MountedSiteMath[] {
  const merged = configure(config);
  return [...document.querySelectorAll<HTMLScriptElement>(`script[type="${SCRIPT_TYPE}"]`)].map((script) => mountBlock(script, document, merged));
}

function mountBlock(script: HTMLScriptElement, document: Document, config: Readonly<Required<SiteMathConfig>>): MountedSiteMath {
  let ast: SiteMathProgram;
  try { ast = parse(script.textContent ?? ""); } catch (error) { emit(script, "sitemath:error", diagnostic(error)); return { error: diagnostic(error) } as unknown as MountedSiteMath; }
  const form = document.createElement("form"); form.className = "sitemath"; form.noValidate = true; script.insertAdjacentElement("afterend", form);
  const errorRegion = document.createElement("div"); errorRegion.className = "sitemath-error"; errorRegion.setAttribute("role", "alert"); errorRegion.setAttribute("aria-live", "assertive"); form.append(errorRegion);
  const fields: Record<string, unknown> = {}; const controls: Record<string, Control> = {};
  for (const field of ast.fields) renderField(document, form, field, fields, controls);
  const handlers = new Map(ast.events.map((event) => [event.name, event]));
  const notify = Object.fromEntries((["info", "success", "error", "debug"] as const).map((level) => [level, (message: unknown): void => { const payload: SiteMathNotification = { level, message: String(message) }; emit(form, "sitemath:notify", payload); config.onNotify?.(payload); }]));
  let queue: Promise<void> = Promise.resolve();
  const run = (name: EventName, event?: unknown): void => {
    queue = queue.then(() => {
      const handler = handlers.get(name); if (!handler) return;
      const scope: RuntimeScope = {
        ...fields, fields, event: event ?? {}, notify, min: Math.min, max: Math.max,
        sum: (values: unknown): number => Array.from(values as Iterable<unknown>).reduce<number>((total, value) => total + Number(value), 0),
        price: (value: unknown): unknown => { if (!config.price) throw new SiteMathError("PRICE_RESOLVER_MISSING", "Resolvedor price ausente."); return config.price(value); },
        limit: (values: unknown, limit: unknown): unknown[] => Array.from(values as Iterable<unknown>).slice(0, Math.max(0, Math.min(Number(limit), config.maxIterations)))
      };
      execute(handler.body, scope, { left: config.maxIterations }); syncControls(ast.fields, fields, controls);
    }).catch((error: unknown) => {
      const payload = diagnostic(error); errorRegion.textContent = payload.message; emit(form, "sitemath:error", payload);
      if (handlers.has("error") && name !== "error") run("error", payload);
    });
  };
  for (const [id, control] of Object.entries(controls)) control.addEventListener("change", () => { fields[id] = readControl(control); run("change", { type: "change", field: id }); });
  form.addEventListener("submit", (event) => { if (handlers.has("submit")) event.preventDefault(); run("submit", { preventDefault: (): void => event.preventDefault() }); });
  run("init", { type: "init" });
  return { ast, fields, form, run };
}

function renderField(document: Document, form: HTMLFormElement, field: SiteMathField, values: Record<string, unknown>, controls: Record<string, Control>): void {
  const options = field.options; const id = `sitemath-${field.id}`; values[field.id] = options.value ?? (field.type === "checkbox" ? false : "");
  if (field.type === "hidden") { const input = document.createElement("input"); input.type = "hidden"; input.name = field.id; input.value = String(values[field.id]); form.append(input); controls[field.id] = input; return; }
  const wrapper = document.createElement("div"); wrapper.className = `sitemath-field sitemath-${field.type}`; const label = document.createElement("label"); label.htmlFor = id; label.textContent = String(options.label); wrapper.append(label);
  const tip = typeof options.tip === "string" ? document.createElement("small") : null;
  if (tip) { tip.id = `${id}-tip`; tip.textContent = String(options.tip); wrapper.append(tip); }
  let control: Control;
  if (field.type === "textarea") control = document.createElement("textarea");
  else if (field.type === "radio" || field.type === "select") { const select = document.createElement("select"); for (const option of Array.isArray(options.options) ? options.options : []) { if (!isRecord(option)) continue; const element = document.createElement("option"); element.value = String(option.value ?? ""); element.textContent = String(option.label ?? ""); select.append(element); } control = select; }
  else { const input = document.createElement("input"); input.type = field.type === "checkbox" ? "checkbox" : field.type; control = input; }
  control.id = id; control.name = field.id; control.required = options.required === true; if ("readOnly" in control) control.readOnly = options.readonly === true; if (tip) control.setAttribute("aria-describedby", tip.id); if (typeof options.placeholder === "string" && "placeholder" in control) control.placeholder = options.placeholder; if (options.min !== undefined && "min" in control) control.min = String(options.min); if (options.max !== undefined && "max" in control) control.max = String(options.max); writeControl(control, values[field.id]); wrapper.append(control); form.append(wrapper); controls[field.id] = control;
}

function readControl(control: Control): unknown { const type = (control as HTMLInputElement).type; return type === "checkbox" ? (control as HTMLInputElement).checked : type === "number" ? Number(control.value || 0) : control.value; }
function writeControl(control: Control, value: unknown): void { if ((control as HTMLInputElement).type === "checkbox") (control as HTMLInputElement).checked = Boolean(value); else control.value = value == null ? "" : String(value); }
function syncControls(definitions: SiteMathField[], fields: Record<string, unknown>, controls: Record<string, Control>): void { for (const field of definitions) { const control = controls[field.id]; if (control) writeControl(control, fields[field.id]); } }
function emit(element: EventTarget, name: string, detail: unknown): void { if (typeof CustomEvent !== "undefined") element.dispatchEvent(new CustomEvent(name, { detail })); }
