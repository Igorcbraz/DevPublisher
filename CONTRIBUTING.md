# Contributing to DevPublisher

Thank you for your interest in contributing to **DevPublisher**! We welcome contributions of all kinds, including bug fixes, new publisher plugins, documentation improvements, and feature requests.

## Development Setup

### Prerequisites

- **Node.js**: `v22.0.0` or higher
- **pnpm**: `v9.0.0` or higher

### Getting Started

1. Fork and clone the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/DevPublisher.git
   cd DevPublisher
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Build all packages:

   ```bash
   pnpm run build
   ```

4. Run tests:
   ```bash
   pnpm run test
   ```

## Creating a Publisher Plugin

DevPublisher uses a modular plugin architecture. To add a new platform publisher:

1. Create a new package under `packages/publisher-<name>`
2. Implement the `PublisherPlugin` interface from `@devpublisher/core`
3. Export a `createPublisher` factory function
4. Write tests covering `publish`, `update`, `delete`, and `validate`

## Code Guidelines & Conventional Commits

We follow Conventional Commits for commit messages:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `test:` Adding or modifying tests
- `refactor:` Code changes that neither fix bugs nor add features

Before creating a Pull Request, please ensure:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
```

## Adding a Changeset

If your changes affect package versions or require a changelog entry, run:

```bash
pnpm changeset
```

Follow the prompts to describe your changes.
