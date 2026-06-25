---
type: architecture
title: "C++ Minimalist & Modern Stack"
description: "The absolute best, most minimalist, and fastest stack, frameworks, libraries, and dev tools for C++."
tags: [cpp, stack, frameworks, libraries, tooling]
timestamp: 2026-06-24
format_version: okf-v0.1
status: active
---

# C++ Modern Stack

- **Runtime Environment:** C++20
  - *Chosen over C++17 or C++14* to leverage revolutionary language improvements: Concepts (for compile-time template constraints), Coroutines (for asynchronous code), Ranges (for functional style algorithms), Modules, and `std::format`.
- **Package Manager:** [vcpkg](https://github.com/microsoft/vcpkg)
  - *Chosen over Conan* because vcpkg integrates natively and seamlessly with CMake using simple toolchain parameters. It relies on a straightforward declarative manifest file (`vcpkg.json`) rather than complex Python build scripts.
- **Build System:** [CMake](https://cmake.org/) + [Ninja](https://ninja-build.org/)
  - *Chosen over Make / Autotools* because CMake is the undisputed cross-platform standard for C++ build configuration.
  - *Ninja is chosen as the build runner* over GNU Make because Ninja compiles code with maximum CPU utilization, features extremely fast incremental builds, and uses a lightweight build file syntax optimized for generator output.
- **Formatter & Linter:** [clang-format](https://clang.llvm.org/docs/ClangFormat.html) & [clang-tidy](https://clang.llvm.org/extra/clang-tidy/)
  - *Chosen over proprietary or ad-hoc solutions* because they are standard LLVM tools, heavily integrated into modern IDEs, and provide extensive config options for formatting and deep static analysis (safeguarding against memory leaks, undefined behavior, and unmodernised code).
- **Test Runner:** [Catch2](https://github.com/catchorg/Catch2)
  - *Chosen over Google Test (GTest)* because Catch2 features a modern, clean C++ design with an expressive assertion syntax (decomposing standard C++ operators automatically, e.g., `REQUIRE(a == b)`), reducing the need for verbose assertion macros.
- **Web/Application Framework:** [Drogon](https://github.com/drogonframework/drogon)
  - *Chosen over Crow* because Drogon is an asynchronous, non-blocking HTTP framework built on epoll (Linux) and kqueue (macOS/BSD). It ranks at the top of TechEmpower web performance benchmarks and provides built-in database connection pooling and coroutine support, whereas Crow uses a synchronous model that degrades under high-concurrency workloads.
