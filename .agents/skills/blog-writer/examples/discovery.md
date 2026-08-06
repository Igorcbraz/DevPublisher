# Exemplo: Descoberta de Caso de Uso (Deep Dive)
**Alvo**: TabNews

---
title: "Como geramos SVGs responsivos baseados em temas de SO diretamente no Edge"
slug: "como-geramos-svgs-responsivos-temas-edge"
published: false
---

Quando você visualiza um perfil no GitHub, você deve ter notado que as imagens estáticas não respondem se você muda a sua interface de Light Mode para Dark Mode. O GitHub faz proxy de todas as imagens externas usando o Camo, o que na prática invalida scripts dinâmicos rodando no lado do cliente na visualização do README.

Para contornar isso no [SeuProduto], tivemos que mudar nossa arquitetura. Em vez de salvar arquivos PNG, nós renderizamos marcação SVG gerada dinamicamente via Next.js Edge APIs...

(Continua com a explicação técnica, code snippets sobre o `prefers-color-scheme` via CSS embedado no SVG, e mostrando a solução final elegante).

