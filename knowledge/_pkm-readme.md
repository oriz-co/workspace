# Vault — PKM + OKF + Code Knowledge

This is `c:\D\oriz\knowledge\` opened as an Obsidian vault. Mixed-purpose:

| Tree | Purpose |
|---|---|
| `decisions/` | OKF architecture + product decisions (300+ files) |
| `rules/` | Non-negotiable invariants (71 files) |
| `runbooks/` | Step-by-step ops procedures (49 files) |
| `services/` | Per-service entries — free-tier, swap-cost, role (171 files) |
| `glossary/` | Term definitions (27 entries) |
| `log/` | Decision audit trail by date |
| `concepts/` | Concept files (OKF/Headroom/etc.) |
| `playbooks/` | Multi-step procedures across runbooks |
| `personal/` | **PKM** — journal, daily, uses, now, resume, projects |
| `inbox/` | New-note dropzone (Obsidian default) |
| `archive/` | Old/superseded personal notes (knowledge-deletion-not-supersession applies to OKF only) |

## Obsidian setup

1. Open Obsidian → "Open folder as vault" → select `c:\D\oriz\knowledge\`
2. Enable community plugins
3. Install: **Terminal**, **Templater**, **Dataview**
4. Templates → `personal/_templates/` (created on first new-note)

## Conventions

- OKF files use the OKF v0.1 frontmatter (`type`, `title`, `description`, `tags`, `timestamp`, `format_version`, `status`)
- Personal files use simpler frontmatter: `title`, `created`, `tags`
- Cross-links: relative `[text](path.md)` for explicit links; `[[wiki]]` for Obsidian-style backlinks
- Daily notes: `personal/daily/YYYY-MM-DD.md`
- Journal: `personal/journal/YYYY-MM-DD-topic.md`

## Privacy

Per Q5 lock (2026-06-26): vault is in `oriz-org/workspace` PUBLIC repo. **Discipline-only**:
- NO passwords, API keys, credentials
- NO sensitive personal info (health, finances, relationships)
- NO unredacted third-party PII
- If a note becomes sensitive → move to `archive/` + `git rm` from public repo

## Linked apps

- Claude Code: this vault is the knowledge base. `~/.claude/settings.json` configured for Hr→hai chain
- kepano/obsidian-skills installed globally at `~/.claude/skills/obsidian-vault/`
