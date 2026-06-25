---
type: architecture
title: "Databases Minimalist & Modern Stack"
description: "The absolute best, most minimalist, and fastest database stack, including serverless SQL, edge-native SQL, key-value, and object storage."
tags:
  - database
  - sql
  - nosql
  - storage
  - serverless
  - edge
  - stack
  - architecture
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# Databases Minimalist & Modern Stack

The definitive database stack, optimized for serverless architecture, edge computing, zero maintenance, minimal latency, and generous free tiers.

- **SQL (Serverless):** [Neon Postgres](https://neon.tech/)
  - *Chosen over AWS RDS / Google Cloud SQL:* RDS and Cloud SQL require provisioned, continuously running database instances, leading to high baseline costs even for idle or development environments, complex network configuration (VPCs, private IPs), and slow snapshot/restoration workflows. Neon offers modern serverless features:
    - **Instant Branching:** Create database copies in seconds (via copy-on-write storage), enabling isolated schema migrations and preview deployments.
    - **Scale-to-Zero Compute:** Automatically suspends compute instances when idle, preventing unwanted charges.
    - **Serverless WebSocket Driver:** Connects directly from serverless edge environments (like Cloudflare Workers) over WebSockets without connection pooling bottlenecks.
  - *Free Tier Capabilities:*
    - 0.5 GiB of storage.
    - Auto-suspend compute (suspends after 5 minutes of inactivity).
    - Free database branching (up to 10 branches per project).
    - No credit card required.

- **SQL (Edge/Distributed):** [Turso](https://turso.tech/) (libSQL/SQLite)
  - *Chosen over Standard SQLite:* Standard SQLite is limited to a single local filesystem, making it impossible to query across multiple edge locations or use in serverless environments where local disks are ephemeral.
  - *Chosen over Traditional Postgres:* Traditional central databases suffer from high round-trip network latency (often 100ms+) when queried from edge locations far from the primary data center.
  - *Turso's benefits:*
    - **Embedded Replicas:** Syncs database replicas to edge nodes close to the user, providing sub-100ms global read speeds (queries are executed against local memory).
    - **libSQL Engine:** Built on libSQL (an open-contribution fork of SQLite) adding support for replication, remote connections, and vector search.
  - *Free Tier Capabilities:*
    - 9 GB storage.
    - 500 databases.
    - 1 billion read requests per month.
    - No credit card required.

- **NoSQL / Key-Value:** [Upstash Redis](https://upstash.com/) (Serverless KV)
  - *Chosen over Redis Labs / AWS ElastiCache:* Traditional Redis deployments require setting up dedicated clusters, sizing VM instances, and managing scaling/failover. They do not scale to zero cost and charge flat hourly rates. Upstash Redis is built for serverless:
    - **REST API Edge Access:** Provides a HTTP/REST API that allows querying Redis directly from edge platforms (like Cloudflare Workers) where standard TCP protocols are restricted.
    - **Scale-to-Zero Cost:** Charged purely on a per-request basis with zero idle compute cost.
  - *Free Tier Capabilities:*
    - 10,000 requests/day.
    - Max 256 MB storage (or up to 10 databases).
    - No credit card required.

- **Object Storage:** [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3-Compatible)
  - *Chosen over AWS S3:* AWS S3 charges heavy data egress fees (bandwidth charges for downloading files to the internet), which makes data retrieval costs unpredictable and expensive. S3 also charges for API requests with no free allowance after the initial 12-month AWS Free Tier.
  - *Cloudflare R2's benefits:*
    - **Zero Egress Fees:** Completely eliminates bandwidth egress charges, allowing free data transfer to the internet.
    - **S3 Compatibility:** Full S3 API compatibility makes it a drop-in replacement for existing AWS S3 libraries and clients.
  - *Free Tier Capabilities:*
    - 10 GB storage per month.
    - 1 million Class A operations per month (e.g., PUT, POST, LIST).
    - 10 million Class B operations per month (e.g., GET, HEAD).
