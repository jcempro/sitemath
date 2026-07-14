# RCF — SiteMath

## 1. Escopo e precedência

Este RCF define o produto SiteMath; `AGENTS.md` define o processo da IA. O produto é uma linguagem declarativa embutível em conteúdo gerenciado, com runtime obrigatório no navegador e integração opcional de detecção no build. Código, sintaxe completa e adaptadores ainda não existem; nenhuma semântica não registrada deve ser inferida.

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

## 7. Qualidade

A implementação DEVE ser modular, acessível, testável e sem dependências desnecessárias. Build e runtime DEVEM validar os mesmos marcadores canônicos. Alteração de sintaxe, manifesto, limite, eventos ou modo de execução DEVE atualizar este RCF, testes, documentação, memória e adaptadores aplicáveis no mesmo ciclo.
