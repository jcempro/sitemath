- [ ] **Aprimorar a DSL existente para suportar dependências externas opcionais,
  pré-aprovadas e integralmente desacopladas do núcleo**, preservando a
  implementação, a arquitetura, o isolamento, a segurança, a resiliência, a
  retrocompatibilidade e o padrão linguístico TypeScript-like já definidos no
  RCF.

  - **Preservação e escopo**
    - Tratar esta tarefa como evolução cirúrgica do projeto já implementado,
      NÃO como implantação, reescrita ou substituição da DSL.
    - Inspecionar antes de alterar o RCF, a gramática, o parser, a AST, o
      analisador, o sistema de tipos, o runtime, o tratamento de erros, o build
      e os mecanismos atuais de extensão.
    - Preservar integralmente scripts, contratos, comportamentos e recursos
      existentes que não utilizem integrações externas.
    - A DSL DEVE continuar autônoma, segura, resiliente e plenamente funcional
      sem qualquer biblioteca externa.
    - Bibliotecas externas NÃO DEVEM integrar, contaminar ou condicionar o
      núcleo da DSL.
    - A DSL NÃO DEVE incluir, distribuir, instalar, baixar, carregar
      automaticamente, exigir, recomendar nem tornar obrigatória qualquer
      biblioteca externa.
    - Nenhuma integração externa PODE tornar-se dependência de build,
      distribuição ou runtime do produto, exceto ferramenta open source
      estritamente limitada à geração, validação ou transpilação de manifestos
      durante o build.
    - Somente bibliotecas previamente aprovadas pelo repositório e
      explicitamente disponibilizadas pelo ambiente hospedeiro PODEM ingressar
      no contexto da DSL.
    - A disponibilidade de uma biblioteca ao script NÃO implica importação
      física, resolução de pacote, acesso por URL, instalação ou carregamento
      realizado pela própria DSL.

  - **Declaração de dependências no script**
    - Normatizar e implementar, na pseudo-linguagem existente, uma notação
      aderente prioritariamente ao estilo TypeScript e, apenas quando este for
      insuficiente, a conceitos equivalentes de C/C++.
    - A notação DEVE diferenciar inequivocamente:
      - dependência **requerida/essencial**, sem a qual o script não pode
        executar;
      - dependência **opcional/desejável**, cuja ausência não impede a execução.
    - A sintaxe DEVE integrar-se ao padrão léxico, sintático, semântico e de
      tipagem já determinado no RCF, sem criar dialeto paralelo.
    - A declaração DEVE identificar uma integração lógica, e não presumir nome
      de pacote, caminho físico, módulo JavaScript, mecanismo de carregamento ou
      origem de distribuição.
    - A forma final PODE ser equivalente semanticamente a:

      ```ts
      import required { recurso } from "biblioteca";
      import optional { recursoOpcional } from "biblioteca";
      ```

    - A sintaxe definitiva DEVE ser escolhida conforme a gramática existente,
      preservando explicitamente a distinção entre requisito e opcionalidade.
    - Quando compatível com a linguagem atual, DEVEM ser admitidos importação
      seletiva, alias, tipos e demais construções já suportadas, sem ampliar o
      escopo apenas para reproduzir integralmente o sistema de módulos do
      TypeScript.

  - **Dependências requeridas**
    - Dependências requeridas DEVEM ser verificadas tão cedo quanto
      tecnicamente possível, preferencialmente durante análise, preparação ou
      validação anterior à execução material.
    - A ausência, incompatibilidade, indisponibilidade ou exposição incompleta
      de qualquer dependência requerida DEVE interromper o processamento antes
      que instruções do script produzam efeitos.
    - A falha DEVE ser determinística, utilizar o sistema de erros já existente
      e identificar, conforme aplicável:
      - integração ausente;
      - versão, capacidade ou contrato incompatível;
      - símbolo ou recurso requerido não exposto;
      - localização da declaração no script.
    - NÃO DEVE existir fallback silencioso, execução parcial ou tentativa
      automática de instalação, localização ou obtenção da dependência.

  - **Dependências opcionais**
    - A ausência de dependência opcional NÃO DEVE impedir análise, preparação
      nem execução do script.
    - O runtime interno da DSL DEVE disponibilizar mecanismo nativo, seguro e
      coerente com o padrão linguístico existente para o próprio script
      verificar se uma ou mais dependências opcionais previamente declaradas:
      - foram disponibilizadas;
      - são compatíveis;
      - expõem determinada capacidade ou símbolo.
    - A verificação NÃO DEVE permitir sondagem arbitrária de bibliotecas não
      declaradas.
    - O script DEVE poder condicionar seu fluxo e tratar adequadamente tanto a
      presença quanto a ausência da integração.
    - Quando o sistema de tipos permitir, a verificação DEVE refinar a
      disponibilidade e os tipos dos símbolos no bloco condicionado.
    - Símbolos opcionais NÃO DEVEM ser usados fora de fluxo validado, salvo
      quando sua disponibilidade puder ser provada estaticamente.
    - A ausência esperada de integração opcional NÃO DEVE ser classificada como
      erro.
    - Falhas ocorridas após a integração ter sido confirmada como disponível
      DEVEM seguir o tratamento normal de erros da DSL, sem serem mascaradas
      como mera ausência de dependência.
    - A forma final PODE ser semanticamente equivalente a:

      ```ts
      if (dependency.available("biblioteca")) {
        // uso da integração
      } else {
        // tratamento alternativo
      }
      ```

    - O identificador, namespace e sintaxe reais DEVEM reutilizar estruturas já
      existentes sempre que possível, evitando novos globais desnecessários.

  - **Contrato de integração**
    - A integração DEVE ocorrer exclusivamente por contrato definido,
      normatizado, validado e controlado pela DSL.
    - A biblioteca externa PODE expor métodos, funções, objetos, propriedades,
      tipos, eventos, callbacks, iteradores, streams e capacidades customizadas.
    - A biblioteca externa NÃO PODE:
      - impor exigências ao núcleo;
      - alterar a gramática fora de pontos de extensão normatizados;
      - acessar diretamente parser, AST, runtime, escopo ou estado interno;
      - exigir que a DSL adote suas dependências, arquitetura ou ciclo de vida;
      - contornar validações, permissões ou limites da DSL.
    - A governança é unilateral: a DSL define como a integração é declarada,
      registrada, validada, exposta, invocada, observada e descartada; a
      biblioteca externa apenas fornece um adaptador ou manifesto compatível.
    - Apenas símbolos e capacidades explicitamente aprovados DEVEM ser expostos
      ao contexto da pseudo-linguagem.
    - O objeto original da biblioteca NÃO DEVE ser disponibilizado
      irrestritamente quando somente parte de sua superfície for necessária.
    - A camada de integração DEVE preservar isolamento de estado, tratamento de
      erros, limites de execução, cancelamento, descarte e demais controles já
      existentes.

  - **Manifesto de métodos, tipos e símbolos**
    - Reutilizar prioritariamente declarações e padrões equivalentes a `.d.ts`
      do TypeScript, evitando criar formato proprietário quando o ecossistema
      existente já fornecer solução adequada.
    - O manifesto DEVE fornecer somente as informações necessárias para a DSL
      compreender e validar o que será efetivamente invocado, escutado,
      acessado ou retornado, incluindo, conforme aplicável:
      - nomes dos símbolos expostos;
      - categoria de cada símbolo;
      - assinaturas;
      - tipos de parâmetros;
      - tipos de retorno;
      - sobrecargas relevantes;
      - propriedades;
      - eventos;
      - tipos genéricos, personalizados, opcionais ou anuláveis;
      - comportamento síncrono ou assíncrono.
    - Nomes de parâmetros NÃO PRECISAM ser preservados quando somente seus tipos
      forem semanticamente necessários.
    - Nomes DEVEM ser mantidos quando influenciarem chamadas nomeadas,
      documentação, associação semântica, validação ou resolução inequívoca.
    - Tipos personalizados referenciados DEVEM possuir definição suficiente
      para análise e uso.
    - A biblioteca externa PODE informar toda a sua API, mas DEVE ser possível
      identificar e processar apenas o subconjunto efetivamente exposto à DSL.
    - A DSL NÃO DEVE exigir duplicação manual de definições já presentes em
      manifesto padrão confiável.
    - Caso o manifesto TypeScript completo contenha informações excedentes, a
      implementação DEVE filtrá-las ou ignorá-las, sem exigir sua reescrita.
    - Declarações de tipo são metadados de análise e NÃO DEVEM ser tratadas como
      mecanismo de segurança ou prova de que a implementação real cumpre o
      contrato.

  - **Manifesto complementar de associação**
    - Como declarações de tipos normalmente descrevem APIs, mas não informam sua
      associação semântica com a DSL, criar manifesto complementar somente
      quando necessário.
    - Esse manifesto DEVE acrescentar exclusivamente informações ausentes, sem
      redefinir tipos, métodos, propriedades ou assinaturas já descritos por
      fonte reutilizada.
    - O manifesto complementar DEVE ser legível por máquina e aderente aos
      formatos normativos já adotados pelo repositório, preferencialmente JSON
      ou YAML; XML NÃO DEVE ser introduzido.
    - O manifesto DEVE indicar, conforme aplicável:
      - identificador lógico da integração;
      - versão do contrato;
      - compatibilidade com versões da DSL;
      - referência ao manifesto de tipos utilizado;
      - símbolos efetivamente expostos;
      - nome, namespace, alias ou sintaxe visível no script;
      - associação entre símbolo da DSL e membro da biblioteca externa;
      - regras léxicas ou sintáticas estritamente necessárias;
      - operação externa a ser invocada;
      - normalização e passagem de argumentos;
      - tipo, estrutura e semântica do retorno esperado;
      - comportamento síncrono, assíncrono, iterável, observável ou orientado a
        eventos;
      - erros possíveis e sua conversão para o modelo da DSL;
      - eventos, gatilhos, listeners ou callbacks;
      - inicialização, ciclo de vida, cancelamento e descarte;
      - permissões ou capacidades explicitamente necessárias;
      - mutabilidade, efeitos colaterais e persistência de estado relevantes;
      - requisitos mínimos para considerar a integração disponível e completa.
    - O manifesto NÃO DEVE permitir que a biblioteca externa imponha
      dependências, comportamentos ou alterações ao núcleo.

  - **Retornos iteráveis e fluxos**
    - Para resultados iteráveis, paginados, incrementais, assíncronos,
      observáveis ou orientados a eventos, o contrato DEVE declarar
      explicitamente quem controla o fluxo.
    - Devem ser suportados, quando aplicáveis, os seguintes modelos:
      1. a biblioteca externa resolve integralmente o fluxo e entrega o
         resultado final;
      2. a integração entrega uma estrutura iterável padronizada e a DSL
         controla a iteração;
      3. a DSL intermedeia o fluxo por operações externas padronizadas, como
         iniciar, avançar, consultar estado, cancelar e encerrar.
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
    - Sempre que viável, o conteúdo DEVE ser entregue à DSL em forma que permita
      ao próprio runtime resolver e controlar a iteração, evitando acoplamento
      operacional desnecessário à biblioteca externa.

  - **Padrões comuns e extensibilidade**
    - A DSL DEVE normatizar contratos comuns, estritos e reutilizáveis para
      finalidades recorrentes, como:
      - funções e métodos;
      - propriedades;
      - eventos e gatilhos;
      - callbacks;
      - promessas;
      - iteradores e iteradores assíncronos;
      - streams;
      - erros;
      - inicialização e descarte.
    - Esses contratos DEVEM reduzir o trabalho de adaptação e permitir que
      bibliotecas que já seguem boas práticas produzam manifestos diretamente
      utilizáveis ou facilmente adaptáveis.
    - Padrões comuns NÃO DEVEM limitar integrações legítimas nem impedir métodos
      customizados quando os contratos genéricos forem insuficientes.
    - Extensões customizadas DEVEM complementar, e não contradizer, o contrato
      comum.
    - O objetivo NÃO é inovar no formato de comunicação, mas reutilizar as
      melhores práticas e padrões já consolidados, adicionando somente os dados
      estritamente ausentes para o contexto da DSL.

  - **Ferramentas auxiliares de build**
    - Dependências open source PODEM ser usadas exclusivamente durante build,
      geração, validação ou transpilação dos manifestos quando:
      - forem estáveis, mantidas, auditáveis e compatíveis com a licença do
        repositório;
      - não integrarem o runtime cliente nem o artefato principal distribuído;
      - não alterarem o contrato público da DSL;
      - puderem ser substituídas sem exigir alterações nas integrações;
      - reduzirem trabalho manual e favorecerem formatos universais.
    - Essas ferramentas também PODEM ser indicadas às bibliotecas externas como
      meio opcional de produzir manifestos padronizados.
    - Elas NÃO DEVEM ser exigidas em runtime nem transformar-se em dependência
      da biblioteca externa ou da DSL.
    - Como a saída principal é JavaScript executado no cliente, a ferramenta de
      build NÃO PRECISA ser escrita em JavaScript, mas DEVE ser compatível com
      ambientes comuns de construção e gerar artefatos determinísticos,
      interoperáveis e independentes da linguagem que os produziu.

  - **Segurança, validação e resiliência**
    - Manifestos DEVEM ser validados estrutural e semanticamente antes do
      registro.
    - Símbolos, tipos e capacidades declarados DEVEM ser confrontados com a
      exposição efetivamente fornecida.
    - Incompatibilidades DEVEM impedir o registro apenas da integração afetada,
      salvo quando ela for requerida por determinado script.
    - Chamadas externas DEVEM atravessar uma camada controlada de adaptação.
    - Erros externos DEVEM ser normalizados para o modelo existente sem ocultar
      a causa técnica necessária ao diagnóstico.
    - Integrações NÃO DEVEM obter acesso implícito a parser, AST, runtime,
      escopo, armazenamento, rede, DOM ou outros recursos internos.
    - Capacidades sensíveis DEVEM depender de exposição e aprovação explícitas.
    - Scripts NÃO DEVEM instalar, localizar, importar ou carregar dependências
      por URL, caminho, pacote ou rede.
    - Falhas externas NÃO DEVEM corromper estado interno, comprometer o núcleo
      nem impedir recuperação controlada do runtime.
    - O comportamento padrão DEVE negar acesso a qualquer símbolo, capacidade
      ou integração não declarada, não aprovada ou não disponibilizada.

  - **Documentação, normatização e rastreabilidade**
    - Atualizar o RCF e a documentação aplicável para tornar o recurso
      determinístico, verificável e suficiente.
    - Documentar:
      - sintaxe de dependências requeridas e opcionais;
      - semântica de resolução e disponibilidade;
      - contrato de integração;
      - formato dos manifestos;
      - associação entre tipos e semântica da DSL;
      - regras de exposição;
      - erros;
      - assincronismo;
      - eventos;
      - iteração;
      - segurança;
      - ciclo de vida;
      - compatibilidade.
    - Registrar decisões arquiteturais relevantes e limitações inevitáveis sem
      transformar limitações temporárias em proibições permanentes.
    - Não alterar normas apenas para legitimar desvios da implementação, salvo
      quando a própria norma estiver comprovadamente incompleta e a alteração
      fizer parte desta evolução.

  - **Validação e aceite**
    - Confirmar por testes que:
      - scripts existentes sem dependências mantêm o comportamento anterior;
      - a DSL permanece funcional sem qualquer integração;
      - nenhuma biblioteca externa é incluída automaticamente no bundle;
      - dependência requerida disponível permite execução;
      - dependência requerida ausente, incompatível ou incompleta interrompe o
        processamento antes de efeitos;
      - dependência opcional ausente não impede execução;
      - dependência opcional disponível pode ser detectada e utilizada;
      - símbolos opcionais não validados são rejeitados ou protegidos;
      - bibliotecas não aprovadas não podem ser registradas nem acessadas;
      - símbolos não expostos permanecem inacessíveis;
      - manifestos inválidos ou divergentes são rejeitados;
      - APIs síncronas, assíncronas, iteráveis e orientadas a eventos seguem o
        contrato;
      - erros externos não corrompem o estado da DSL;
      - cancelamento e descarte liberam recursos quando aplicáveis;
      - ferramentas de build não vazam para o runtime cliente;
      - bibliotecas externas podem expor recursos customizados sem impor
        exigências ao núcleo;
      - a solução reutiliza padrões existentes e acrescenta somente adaptações
        cirúrgicas indispensáveis.
