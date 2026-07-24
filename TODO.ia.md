- [ ] **Aprimorar a DSL existente para suportar dependências externas opcionais, pré-aprovadas, desacopladas do núcleo e capazes de estender controladamente a pseudo-linguagem**, preservando a implementação, a arquitetura, o isolamento, a segurança, a resiliência, o tamanho final do build, a retrocompatibilidade e o padrão linguístico TypeScript-like já definidos no RCF.

  - **Preservação e escopo**
    - Tratar esta tarefa como evolução cirúrgica do projeto já implementado, NÃO como implantação, reescrita ou substituição da DSL.
    - Inspecionar antes de alterar o RCF, a gramática, o parser, a AST, o analisador, o sistema de tipos, o runtime, o tratamento de erros, o build e os mecanismos atuais de extensão.
    - Preservar integralmente scripts, contratos, comportamentos e recursos existentes que não utilizem integrações externas.
    - A DSL DEVE continuar autônoma, segura, resiliente e plenamente funcional sem qualquer biblioteca externa.
    - Bibliotecas externas NÃO DEVEM integrar, contaminar nem condicionar o núcleo da DSL.
    - A DSL NÃO DEVE incluir, distribuir, instalar, baixar, carregar automaticamente, exigir, recomendar nem tornar obrigatória qualquer biblioteca externa.
    - Nenhuma integração externa PODE tornar-se dependência de build, distribuição ou runtime do produto, exceto ferramenta open source estritamente limitada à geração, validação ou transpilação de manifestos durante o build.
    - Somente bibliotecas previamente aprovadas pelo repositório e explicitamente disponibilizadas pelo ambiente hospedeiro PODEM ingressar no contexto da DSL.
    - A disponibilidade de uma biblioteca ao script NÃO implica importação física, resolução de pacote, acesso por URL, instalação ou carregamento realizado pela própria DSL.
    - A extensão da linguagem DEVE permanecer opcional para o núcleo: o código da biblioteca externa, seus recursos e suas regras especializadas NÃO DEVEM integrar o bundle principal da DSL.
    - A infraestrutura de integração e hooks adicionada ao núcleo DEVE ser mínima, genérica, reutilizável e proporcional, evitando crescimento desnecessário do artefato final.

  - **Declaração de dependências no script**
    - Normatizar e implementar, na pseudo-linguagem existente, notação aderente prioritariamente ao estilo TypeScript e, apenas quando este for insuficiente, a conceitos equivalentes de C/C++.
    - A notação DEVE diferenciar inequivocamente:
      - dependência **requerida/essencial**, sem a qual o script não pode executar;
      - dependência **opcional/desejável**, cuja ausência não impede a execução.
    - A sintaxe DEVE integrar-se ao padrão léxico, sintático, semântico e de tipagem já determinado no RCF, sem criar dialeto paralelo.
    - A declaração DEVE identificar uma integração lógica, e não presumir nome de pacote, caminho físico, módulo JavaScript, mecanismo de carregamento ou origem de distribuição.
    - A forma final PODE ser semanticamente equivalente a:

      ```ts
      import required { recurso } from "biblioteca";
      import optional { recursoOpcional } from "biblioteca";
      ```

    - A sintaxe definitiva DEVE ser escolhida conforme a gramática existente, preservando explicitamente a distinção entre requisito e opcionalidade.
    - Quando compatível com a linguagem atual, DEVEM ser admitidos importação seletiva, alias, tipos e demais construções já suportadas, sem ampliar o escopo apenas para reproduzir integralmente o sistema de módulos do TypeScript.
    - A declaração de uma integração que estenda globalmente a linguagem DEVE vincular previamente o script ou o contexto de execução ao respectivo manifesto, permitindo identificar qual extensão responde por cada sintaxe, símbolo ou semântica adicional.
    - A vinculação prévia NÃO DEVE implicar disponibilidade imediata do código executável da dependência; manifesto, descrição estática e implementação externa DEVEM poder possuir ciclos de disponibilidade distintos.

  - **Dependências requeridas**
    - Dependências requeridas DEVEM ser verificadas tão cedo quanto tecnicamente possível, respeitando o carregamento real dos assets e evitando falsos negativos causados por dependências ainda em carregamento.
    - A análise preliminar de manifestos declarativos embutidos PODE identificar, validar e registrar dependências já disponíveis, mas NÃO DEVE exigir prematuramente sua presença quando o ambiente ainda puder carregá-las.
    - A exigibilidade definitiva DEVE ocorrer no primeiro ponto em que a dependência for materialmente necessária e, obrigatoriamente, antes que qualquer instrução dependente ou execução material do script produza efeitos.
    - A ausência, incompatibilidade, indisponibilidade ou exposição incompleta de qualquer dependência requerida DEVE interromper o processamento tão cedo quanto for possível determinar validamente a falha.
    - A falha DEVE ser determinística, utilizar o sistema de erros já existente e identificar, conforme aplicável:
      - integração ausente;
      - versão, capacidade ou contrato incompatível;
      - símbolo ou recurso requerido não exposto;
      - extensão lexical, sintática ou semântica indisponível;
      - localização da declaração ou do uso no script.
    - NÃO DEVE existir fallback silencioso, execução parcial, tentativa automática de instalação, localização ou obtenção da dependência.

  - **Dependências opcionais**
    - A ausência de dependência opcional NÃO DEVE impedir a análise preliminar, a leitura dos manifestos declarativos nem a execução das partes independentes do script.
    - O runtime interno da DSL DEVE disponibilizar mecanismo nativo, seguro e coerente com o padrão linguístico existente para o próprio script verificar se uma ou mais dependências opcionais previamente declaradas:
      - foram disponibilizadas;
      - estão carregadas e vinculadas;
      - são compatíveis;
      - expõem determinada capacidade, símbolo ou extensão.
    - A verificação NÃO DEVE permitir sondagem arbitrária de bibliotecas não declaradas.
    - O script DEVE poder condicionar seu fluxo e tratar adequadamente tanto a presença quanto a ausência da integração.
    - Quando o sistema de tipos permitir, a verificação DEVE refinar a disponibilidade e os tipos dos símbolos no bloco condicionado.
    - Símbolos opcionais NÃO DEVEM ser usados fora de fluxo validado, salvo quando sua disponibilidade puder ser provada estaticamente.
    - A ausência esperada de integração opcional NÃO DEVE ser classificada como erro.
    - Falhas ocorridas após a integração ter sido confirmada como disponível DEVEM seguir o tratamento normal de erros da DSL, sem serem mascaradas como mera ausência de dependência.
    - A forma final PODE ser semanticamente equivalente a:

      ```ts
      if (dependency.available("biblioteca")) {
        // uso da integração
      } else {
        // tratamento alternativo
      }
      ```

    - O identificador, namespace e sintaxe reais DEVEM reutilizar estruturas já existentes sempre que possível, evitando novos globais desnecessários.
    - Quando uma extensão opcional introduzir sintaxe que o núcleo não consiga interpretar isoladamente, a implementação DEVE:
      - identificar essa necessidade pelos manifestos antes do processamento integral;
      - resolver a extensão apenas no momento em que sua participação se tornar necessária;
      - permitir análise preliminar do script sem exigir prematuramente a biblioteca;
      - falhar de forma localizada e determinística caso a sintaxe indispensável não possa ser processada;
      - preservar a execução de caminhos independentes somente quando isso for semanticamente seguro e compatível com o modelo atual da DSL.

  - **Extensão global da pseudo-linguagem**
    - Bibliotecas externas aprovadas PODEM estender a DSL com recursos linguísticos inexistentes no núcleo nativo, incluindo:
      - novas sintaxes;
      - novas notações;
      - construções declarativas;
      - operadores ou formas de expressão;
      - funções, classes, objetos, constantes, tipos e demais símbolos no escopo global;
      - semânticas, gatilhos e comportamentos complementares.
    - Essas extensões PODEM possuir uso global, sem namespace específico e sem encapsulamento sintático, quando sua natureza não permitir ou não tornar adequado o uso encapsulado.
    - A ausência de namespace NÃO DISPENSA declaração, aprovação, vinculação prévia, validação, rastreabilidade nem controle de conflitos.
    - Extensões globais NÃO PODEM:
      - substituir, redefinir, interceptar indevidamente ou alterar construções nativas;
      - contradizer a gramática, a semântica, os tipos ou os contratos existentes;
      - produzir incoerência com o padrão linguístico já normatizado;
      - modificar silenciosamente o significado de scripts anteriormente válidos;
      - ocupar símbolo, token, operador, palavra reservada ou forma sintática já pertencente ao núcleo.
    - Em qualquer conflito, ambiguidade ou sobreposição, a precedência absoluta DEVE ser do núcleo original.
    - Conflitos conhecidos DEVEM ser rejeitados no registro ou vinculação da extensão, e não resolvidos de forma dependente da ordem de carregamento.
    - Extensões globais entre bibliotecas distintas DEVEM possuir regras determinísticas de compatibilidade e colisão; sobreposições incompatíveis DEVEM impedir a ativação das extensões afetadas.
    - Recursos globais adicionados DEVEM ser explicitamente enumerados no manifesto e expostos somente no contexto em que a integração estiver vinculada.
    - A extensão da DSL NÃO DEVE conceder à biblioteca externa autoridade geral sobre o parser, analisador, runtime ou código de outras integrações.

  - **Hooks de processamento linguístico**
    - Adaptar cirurgicamente o núcleo para permitir hooks controlados nas etapas em que uma extensão possa complementar capacidades lexicais, sintáticas, semânticas, de tipagem, transformação ou execução que o núcleo não possua.
    - Os hooks DEVEM reutilizar as fases e estruturas reais já existentes; NÃO DEVEM impor uma nova arquitetura paralela quando a atual puder ser estendida.
    - O núcleo DEVE processar diretamente tudo o que reconhecer e delegar somente:
      - tokens, trechos ou construções vinculados a uma extensão;
      - pontos explicitamente descritos pelo manifesto;
      - lacunas transitórias que o núcleo, naquele ponto específico, não consiga resolver.
    - A delegação PODE ocorrer total ou parcialmente em uma construção.
    - O processamento DEVE permitir alternância controlada, inclusive:

      ```text
      núcleo → extensão → núcleo → extensão → núcleo
      ```

    - Essa alternância DEVE ser possível quando uma construção possuir segmentos intercalados nativos e estendidos, sem exigir que uma única parte processe toda a expressão, declaração ou bloco.
    - Cada transferência DEVE preservar, conforme aplicável:
      - posição e intervalo de origem;
      - cursor ou ponto atual de leitura;
      - contexto léxico;
      - contexto sintático;
      - escopo;
      - precedência;
      - estado semântico;
      - tipos conhecidos;
      - diagnósticos;
      - ponto válido de retorno ao núcleo;
      - identificação da extensão responsável.
    - A extensão DEVE consumir ou produzir somente o trecho e a informação sob sua responsabilidade, devolvendo controle ao núcleo no ponto contratualmente indicado.
    - O núcleo NÃO DEVE repassar o script integral, seu estado interno irrestrito ou estruturas além das estritamente necessárias.
    - O protocolo DEVE impedir:
      - consumo ambíguo ou ilimitado de tokens;
      - regressão indevida do cursor;
      - loops de delegação;
      - recursão descontrolada entre hooks;
      - alteração retroativa de trechos já confirmados pelo núcleo;
      - interceptação de construções nativas;
      - mutação não autorizada do estado interno.
    - Quando a extensão não reconhecer ou não puder concluir o trecho delegado, DEVE devolver controle com resultado explícito, sem mascarar a insuficiência nem corromper o estado.
    - Falhas, exceções ou respostas inválidas da extensão DEVEM ser contidas e convertidas em diagnóstico da DSL.
    - O mecanismo DEVE manter fail-safe: na dúvida, conflito, resposta inválida ou ausência da extensão adequada, o núcleo DEVE preservar sua própria semântica e rejeitar apenas a construção que não possa tratar com segurança.
    - Limites de execução, profundidade, tamanho, cancelamento e demais proteções já existentes DEVEM alcançar os hooks externos.
    - O suporte aos hooks NÃO DEVE obrigar o núcleo a incorporar parsers, compiladores ou runtimes completos de terceiros.

  - **Manifesto linguístico da extensão**
    - O manifesto complementar DEVE fornecer todas as informações necessárias para o núcleo identificar quando, onde e como a extensão participa do processamento.
    - Conforme as fases realmente existentes no projeto, o manifesto DEVE descrever, quando aplicável:
      - tokens, delimitadores, palavras-chave, operadores ou padrões lexicais introduzidos;
      - prioridade, precedência, associatividade e regras de desambiguação;
      - contextos em que a construção é válida;
      - pontos de entrada e término;
      - limites de consumo;
      - relação com expressões, declarações, blocos, tipos e escopos nativos;
      - símbolos globais adicionados;
      - estrutura sintática ou representação intermediária esperada;
      - forma de retorno ao núcleo;
      - fases que o núcleo consegue processar diretamente;
      - fases ou trechos que DEVEM ser repassados à extensão;
      - hooks correspondentes;
      - semântica, validações e tipos resultantes;
      - comportamento em runtime;
      - diagnósticos e erros;
      - compatibilidade e conflitos conhecidos.
    - O manifesto DEVE permitir ao núcleo identificar a extensão apropriada sem testar indiscriminadamente todas as bibliotecas registradas para cada token.
    - Sempre que as regras declarativas forem suficientes, o próprio núcleo DEVE realizar o processamento, evitando chamada externa desnecessária.
    - A delegação à biblioteca DEVE ocorrer somente quando o manifesto declarativo e os recursos nativos forem insuficientes.
    - O manifesto NÃO DEVE autorizar a extensão a reivindicar tokens ou construções já reconhecidos pelo núcleo.
    - Informações linguísticas DEVEM complementar, e não duplicar, declarações de tipos já existentes.

  - **Contrato de integração**
    - A integração DEVE ocorrer exclusivamente por contrato definido, normatizado, validado e controlado pela DSL.
    - A biblioteca externa PODE expor métodos, funções, objetos, propriedades, tipos, eventos, callbacks, iteradores, streams, capacidades customizadas e extensões linguísticas globais.
    - A biblioteca externa NÃO PODE:
      - impor exigências ao núcleo;
      - alterar construções nativas;
      - acessar diretamente parser, AST, runtime, escopo ou estado interno;
      - exigir que a DSL adote suas dependências, arquitetura ou ciclo de vida;
      - contornar validações, permissões ou limites da DSL;
      - apropriar-se de sintaxe, símbolos ou semântica fora do que estiver aprovado e declarado.
    - A governança é unilateral: a DSL define como a integração é declarada, registrada, vinculada, validada, exposta, invocada, observada, delegada e descartada; a biblioteca externa apenas fornece implementação, adaptador e manifestos compatíveis.
    - Apenas símbolos, sintaxes e capacidades explicitamente aprovados DEVEM ser expostos ao contexto da pseudo-linguagem.
    - O objeto original da biblioteca NÃO DEVE ser disponibilizado irrestritamente quando somente parte de sua superfície for necessária.
    - A camada de integração DEVE preservar isolamento de estado, tratamento de erros, limites de execução, cancelamento, descarte e demais controles já existentes.

  - **Manifesto de métodos, tipos e símbolos**
    - Reutilizar prioritariamente declarações e padrões equivalentes a `.d.ts` do TypeScript, evitando criar formato proprietário quando o ecossistema existente já fornecer solução adequada.
    - O manifesto DEVE fornecer somente as informações necessárias para a DSL compreender e validar o que será efetivamente invocado, escutado, acessado, instanciado ou retornado, incluindo, conforme aplicável:
      - nomes dos símbolos expostos;
      - categoria de cada símbolo;
      - assinaturas;
      - tipos de parâmetros;
      - tipos de retorno;
      - sobrecargas relevantes;
      - propriedades;
      - eventos;
      - classes, objetos e funções globais;
      - tipos genéricos, personalizados, opcionais ou anuláveis;
      - comportamento síncrono ou assíncrono.
    - Nomes de parâmetros NÃO PRECISAM ser preservados quando somente seus tipos forem semanticamente necessários.
    - Nomes DEVEM ser mantidos quando influenciarem chamadas nomeadas, documentação, associação semântica, validação ou resolução inequívoca.
    - Tipos personalizados referenciados DEVEM possuir definição suficiente para análise e uso.
    - A biblioteca externa PODE informar toda a sua API, mas DEVE ser possível identificar e processar apenas o subconjunto efetivamente exposto à DSL.
    - A DSL NÃO DEVE exigir duplicação manual de definições já presentes em manifesto padrão confiável.
    - Caso o manifesto TypeScript completo contenha informações excedentes, a implementação DEVE filtrá-las ou ignorá-las, sem exigir sua reescrita.
    - Declarações de tipo são metadados de análise e NÃO DEVEM ser tratadas como mecanismo de segurança ou prova de que a implementação real cumpre o contrato.

  - **Manifesto complementar de associação**
    - Como declarações de tipos normalmente descrevem APIs, mas não informam sua associação semântica e linguística com a DSL, criar manifesto complementar somente quando necessário.
    - Esse manifesto DEVE acrescentar exclusivamente informações ausentes, sem redefinir tipos, métodos, propriedades ou assinaturas já descritos por fonte reutilizada.
    - O manifesto complementar DEVE ser legível por máquina e aderente aos formatos normativos já adotados pelo repositório, preferencialmente JSON ou YAML; XML NÃO DEVE ser introduzido.
    - O manifesto DEVE indicar, conforme aplicável:
      - identificador lógico da integração;
      - versão do contrato;
      - compatibilidade com versões da DSL;
      - referência ao manifesto de tipos utilizado;
      - dependências internas da integração relevantes à validação;
      - símbolos efetivamente expostos;
      - símbolos inseridos no escopo global;
      - nome, namespace, alias ou sintaxe visível no script;
      - extensões globais não encapsuláveis;
      - associação entre símbolo da DSL e membro da biblioteca externa;
      - informações lexicais, sintáticas e semânticas necessárias;
      - pontos e condições de delegação;
      - hooks disponíveis;
      - operação externa a ser invocada;
      - normalização e passagem de argumentos;
      - tipo, estrutura e semântica do retorno esperado;
      - comportamento síncrono, assíncrono, iterável, observável ou orientado a eventos;
      - erros possíveis e sua conversão para o modelo da DSL;
      - eventos, gatilhos, listeners ou callbacks;
      - inicialização, ciclo de vida, cancelamento e descarte;
      - permissões ou capacidades explicitamente necessárias;
      - mutabilidade, efeitos colaterais e persistência de estado relevantes;
      - requisitos mínimos para considerar a integração disponível e completa.
    - O manifesto NÃO DEVE permitir que a biblioteca externa imponha dependências, comportamentos ou alterações ao núcleo.

  - **Registro, vinculação e descoberta compartilhada**
    - A descoberta e a validação da disponibilidade de uma biblioteca externa NÃO DEVEM ser repetidas por cada script ou por cada instância da DSL.
    - Criar registro compartilhado por contexto de execução, abrangendo, conforme o alvo:
      - página ou realm do navegador;
      - Worker;
      - processo;
      - contexto global equivalente.
    - Esse registro DEVE permitir que múltiplos usos da mesma biblioteca ou múltiplas instâncias da DSL reutilizem:
      - resultado da descoberta;
      - estado de carregamento;
      - manifesto validado;
      - compatibilidade;
      - símbolos e capacidades disponíveis;
      - adaptador ou vínculo já estabelecido;
      - erros definitivos de registro, quando ainda aplicáveis.
    - Cada dependência DEVE ser descoberta e vinculada uma única vez por contexto global compatível, salvo invalidação, substituição, mudança de versão ou descarte explicitamente normatizados.
    - Scripts posteriores NÃO DEVEM procurar novamente uma dependência cujo estado válido já esteja registrado.
    - O compartilhamento DEVE evitar reprocessamento sem misturar contextos incompatíveis, versões distintas, permissões diferentes ou estados que devam permanecer isolados.
    - O registro compartilhado NÃO DEVE expor estado mutável interno da biblioteca a scripts ou instâncias não autorizados.
    - A existência do registro NÃO transforma a biblioteca em dependência global obrigatória; ele apenas reutiliza a resolução das integrações efetivamente solicitadas.
    - A vinculação entre manifesto, implementação carregada e adaptador DEVE ocorrer previamente ao primeiro uso material da integração.
    - O manifesto DEVE fornecer identificação suficientemente estável para que o núcleo associe a dependência encontrada à integração esperada sem redescobertas recorrentes.

  - **Resolução tardia e carregamento dinâmico no navegador**
    - No navegador, a DSL NÃO DEVE concluir que uma dependência está ausente apenas porque ela ainda não foi carregada no instante da análise inicial.
    - A descoberta DEVE ocorrer:
      - somente quando uma dependência for efetivamente necessária; ou
      - quando houver sinal confiável de que os assets pertinentes já foram carregados.
    - Priorizar resolução tardia, acionada no primeiro uso real do script ou da extensão, pois nesse momento os assets normalmente já estarão disponíveis.
    - Quando frameworks, bibliotecas de bootstrap, loaders ou mecanismos análogos disponibilizarem eventos, Promises, callbacks ou hooks confiáveis de conclusão, a integração PODE utilizá-los para adiar a resolução até o momento apropriado.
    - Quando necessário, criar callback, hook ou mecanismo equivalente que:
      - seja registrado dinamicamente;
      - seja executado no máximo uma vez por dependência e contexto;
      - seja removido, resolvido ou neutralizado após a vinculação;
      - não introduza polling recorrente desnecessário;
      - não reexecute a descoberta para cada script.
    - A DSL NÃO DEVE presumir um framework ou loader específico; DEVE oferecer ponto de integração genérico para que o ambiente hospedeiro sinalize disponibilidade ou conclusão do carregamento.
    - A resolução tardia NÃO DEVE executar o script antes da validação das dependências requeridas.
    - Dependências opcionais ainda em carregamento DEVEM possuir estado distinguível de:
      - disponível;
      - indisponível;
      - ainda não resolvida;
      - incompatível;
      - falha de carregamento, quando conhecida.
    - O runtime NÃO DEVE confundir “ainda não verificada” ou “ainda em carregamento” com “ausente”.
    - Uma vez concluída a resolução, seu resultado DEVE ser registrado globalmente no contexto correspondente e reutilizado pelas demais instâncias da DSL.

  - **Manifestos declarativos embutidos nos scripts**
    - Scripts PODEM conter manifestos ou metadados declarativos embutidos que identifiquem dependências, recursos, extensões ou requisitos antes da análise integral do código.
    - Esses manifestos DEVEM poder ser extraídos, analisados e validados sem executar o script.
    - A etapa declarativa inicial DEVE permitir:
      - identificar integrações requeridas e opcionais;
      - localizar manifestos de tipos e associação;
      - detectar extensões linguísticas necessárias;
      - preparar vínculos e registros;
      - verificar e registrar dependências já disponíveis;
      - determinar quais etapas futuras exigirão resolução tardia.
    - Essa etapa NÃO DEVE exigir imediatamente a presença das dependências quando o carregamento ainda não puder ser considerado concluído.
    - A ausência somente DEVE tornar-se definitiva quando:
      - o ambiente declarar encerrado o carregamento aplicável;
      - houver falha explícita;
      - a dependência for materialmente necessária e não puder ser resolvida;
      - outro critério confiável previsto no contrato confirmar indisponibilidade.
    - O processamento preliminar DEVE permanecer livre de efeitos materiais do script.
    - Manifestos embutidos NÃO DEVEM poder registrar bibliotecas não aprovadas, conceder permissões, alterar precedência nem contornar o contrato do repositório.

  - **Retornos iteráveis e fluxos**
    - Para resultados iteráveis, paginados, incrementais, assíncronos, observáveis ou orientados a eventos, o contrato DEVE declarar explicitamente quem controla o fluxo.
    - Devem ser suportados, quando aplicáveis, os seguintes modelos:
      1. a biblioteca externa resolve integralmente o fluxo e entrega o resultado final;
      2. a integração entrega uma estrutura iterável padronizada e a DSL controla a iteração;
      3. a DSL intermedeia o fluxo por operações externas padronizadas, como iniciar, avançar, consultar estado, cancelar e encerrar.
    - Deve-se preferir, nesta ordem:
      1. iteração controlada pela própria DSL, quando segura e viável;
      2. iterável ou fluxo padronizado;
      3. intermediação passo a passo somente quando inevitável.
    - Quando houver intermediação, o manifesto DEVE indicar inequivocamente:
      - métodos correspondentes;
      - estados possíveis;
      - forma de avanço;
      - término;
      - erro;
      - cancelamento;
      - descarte;
      - propriedade e responsabilidade sobre os dados e recursos.
    - Sempre que viável, o conteúdo DEVE ser entregue à DSL em forma que permita ao próprio runtime resolver e controlar a iteração, evitando acoplamento operacional desnecessário à biblioteca externa.

  - **Padrões comuns e extensibilidade**
    - A DSL DEVE normatizar contratos comuns, estritos e reutilizáveis para finalidades recorrentes, como:
      - funções e métodos;
      - propriedades;
      - classes e objetos;
      - símbolos globais;
      - eventos e gatilhos;
      - callbacks;
      - promessas;
      - iteradores e iteradores assíncronos;
      - streams;
      - erros;
      - extensões linguísticas;
      - inicialização, vinculação e descarte.
    - Esses contratos DEVEM reduzir o trabalho de adaptação e permitir que bibliotecas que já seguem boas práticas produzam manifestos diretamente utilizáveis ou facilmente adaptáveis.
    - Padrões comuns NÃO DEVEM limitar integrações legítimas nem impedir métodos, símbolos ou construções customizadas quando os contratos genéricos forem insuficientes.
    - Extensões customizadas DEVEM complementar, e não contradizer, o contrato comum.
    - O objetivo NÃO é inovar no formato de comunicação, mas reutilizar as melhores práticas e padrões já consolidados, adicionando somente os dados estritamente ausentes para o contexto da DSL.

  - **Ferramentas auxiliares de build**
    - Dependências open source PODEM ser usadas exclusivamente durante build, geração, validação ou transpilação dos manifestos quando:
      - forem estáveis, mantidas, auditáveis e compatíveis com a licença do repositório;
      - não integrarem o runtime cliente nem o artefato principal distribuído;
      - não alterarem o contrato público da DSL;
      - puderem ser substituídas sem exigir alterações nas integrações;
      - reduzirem trabalho manual e favorecerem formatos universais.
    - Essas ferramentas também PODEM ser indicadas às bibliotecas externas como meio opcional de produzir manifestos padronizados.
    - Elas NÃO DEVEM ser exigidas em runtime nem transformar-se em dependência da biblioteca externa ou da DSL.
    - Como a saída principal é JavaScript executado no cliente, a ferramenta de build NÃO PRECISA ser escrita em JavaScript, mas DEVE ser compatível com ambientes comuns de construção e gerar artefatos determinísticos, interoperáveis e independentes da linguagem que os produziu.

  - **Segurança, validação, fail-safe e resiliência**
    - Manifestos DEVEM ser validados estrutural e semanticamente antes do registro.
    - Símbolos, tipos, sintaxes, hooks e capacidades declarados DEVEM ser confrontados com a exposição efetivamente fornecida.
    - Incompatibilidades DEVEM impedir o registro apenas da integração afetada, salvo quando ela for requerida por determinado script.
    - Chamadas e delegações externas DEVEM atravessar camada controlada de adaptação.
    - Erros externos DEVEM ser normalizados para o modelo existente sem ocultar a causa técnica necessária ao diagnóstico.
    - Integrações NÃO DEVEM obter acesso implícito a parser, AST, runtime, escopo, armazenamento, rede, DOM ou outros recursos internos.
    - Quando um hook necessitar de informação interna, o núcleo DEVE fornecer visão mínima, validada e específica, e não referência irrestrita à estrutura real.
    - Capacidades sensíveis DEVEM depender de exposição e aprovação explícitas.
    - Scripts NÃO DEVEM instalar, localizar, importar ou carregar dependências por URL, caminho, pacote ou rede.
    - Falhas externas NÃO DEVEM corromper estado interno, comprometer o núcleo nem impedir recuperação controlada do runtime.
    - O comportamento padrão DEVE negar acesso a qualquer símbolo, sintaxe, capacidade ou integração não declarada, não aprovada ou não disponibilizada.
    - A extensão DEVE falhar fechada quanto à segurança e aberta somente quanto às capacidades explicitamente autorizadas.
    - A precedência do núcleo DEVE permanecer invariável mesmo quando a extensão falhar, divergir do manifesto ou retornar resultado ambíguo.
    - Cache, registro global e descoberta compartilhada NÃO DEVEM preservar indefinidamente estados inválidos nem impedir invalidação controlada quando o ambiente substituir ou descarregar uma integração.
    - A flexibilidade requerida NÃO DEVE ser implementada por execução arbitrária de código, `eval`, mutação global irrestrita ou exposição direta de internals.

  - **Documentação, normatização e rastreabilidade**
    - Atualizar o RCF e a documentação aplicável para tornar o recurso determinístico, verificável e suficiente.
    - Documentar:
      - sintaxe de dependências requeridas e opcionais;
      - semântica de resolução, carregamento e disponibilidade;
      - estados de descoberta;
      - registro e vinculação compartilhados;
      - escopo global por página, Worker, processo ou contexto equivalente;
      - contrato de integração;
      - extensão global da linguagem;
      - precedência do núcleo;
      - conflitos entre extensões;
      - protocolo de hooks e alternância de processamento;
      - formato dos manifestos;
      - associação entre tipos, sintaxe e semântica da DSL;
      - regras de exposição;
      - erros;
      - assincronismo;
      - eventos;
      - iteração;
      - segurança;
      - ciclo de vida;
      - compatibilidade;
      - invalidação e descarte.
    - Registrar decisões arquiteturais relevantes e limitações inevitáveis sem transformar limitações temporárias em proibições permanentes.
    - Não alterar normas apenas para legitimar desvios da implementação, salvo quando a própria norma estiver comprovadamente incompleta e a alteração fizer parte desta evolução.

  - **Validação e aceite**
    - Confirmar por testes que:
      - scripts existentes sem dependências mantêm o comportamento anterior;
      - a DSL permanece funcional sem qualquer integração;
      - nenhuma biblioteca externa é incluída automaticamente no bundle;
      - a infraestrutura de hooks não amplia desproporcionalmente o build principal;
      - dependência requerida disponível permite execução;
      - dependência requerida ausente, incompatível ou incompleta interrompe o processamento antes de efeitos;
      - a análise preliminar não gera falso negativo enquanto assets ainda puderem estar em carregamento;
      - dependência opcional ausente não impede a execução de caminhos independentes;
      - dependência opcional disponível pode ser detectada e utilizada;
      - estados “não resolvida”, “carregando”, “disponível”, “ausente” e “incompatível” não são confundidos;
      - manifestos declarativos embutidos podem ser processados sem exigir prematuramente as dependências;
      - bibliotecas já descobertas não são procuradas novamente por cada script;
      - múltiplas instâncias da DSL reutilizam o registro no mesmo contexto compatível;
      - páginas, Workers e processos distintos permanecem corretamente isolados;
      - callbacks ou hooks de carregamento são executados no máximo uma vez por dependência e contexto;
      - resolução tardia ocorre antes do primeiro uso material;
      - símbolos opcionais não validados são rejeitados ou protegidos;
      - bibliotecas não aprovadas não podem ser registradas nem acessadas;
      - símbolos não expostos permanecem inacessíveis;
      - funções, classes, objetos e demais símbolos globais autorizados ficam disponíveis somente nos contextos vinculados;
      - extensões globais não sobrescrevem recursos nativos;
      - a precedência do núcleo é preservada em qualquer conflito;
      - extensões incompatíveis são rejeitadas deterministicamente;
      - manifestos inválidos ou divergentes são rejeitados;
      - o núcleo processa diretamente construções conhecidas e delega apenas trechos vinculados e necessários;
      - o controle pode alternar entre núcleo e extensão múltiplas vezes na mesma construção;
      - posições, contexto, tipos, diagnósticos e pontos de retorno permanecem íntegros após cada delegação;
      - hooks não conseguem consumir tokens arbitrariamente, retroceder indevidamente, entrar em loop ou mutar internals;
      - falha de uma extensão produz diagnóstico localizado sem corromper parser, analisador ou runtime;
      - APIs síncronas, assíncronas, iteráveis e orientadas a eventos seguem o contrato;
      - erros externos não corrompem o estado da DSL;
      - cancelamento e descarte liberam recursos quando aplicáveis;
      - ferramentas de build não vazam para o runtime cliente;
      - bibliotecas externas podem expor recursos customizados e estender a pseudo-linguagem sem impor exigências ao núcleo;
      - a solução reutiliza padrões existentes e acrescenta somente adaptações cirúrgicas indispensáveis.
