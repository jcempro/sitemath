# Especializacao local

`AGENTS.md`, seus cenarios, metaarquivos gerenciados e `scripts/.agents/` espelham outro repositorio e DEVEM permanecer imutaveis neste projeto. A atualizacao ocorre exclusivamente por `agent:agents`; alteracao manual sera revertida e e vedada.

Especializacao do SiteMath DEVE residir em codigo do produto, `scripts/` fora de `.agents/`, `./.agents/local/` ou `./.agents/hooks/` declarados. Integracao com a governanca gerenciada DEVE usar hooks/adaptadores, sem fork ou edicao direta.
