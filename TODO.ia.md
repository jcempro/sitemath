# TODO — Integração opcional, segura e desacoplada de bibliotecas externas na DSL

## Contexto

A DSL DEVE permanecer isolada, segura, resiliente e aderente ao padrão linguístico definido no RCF, prioritariamente semelhante ao TypeScript. Contudo, scripts da DSL DEVEM poder utilizar bibliotecas externas previamente aprovadas pelo repositório, quando disponibilizadas explicitamente pelo ambiente hospedeiro.

Essa extensibilidade NÃO PODE transformar bibliotecas externas em dependências da DSL, comprometer sua execução autônoma ou introduzir acoplamento inverso.

## Objetivo

Normatizar e implementar:

1. declaração de dependências externas requeridas ou opcionais;
2. detecção antecipada de dependências requeridas ausentes;
3. consulta, durante a execução, da disponibilidade de dependências opcionais;
4. contrato universal de exposição, tipagem, associação semântica e comunicação entre a DSL e bibliotecas externas;
5. reutilização prioritária de padrões, manifestos e ferramentas existentes, especialmente do ecossistema TypeScript, com apenas adaptações cirúrgicas indispensáveis.

## Requisitos normativos

### 1. Independência da DSL

- [ ] A biblioteca principal da DSL DEVE continuar integralmente funcional sem qualquer biblioteca externa.
- [ ] A DSL NÃO DEVE incluir, incorporar, distribuir, instalar, carregar automaticamente, exigir nem recomendar bibliotecas externas.
- [ ] Nenhuma biblioteca externa PODE tornar-se dependência obrigatória de build, distribuição ou runtime da DSL, salvo ferramenta estritamente interna de build/transpilação nos termos deste TODO.
- [ ] O núcleo NÃO DEVE importar diretamente pacotes externos destinados aos scripts.
- [ ] Bibliotecas externas DEVEM ser disponibilizadas pelo ambiente hospedeiro por meio do contrato de integração definido pela DSL.
- [ ] Apenas bibliotecas previamente aprovadas pelo repositório PODEM ser expostas ao contexto da DSL.
- [ ] A ausência de integrações externas NÃO PODE degradar recursos nativos, segurança, previsibilidade, compatibilidade nem resiliência da DSL.
- [ ] O comportamento padrão DEVE ser de negação: símbolos, objetos ou capacidades não declarados e não disponibilizados NÃO DEVEM ficar acessíveis ao script.

### 2. Declaração de dependências

A pseudo-linguagem DEVE receber notação padronizada para diferenciar:

- **dependência requerida**: indispensável à execução do script;
- **dependência opcional**: desejável, mas dispensável.

A sintaxe DEVE:

- [ ] aderir prioritariamente ao estilo de importação do TypeScript;
- [ ] utilizar conceitos semelhantes aos do C/C++ somente quando o modelo TypeScript for insuficiente;
- [ ] integrar-se à gramática, análise léxica, tipagem e semântica já existentes;
- [ ] ser inequívoca, analisável estaticamente e declarada antes do uso;
- [ ] permitir importação seletiva, alias e tipos, quando compatíveis com os recursos atuais;
- [ ] não ser confundida com instalação, download ou resolução de pacotes;
- [ ] identificar a integração por nome lógico estável, sem presumir pacote, caminho físico ou mecanismo de carregamento.

Modelo semântico esperado, sujeito apenas à adequação lexical ao RCF vigente:

