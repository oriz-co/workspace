---
type: decision
title: Alternative free-forever backup channels for GitHub code and metadata
description: Documents alternative free-forever backup channels to protect GitHub
  repositories and their metadata (issues, PRs, wikis, releases) using Cloudflare
  R2, Backblaze B2, Hugging Face Datasets (with caveats), and the native GitHub Migration
  API. Integrated into our overall disaster recovery options.
tags:
- decision
- backup
- disaster-recovery
- metadata
- cloudflare-r2
- backblaze-b2
- huggingface
- github-migration
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- decisions/architecture/ops/mirror-to-6-git-hosts
- decisions/architecture/ops/backup-everywhere-weekly
- rules/interaction/no-card-on-file
- rules/infrastructure/free-tier-with-cost-controls
---



# Alternative free-forever backup channels

## Context

Our primary backup strategy is the 6-host active git mirror (using GitHub Actions to push code). However, git mirroring only copies the source code and git history. It does NOT backup repository metadata:
- Issues and comments
- Pull request conversations and code reviews
- Wiki pages (though these are git repos, they require separate cloning)
- Release binaries and attachments
- Milestones, labels, projects, and repository settings

This decision documents alternative, free-forever, automated methods to back up both repositories and their associated metadata.

---

## 1. Native GitHub Migration API (Full Export)

GitHub offers a native migration API that generates a single, downloadable `.tar.gz` archive containing the entire repository structure and metadata.

### Capabilities
- **Included**: Repository source code, wiki, issues, pull requests, releases (including attachments), milestones, labels, projects, and settings.
- **Cost**: Completely free forever (native GitHub platform capability).

### Automated Flow (GH Actions + Target Storage)
1. **Trigger**: A weekly GitHub Actions cron runs a script to start the migration:
   ```bash
   # Start migration for repository or organization
   curl -X POST -H "Authorization: token $GH_PAT" \
     -H "Accept: application/vnd.github+json" \
     "https://api.github.com/orgs/oriz-org/migrations" \
     -d '{"repositories":["workspace"],"exclude_attachments":false}'
   ```
2. **Poll**: The workflow sleeps/polls the status endpoint until the migration state becomes `exported`.
3. **Download**: Downloads the archive using the returned download URL:
   ```bash
   curl -H "Authorization: token $GH_PAT" \
     -o backup.tar.gz \
     "https://api.github.com/orgs/oriz-org/migrations/$MIGRATION_ID/archive"
   ```
4. **Push to Storage**: Stream/copy the archive to one of the free-forever storage layers below.

---

## 2. Cloudflare R2 (10 GB S3-Compatible Free Storage) — **PREFERRED**

Cloudflare R2 provides a free-tier object storage bucket with zero egress fees, making it the perfect remote archive repository for backup bundles.

### Limits
- **Storage**: **10 GB** free forever per account.
- **Egress**: **$0** (completely free data transfer out).
- **Operations**: 1,000,000 Class A (write) and 10,000,000 Class B (read) operations per month.

### Automation via AWS CLI
Since R2 is S3-compatible, the pre-installed `aws` CLI on GitHub runners can copy backups directly:
```yaml
- name: Upload to Cloudflare R2
  run: |
    aws s3 cp backup.tar.gz s3://oriz-backups/github-backup-$(date +%F).tar.gz \
      --endpoint-url ${{ secrets.R2_ENDPOINT }}
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.R2_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.R2_SECRET_ACCESS_KEY }}
    AWS_DEFAULT_REGION: auto
```

---

## 3. Backblaze B2 (10 GB Free Storage) — **SECONDARY**

Backblaze B2 is an alternative object storage option offering a free-forever tier without requiring a credit card.

### Limits
- **Storage**: **10 GB** free forever.
- **Egress**: 1 GB/day free download.

### Automation via Rclone or B2 CLI
You can use `rclone` (pre-installed on runner or run-time script) to sync backups:
```bash
rclone copy backup.tar.gz b2:oriz-backups-bucket/ -v
```

---

## 4. Hugging Face Datasets — **AVOID for generic file backup**

**⚠️ CAVEAT 2026-06-24**: Hugging Face's "free unlimited" hosting is intended for **public ML datasets and model weights**. Using HF Datasets as a generic file backup target for tarballs / metadata archives:

- Soft-violates HF's intended use (their ToS reserves the right to remove non-ML content)
- Private datasets DO count toward an account's soft storage budget
- Risk of account suspension / data loss if HF tightens enforcement

**Use R2 or B2 instead for backup tarballs.** Only use HF Datasets for things that are genuinely ML-related (e.g. the `oriz-ai-providers-data` repo, or training datasets if those ever exist).

---

## 5. Open-Source Metadata Backup Tools (CLI)

For custom metadata extraction (saving issues/PRs as readable JSON rather than binary tarballs), the following CLI tools can be executed inside GitHub Actions:

1. **`github-backup` (Python)**:
   - Command: `github-backup --token $GH_PAT --output-directory ./backup --all --private-embed-key oriz-org`
   - Backs up repositories, wikis, issues, pull requests, milestones, labels, and releases.
2. **`gitbackup` (Go)**:
   - Excellent for multi-platform clones.
3. **`rclone` (Go)**:
   - For syncing local folders of downloaded metadata files to GDrive/OneDrive free tiers.

---

## Recommendation

**Default channel**: Native GitHub Migration API → Cloudflare R2 weekly. R2's zero egress + 10 GB free + S3-compatible CLI makes it the cleanest path. Use B2 as a secondary mirror only if you've outgrown R2's 10 GB.

**Skip HF Datasets** for this purpose — not designed for it, real ToS risk.

## Cross-refs

- weekly everywhere plan → [[decisions/architecture/backup-everywhere-weekly]]
- 6-host mirror → [[decisions/architecture/mirror-to-6-git-hosts]]
- No card on file rule → [[rules/no-card-on-file]]
