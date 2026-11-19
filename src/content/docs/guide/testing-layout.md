---
title: Tests and layout
description: Running the tests, and how the repository is organised.
sidebar:
  order: 12
---

## Tests

```sh
node tests/run.ts
```

This runs each program in `examples/` on wasm32 and natively on this machine and compares the output (against the `// expect:` lines; lines written as `// stdin: line` are given as standard input), and checks object generation for arm64 macOS. Where AddressSanitizer or valgrind is available (AddressSanitizer and `leaks` on a Mac), it also runs with memory checking to confirm there is no use after free, out-of-bounds access, double free or leak. It also checks code that must fail to compile (`tests/errors/`) and code that must stop (`tests/panics/`). Thread tests (`tests/threads/`, native only) are also run under ThreadSanitizer to confirm there are no data races. `tests/metal/` runs on Metal on a Mac and is compared with the CPU results; elsewhere it only checks that it can be built for arm64.

- There is no option to run a single test. To check one, build and run that file and compare its output with the `// expect:` lines.
- wasm32 tests are skipped where there is no wasm32-capable clang (such as Xcode's clang on a Mac).

## Layout

```
src/lexer.ts     lexical analysis
src/parser.ts    parsing
src/checker.ts   type and borrow checking, kernel restrictions, constant evaluation
src/codegen.ts   LLVM IR (text) generation
src/msl.ts       kernel to MSL (Metal) translation
src/wgsl.ts      kernel to WGSL (WebGPU; experimental) translation
src/driver.ts    invoking clang
src/cli.ts       commands
runtime/         runtimes for native (native.c), Metal (metal.m) and wasm (wasm_rt.c and host.mjs, including running on WebGPU), and the standard functions (prelude.um)
assets/logo/     logo (SVG and PNG)
examples/        runnable samples (also tests)
tests/           test runner, and cases for errors, panics, threads, Metal, MSL and more
docs/            this guide
```

The project's own security policy is in [SECURITY.md](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/SECURITY.md).
