# Contributing to motionary

First off, thank you for considering contributing to `motionary`! It's people like you that make the open-source community such a great place to learn, inspire, and create.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please treat everyone with respect and kindness.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue tracker as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title for the issue to identify the problem.
* Describe the exact steps which reproduce the problem in as many details as possible.
* Provide specific examples to demonstrate the steps. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
* Describe the behavior you observed after following the steps and point out what exactly is the problem with that behavior.
* Explain which behavior you expected to see instead and why.

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When you are creating an enhancement suggestion, please include:

* Use a clear and descriptive title for the issue to identify the suggestion.
* Provide a step-by-step description of the suggested enhancement in as many details as possible.
* Provide specific examples to demonstrate the steps.
* Describe the current behavior and explain which behavior you expected to see instead and why.
* Explain why this enhancement would be useful to most users.

### Pull Requests

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

1. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/motionary.git
   cd motionary
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development build watcher:
   ```bash
   npm run dev
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Type-check and run the tests (Vitest + jsdom):
   ```bash
   npm run typecheck
   npm test
   ```

6. After building, check the published entry points and the size budgets:
   ```bash
   npm run check:exports
   npm run size:check   # budgets live in size-budget.json
   ```

`dist/` is committed only in release PRs; feature PRs leave it untouched.

## Docs facts, versions and the release gate

- Component counts, the core element table in the READMEs and the package description are generated from the manifest:
  run `npm run facts` after adding or moving a component. `npm run check:docs` (also in CI) fails when any generated doc,
  count or version description is stale — see [docs/components.md](./docs/components.md#how-components-are-counted).
- Releases go through the release gate: required CI checks green on the PR head, merged at that exact commit —
  [docs/release-gate.md](./docs/release-gate.md).

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. Please ensure your commit messages adhere to this format:

* `feat:` A new feature
* `fix:` A bug fix
* `docs:` Documentation only changes
* `style:` Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* `refactor:` A code change that neither fixes a bug nor adds a feature
* `perf:` A code change that improves performance
* `test:` Adding missing tests or correcting existing tests
* `chore:` Changes to the build process or auxiliary tools and libraries such as documentation generation

Thank you for your contribution!
