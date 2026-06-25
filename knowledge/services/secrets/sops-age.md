---
type: service
title: "SOPS + Age Secrets Encryption"
description: "Primary, file-based secrets encryption toolchain using age keys and Secrets OPerationS (SOPS) — actively maintained under CNCF."
tags: [secrets, encryption, sops, age, security, gitops]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
  - runbooks/operations/env-management
  - decisions/security/sops-plus-doppler-hybrid
---

# SOPS + Age Secrets Encryption

- **Role**: Primary secrets encryption toolchain for the family. Encrypts `.env` to `.env.enc` for safe version control storage and disaster recovery.
- **Cost**: $0 (100% free, local binary execution, zero dependencies on external SaaS).
- **Credit Card Required**: No.

## Project Status — NOT Abandoned

SOPS was **created at Mozilla in 2015** by Adrian Utrilla and Julien Vehent. It was **donated to the CNCF as a Sandbox project in 2023** and is now actively maintained by a new group of maintainers at **`getsops/sops`** (github.com/getsops/sops). The old `mozilla/sops` repo redirects there.

- **Latest release**: v3.13.1 (May 2026)
- **Stars**: 22.2k, Forks: 1k, Commits: 2,633
- **Documentation**: getsops.io
- **License**: Mozilla Public License v2.0
- **Go dependency**: `github.com/getsops/sops/v3`

**Yes, you should use it.** It is under active CNCF stewardship, the GitOps standard for secret management.

## How SOPS + Age Work Together (Envelope Encryption)

```
Plaintext File
      │
      ▼
[1] Generate random 256-bit Data Encryption Key (DEK)
      │
      ├──► [2] Encrypt FILE content with AES-256-GCM using DEK
      │
      └──► [3] Encrypt DEK with MASTER KEYS (Age, KMS, PGP…)
                   │
                   └──► Stored in file's `sops` metadata block
```

1. SOPS generates a unique 256-bit data key per file
2. File content is encrypted with AES-256-GCM using that data key
3. The data key is encrypted by **Age** (using X25519 + ChaCha20-Poly1305) and stored in the file's metadata

**Age** is by Filippo Valsotta (`FiloSottile/age`) — a modern replacement for PGP/GPG. Keys are single-line strings, trivial to store in password managers or CI secrets.

## Why SOPS + Age?

We use SOPS + Age as our primary secret encryption mechanism because it offers the ultimate combination of security, portability, and zero-cost/zero-card constraints:

- **Files in Git (DR-First)**: Secrets travel directly with the codebase in Git as `.env.enc`, enabling full versioning history and automatic mirroring to our 6 git hosts.
- **Diff-Friendly**: SOPS only encrypts the values, leaving the keys and comments in plaintext. This allows developers to easily diff environment variable additions and edits in pull requests without exposing the secret values.
- **Scale to Zero Cost**: Runs entirely locally or on CI runner nodes. There is no server to host, no database to maintain, and no billing limits to monitor.

---

## Why Age Keyring over Alternatives?

`sops` supports multiple backends. We strictly use **Age**:

- **Age vs. PGP (GnuPG)**: PGP is ancient with complex keyring management. Age is modern, designed by Filippo Valsotta specifically to replace PGP. Keys are single-line strings.
- **Age vs. Cloud KMS (AWS / GCP / Azure)**: Require accounts and credit cards on file, violating [no-card-on-file](../../rules/interaction/no-card-on-file.md). Age is completely offline.
- **Age vs. HashiCorp Vault / OpenBao**: Vault requires a running server with hosting costs. Age is a lightweight CLI binary with zero runtime footprint.

### Comparison Table

| Tool | Encrypts | Diffable | Infra Needed | GitOps Friendly |
|---|---|---|---|---|
| **SOPS + Age** | Values only | Yes | None | Excellent |
| Sealed Secrets | Whole k8s Secret | No | Cluster controller | K8s only |
| External Secrets | At runtime | N/A | Vault/KMS + controller | Yes, online only |
| git-crypt | Whole files | No | GPG keyring | Limited |
