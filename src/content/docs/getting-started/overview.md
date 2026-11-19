---
title: Overview
description: What UnifiedMozaic is and what it offers.
sidebar:
  order: 1
---

UnifiedMozaic is a small, statically typed language with TypeScript-like syntax. It compiles through LLVM to native executables and WebAssembly, with no garbage collector, and lets you write CPU and GPU code in the same `.um` source.

:::caution[Status: experimental]
The language and its runtime are developed by one person and change often.
:::

## Features

- **TypeScript-like syntax, explicit types.** Sized numeric types (`i8`–`i64`, `u8`–`u64`, `f16`/`f32`/`f64`, and small floats `f4`/`f8`), `struct`, `class` (no inheritance), `enum` with `match`, interfaces, generics, strings, nullable types. No implicit conversions.
- **Ownership instead of GC.** Arrays and other heap values have a single owner. Arguments are borrowed (default), mutably borrowed (`mut`) or moved (`own`), checked at compile time.
- **Safe by default.** Out-of-bounds access, integer division by zero and oversized shifts stop the program with a clear message; integer overflow wraps; there is no undefined behaviour and no `unsafe`.
- **One source for CPU and GPU.** `kernel` functions have the same meaning on every backend. They run on a CPU thread pool, on Apple GPUs through Metal (MSL), and, experimentally, on WebGPU (WGSL). `dispatch` chooses CPU or GPU by measurement; `gpu.submit` / `gpu.ready` / `gpu.wait` run GPU work asynchronously.
- **Threads.** `thread.spawn` / `thread.join`, with `RacyBuffer` as the only shared mutable data (atomic element access, so no data races).
- **Low-level speed when you need it.** 128-bit SIMD types (`i8x16`, `i16x8`, `f32x4`, …), `Math.prefetch`, masked shifts, bounds-check elimination, bulk `fill`.
- **Diagnostics for humans and AI.** Errors carry a code, a location and a hint, and `check --json` gives machine-readable diagnostics.
- **No npm dependencies.** The compiler is plain TypeScript run directly by Node.js; the only external tool is `clang`.

## Example

```um
struct Particle {
  pos: f32;
  vel: f32;
}

// A kernel runs once per index, on the CPU (all cores) or on the GPU.
kernel function integrate(i: u32, ps: mut Buffer<Particle>, dt: f32): void {
  ps[i].pos = ps[i].pos + ps[i].vel * dt;
}

export function main(): i32 {
  let ps = new Buffer<Particle>(1000);        // fixed length, zero-filled
  ps[0].vel = 2;
  dispatch(integrate, ps.length, mut ps, 0.5);
  print(ps[0].pos);                           // 1
  return 0;
}
```

## Project layout

```
src/        compiler: lexer → parser → checker → codegen (LLVM IR) → driver (clang)
            plus msl.ts (Metal) and wgsl.ts (WebGPU) kernel translators
runtime/    native runtime (C), Metal runtime (Objective-C), wasm runtime and JS host
examples/   sample programs (also tests)
tests/      test runner and test cases
assets/     logo
docs/       documentation
```

## License

UnifiedMozaic is licensed under either of the [Apache License, Version 2.0](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/LICENSE-APACHE) or the [MIT license](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/LICENSE-MIT), at your option.

For the security policy and how to report a vulnerability, see [SECURITY.md](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/SECURITY.md).
