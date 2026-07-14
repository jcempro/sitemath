<!-- Gerado por npm run agent:handoff. Nao editar manualmente. -->
# Implementacoes em andamento

Resumo operacional gerado de `.agents/continue.ia`.

## FT-001 - Scripts especializados e bootstrap SiteMath

Objetivo: Substituir infraestrutura herdada por comandos especializados e construir de forma incremental o runtime cliente SiteMath, seus detectores e adaptadores de build verificaveis.

<table>
<thead><tr><th>Etapa</th><th>Tarefa</th><th>Status</th></tr></thead>
<tbody>
<tr>
<td rowspan="3">Diagnostico e contratos</td>
<td>Mapear scripts herdados, entradas, efeitos, lacunas e dependencias</td>
<td><span style="color:#ca8a04">&#9679;</span> em andamento</td>
</tr>
<tr>
<td>Confirmar RCF, API operacional, estrutura fonte e artefato publicado</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Definir criterios de aceite, riscos e ordem de migracao</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td rowspan="4">Infraestrutura operacional</td>
<td>Especializar por hooks/adaptadores locais, sem editar a governanca espelhada</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Implementar comandos de build, teste, lint, contexto e documentacao aplicaveis</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Remover ou isolar scripts comprovadamente alheios, sem apagar extensoes uteis</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Validar multiplataforma, CI e idempotencia</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td rowspan="5">Runtime e linguagem cliente</td>
<td>Definir parser e declaracao tipada de campos</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Implementar limite de iteracao configuravel, async, cancelamento e Worker proporcional</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Expor eventos, gatilhos, notificacoes e leitura de campos</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Garantir HTML acessivel, falha segura e execucao obrigatoria no cliente</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Testar multiplos blocos no mesmo artigo e limites aninhados</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td rowspan="4">Deteccao e integracao de build</td>
<td>Consolidar manifesto com identificadores exatos e schema versionado</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Implementar deteccao Markdown e HTML sem falso positivo</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Criar contrato de adaptador plugavel por runtime do CMS</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Verificar inclusao condicional da biblioteca apenas em paginas validas</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td rowspan="4">Validacao e entrega</td>
<td>Executar testes, lint, build e verificacao do artefato publicado</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Atualizar RCF, README, memoria e handoff</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Revisar diffs e compatibilidade</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
<tr>
<td>Commitar em dev sem push e preparar convergencia futura</td>
<td><span style="color:#64748b">&#9679;</span> pendente</td>
</tr>
</tbody>
</table>
