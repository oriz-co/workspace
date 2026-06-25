---
type: rule
title: Playwright Persistent Browser Context Rules
description: Constraints and instructions for running browser automation with persistent authentication, handling cookie encryption, and preventing memory leaks in long loops.
tags:
- rule
- automation
- playwright
- testing
- development
timestamp: '2026-06-24'
format_version: okf-v0.1
status: active
related:
- architecture/stack/automation
---

# Playwright Persistent Browser Context Rules

To build stable, secure, and long-running browser automation (such as agent testing and voting systems) that runs for hours on local dev servers or cloud workers without losing authentication states, follow these constraints.

---

## 1. Browser Choice: Chrome vs. Microsoft Edge
*   **Engine Congruence:** Both Google Chrome (`channel: 'chrome'`) and Microsoft Edge (`channel: 'msedge'`) are Chromium-based. Playwright controls them identically via the Chrome DevTools Protocol (CDP).
*   **Branded vs. Open-Source:** 
    *   **Recommendation:** Use the default open-source **Chromium** (`channel` omitted or set to `'chromium'`) for remote cloud workers and headless loops. It is lighter, compiles faster, and is optimized for headless CI runners.
    *   Use branded `'chrome'` or `'msedge'` only if you need proprietary browser features (like Microsoft Workspaces, specific extension stores, or Microsoft Rewards automation).
*   **App-Bound Encryption (Chrome 127+):** Chrome on Windows binds cookie encryption to the Chrome application identity. While Playwright can still read cookies when launching Chrome directly, external scripts cannot parse the `Cookies` SQLite file from disk.

---

## 2. Cookie Portability & Profile Encryption Limits

> [!WARNING]
> **Do not copy raw `userDataDir` folders across different operating systems or user accounts.**
> Chromium encrypts cookies, local storage, and credentials using host OS APIs (DPAPI on Windows, Keychain on macOS, Gnome Keyring/KWallet on Linux). If you copy a local Windows profile to a Linux GitHub Actions runner, the runner cannot decrypt the database. The browser will treat cookies as corrupted and wipe them, causing authentication failures.

### The Storage State Solution
To persist logins across environments, use Playwright's native **Storage State** format instead of raw directory copying:

1.  **Generate State Locally:** Run a local/headed script once to perform authentication or let the user sign in manually.
2.  **Export Decrypted State:** Export cookies and `localStorage` to a plain JSON file:
    ```javascript
    await context.storageState({ path: 'state.json' });
    ```
3.  **Deploy State to Worker:** Send the `state.json` file (or store its text content in a secure environment variable/GitHub Secret) to the remote/cloud worker.
4.  **Inject State on Launch:** Launch the remote context by loading the JSON file. This bypasses OS-level encryption entirely and works cross-platform:
    ```javascript
    const context = await browser.newContext({ storageState: 'state.json' });
    ```

---

## 3. Persistent Directory Locking Errors
*   **Dedicated Folders:** When using `launchPersistentContext(userDataDir, ...)` for local development, always specify a dedicated, clean folder (e.g. `tmp/automation-profile`) instead of your daily-driver Chrome or Edge profile.
*   **Single-Instance Constraint:** Chromium allows only one process to access a profile directory at a time. If your personal browser or another script is using that folder, Playwright will hang on `about:blank` or crash with directory lock errors.
*   **Cleanup on Exit:** Always wrap script execution in `try...finally` blocks to guarantee `context.close()` and `browser.close()` are called, releasing directory locks.

---

## 4. Stability Rules for Long-Running Loops ("Hours and Hours")
If a script runs an automation loop for hours, it will crash due to memory leaks and resource depletion unless these rules are followed:

*   **Context Isolation:** Do not keep a single tab or browser context open indefinitely. Create a new `BrowserContext` and `Page` for each logical unit of work (or every $N$ iterations), and close them immediately when done.
*   **Process Recycling:** Completely close and re-launch the `browser` process periodically (e.g., every 1 hour or every 100 iterations) to reclaim memory from internal browser caches.
*   **Docker & Cloud VM Optimization:**
    *   Pass the `--disable-dev-shm-usage` flag in launch arguments. This forces the browser to use disk storage instead of `/dev/shm` (shared memory), avoiding out-of-memory crashes in Docker containers.
    *   Increase the Node.js memory limit if handling large pages: `node --max-old-space-size=4096 script.js`.
*   **Session Refresh Loop Prevention:** Implement detection for login expiration (e.g. detecting a redirect to `/login` or the absence of a session indicator element). If expired, the script must exit or trigger a refresh routine instead of looping endlessly and spamming the target server.
