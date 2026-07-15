# Especializacao local

`AGENTS.md`, `./.agents/core/`, cenarios gerenciados, metaarquivos e scripts de governanca espelham outro repositorio e DEVEM permanecer imutaveis neste projeto. A atualizacao ocorre exclusivamente por `agent:agents`; alteracao manual sera revertida e e vedada.

Especializacao do SiteMath DEVE residir em codigo do produto, `scripts/` fora da arvore gerenciada, `./.agents/local/` ou `./.agents/hooks/` declarados. Integracao com a governanca gerenciada DEVE usar hooks/adaptadores, sem fork ou edicao direta.
