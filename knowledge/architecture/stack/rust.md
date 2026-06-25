---
type: architecture
title: "Rust Minimalist & Modern Stack"
description: "The absolute best, most minimalist, and fastest stack, frameworks, libraries, and dev tools for Rust."
tags: [rust, stack, frameworks, libraries, tooling]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# Rust Modern Stack

- **Runtime Environment:** Rust Edition 2021
  - *Chosen over older editions (like 2018)* for modern language features, including disjoint capture in closures, panic macro changes, cargo feature resolver v2, and an updated prelude.
- **Package Manager:** [cargo](https://doc.rust-lang.org/cargo/)
  - *Chosen over external tools* as it is the official, zero-config, highly-optimized compiler driver, package manager, and dependency orchestrator for the Rust language.
- **Linter & Formatter:** [clippy](https://github.com/rust-lang/rust-clippy) & [rustfmt](https://github.com/rust-lang/rustfmt)
  - *Chosen over manual style guides or third-party formatters* because they are officially maintained, run out-of-the-box, compile directly with the language, and catch over 700 types of common code smells and performance bugs.
- **Test Runner:** [cargo-nextest](https://nexte.st/)
  - *Chosen over standard `cargo test`* because it executes tests using a process-per-test model, eliminating execution bottlenecks by scheduling tests across all available CPU cores, providing up to 3x faster execution, strict test isolation (so aborts/segmentation faults in one test don't fail the entire run), and robust retry-on-failure configuration.
- **Web Framework:** [Axum](https://github.com/tokio-rs/axum)
  - *Chosen over Actix-web and Rocket* because of its native, seamless integration with `tokio` and the `tower` middleware ecosystem. It uses standard async functions and type-safe extractors rather than Actix-web's specialized/actor-based runtimes or Rocket's heavy macros and slower compilation times.
- **Asynchronous Runtime:** [tokio](https://tokio.rs/)
  - *Chosen over async-std or smol* because it is the industry-standard runtime, battle-tested at scale, with an extensive ecosystem, highly-optimized I/O loop, and native integration with Axum and SQLx.
- **Serialization/Deserialization:** [serde](https://serde.rs/)
  - *Chosen over custom parsing* because it provides zero-copy compile-time serialization and deserialization, supporting JSON, YAML, TOML, and binary formats with zero runtime overhead.
- **Database Client:** [SQLx](https://github.com/launchbadge/sqlx)
  - *Chosen over Diesel* because it is a SQL-first, compile-time checked SQL toolkit that runs natively async. It allows developers to write raw SQL while macros verify query correctness against a database at compile time, avoiding the heavy compile-time type-generation and block-on-thread model of Diesel.
