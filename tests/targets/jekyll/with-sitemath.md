---
layout: default
title: Jekyll com SiteMath
permalink: /with-sitemath/
---

# Página Jekyll declarada

```sitemath
field nome: text = { label: "Nome", placeholder: "Informe o nome", tip: "Fixture Jekyll" };
field total: number = { label: "Total", readonly: true };
on.change([nome], () => { if (nome != "") { total = 5; } });
```
