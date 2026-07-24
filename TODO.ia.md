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

- [ ] **Criar, somente após a conclusão integral do suporte a extensões e
  dependências externas da DSL, uma norma técnica autônoma para orientar
  bibliotecas externas e suas IAs na produção de integrações conformes**,
  mantendo-a continuamente revisada, sincronizada e atualizada conforme a
  evolução do RCF da DSL, sem contrariar, negar, enfraquecer ou romper as regras
  de negócio, a arquitetura, os contratos, a segurança, a compatibilidade ou as
  decisões normativas da própria biblioteca integrada.

  - **Dependência e ordem de execução**
    - Este item é independente, porém diretamente relacionado ao TODO de
      extensibilidade da DSL.
    - Sua execução inicial DEVE ocorrer somente após o item anterior estar:
      - implementado;
      - normatizado no RCF principal;
      - validado por testes;
      - estabilizado quanto a sintaxe, manifestos, hooks, registro, vinculação,
        descoberta, segurança e ciclo de vida.
    - A norma NÃO DEVE antecipar, presumir ou consolidar contratos ainda não
      implementados.
    - Antes de redigi-la, inspecionar o estado final do:
      - RCF da DSL;
      - código implementado;
      - gramática;
      - parser e analisadores;
      - sistema de tipos;
      - runtime;
      - contratos de integração;
      - schemas;
      - manifestos;
      - adaptadores;
      - hooks;
      - testes;
      - exemplos;
      - documentação aplicável.
    - Divergências entre norma e implementação DEVEM ser resolvidas na fonte
      correta antes da publicação; a norma externa NÃO DEVE documentar
      comportamento inexistente nem legitimar desvio da implementação.
    - A conclusão inicial deste item NÃO encerra sua manutenção: a norma DEVE
      permanecer vinculada ao ciclo de evolução do RCF e ser reavaliada sempre
      que este, a implementação ou os contratos públicos da DSL forem alterados.

  - **Artefato normativo**
    - Criar documento normativo próprio, versionado e destinado ao repositório
      da DSL, com nome semanticamente mais adequado que `RCF.md` para consumo
      por bibliotecas integradoras.
    - Adotar preferencialmente:

      ```text
      DSL-INTEGRATION-COMPLIANCE.md
      ```

    - O nome PODE ser ajustado às convenções documentais reais do repositório,
      desde que expresse inequivocamente:
      - integração com a DSL;
      - conformidade normativa;
      - aplicabilidade a bibliotecas externas.
    - O documento DEVE funcionar como norma técnica de integração, e não como
      tutorial informal, material promocional, README genérico ou duplicação do
      RCF principal.
    - Ele DEVE ser:
      - autônomo para sua finalidade;
      - aderente e subordinado ao RCF da DSL;
      - normativo;
      - determinístico;
      - verificável;
      - detalhado;
      - incisivo;
      - orientado prioritariamente ao consumo por IA;
      - suficientemente claro para uso humano;
      - acompanhado de exemplos delimitadores.
    - O documento DEVE permitir que uma IA atuando no repositório de uma
      biblioteca externa identifique, planeje, implemente, teste e documente o
      acoplamento necessário sem depender de interpretações implícitas ou
      explicações externas.
    - O RCF principal da DSL DEVE mencionar e vincular diretamente essa norma
      como referência oficial para implementação, validação e manutenção de
      integrações externas.
    - O `README.md` da DSL DEVE mencionar e vincular diretamente essa norma em
      seção visível e semanticamente adequada, permitindo sua localização por
      humanos e IAs sem pesquisa indireta pelo repositório.
    - Os links DEVEM utilizar caminhos estáveis, relativos quando apropriado, e
      permanecer válidos após reorganizações documentais ou alterações de nome.

  - **Finalidade**
    - Definir integralmente como uma biblioteca externa PODE tornar-se
      compatível com a DSL mediante:
      - manifestos;
      - declarações de tipos;
      - adaptadores;
      - pontos de integração;
      - exposição de APIs;
      - extensões linguísticas;
      - hooks;
      - registro;
      - descoberta;
      - vinculação;
      - validação;
      - testes;
      - distribuição dos artefatos de integração.
    - A norma DEVE orientar a integração preservando simultaneamente:
      - autonomia da DSL;
      - autonomia da biblioteca externa;
      - regras de negócio de ambas;
      - segurança;
      - compatibilidade;
      - isolamento;
      - resiliência;
      - previsibilidade;
      - baixo acoplamento;
      - baixo custo de adaptação;
      - mínimo impacto no build e no runtime.
    - A biblioteca externa NÃO DEVE ser obrigada a:
      - alterar regras de negócio;
      - quebrar contratos públicos;
      - abandonar sua arquitetura;
      - incorporar a DSL ao próprio núcleo;
      - tornar a DSL uma dependência obrigatória;
      - expor APIs privadas;
      - modificar comportamentos nativos;
      - distribuir código desnecessário;
      - assumir responsabilidades pertencentes ao runtime da DSL.
    - Quando a integração exigir adaptação, priorizar, nesta ordem:
      1. manifesto declarativo;
      2. geração automatizada de metadados;
      3. adaptador externo e desacoplado;
      4. módulo opcional de integração;
      5. alteração interna da biblioteca somente quando inevitável, segura e
         compatível com suas próprias normas.

  - **Precedência normativa**
    - A norma DEVE declarar expressamente que:
      - o RCF da DSL prevalece quanto ao contrato da DSL;
      - as normas da biblioteca externa prevalecem quanto ao seu próprio
        funcionamento interno;
      - a integração existe na interseção compatível entre ambos os contratos;
      - nenhuma parte PODE utilizar a integração para impor domínio normativo
        sobre a outra.
    - Em caso de incompatibilidade material:
      - a integração DEVE ser adaptada;
      - uma capacidade PODE deixar de ser exposta;
      - um adaptador especializado PODE ser exigido;
      - a integração DEVE ser recusada quando não houver solução compatível.
    - É PROIBIDO resolver incompatibilidades:
      - violando o RCF da DSL;
      - alterando silenciosamente regras da biblioteca externa;
      - ocultando limitações;
      - simulando conformidade;
      - desabilitando validações;
      - expondo internals;
      - contornando segurança;
      - redefinindo recursos nativos.
    - O núcleo da DSL mantém precedência absoluta sobre:
      - sua gramática nativa;
      - seus tokens;
      - sua semântica;
      - seus símbolos;
      - seus tipos;
      - sua execução;
      - sua segurança;
      - seus limites.
    - Extensões externas somente PODEM complementar espaços normativamente
      disponíveis.
    - Havendo divergência entre esta norma de integração e o RCF da DSL, o RCF
      prevalece, e a norma de integração DEVE ser corrigida antes de novo uso
      normativo ou implementação baseada no trecho divergente.

  - **Público e modo de consumo**
    - Estruturar o documento para uso por:
      - IAs de implementação;
      - mantenedores de bibliotecas;
      - autores de adaptadores;
      - revisores;
      - ferramentas de geração e validação.
    - O texto DEVE:
      - usar linguagem normativa consistente;
      - distinguir obrigação, recomendação, permissão e proibição;
      - evitar dependência de contexto tácito;
      - definir todos os termos especializados;
      - possuir referências internas estáveis;
      - separar regras gerais de contratos especializados;
      - fornecer ordem de execução;
      - incluir critérios verificáveis;
      - indicar entradas, saídas e artefatos esperados;
      - exigir inspeção do estado real antes de modificar a biblioteca externa.
    - Incluir instrução inicial à IA integradora para:
      - ler integralmente a norma;
      - identificar as normas locais do repositório externo;
      - determinar precedências;
      - mapear APIs e capacidades;
      - detectar incompatibilidades;
      - propor adaptação mínima;
      - não inventar contratos;
      - não alterar a biblioteca para facilitar a integração sem necessidade
        comprovada.

  - **Estrutura mínima da norma**
    - Organizar o documento, conforme aplicável, nas seguintes áreas:
      1. finalidade, escopo e fora de escopo;
      2. terminologia e microconceitos;
      3. precedência e responsabilidades;
      4. modelo arquitetural de integração;
      5. modalidades e níveis de conformidade;
      6. identificação, aprovação e versionamento;
      7. declarações de dependências;
      8. manifestos e schemas;
      9. tipos, APIs e símbolos;
      10. adaptadores e exposição controlada;
      11. extensões lexicais, sintáticas e semânticas;
      12. hooks e alternância de processamento;
      13. funções, classes, objetos e símbolos globais;
      14. assincronismo, eventos, iteradores e streams;
      15. descoberta, carregamento e vinculação;
      16. navegador, Worker, processo e demais contextos;
      17. segurança, permissões e isolamento;
      18. erros, diagnósticos e fail-safe;
      19. build, geração e distribuição;
      20. compatibilidade e evolução;
      21. manutenção e sincronização normativa;
      22. validação, testes e certificação;
      23. exemplos conformes e não conformes;
      24. checklist de entrega;
      25. relatório de conformidade.
    - A estrutura PODE ser reorganizada quando outra ordem aumentar densidade,
      clareza ou aderência ao RCF, sem omitir qualquer matéria aplicável.

  - **Terminologia e microconceitos**
    - Definir de forma curta, inequívoca e reutilizável, pelo menos:
      - DSL;
      - núcleo;
      - biblioteca externa;
      - integração;
      - adaptador;
      - manifesto;
      - manifesto de tipos;
      - manifesto de associação;
      - extensão linguística;
      - hook;
      - símbolo exposto;
      - símbolo global;
      - dependência requerida;
      - dependência opcional;
      - descoberta;
      - resolução;
      - registro;
      - vinculação;
      - contexto de execução;
      - capacidade;
      - conformidade.
    - Esses microconceitos DEVEM substituir repetições sem ocultar regras,
      exceções ou responsabilidades.

  - **Modalidades de integração**
    - A norma DEVE distinguir pelo menos:
      - **exposição de API**: métodos, funções, propriedades, objetos, classes,
        tipos ou eventos;
      - **integração declarativa**: capacidades descritas integralmente por
        manifesto;
      - **integração adaptada**: uso de camada que converte o contrato externo
        para o contrato da DSL;
      - **extensão linguística encapsulada**: recurso acessado por namespace ou
        construção delimitada;
      - **extensão linguística global**: sintaxe, notação ou símbolo disponível
        sem namespace;
      - **integração de build**: geração ou validação de artefatos sem presença
        no runtime;
      - **integração híbrida**: combinação controlada das modalidades
        anteriores.
    - Cada modalidade DEVE declarar:
      - requisitos;
      - artefatos;
      - permissões;
      - limitações;
      - riscos;
      - validações;
      - testes obrigatórios.
    - A biblioteca externa DEVE implementar apenas as modalidades necessárias
      às capacidades que efetivamente pretende expor.

  - **Níveis de conformidade**
    - Definir níveis cumulativos ou perfis equivalentes para evitar que toda
      biblioteca seja obrigada a implementar recursos desnecessários.
    - Considerar, conforme aderência à implementação final:
      - conformidade de tipos;
      - conformidade de API;
      - conformidade assíncrona;
      - conformidade de eventos e fluxos;
      - conformidade de extensão linguística;
      - conformidade global;
      - conformidade completa.
    - Cada nível DEVE possuir:
      - requisitos obrigatórios;
      - recursos permitidos;
      - testes;
      - critérios de aprovação;
      - declaração de capacidades.
    - A ausência de um nível avançado NÃO DEVE invalidar uma integração que
      declare corretamente um subconjunto inferior.

  - **Preservação da biblioteca externa**
    - A IA integradora DEVE identificar previamente:
      - regras de negócio;
      - contratos públicos;
      - garantias;
      - invariantes;
      - arquitetura;
      - ciclos de vida;
      - modelos de erro;
      - segurança;
      - licenciamento;
      - compatibilidade;
      - requisitos de build;
      - plataformas suportadas.
    - A integração NÃO DEVE contrariar esses elementos.
    - Havendo conflito, a IA DEVE:
      - preservar a biblioteca;
      - limitar a superfície exposta;
      - criar adaptador;
      - declarar incompatibilidade parcial;
      - excluir capacidade inviável.
    - É PROIBIDO modificar o núcleo da biblioteca externa apenas para adequá-lo
      artificialmente ao modelo da DSL quando um adaptador resolver de forma
      suficiente.
    - Alterações internas inevitáveis DEVEM:
      - ser mínimas;
      - preservar comportamento anterior;
      - permanecer opcionais;
      - possuir testes próprios;
      - ser documentadas;
      - não afetar consumidores que não utilizem a DSL.

  - **Mapeamento de capacidades**
    - Exigir inventário explícito das capacidades externas candidatas à
      exposição.
    - Para cada capacidade, registrar:
      - origem;
      - finalidade;
      - símbolo externo;
      - representação na DSL;
      - tipos;
      - parâmetros;
      - retorno;
      - sincronismo;
      - efeitos colaterais;
      - mutabilidade;
      - erros;
      - permissões;
      - ciclo de vida;
      - riscos;
      - modalidade de integração.
    - A biblioteca externa NÃO PRECISA expor tudo o que implementa.
    - Somente recursos materialmente necessários e aprovados DEVEM compor a
      integração.
    - Recursos privados, internos, experimentais ou instáveis NÃO DEVEM ser
      expostos sem justificativa e marcação explícitas.

  - **Manifesto de tipos**
    - Normatizar a reutilização prioritária de:
      - `.d.ts`;
      - TypeScript Compiler API;
      - declarações geradas automaticamente;
      - formatos equivalentes consolidados.
    - A norma DEVE especificar:
      - informações obrigatórias;
      - informações opcionais;
      - elementos ignoráveis;
      - regras de filtragem;
      - tratamento de sobrecargas;
      - tipos personalizados;
      - genéricos;
      - nulabilidade;
      - assincronismo;
      - classes;
      - objetos;
      - funções;
      - propriedades;
      - eventos.
    - Nomes de parâmetros somente DEVEM ser exigidos quando possuírem função
      semântica.
    - O manifesto completo da biblioteca PODE ser utilizado, desde que a
      integração identifique inequivocamente o subconjunto exposto.
    - A norma DEVE proibir duplicação de tipos já obtidos de fonte confiável,
      salvo transformação automatizada necessária.

  - **Manifesto de associação**
    - Definir schema normativo para complementar informações não representadas
      pelo manifesto de tipos.
    - O manifesto DEVE incluir, conforme a modalidade:
      - identificação da integração;
      - versões;
      - compatibilidade;
      - capacidades;
      - símbolos expostos;
      - símbolos globais;
      - namespaces;
      - aliases;
      - sintaxes;
      - regras lexicais;
      - regras sintáticas;
      - semântica;
      - hooks;
      - pontos de delegação;
      - invocações;
      - argumentos;
      - retornos;
      - erros;
      - eventos;
      - iteração;
      - inicialização;
      - cancelamento;
      - descarte;
      - permissões;
      - efeitos colaterais;
      - requisitos de disponibilidade.
    - O manifesto complementar NÃO DEVE redefinir informações já presentes no
      manifesto de tipos.
    - O formato DEVE ser legível por máquina, validável por schema e aderente
      aos formatos do repositório, preferencialmente JSON ou YAML.
    - Incluir schema oficial e exemplos mínimos, intermediários e completos.

  - **Extensões linguísticas**
    - Explicar rigorosamente como uma biblioteca externa PODE adicionar:
      - tokens;
      - delimitadores;
      - palavras-chave;
      - operadores;
      - expressões;
      - declarações;
      - blocos;
      - tipos;
      - construções declarativas;
      - semânticas;
      - símbolos globais.
    - A norma DEVE exigir declaração explícita de:
      - contexto válido;
      - prioridade;
      - precedência;
      - associatividade;
      - início e término;
      - limites de consumo;
      - estrutura produzida;
      - semântica;
      - tipos;
      - runtime;
      - erros;
      - compatibilidade.
    - A extensão NÃO PODE:
      - redefinir sintaxe nativa;
      - alterar significado existente;
      - ocupar palavra reservada;
      - produzir interpretação dependente da ordem de carregamento;
      - capturar trechos fora de seu contrato.
    - Em qualquer conflito, o núcleo prevalece.
    - Extensões globais sem namespace DEVEM possuir justificativa técnica e
      controles adicionais de colisão e rastreabilidade.

  - **Hooks e alternância de processamento**
    - Documentar o protocolo oficial para delegação parcial entre núcleo e
      extensão.
    - A norma DEVE permitir, quando suportado:

      ```text
      núcleo → extensão → núcleo → extensão → núcleo
      ```

    - Especificar:
      - fases disponíveis;
      - formato de entrada;
      - formato de saída;
      - contexto fornecido;
      - contexto proibido;
      - consumo de tokens;
      - avanço do cursor;
      - retorno ao núcleo;
      - AST ou representação intermediária;
      - tipos;
      - diagnósticos;
      - cancelamento;
      - limites;
      - falhas.
    - A extensão DEVE processar somente o trecho atribuído.
    - Ela NÃO DEVE:
      - acessar internals irrestritos;
      - retroceder arbitrariamente;
      - interceptar sintaxe nativa;
      - delegar em ciclo;
      - alterar trechos consolidados;
      - manter controle além do ponto autorizado.
    - Incluir exemplos de:
      - delegação lexical;
      - delegação sintática;
      - complemento semântico;
      - construção intercalada;
      - falha controlada;
      - resposta inválida.

  - **Escopo global**
    - Normatizar a exposição de:
      - funções;
      - classes;
      - objetos;
      - constantes;
      - tipos;
      - operadores;
      - sintaxes;
      - gatilhos.
    - Recursos globais DEVEM:
      - estar declarados;
      - ser aprovados;
      - possuir origem identificável;
      - ser vinculados ao contexto;
      - evitar colisões;
      - respeitar a precedência do núcleo.
    - O documento DEVE diferenciar:
      - global da DSL;
      - global da página;
      - global do Worker;
      - global do processo;
      - global do módulo ou instância.
    - A integração NÃO DEVE assumir que `globalThis`, `window`, escopo da DSL e
      escopo interno da biblioteca são equivalentes.

  - **Descoberta, registro e vinculação**
    - Especificar como a biblioteca externa DEVE:
      - tornar-se descobrível;
      - fornecer identificação estável;
      - apresentar manifestos;
      - expor versão;
      - declarar capacidades;
      - vincular implementação e adaptador.
    - A descoberta DEVE ocorrer uma única vez por dependência e contexto
      compatível, salvo invalidação normatizada.
    - A norma DEVE explicar como múltiplas instâncias da DSL reutilizam:
      - estado de descoberta;
      - carregamento;
      - validação;
      - manifesto;
      - adaptador;
      - compatibilidade.
    - Definir estados oficiais, como:
      - não resolvida;
      - aguardando carregamento;
      - disponível;
      - incompatível;
      - ausente;
      - falha;
      - descartada.
    - A biblioteca externa DEVE oferecer os sinais mínimos necessários para que
      o ambiente hospedeiro ou a DSL determine esses estados sem sondagem
      arbitrária recorrente.

  - **Carregamento dinâmico**
    - Para navegador, definir como a integração PODE sinalizar carregamento por:
      - Promise;
      - callback;
      - evento;
      - hook de bootstrap;
      - loader;
      - registro explícito.
    - A norma NÃO DEVE exigir framework específico.
    - Callbacks ou hooks de disponibilidade DEVEM:
      - executar no máximo uma vez por contexto e versão;
      - ser idempotentes;
      - evitar polling;
      - permitir descarte;
      - diferenciar carregamento pendente de ausência.
    - A análise de manifestos embutidos no script NÃO DEVE exigir que a
      implementação externa já esteja carregada.
    - A exigibilidade definitiva de dependência requerida DEVE ocorrer antes do
      uso material, mas somente depois de haver condição confiável para
      determinar sua disponibilidade.

  - **APIs, eventos e fluxos**
    - Definir padrões para:
      - chamadas síncronas;
      - Promises;
      - callbacks;
      - eventos;
      - listeners;
      - iteradores;
      - iteradores assíncronos;
      - streams;
      - observables, quando suportados;
      - cancelamento;
      - descarte.
    - A norma DEVE indicar quando:
      - a biblioteca materializa o resultado;
      - a DSL controla a iteração;
      - ocorre intermediação passo a passo.
    - Para fluxos intermediados, exigir:
      - inicialização;
      - avanço;
      - estado;
      - término;
      - erro;
      - cancelamento;
      - descarte.
    - Preferir formatos JavaScript consolidados quando o runtime final for
      client-side, sem exigir que a biblioteca externa seja implementada em
      JavaScript.

  - **Segurança**
    - Definir modelo de exposição mínima e negação por padrão.
    - Proibir:
      - acesso irrestrito ao objeto externo;
      - acesso aos internals da DSL;
      - `eval`;
      - execução arbitrária;
      - mutação global não controlada;
      - instalação ou download pela DSL;
      - carregamento por URL solicitado pelo script;
      - concessão implícita de permissões;
      - confiança em `.d.ts` como mecanismo de segurança.
    - Exigir declaração de:
      - capacidades sensíveis;
      - acesso a DOM;
      - rede;
      - armazenamento;
      - sistema de arquivos;
      - processos;
      - recursos nativos;
      - efeitos colaterais.
    - O adaptador DEVE limitar o acesso ao subconjunto aprovado.
    - Falhas externas DEVEM ser isoladas e convertidas ao modelo de erros da
      DSL.

  - **Build e distribuição**
    - Definir quais artefatos a biblioteca externa DEVE ou PODE distribuir:
      - manifesto de tipos;
      - manifesto de associação;
      - schema;
      - adaptador;
      - módulo opcional;
      - testes de conformidade;
      - metadados de versão.
    - A integração DEVE permanecer opcional para consumidores comuns da
      biblioteca.
    - Ferramentas open source de geração ou validação PODEM ser recomendadas
      quando:
      - forem mantidas;
      - forem estáveis;
      - forem auditáveis;
      - não forem exigidas em runtime;
      - produzirem artefatos interoperáveis.
    - O documento DEVE distinguir claramente:
      - dependência de desenvolvimento;
      - dependência de build;
      - dependência da integração;
      - dependência de runtime;
      - biblioteca integrada.
    - A DSL NÃO DEVE ser incorporada ao bundle da biblioteca externa apenas
      para gerar compatibilidade.

  - **Versionamento e compatibilidade**
    - Definir:
      - versão do contrato;
      - versão do manifesto;
      - versão da integração;
      - versão da biblioteca externa;
      - versões da DSL suportadas;
      - capacidades opcionais;
      - depreciações;
      - incompatibilidades.
    - Mudanças incompatíveis DEVEM ser detectáveis antes da execução.
    - A norma DEVE impedir que a compatibilidade dependa apenas de comparação
      textual de versões quando capacidades declaradas forem mais precisas.
    - Extensões linguísticas DEVEM declarar compatibilidade com gramática,
      parser e protocolo de hooks.

  - **Manutenção e sincronização normativa contínuas**
    - A norma de integração DEVE ser tratada como projeção especializada e
      subordinada do RCF da DSL, e não como documento estático ou independente
      de sua evolução.
    - Toda alteração no RCF, na implementação ou nos contratos públicos da DSL
      DEVE incluir análise explícita de impacto sobre essa norma.
    - A análise DEVE verificar, conforme aplicável:
      - terminologia;
      - precedências;
      - sintaxe;
      - gramática;
      - tipos;
      - manifestos;
      - schemas;
      - adaptadores;
      - hooks;
      - símbolos globais;
      - descoberta;
      - carregamento;
      - registro;
      - vinculação;
      - segurança;
      - erros;
      - ciclo de vida;
      - testes;
      - exemplos;
      - critérios de conformidade.
    - Quando houver impacto, a norma, seus schemas, modelos, exemplos, testes e
      referências DEVEM ser atualizados no mesmo ciclo de alteração ou antes da
      disponibilização da mudança afetada.
    - Quando não houver impacto, essa conclusão DEVE ser registrada de forma
      rastreável no relatório, FT, issue, commit, changelog ou mecanismo
      equivalente adotado pelo repositório.
    - A revisão NÃO DEVE limitar-se à substituição textual de versões; DEVE
      confirmar coerência normativa, semântica e operacional entre:
      - RCF;
      - norma de integração;
      - implementação;
      - schemas;
      - testes;
      - exemplos;
      - documentação pública.
    - É PROIBIDO manter instrução obsoleta por compatibilidade documental quando
      ela puder induzir integração incorreta ou insegura.
    - Regras removidas, substituídas ou depreciadas DEVEM possuir tratamento
      explícito de migração, compatibilidade e versionamento quando ainda forem
      relevantes para integrações existentes.
    - Alterações incompatíveis DEVEM:
      - atualizar a versão normativa aplicável;
      - indicar impacto;
      - fornecer orientação de migração;
      - identificar integrações potencialmente afetadas;
      - atualizar os testes de conformidade.
    - A norma DEVE indicar claramente:
      - versão do RCF à qual está aderente;
      - versão do contrato de integração;
      - data ou identificador da última revisão normativa;
      - estado de estabilidade;
      - depreciações vigentes.
    - Sempre que tecnicamente viável, validações automatizadas DEVEM verificar:
      - existência dos links no RCF e no `README.md`;
      - consistência das versões referenciadas;
      - validade dos schemas;
      - atualização dos exemplos;
      - ausência de referências a contratos removidos;
      - correspondência entre requisitos normativos e testes contratuais.
    - A norma NÃO DEVE exigir replicação integral do RCF; referências internas
      ou diretas DEVEM substituir duplicação quando preservarem autonomia de
      consumo, clareza e estabilidade.
    - Quando uma regra do RCF for indispensável para a integração e não puder
      ser compreendida isoladamente por referência, ela DEVE ser condensada ou
      contextualizada na norma sem alterar seu significado.
    - O RCF DEVE indicar que alterações relacionadas à extensibilidade,
      integrações externas ou contratos associados exigem revisão desta norma.
    - O `README.md` DEVE apresentar a norma como referência vigente para autores
      de bibliotecas, adaptadores e extensões externas, sem descrevê-la como
      documentação opcional ou meramente complementar.

  - **Exemplos normativos**
    - Incluir exemplos completos e reduzidos de:
      - exposição de uma função;
      - exposição de objeto ou classe;
      - integração com dependência requerida;
      - integração com dependência opcional;
      - detecção de disponibilidade;
      - manifesto de tipos reutilizado;
      - manifesto complementar mínimo;
      - adaptador desacoplado;
      - evento;
      - Promise;
      - iterador;
      - extensão encapsulada;
      - função global;
      - sintaxe global;
      - hook intercalado com o núcleo;
      - carregamento dinâmico;
      - incompatibilidade;
      - erro controlado.
    - Cada exemplo DEVE indicar:
      - o que é obrigatório;
      - o que é opcional;
      - por que é conforme;
      - limites do exemplo.
    - Incluir contraexemplos para:
      - sobrescrita de sintaxe nativa;
      - exposição irrestrita;
      - duplicação de `.d.ts`;
      - dependência obrigatória da DSL;
      - polling recorrente;
      - manifesto divergente;
      - acesso a internals;
      - extensão global conflitante.
    - Exemplos NÃO DEVEM introduzir requisitos não previstos na norma.

  - **Schemas e artefatos auxiliares**
    - Produzir, quando compatível com o repositório:
      - schema oficial do manifesto;
      - modelo mínimo;
      - modelo completo;
      - checklist de conformidade;
      - matriz de capacidades;
      - relatório padrão de integração.
    - Os schemas DEVEM ser:
      - versionados;
      - determinísticos;
      - validáveis;
      - compatíveis com automação;
      - referenciados pela norma.
    - Evitar duplicar no Markdown regras que possam ser verificadas diretamente
      pelo schema; o documento DEVE explicar a semântica e referenciar a
      validação estrutural.
    - Alterações em schemas ou artefatos auxiliares DEVEM permanecer
      sincronizadas com a norma, o RCF e os testes de conformidade.

  - **Processo obrigatório para a IA integradora**
    - A norma DEVE fornecer sequência executável equivalente a:
      1. ler as normas da biblioteca externa;
      2. ler esta norma;
      3. identificar precedências;
      4. confirmar a versão do RCF e do contrato atendidos;
      5. inventariar capacidades;
      6. selecionar modalidade e nível de conformidade;
      7. mapear tipos e APIs;
      8. identificar lacunas semânticas;
      9. reutilizar manifestos existentes;
      10. criar apenas complementos necessários;
      11. implementar adaptador mínimo;
      12. validar segurança e conflitos;
      13. gerar artefatos;
      14. executar testes;
      15. produzir relatório.
    - A IA NÃO DEVE iniciar alterações antes de compreender:
      - arquitetura;
      - contratos;
      - regras de negócio;
      - build;
      - distribuição;
      - compatibilidade.
    - Quando uma informação não puder ser inferida com segurança, a IA DEVE
      inspecionar a implementação real ou deixar a decisão condicionada, sem
      converter hipótese em fato.

  - **Testes de conformidade**
    - Definir suíte mínima reutilizável para validar:
      - manifesto;
      - schema;
      - tipos;
      - exposição;
      - disponibilidade;
      - compatibilidade;
      - hooks;
      - símbolos globais;
      - erros;
      - isolamento;
      - cancelamento;
      - descarte;
      - ausência de regressões.
    - Sempre que viável, fornecer testes contratuais executáveis pela biblioteca
      externa sem incorporar o runtime completo da DSL ao produto final.
    - Testes DEVEM confirmar que:
      - a biblioteca continua funcional sem a integração;
      - consumidores comuns não recebem código da DSL;
      - somente recursos aprovados são expostos;
      - o adaptador não altera regras de negócio;
      - a integração falha com segurança;
      - o núcleo mantém precedência;
      - manifestos e implementação permanecem coerentes.
    - A suíte DEVE ser revisada sempre que o RCF ou a norma alterarem qualquer
      contrato verificável.
    - Nenhuma atualização normativa DEVE ser considerada concluída enquanto os
      testes correspondentes permanecerem incompatíveis, ausentes ou
      desatualizados.

  - **Declaração de conformidade**
    - Definir formato padrão para a biblioteca externa declarar:
      - norma e versão atendidas;
      - versão do RCF de referência;
      - nível de conformidade;
      - modalidades implementadas;
      - capacidades expostas;
      - artefatos fornecidos;
      - versões compatíveis;
      - limitações;
      - permissões;
      - testes executados;
      - desvios conhecidos.
    - A declaração NÃO DEVE alegar conformidade total quando apenas subconjunto
      tiver sido implementado.
    - Exceções e limitações DEVEM ser explícitas e verificáveis.
    - Alterações da norma que afetem uma declaração existente DEVEM permitir
      identificar se a integração continua conforme, requer nova validação ou
      necessita migração.

  - **Critérios de aceite**
    - Considerar a criação inicial concluída somente quando:
      - o suporte de extensibilidade anterior estiver finalizado e estável;
      - o documento normativo possuir nome definitivo;
      - o RCF mencionar e vincular diretamente a norma;
      - o `README.md` mencionar e vincular diretamente a norma;
      - os links forem válidos, estáveis e verificáveis;
      - a norma refletir exatamente os contratos implementados;
      - a precedência entre DSL e biblioteca externa estiver inequívoca;
      - a preservação das regras de negócio externas estiver normatizada;
      - modalidades e níveis de conformidade estiverem definidos;
      - manifestos, tipos, adaptadores, hooks e extensões globais estiverem
        integralmente cobertos;
      - carregamento, descoberta, registro e vinculação estiverem normatizados;
      - segurança, erros, versionamento e compatibilidade estiverem cobertos;
      - schemas e modelos necessários estiverem disponíveis;
      - houver exemplos conformes e não conformes;
      - houver checklist e relatório padrão;
      - uma IA externa consiga implementar integração correta usando apenas a
        norma, os artefatos referenciados e o estado real da biblioteca;
      - a integração resultante não exija violação das normas da DSL nem da
        biblioteca externa;
      - a documentação esteja validada contra pelo menos uma integração de
        referência ou caso de teste representativo.
    - Considerar a manutenção contínua conforme somente quando:
      - toda alteração relevante do RCF possuir análise de impacto registrada;
      - norma, schemas, exemplos e testes estiverem sincronizados;
      - versões e referências cruzadas estiverem coerentes;
      - links no RCF e no `README.md` permanecerem válidos;
      - depreciações e migrações estiverem documentadas;
      - não houver contrato implementado sem cobertura normativa aplicável;
      - não houver regra normativa obsoleta contradizendo o RCF ou a
        implementação.
