---
type: architecture
title: "Java Minimalist & Modern Stack"
description: "The absolute best, most minimalist, and fastest stack, frameworks, libraries, and dev tools for Java."
tags: [java, stack, frameworks, libraries, tooling]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# Java Modern Stack

- **Runtime Environment:** JDK 21 (LTS)
  - *Chosen over older versions (such as JDK 17 or 11)* to leverage Virtual Threads (Project Loom) for high-performance concurrent request handling, along with pattern matching for switch, record patterns, and sequenced collections.
- **Build Tool & Package Manager:** [Gradle](https://gradle.org/) with Kotlin DSL
  - *Chosen over Maven* due to Gradle's superior build speed (using incremental compilation, build cache, and daemon), and the type-safety, auto-completion, and readability of writing build scripts in Kotlin rather than verbose, rigid Maven XML.
- **Linter & Formatter:** [Spotless](https://github.com/diffplug/spotless) with [google-java-format](https://github.com/google/google-java-format)
  - *Chosen over Checkstyle / PMD* because Spotless actively formats code automatically at compile or commit time using Google's official style guide, rather than just raising static analysis warnings that require manual developer intervention.
- **Test Runner:** [JUnit 5](https://junit.org/junit5/)
  - *Chosen over JUnit 4 or TestNG* because of its modular Jupiter platform architecture, rich extensibility, nested test suites, parameterised testing, and native support for modern Java language features and parallel execution.
- **Web/Application Framework:** [Spring Boot](https://spring.io/projects/spring-boot) or [Quarkus](https://quarkus.io/)
  - *Spring Boot is recommended for standard enterprise apps* due to its unmatched ecosystem size, mature security frameworks, and deep library support.
  - *Quarkus is recommended for cloud-native/minimal microservices* due to its compile-to-native GraalVM support, sub-second startup times, and tiny memory footprint.
- **Boilerplate Reduction:** [Lombok](https://projectlombok.org/)
  - *Chosen over manual boilerplate writing* because it uses annotations to generate getters, setters, equals/hashCode, toString, and builder patterns at compile time, improving readability and reducing code size.
- **Database Client:** [jOOQ](https://www.jooq.org/)
  - *Chosen over Hibernate / JPA* because jOOQ is a SQL-centric, type-safe query builder that generates Java classes directly from database schemas. It gives developers full control over SQL syntax and query optimization while avoiding the runtime magic, N+1 query traps, and cache synchronization problems of full ORMs.
