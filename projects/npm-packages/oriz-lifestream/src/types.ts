/**
 * JSONL line schemas — every event written to the oriz-me canonical store
 * MUST validate against one of these. Schemas are intentionally minimal:
 * shapes documented in `knowledge/decisions/architecture/lifestream-auto-event-sources.md`
 * (the locked decision file).
 *
 * Validation policy: every pipeline calls the matching schema's `parse()`
 * before invoking `appendJsonl()`. Failed validation = pipeline error =
 * Hookdeck/healthchecks alert; line is NEVER written half-validated.
 *
 * Schema versions are implicit (v1) — bump by adding a discriminator field
 * if/when the shape ever changes.
 */

import { z } from 'zod'

/** ISO 8601 UTC timestamp with `Z` suffix, e.g. `2026-06-20T11:42:13Z`. */
const isoUtc = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/, {
    message: 'ts must be ISO 8601 UTC with Z suffix',
  })

/** YYYY-MM-DD calendar date, IST-anchored upstream. */
const yyyymmdd = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })

/**
 * Source 1 — GitHub webhook event. Per-event grain. Idempotency keys vary by
 * subkind: `(repo, sha)` for push, `(repo, pr_number)` for pull_request,
 * `(repo, tag)` for release, `(repo, run_id)` for workflow_run.
 */
export const GitEventSchema = z.object({
  ts: isoUtc,
  kind: z.literal('git'),
  repo: z.string().min(1),
  /** Subkind — which webhook event produced this line. */
  event: z.enum(['push', 'pull_request', 'release', 'workflow_run']),
  /** Commit SHA for push events; empty for non-commit subkinds. */
  sha: z.string().optional(),
  /** PR number for pull_request events. */
  pr_number: z.number().int().optional(),
  /** Release tag for release events. */
  tag: z.string().optional(),
  /** workflow_run id for workflow_run events. */
  run_id: z.number().int().optional(),
  /** workflow_run conclusion (success/failure). */
  conclusion: z.enum(['success', 'failure']).optional(),
  message: z.string(),
  author: z.string(),
  url: z.string().url(),
})

export type GitEvent = z.infer<typeof GitEventSchema>

/** Source 2 — Wakatime daily summary. Per-day grain. Idempotent on `date`. */
export const CodingEventSchema = z.object({
  ts: isoUtc,
  kind: z.literal('coding'),
  date: yyyymmdd,
  total_seconds: z.number().nonnegative(),
  languages: z.array(
    z.object({
      name: z.string(),
      seconds: z.number().nonnegative(),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      seconds: z.number().nonnegative(),
    }),
  ),
})

export type CodingEvent = z.infer<typeof CodingEventSchema>

/**
 * Source 3 — Cloudflare Web Analytics daily summary. Per-day per-site grain.
 * Idempotent on `(date, site)`. Eleven sites × 1 line/day = 11 events/day.
 */
export const VisitorsEventSchema = z.object({
  ts: isoUtc,
  kind: z.literal('visitors'),
  date: yyyymmdd,
  site: z.string().min(1),
  pageviews: z.number().int().nonnegative(),
  unique: z.number().int().nonnegative(),
  top_paths: z.array(
    z.object({
      path: z.string(),
      pv: z.number().int().nonnegative(),
    }),
  ),
})

export type VisitorsEvent = z.infer<typeof VisitorsEventSchema>

/** Discriminated union over every accepted JSONL line shape. */
export const LifestreamEventSchema = z.discriminatedUnion('kind', [
  GitEventSchema,
  CodingEventSchema,
  VisitorsEventSchema,
])

export type LifestreamEvent = z.infer<typeof LifestreamEventSchema>
