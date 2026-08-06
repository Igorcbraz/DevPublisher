---
name: blog-writer
description: Gera posts virais e técnicos para um produto otimizados para publicação cross-platform (dev.to, TabNews, Hackernoon) via DevPublisher.
---

# ✍️ Blog Writer Skill

Esta skill é responsável por gerar conteúdo em formato de post de blog altamente engajador, feito para viralizar e atrair atenção para o produto do projeto atual. O post final deve ser salvo no repositório do projeto para posterior publicação automatizada.

## 🧠 Contexto de Execução
A skill roda a partir do repositório do projeto do usuário. Para saber em qual contexto você está e buscar as informações corretas:
1. Identifique o documento de contexto do produto. O usuário fornecerá o caminho (ex: `docs/PRODUCT.md` ou `blog/PRODUCT.md`), ou você deve procurar por um arquivo `PRODUCT.md` na raiz do projeto. Ele contém a fonte da verdade sobre o produto, público-alvo e features.
2. Identifique quais plataformas alvo o usuário deseja publicar. A skill não assume que todas as 3 plataformas estão ativas; ela publica apenas onde for explicitamente solicitado.
3. Escolha o formato prioritário.
4. Utilize o respectivo frontmatter localizado no subdiretório `templates/` desta mesma skill (caminho relativo a este arquivo).

## 📝 Regras Gerais de Escrita (CRÍTICO para Viralização)

1. **NUNCA repita ganchos ou títulos** entre posts gerados. Se solicitado para gerar vários posts, cada um DEVE ter uma abordagem, ângulo de entrada e título completamente diferentes. Evite fórmulas repetitivas.
2. **Ganchos Iniciais Fortes**: O primeiro parágrafo deve imediatamente fisgar a atenção do leitor (apresentando um problema comum, um dado chocante, uma narrativa pessoal, ou uma dor aguda).
3. **Foco Tangível**: Mais demonstração de uso ("show, don't tell") e menos jargão corporativo.
4. **Uso de Imagens e Código**: Sempre adicione snippets de código reais e imagens geradas para ilustrar os conceitos (ver seção sobre Nanobanana abaixo).

## 🖼️ Geração de Imagens (Nanobanana)

Todos os posts devem conter elementos visuais gerados via Nanobanana. Use a ferramenta `generate_image` (ou o comando `/nanobanana:generate`) seguindo estes critérios:

### 1. Requisitos por Post
- **Imagem de Capa (Hero)**: Pelo menos uma imagem de proporção `16:9` no topo ou referenciada no frontmatter.
- **Imagem de Apoio (Meio do texto)**: Adicione diagramas ou fluxos conceituais ilustrativos para posts técnicos (comparativos e deep dives).

### 2. Padrões de Prompting para Imagens Técnicas
Escreva prompts detalhados para manter a consistência visual com o design do produto:
- **Estilo Editorial Tech**: Defina temas escuros com cores de carbono (`#060606`) e acentos neon brilhantes como verde limão ("signal lime", `#c5ff4a`).
- **Diagramas Abstratos**: Solicite ilustrações vetoriais minimalistas com caminhos e fluxos de dados brilhantes. Evite pedir textos literais nos diagramas para não gerar caracteres corrompidos.
- **Ilustrações de Tema Adaptativo**: Para posts de tema claro/escuro, peça uma imagem com divisão diagonal separando uma metade clara com fontes escuras de uma metade escura com fontes verdes neon.

### 3. Organização de Assets
- Salve as imagens geradas na subpasta `blog/assets/` do projeto.
- Use nomenclatura descritiva em kebab-case (ex: `decoupling-canvas.jpg`, `latency-comparison.jpg`).
- Referencie as imagens no markdown usando caminhos relativos (ex: `![Descrição](assets/imagem.jpg)`).
- Adicione os campos `cover_image` (Dev.to) e `main_image` / `cover_image` (Hackernoon) no frontmatter dos posts dessas plataformas, apontando para o caminho do arquivo gerado.

## 🎯 Formatos Prioritários
Foque os posts nestes três formatos primários:
1. **Comparativo Direto**: Posicionamento agressivo mas justificado. Ex: "Por que parei de usar X e decidi construir Y do zero".
2. **Listicle (Lista Curada)**: Alto engajamento. Ex: "As 10 ferramentas de open-source que vão mudar sua produtividade (A #3 é absurda)". O produto em questão é uma dessas ferramentas.
3. **Descoberta de Caso de Uso (Deep Dive Técnico)**: Conta a história técnica dos bastidores. Ex: "Como resolvemos o problema de cache no edge usando Redis". Atrai devs brilhantes pelo desafio técnico.

## 🎭 Plataformas e Tom de Voz
Adeque o post e o frontmatter para a(s) plataforma(s) selecionada(s). Leia o template de cada plataforma solicitada para saber os campos obrigatórios.

- **dev.to**: 
  - *Tom*: Casual, técnico, muito acolhedor e com energia alta. Gosta de emojis, tutoriais rápidos e relatos de jornada.
  - *Frontmatter*: Use o template `templates/frontmatter-devto.md` relativo a esta skill.
- **TabNews**: 
  - *Tom*: Direto, objetivo, neutro e **altamente cético em relação a auto-promoção**. Traga "pedações de valor concreto" (arquitetura, decisões técnicas). **Sem tom marqueteiro.** Evite emojis no título. Se for vender o produto, venda através da solução técnica brilhante.
  - *Frontmatter*: Use o template `templates/frontmatter-tabnews.md` relativo a esta skill.
- **Hackernoon**: 
  - *Tom*: Editorial, denso, tom de artigo de tecnologia e opinião forte sobre tendências da indústria. 
  - *Frontmatter*: Use o template `templates/frontmatter-hackernoon.md` relativo a esta skill.

## 🛠️ Passo a Passo Final
1. Analise o documento de contexto do produto do repositório alvo.
2. Para cada plataforma solicitada, leia as regras de formatação do respectivo arquivo em `templates/`.
3. Gere o texto em markdown, garantindo ganchos inéditos e o tom correto.
4. Gere e configure as imagens de capa e de apoio na pasta `blog/assets/` usando Nanobanana.
5. Salve o arquivo na pasta especificada pelo usuário, nomeado de acordo com a plataforma (ex: `post-sobre-arquitetura-tabnews.md`).

