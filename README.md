# 🚀 DevPublisher

> The open-source technical content syndication platform. Write once in Markdown, publish everywhere automatically.

[![CI](https://github.com/Igorcbraz/DevPublisher/actions/workflows/ci.yml/badge.svg)](https://github.com/Igorcbraz/DevPublisher/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io/)

---

## 💡 Motivation & Goal

As technical writers and software engineers, sharing knowledge across developer communities (Dev.to, Medium, Ghost, LinkedIn) is essential for reach and personal branding. However, manually copying, pasting, reformatting Markdown, setting canonical URLs, and managing platform-specific tags is tedious and error-prone.

**DevPublisher** solves this by providing a unified, open-source content syndication engine. Built with an extensible **Pipeline & Plugin System**, DevPublisher parses your Markdown posts, validates frontmatter, applies necessary content transformations, and automatically cross-posts or updates your articles across target platforms while preserving canonical URLs for SEO.

---

## ✨ Features

- 🎯 **Multi-Platform Syndication**: Distribute articles to Dev.to out of the box, with extensible plugins for Medium, Ghost, and custom REST APIs.
- 🔌 **Extensible Plugin Architecture**: Independent registries for **Loaders**, **Validators**, **Transformers**, **Publishers**, **Reporters**, and **Enrichers**.
- 🛠️ **Idempotent Execution**: Smart state tracking (`.devpublisher/state.json`) detects existing publications and executes updates instead of duplicate creates.
- ⚡ **Zero-Business-Logic Clients**: Pure CLI (`devpublisher`), native GitHub Action (`- uses: Igorcbraz/DevPublisher@v1`), and Node.js SDK sharing the same engine.
- 🛡️ **Clean Frontmatter**: Frontmatter contains only intrinsic article metadata (`title`, `slug`, `canonical`, `tags`, `published`). Target platforms are configured via CLI or Action options.
- 🔍 **Built-in Validation**: Zod-powered schema validation catches frontmatter errors, missing fields, or empty bodies before calling platform APIs.

---

## 📦 Installation & Quick Start

### 1. Global CLI Installation

```bash
npm install -g @devpublisher/cli
# or via pnpm
pnpm add -g @devpublisher/cli
```

### 2. Initialize Configuration

Generate a sample `devpublisher.yml` in your project root:

```bash
devpublisher init
```

Example `devpublisher.yml`:

```yaml
version: '1'

source:
  folder: 'content/blog'
  match: '**/*.md'

platforms:
  devto:
    enabled: true
    apiKey: '${DEVTO_API_KEY}'

pipeline:
  validators:
    - frontmatter
  transformers:
    - canonical-url
  tracking:
    provider: 'file'
    file: '.devpublisher/state.json'
```

---

## 🔑 Environment Variables & API Keys

To publish articles to your target platforms, DevPublisher needs authentication credentials. You can set these credentials as environment variables or configure them directly inside `devpublisher.yml`.

### 1. Dev.to (`DEVTO_API_KEY`)

1. Log in to [Dev.to](https://dev.to).
2. Go to **Settings** (click your profile picture -> Settings).
3. Select **Extensions** in the left sidebar.
4. Scroll down to the **DEV.TO API Keys** section.
5. Click **Generate API Key**, provide a description, and copy the generated key.
6. Export the key in your terminal or action secrets:
   ```bash
   export DEVTO_API_KEY="your_devto_api_key_here"
   ```

### 2. TabNews (`TABNEWS_SESSION_ID`)

TabNews uses a session cookie token for authentication. To retrieve your session ID:

1. Log in to [TabNews](https://www.tabnews.com.br).
2. Open your browser's **Developer Tools** (F12 or right-click -> Inspect).
3. Navigate to the **Application** (Chrome/Edge) or **Storage** (Firefox) tab.
4. Expand the **Cookies** section and select `https://www.tabnews.com.br`.
5. Locate the cookie named `session_id` and copy its value.
6. Export the session ID in your terminal or action secrets:
   ```bash
   export TABNEWS_SESSION_ID="your_session_id_here"
   ```

---

## 💻 CLI Usage

### Publish Articles

Publish all markdown files in a directory:

```bash
export DEVTO_API_KEY="your-devto-api-key"
devpublisher publish content/blog
```

Publish a single article to specific platforms:

```bash
devpublisher publish content/blog/my-article.md --platforms devto
```

### Validate Articles

Validate frontmatter and markdown structure without publishing:

```bash
devpublisher validate content/blog
```

### List Registered Plugins

Display all loaded loaders, validators, transformers, publishers, and reporters:

```bash
devpublisher list
```

### System Health Check

Verify environment variables and system dependencies:

```bash
devpublisher doctor
```

---

## 🤖 GitHub Action Usage

Automate your content syndication on every `push` to `main` using GitHub Actions:

```yaml
name: Syndication Workflow

on:
  push:
    branches: [main]
    paths:
      - 'content/blog/**'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Run DevPublisher
        uses: Igorcbraz/DevPublisher@v1
        with:
          folder: 'content/blog'
          platforms: 'devto'
        env:
          DEVTO_API_KEY: ${{ secrets.DEVTO_API_KEY }}
```

---

## ✍️ Content Generation with `blog-writer` Skill

DevPublisher isn't just about syndicating existing content; it also provides an AI-powered **`blog-writer`** skill to generate high-quality, viral technical posts dynamically. It uses your project's context to author engaging articles optimized for platforms like Dev.to, TabNews, and HackerNoon.

### Usando a skill `blog-writer` no seu projeto

You can easily port this skill into any third-party project to automate your technical marketing.

#### Pré-requisitos

- You must be using an agentic AI assistant (like Google Antigravity or similar) capable of running local file-based skills.
- A product context file describing what your project does, its target audience, technical stack, and differentials.

#### Passo a Passo de Instalação e Configuração

1. **Copie a Skill**: Copy the entire `.agents/skills/blog-writer/` directory from this DevPublisher repository into your own project (e.g., at `your-project/.agents/skills/blog-writer/`).
2. **Crie seu Contexto de Produto**: Create a `PRODUCT.md` file anywhere in your project (e.g., at the root, or inside `docs/` or `blog/`). Write down the truth about your product's architecture and value proposition.
3. **Plataformas Configuráveis**: The skill supports Dev.to, TabNews, and HackerNoon, but you don't have to use all of them. The templates in `.agents/skills/blog-writer/templates/` dictate the required fields for each platform. You can explicitly request the agent to target just one or multiple platforms.

#### Exemplo de Invocação Genérica

When interacting with your AI agent in your project, use a prompt like this:

> "Por favor, use a skill `blog-writer` para gerar um post no formato 'Listicle' focado na plataforma **dev.to**. O contexto do produto está no arquivo `docs/PRODUCT.md`. Salve o resultado final na pasta `blog/` do projeto."

The skill will automatically read your context, apply the Dev.to frontmatter and tone rules, guarantee an original hook, and output the final markdown ready for DevPublisher to syndicate.

---

## 🏗️ Architecture & Extension Guide

DevPublisher is organized as a monorepo under `packages/`:

```text
packages/
├── core/                  # @devpublisher/core (Micro-Kernel, Pipeline Engine, Registries)
├── publisher-devto/       # @devpublisher/publisher-devto (Dev.to Plugin)

├── publisher-medium/      # @devpublisher/publisher-medium (Medium Plugin Stub)
└── cli/                   # @devpublisher/cli (Command Line Adapter)
```

### Creating a New Publisher Plugin

To create a new platform publisher:

1. Implement the `Publisher` and `PublisherPlugin` contracts from `@devpublisher/core`:

```typescript
import {
  Publisher,
  PublisherPlugin,
  BlogPost,
  PlatformResult,
  PublisherOptions
} from '@devpublisher/core';

export class CustomPublisher implements Publisher {
  readonly platformId = 'custom';
  readonly platformName = 'Custom Platform';

  async validate(post: BlogPost) {
    return { valid: true, filePath: post.filePath, issues: [] };
  }

  async publish(post: BlogPost, options?: PublisherOptions): Promise<PlatformResult> {
    // Implement API call
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'published',
      externalId: '12345',
      url: 'https://custom-platform.com/article'
    };
  }

  async update(
    post: BlogPost,
    externalId: string,
    options?: PublisherOptions
  ): Promise<PlatformResult> {
    // Implement update API call
    return {
      platformId: this.platformId,
      platformName: this.platformName,
      status: 'updated',
      externalId,
      url: 'https://custom-platform.com/article'
    };
  }

  async delete(externalId: string): Promise<PlatformResult> {
    // Implement delete API call
    return { platformId: this.platformId, platformName: this.platformName, status: 'published' };
  }
}

export class CustomPublisherPlugin implements PublisherPlugin {
  readonly id = 'custom';
  readonly name = 'Custom Platform Publisher';
  readonly version = '1.0.0';
  readonly type = 'publisher';

  createPublisher() {
    return new CustomPublisher();
  }
}
```

2. Register your plugin with the engine:

```typescript
import { DevPublisherEngine } from '@devpublisher/core';
import { CustomPublisherPlugin } from './custom-plugin';

const engine = new DevPublisherEngine();
engine.use(new CustomPublisherPlugin());
await engine.run();
```

---

## 🗺️ Roadmap

- [x] Core Micro-Kernel Engine & Extensible Pipeline
- [x] Zod-powered Frontmatter & Article Validation
- [x] State Tracking & Idempotent Updates (`.devpublisher/state.json`)
- [x] Dev.to Publisher Plugin (`@devpublisher/publisher-devto`)
- [x] DevPublisher CLI (`@devpublisher/cli`)
- [x] GitHub Action Workflow (`action.yml`)

- [ ] Medium Publisher Plugin (`@devpublisher/publisher-medium`)
- [ ] Ghost Publisher Plugin
- [ ] WordPress Publisher Plugin
- [ ] LinkedIn Articles Publisher Plugin
- [ ] AI Summary & Automatic Translation Enrichers
- [ ] VS Code Extension & Web Dashboard

---

## 🤝 Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
