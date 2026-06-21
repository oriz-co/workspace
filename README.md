# Oriz

> Family of static sites + apps + browser extensions + VS Code extensions + CLIs + Workers, all free-forever, all on Cloudflare + Firebase Spark, never a card on file.

[![Knowledge: OKF v0.1](https://img.shields.io/badge/knowledge-OKF%20v0.1-success)](./knowledge/index.md)
[![Hosted on Cloudflare](https://img.shields.io/badge/hosted-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)
[![Firebase Spark](https://img.shields.io/badge/Firebase-Spark%20forever-yellow)](https://firebase.google.com/pricing)

This is the **master umbrella repo** (`chirag127/workspace`). It is a meta-repo whose `projects/` tree submodules every site, app, package, API, extension, and skill in the family. The user always works from here (`c:/D/oriz/`); per-submodule `pnpm install` is wrong.

## Start here

| What you need | Read |
|---|---|
| The 11 hard rules that govern every decision | [`AGENTS.md`](./AGENTS.md) |
| Family-wide knowledge (rules, decisions, services, architecture, runbooks, glossary, design, policy) | [`knowledge/`](./knowledge/) |
| Per-app knowledge (one bundle per submodule) | each submodule's own `knowledge/` folder |
| Fresh-clone + bootstrap commands | [`knowledge/runbooks/install-and-bootstrap.md`](./knowledge/runbooks/install-and-bootstrap.md) |
| The 15 shared npm packages | [`knowledge/architecture/the-six-packages.md`](./knowledge/architecture/the-six-packages.md) |
| Repo layout + submodule mechanics | [`knowledge/architecture/repo-layout.md`](./knowledge/architecture/repo-layout.md) |

## Quick start

```bash
git clone --recurse-submodules https://github.com/chirag127/workspace c:/D/oriz
cd c:/D/oriz
pnpm install -r
```

To run any app or package: `pnpm -F <package.json#name> dev|build|test`.
To run everything in parallel: `pnpm -r --parallel <script>`.

Full install runbook: [`knowledge/runbooks/install-and-bootstrap.md`](./knowledge/runbooks/install-and-bootstrap.md).

## License

Source-available, all rights reserved. See [`LICENSE`](./LICENSE). No license is granted to use, fork, modify, or redistribute. Public visibility is for transparency only.