```ts
import required { recurso } from "biblioteca";
import optional { recursoOpcional } from "biblioteca";
````

A implementação PODE adotar forma equivalente mais aderente à gramática existente, mas DEVE preservar explicitamente os qualificadores `required` e `optional` ou termos normativos equivalentes igualmente inequívocos.

### 3. Dependências requeridas

* [ ] Todas as dependências requeridas DEVEM ser resolvidas e validadas antes do início da execução material do script.
* [ ] A ausência, incompatibilidade ou exposição incompleta de qualquer dependência requerida DEVE interromper o processamento tão cedo quanto tecnicamente possível.
* [ ] Nenhuma instrução dependente ou independente DEVE ser executada quando a validação prévia determinar que o script é inexequível.
* [ ] O erro DEVE identificar, sem expor dados sensíveis:

  * dependência;
  * requisito não atendido;
  * versão ou capacidade esperada, quando declarada;
  * símbolo ou contrato ausente;
  * origem da declaração no script.
* [ ] A interrupção DEVE ser determinística e utilizar o sistema de erros já normatizado, sem `fallback` silencioso.

### 4. Dependências opcionais

* [ ] A ausência de dependência opcional NÃO DEVE impedir análise, preparação ou execução do script.
* [ ] O runtime interno DEVE fornecer mecanismo nativo, seguro e tipado para consultar a disponibilidade de uma ou mais dependências opcionais previamente declaradas.
* [ ] O script DEVE poder criar condicionantes e tratamentos distintos para disponibilidade, indisponibilidade ou incompatibilidade.
* [ ] A consulta NÃO DEVE permitir sondagem arbitrária de bibliotecas não declaradas.
* [ ] Símbolos opcionais NÃO DEVEM ser invocados fora de fluxo protegido por verificação reconhecida pelo analisador/runtime, salvo quando o sistema de tipos conseguir provar sua disponibilidade.
* [ ] O mecanismo DEVE permitir verificação por integração e, quando necessário, por capacidade ou símbolo exposto.
* [ ] A indisponibilidade esperada de dependência opcional NÃO DEVE ser tratada como erro de execução.
* [ ] Falhas ocorridas após a confirmação de disponibilidade DEVEM seguir o tratamento normal de erros da DSL, sem serem convertidas indevidamente em “dependência ausente”.

Exemplo semântico:

```ts
if (dependency.available("biblioteca")) {
  // uso da integração opcional
} else {
  // alternativa nativa ou ausência deliberada de ação
}
```

O identificador e a sintaxe finais DEVEM seguir o padrão linguístico existente e evitar novos globais quando já houver namespace apropriado.

## Contrato de integração

### 5. Princípio arquitetural

A integração DEVE ocorrer por contrato definido e controlado pela DSL.

* [ ] A biblioteca externa PODE expor métodos, funções, objetos, propriedades, tipos, eventos, iteradores e capacidades customizadas.
* [ ] A biblioteca externa NÃO PODE impor requisitos, alterar a gramática, acessar internamente o runtime, exigir dependências da DSL ou determinar o funcionamento do núcleo.
* [ ] O contrato DEVE ser unilateral quanto à governança: a DSL define como integrações são declaradas, validadas, expostas e executadas; a biblioteca externa apenas se adapta voluntariamente.
* [ ] O adaptador ou manifesto NÃO DEVE conceder acesso irrestrito ao objeto original quando apenas parte de sua superfície for necessária.
* [ ] Somente elementos explicitamente aprovados e expostos DEVEM ingressar no contexto do script.
* [ ] A integração DEVE preservar isolamento de estado, tratamento de erros, limites de execução e demais controles de segurança existentes.

### 6. Manifesto de tipos e símbolos

A tipagem DEVE reutilizar prioritariamente declarações equivalentes a `.d.ts` do TypeScript.

O manifesto de tipos DEVE conter somente as informações necessárias à análise e ao uso pela DSL, incluindo:

* nomes públicos expostos;
* categorias dos símbolos;
* assinaturas;
* tipos de parâmetros;
* tipos de retorno;
* sobrecargas relevantes;
* propriedades;
* eventos;
* tipos genéricos, quando suportados;
* tipos personalizados referenciados;
* nulabilidade, opcionalidade e assincronismo, quando relevantes.

Não é necessário preservar nomes de parâmetros quando apenas seus tipos forem semanticamente necessários. Nomes DEVEM ser mantidos apenas quando influenciarem chamadas nomeadas, documentação, associação semântica ou validação.

A biblioteca externa:

* PODE declarar toda a sua API pública;
* DEVE tornar identificável o subconjunto efetivamente exposto à DSL;
* NÃO DEVE obrigar a DSL a processar, carregar ou disponibilizar símbolos não utilizados;
* NÃO DEVE exigir duplicação manual de definições já fornecidas por manifesto padrão confiável.

### 7. Manifesto de associação com a DSL

Declarações de tipos descrevem símbolos, mas normalmente não informam como eles se associam à DSL. Portanto, quando o formato reutilizado não contiver todos os dados necessários, DEVE existir manifesto complementar exclusivo, sem redefinir informações já disponíveis.

Esse manifesto DEVE referenciar as declarações existentes e informar somente a semântica adicional necessária, incluindo, conforme aplicável:

* identificador lógico único da integração;
* nome e versão do contrato;
* compatibilidade com versões da DSL;
* dependências ou capacidades próprias da integração;
* símbolos efetivamente expostos;
* nome, namespace, alias ou sintaxe visível na DSL;
* regras léxicas ou sintáticas adicionais estritamente permitidas;
* associação entre símbolo da DSL e símbolo externo;
* operação externa a ser invocada;
* forma de passagem e normalização de argumentos;
* tipo, estrutura e semântica do retorno;
* comportamento síncrono, assíncrono, iterável, observável ou orientado a eventos;
* modelo de erros e sua conversão para erros da DSL;
* gatilhos, eventos ou callbacks escutáveis;
* ciclo de vida, inicialização e encerramento, quando necessários;
* permissões ou capacidades explicitamente requeridas;
* mutabilidade, efeitos colaterais e persistência de estado relevantes;
* limites, cancelamento e descarte, quando suportados;
* estratégia de iteração e propriedade do fluxo;
* elementos obrigatórios para validar que a integração está completa.

O formato DEVE ser legível por máquina e aderente aos padrões documentais já adotados pelo repositório, preferencialmente JSON ou YAML. XML NÃO DEVE ser introduzido.

### 8. Iteração e fluxos

Para retornos iteráveis, paginados, incrementais, assíncronos ou orientados a eventos, o manifesto DEVE declarar explicitamente um dos modelos:

1. **materialização pela integração**: a biblioteca externa resolve o fluxo e entrega à DSL o conteúdo final;
2. **iteração pela DSL**: a integração entrega estrutura iterável padronizada, e a DSL controla a iteração;
3. **iteração intermediada**: a DSL controla o fluxo por operações externas padronizadas, como iniciar, avançar, consultar estado, cancelar e encerrar.

A preferência DEVE ser:

1. iteração integralmente controlada pela DSL, quando segura e tecnicamente viável;
2. estrutura iterável padronizada;
3. intermediação passo a passo somente quando inevitável.

Quando houver intermediação, o contrato DEVE identificar inequivocamente as operações correspondentes, estados possíveis, término, erro, cancelamento e descarte.

## Padronização e extensibilidade

### 9. Contratos comuns

* [ ] A DSL DEVE definir contratos estritos para finalidades recorrentes que possam ser universalizadas sem limitar integrações legítimas.
* [ ] DEVEM ser reutilizados padrões existentes para funções, propriedades, eventos, callbacks, promessas, iteradores, streams, erros e ciclos de vida.
* [ ] Integrações customizadas DEVEM continuar permitidas quando os contratos comuns forem insuficientes.
* [ ] Extensões customizadas NÃO DEVEM alterar o núcleo, contornar validações ou criar sintaxe arbitrária fora dos pontos de extensão normatizados.
* [ ] Contratos especializados DEVEM complementar, e não duplicar ou contradizer, o contrato comum.
* [ ] O objetivo DEVE ser interoperabilidade previsível com o menor esforço possível para a biblioteca externa.

### 10. Reutilização de padrões existentes

A solução NÃO DEVE inovar onde houver padrão consolidado suficiente.

Devem ser avaliados e preferidos, conforme compatibilidade:

* declarações TypeScript;
* TypeScript Compiler API ou ferramentas equivalentes para leitura de tipos;
* formatos de manifesto já consolidados;
* JSON Schema ou mecanismo equivalente para validação estrutural;
* padrões JavaScript para promessas, iteradores, iteradores assíncronos, eventos e erros;
* geração automatizada de metadados a partir de fontes existentes.

Adaptações DEVEM ser cirúrgicas e limitar-se às informações semânticas que os padrões reutilizados não representem.

## Ferramentas de build

Dependências externas open source PODEM ser adotadas para geração, validação ou transformação de manifestos quando:

* [ ] forem estáveis, mantidas, auditáveis e compatíveis com a licença do projeto;
* [ ] forem utilizadas exclusivamente em build, desenvolvimento ou transpilação;
* [ ] não integrarem o runtime cliente nem o artefato distribuído, salvo necessidade explicitamente aprovada;
* [ ] não tornarem a biblioteca externa dependente da DSL;
* [ ] puderem ser substituídas sem alterar o contrato público;
* [ ] reduzirem trabalho manual e favorecerem formatos universais;
* [ ] forem aderentes aos ambientes de construção normalmente utilizados pelas bibliotecas integráveis.

Como a saída principal da DSL é JavaScript executado no cliente, a ferramenta de build NÃO PRECISA ser implementada em JavaScript, mas DEVE produzir artefatos interoperáveis, determinísticos e independentes da linguagem usada para gerá-los.

## Segurança e resiliência

* [ ] Manifestos DEVEM ser validados antes do registro da integração.
* [ ] Tipos, símbolos e capacidades declarados DEVEM ser confrontados com a exposição efetivamente fornecida.
* [ ] Incompatibilidades DEVEM impedir apenas o registro da integração afetada, salvo quando ela for requerida pelo script.
* [ ] O runtime NÃO DEVE confiar em declarações de tipo como mecanismo de segurança.
* [ ] Chamadas externas DEVEM atravessar a camada controlada de integração.
* [ ] Erros externos DEVEM ser normalizados sem ocultar sua causa técnica relevante.
* [ ] A integração NÃO DEVE obter acesso implícito ao parser, AST, runtime, escopo, armazenamento, rede, DOM ou demais recursos internos.
* [ ] Capacidades sensíveis DEVEM exigir exposição e aprovação explícitas.
* [ ] O script NÃO DEVE instalar, localizar ou carregar dependências por URL, caminho, pacote ou acesso à rede.
* [ ] Falhas de integração NÃO DEVEM corromper estado interno nem impedir recuperação controlada do runtime.
* [ ] A implementação DEVE preservar compatibilidade com scripts existentes que não utilizem dependências externas.

## Implementação

* [ ] Inspecionar integralmente o RCF, gramática, parser, analisador, sistema de tipos, runtime, tratamento de erros e mecanismos atuais de extensão.
* [ ] Identificar precedências documentais e evitar alteração incompatível da linguagem.
* [ ] Normatizar os conceitos `required` e `optional`.
* [ ] Definir a gramática e o modelo AST correspondentes.
* [ ] Implementar análise estática das declarações.
* [ ] Implementar resolução somente contra integrações previamente registradas pelo hospedeiro.
* [ ] Implementar validação antecipada das dependências requeridas.
* [ ] Implementar consulta segura de disponibilidade das opcionais.
* [ ] Integrar refinamento de tipos após verificação de disponibilidade, quando suportado.
* [ ] Definir e validar o manifesto de tipos.
* [ ] Definir o manifesto complementar de associação.
* [ ] Implementar registro, validação, exposição e descarte das integrações.
* [ ] Implementar contratos para chamadas, eventos, assincronismo e iteração.
* [ ] Preservar isolamento e controles existentes.
* [ ] Atualizar RCF, documentação técnica, exemplos e schemas aplicáveis.
* [ ] Registrar decisões arquiteturais relevantes e eventuais limitações inevitáveis.

## Testes obrigatórios

* [ ] Script sem dependências externas mantém comportamento anterior.
* [ ] Dependência requerida disponível permite execução.
* [ ] Dependência requerida ausente interrompe antes da execução material.
* [ ] Dependência requerida incompleta ou incompatível produz erro determinístico.
* [ ] Dependência opcional ausente não impede execução.
* [ ] Dependência opcional disponível pode ser detectada e utilizada.
* [ ] Símbolo opcional não verificado é rejeitado ou protegido pelo sistema de tipos/runtime.
* [ ] Biblioteca não aprovada não pode ser registrada ou acessada.
* [ ] Símbolo não exposto permanece inacessível.
* [ ] Manifesto inválido é rejeitado.
* [ ] Declaração de tipos e manifesto complementar não divergem silenciosamente.
* [ ] APIs síncronas, assíncronas, iteráveis e orientadas a eventos funcionam conforme contrato.
* [ ] Erros externos são convertidos sem corrupção de estado.
* [ ] Cancelamento e descarte encerram recursos quando aplicáveis.
* [ ] Nenhuma biblioteca externa é incluída automaticamente no bundle da DSL.
* [ ] Ferramentas exclusivamente de build não vazam para o runtime cliente.
* [ ] Scripts existentes permanecem compatíveis.
* [ ] A execução permanece segura quando uma integração falha durante o uso.

## Fora de escopo

* instalação ou gerenciamento de pacotes pela DSL;
* carregamento remoto de código por scripts;
* recomendação de bibliotecas externas;
* exposição automática de APIs completas;
* alteração irrestrita da gramática por integrações;
* incorporação de bibliotecas externas ao núcleo;
* garantia de compatibilidade com bibliotecas não adaptadas ao contrato;
* criação de padrão proprietário quando um padrão existente puder ser reutilizado adequadamente.

## Critérios de aceite

* [ ] A DSL executa de forma autônoma sem integrações.
* [ ] Dependências externas são sempre opcionais para a biblioteca, ainda que possam ser requeridas por um script específico.
* [ ] Apenas integrações aprovadas e injetadas explicitamente ficam disponíveis.
* [ ] Scripts diferenciam inequivocamente dependências requeridas e opcionais.
* [ ] Requisitos ausentes falham cedo; opcionais ausentes permanecem tratáveis em runtime.
* [ ] A sintaxe permanece aderente ao padrão TypeScript-like definido no RCF.
* [ ] Tipos existentes são reutilizados sem duplicação desnecessária.
* [ ] Informações semânticas ausentes são fornecidas por manifesto complementar mínimo.
* [ ] O contrato cobre exposição, chamadas, retornos, erros, eventos, assincronismo, iteração e ciclo de vida.
* [ ] Bibliotecas externas podem oferecer recursos customizados sem impor requisitos ao núcleo.
* [ ] O fluxo comum exige adaptação mínima de bibliotecas que já sigam boas práticas.
* [ ] Nenhuma dependência de integração é distribuída ou exigida pela DSL.
* [ ] Segurança, isolamento, resiliência e retrocompatibilidade são demonstrados por testes.
* [ ] RCF e documentação tornam o recurso determinístico, universal e implementável sem conhecimento externo.
