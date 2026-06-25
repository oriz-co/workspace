---
type: architecture
title: "C# Minimalist & Modern Stack"
description: "The absolute best, most minimalist, and fastest stack, frameworks, libraries, and dev tools for C#."
tags: [csharp, dotnet, stack, frameworks, libraries, tooling]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# C# Modern Stack

- **Runtime Environment:** .NET 8 (LTS)
  - *Chosen over older versions (such as .NET 6/7 or .NET Framework)* for massive JIT compiler optimizations, support for Native AOT (Ahead-of-Time) compilation, and language ergonomics like primary constructors and collection expressions.
- **Build Tool & Package Manager:** dotnet CLI / NuGet
  - *Chosen over MSBuild XML or external runners* because it is the unified cross-platform toolchain built directly into the SDK, offering fast, native, and clean build/restore capabilities.
- **Formatter & Linter:** dotnet format & Roslyn Analyzers
  - *Chosen over StyleCop or ReSharper Command Line Tools* because they run natively inside the .NET SDK compiler pipeline, requiring zero extra dependencies while enforcing style, quality, and compiler-level correctness rules.
- **Test Runner:** [xUnit](https://xunit.net/)
  - *Chosen over NUnit and MSTest* because xUnit enforces strict test isolation by instantiating a new class instance for every single test, eliminating shared-state pollution. It also leverages standard C# patterns (constructors and `IDisposable`) rather than relying on custom lifecycle attributes.
- **Web Framework:** ASP.NET Core Minimal APIs
  - *Chosen over traditional Controllers / MVC* because Minimal APIs map endpoints directly to lambdas with negligible boilerplate, resulting in significantly lower memory allocation, faster routing, and higher HTTP request throughput.
- **Database Client:** [Dapper](https://github.com/DapperLib/Dapper)
  - *Chosen over Entity Framework Core* because Dapper is a high-performance micro-ORM that operates as a thin wrapper over ADO.NET, providing raw SQL speed and zero-allocation object mapping without the performance tax of change tracking, complex migration pipelines, and magic SQL generation.
