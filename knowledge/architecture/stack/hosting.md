---
type: architecture
title: "Hosting Minimalist & Modern Stack"
description: "The absolute best, most minimalist, and fastest hosting solutions for static frontend applications, edge workers, and containerized microservices."
tags:
  - hosting
  - deployment
  - edge
  - serverless
  - containers
  - microservices
  - stack
  - architecture
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# Hosting Minimalist & Modern Stack

The definitive hosting and deployment stack, optimized for edge-first speed, simple container management, predictable costs, and generous free tiers.

- **Static/Edge Frontend & Serverless:** [Cloudflare Pages & Workers](https://developers.cloudflare.com/)
  - *Chosen over Vercel / Netlify:* Vercel and Netlify have strict bandwidth limits (typically 100 GB/month) on their free tiers and can charge high, unpredictable rates once exceeded. They also restrict build times and request execution. Cloudflare Pages & Workers provide a safer, more performant, and cheaper alternative:
    - **Unlimited Bandwidth & Builds:** Cloudflare Pages offers unlimited bandwidth and unlimited monthly build minutes on the free tier.
    - **Edge Scalability:** Workers run on Cloudflare's global network with zero cold-starts, compared to traditional serverless functions that spin up on demand.
    - **Fail Safe / No Bill Shocks:** The free tier disables/throttles requests instead of charging credit card overages, eliminating billing surprises.
  - *Free Tier Capabilities:*
    - **Cloudflare Pages:** Unlimited bandwidth, unlimited projects, and unlimited build times.
    - **Cloudflare Workers:** 100,000 requests per day across your account with up to 10ms of CPU time per request.
    - No credit card required.

- **Containers / Microservices (Option A - Edge Containers):** [Fly.io](https://fly.io/)
  - *Chosen over AWS / GCP:* Fly.io is optimized for developers who want to run containerized full-stack applications or microservices close to users, without the overhead of Kubernetes, AWS ECS/Fargate, or Google Cloud Run. AWS and GCP have highly complex billing matrices, higher baseline costs, and massive infrastructure boilerplate.
    - **Micro-VMs Close to Users:** Automatically package and run Docker containers as Firecracker micro-VMs in regions worldwide.
    - **Automatic Scaling & Scale-to-Zero:** Extremely low startup latency allows running services close to users.
    - **Low Boilerplate:** Standard `fly.toml` configuration makes it much simpler than complex cloud consoles.
  - *Free Tier / Hobby Credit:*
    - Up to $5/month of free credit (automatically covers up to 3 shared-cpu-1x micro-VMs with 256MB RAM).
    - 3 GB of persistent volume storage.
    - 160 GB of outbound data transfer per month.

- **Containers / Microservices (Option B - Managed PaaS):** [Render](https://render.com/)
  - *Chosen over AWS / GCP:* Render offers a fully managed platform-as-a-service (PaaS) experience, handling TLS, load balancers, and environment variables out of the box with zero boilerplate, unlike AWS or GCP which require complex IAM, VPC, and load balancer configurations.
    - *Comparison with Fly.io:* Render is ideal for standard web applications that don't need complex multi-region deployments, offering simple flat-rate predictable pricing tiers and managed databases.
    - *Trade-off (Cold Starts):* The free tier of Render Web Services will spin down due to inactivity and suffer from a cold start (up to 50 seconds delay) on the first request after being idle.
  - *Free Tier Capabilities:*
    - Free web services (suspended after 15 minutes of inactivity).
    - 500 build minutes per month.
    - 100 GB of egress bandwidth per month.
    - Managed databases (PostgreSQL/Redis) with free tiers (note: PostgreSQL databases expire after 30 days on the free tier).
