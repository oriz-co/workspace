---
type: runbook
title: Manage a private organization repository mirroring public upstream releases
description: How to clone a public Chrome extension to a private organization repository
  and merge upstream updates smoothly with minimal conflicts.
tags:
- runbook
- github
- git
- upstream-sync
- private-repo
- chrome-extension
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
related:
- runbooks/operations/add-new-extension
- services/compute/github-actions
---



# Manage a private organization repository mirroring public upstream releases

This runbook guides you on how to host a private copy of an open-source (MIT licensed) Chrome extension inside your GitHub Organization, and how to pull and merge upstream updates easily when new versions of the extension are released.

---

## 1. GitHub Organization Privacy Rules

* **Visibility Options:** GitHub Organizations support **Public**, **Private**, and **Internal** (Enterprise-only) repositories.
* **No Compulsion:** There is no forced requirement that your organization repositories must be public or private. You can mix and match both.
* **Member Constraints:** Organization owners can configure member permissions under **Organization Settings -> Repository creation** to restrict members from creating public repositories (to prevent accidental data leaks) or private repositories.

---

## 2. GitHub Actions Minute Quotas

Before using GitHub Actions on private repositories, understand the billing limits:
* **Quota Pool is Combined:** The 2,000 free monthly minutes (on the GitHub Free plan) is a **combined pool shared across all private repositories** in the organization, not an individual 2,000-minute quota per repository.
* **No Sharing with Personal Accounts:** Organizations and personal accounts have completely separate billing and quotas. Minutes are not shared, pooled, or transferable.
* **Public Repositories:** Any public repository in your organization enjoys **unlimited and free** GitHub-hosted runner minutes.

---

## 3. Initial Setup: Importing to a Private Org Repo

Since GitHub does not natively support creating a "private fork" of a public repository directly via the UI (forking a public repo creates a public fork), you must manually duplicate the repository.

### Step-by-step duplicate:

1. **Create the target repository:**
   Go to your GitHub Organization (`https://github.com/organizations/<your-org>/repositories/new`) and create a new empty repository. 
   * Set the visibility to **Private**.
   * Do **not** initialize it with a README, `.gitignore`, or license.

2. **Clone the public upstream repository as a bare repository:**
   ```bash
   git clone --bare https://github.com/upstream-author/chrome-extension.git temp-bare-repo
   cd temp-bare-repo
   ```

3. **Mirror-push the bare repository to your new private organization repo:**
   ```bash
   git push --mirror https://github.com/<your-org>/<your-private-repo>.git
   ```

4. **Clean up the local bare repository:**
   ```bash
   cd ..
   rm -rf temp-bare-repo
   ```

5. **Clone your private repository for active development:**
   ```bash
   git clone https://github.com/<your-org>/<your-private-repo>.git
   cd <your-private-repo>
   ```

6. **Add the upstream remote pointing to the original public repository:**
   ```bash
   git remote add upstream https://github.com/upstream-author/chrome-extension.git
   # Disable pushing to upstream to prevent accidental upstream pushes
   git remote set-url --push upstream DISABLE
   ```

---

## 4. Keeping Code Synced and Merging Upstream Releases

When a new release or update comes out from the upstream author, follow this workflow to merge changes easily.

### The Branching Strategy

To make merging as easy and conflict-free as possible, maintain at least two branches:
1. `upstream-sync`: A clean branch that tracks the upstream repository exactly, with **no custom modifications**.
2. `main` (or `custom`): Your active branch containing your organization's custom logic and modifications.

### Step-by-Step Merge Workflow:

1. **Fetch the upstream releases and branches:**
   ```bash
   git fetch upstream
   ```

2. **Update your local clean tracking branch:**
   ```bash
   git checkout upstream-sync
   git merge upstream/main
   ```

3. **Prepare a merge branch from your main custom branch:**
   ```bash
   git checkout main
   git checkout -b merge-upstream-updates
   ```

4. **Merge upstream-sync into the merge branch:**
   ```bash
   git merge upstream-sync
   ```

5. **Resolve Conflicts:**
   * If there are merge conflicts, Git will mark the affected files.
   * Open the files, resolve the conflicts (keeping your custom modifications aligned with the upstream changes), and stage them:
     ```bash
     git add <conflict-file>
     ```
   * Complete the merge commit:
     ```bash
     git commit -m "merge: sync upstream releases into custom fork"
     ```

6. **Verify and Deploy:**
   * Run your extension build scripts, test in Chrome Developer Mode to ensure nothing is broken.
   * If working correctly, merge the temporary branch back to `main`:
     ```bash
     git checkout main
     git merge merge-upstream-updates
     git push origin main
     git branch -d merge-upstream-updates
     ```

---

## 5. Architectural Best Practices for Customizing Code

To avoid painful, manual conflict resolution during upstream merges in the future, follow these architectural principles:

1. **Isolate Custom Code:** Avoid modifying the original core logic files of the extension if possible. Instead, create new files (e.g., `custom-logger.js`, `org-logic.js`) and inject or import them.
2. **Utilize Configuration/Environment Files:** Use config files (`config.json` or `.env` files) to override default behaviors rather than hardcoding differences in the original files.
3. **Use Event Listeners or Hooks:** If the extension has modular code, register event listeners or hooks rather than intercepting function calls inline.
4. **Merge Frequently:** Fetch and merge from `upstream` regularly. Small, frequent merges are significantly easier to resolve than one giant merge after a year of development.
