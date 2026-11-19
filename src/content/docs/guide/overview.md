---
title: Overview
description: The UnifiedMozaic language guide — requirements, what you can write today, and the ground rules.
sidebar:
  order: 1
---

UnifiedMozaic is a language with TypeScript-like syntax that compiles, without a GC, to native executables and WebAssembly. You can write CPU and GPU code in the same source (`.um`). This guide explains what you can write today and the rules that apply.

```um
struct Vec3 {
  x: f32;
  y: f32;
  z: f32;
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

// mut is a mutable borrow. Write mut at the call site too.
function scaleInPlace(v: mut Vec3, s: f32): void {
  v.x *= s;
  v.y *= s;
  v.z *= s;
}

export function main(): i32 {
  let v: Vec3 = add({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 });
  scaleInPlace(mut v, 0.5);
  print(v.x);
  return 0;
}
```

**Current status:** the language and runtime are experimental and change often. `kernel` functions run on multiple CPU threads on native targets, and on a Mac (Apple Silicon) they can also run on the GPU through Metal (see [GPU on Metal (Mac)](/guide/metal/)). Running on WebGPU for wasm32 is experimental and will not be maintained going forward (see [WebGPU and MSL output](/guide/webgpu-msl/)).

## Requirements and usage

Installation is covered in [Installation](/getting-started/installation/), and the first steps in [Quick start](/getting-started/quick-start/). Only the essentials are repeated here.

- Node.js 22.18 or later (runs the TypeScript directly; there are no npm package dependencies)
- `clang` from LLVM 18 or later. Emitting wasm32 also needs `wasm-ld`
  - macOS: Xcode's clang does not support wasm, so for wasm32 use the one installed with `brew install llvm lld` (you can point to clang with `UM_CLANG`)

```sh
# wasm32 (default)
node src/cli.ts build examples/structs.um -o structs.wasm
node runtime/run-node.mjs structs.wasm

# Native executable for this machine
node src/cli.ts build examples/structs.um --target host -o structs
./structs

# Native executable that can also run kernels on the GPU (Metal) on a Mac
UM_METAL=1 node src/cli.ts build examples/kernels.um --target host -o kernels

# For macOS on Apple Silicon (on other machines, only up to an object file)
node src/cli.ts build examples/structs.um --target arm64-macos -o structs

# Type-check only. --json prints machine-readable diagnostics
node src/cli.ts check examples/structs.um --json

# Look at the generated LLVM IR (--emit-wgsl / --emit-msl also write kernel shaders)
node src/cli.ts build examples/structs.um --emit-llvm -o structs.ll
```

In a browser, load the module with `instantiate(bytes)` from `runtime/host.mjs` and call the `export`ed functions.

## What you can write today

| Category | Contents |
| --- | --- |
| Types | `i8`–`i64`, `u8`–`u64`, `usize`, `f4`, `f8`, `f16`, `f32`, `f64`, `bool`, `string`, `struct`, `enum` (with values; branch with `match`), `class`, fixed-length arrays `T[N]`, growable arrays `T[]` (same as `Array<T>`), `Buffer<T>`, `RacyBuffer<T>`, `T \| null`, the standard `Result<T, E>`, vectors and matrices `vec2<T>`–`vec4<T>` / `mat2<T>`–`mat4<T>`, SIMD types such as `i8x16` |
| Declarations | `function`, `export function`, `kernel function`, `struct`, `enum`, `class` (fields, initial values, `constructor`, methods, `private`, `implements`), `interface`, generic functions, structs, classes, enums and kernels, top-level constants `const NAME: T = constant expression;` (`export const` too), `import { a, b } from "./x.um";` |
| Statements | `let` / `const` (`let x: T;` is zero-initialised), assignment and compound assignment, `++` / `--`, `if` / `else`, `while`, `do ... while`, `for (;;)`, `for...of`, `switch`, `match`, `break`, `continue`, `return` |
| Expressions | arithmetic and remainder, comparisons, `&&` / `\|\|` / `!`, the conditional `a ? b : c`, `x ?? default`, bitwise operators and shifts, conversion with `as`, function and method calls, `new`, `this`, fields and indexing, object literals, array literals, `new Array<T>(n)`, `xs.length`, template strings `` `x = ${x}` ``, `String(x)` |
| Array methods | `push`, `pop`, `clear`, `clone`, bulk writes `fill(v)` / `fill(v, start, end)` (also on Buffer / RacyBuffer; see [Bulk writes](/guide/performance/)) |
| Built-ins | `print(x)` (numbers, `bool`, strings), `dispatch` / `cpu.dispatch` / `gpu.dispatch`, `gpu.submit` / `gpu.ready` / `gpu.wait`, `thread.*` (see [Threads](/guide/threads/)), `Math.sqrt` / `floor` / `ceil` / `abs` / `min` / `max`, the bit operations `Math.popcount` / `clz` / `ctz`, masked shifts `Math.shl` / `Math.shr`, prefetch `Math.prefetch(arr, i)`, SIMD `Simd.*` (see [Performance features](/guide/performance/)) |
| I/O built-ins | `readLine()`, `inputReady()`, `clock()`, `stringFromBytes(bytes)`, `readFile(path)`, `writeFile(path, bytes)` (see [Input and output](/guide/input-output/)) |

How to write each of these is shown in the following pages and in the examples under [More features](/guide/features/).

Ground rules:

- **There are no implicit type conversions.** When mixing `i32` and `f64`, convert explicitly with `as`. Numeric literals take the type of their context.
- **Arguments are passed in one of three ways.** Unqualified is a read-only borrow, `mut` is a mutable borrow, and `own` moves ownership. `mut` and `own` are also written at the call site.
- **Structs, `class`es and arrays are value types.** On assignment, values without heap data are copied and values with heap data are moved (see [Ownership](/guide/ownership/)).
- **`class` has no inheritance.** A `struct` is created with an object literal and a `class` with `new`. Use an `interface` for a shared contract of methods.
- **The compiler decides from the body whether a method modifies `this`.** A method that modifies it can only be called on a variable declared with `let` or on a `mut` argument.
- **A constructor initialises every field,** either with a top-level `this.x = ...` or with a field initial value (`x: i32 = 0`). `this` as a whole cannot be used until initialisation is complete.
- **In `for...of`, numbers and the like are copied, and elements with heap data (strings or arrays) are borrowed.** To borrow, write `for (const x of xs)`. No bounds checks are inserted. The array being iterated cannot be modified.
- **In `for (let i = 0; i < xs.length; i++)`, `i` gets the type of what it is compared with (here, `usize`).** Elsewhere `xs.length` is `usize`, so mixing it with `i32` needs `as`.
- **The width of `usize` depends on the target (32 bits on wasm32, 64 bits on native).** For calculations that depend on width, state `u32` or `u64` explicitly.
- **Writing `>= 0` on an unsigned integer is a compile error,** because it is always true and would make a countdown loop never end.
- **Assignment evaluates the right-hand side first.** `a[f()] = g()` evaluates `g()`, then `f()` (the opposite of JavaScript), so that the target can be found safely even if the right-hand side grows the array.
- **`print` formats floating-point numbers the same way as JavaScript on every target.**
- **`Math.min` / `Math.max` are defined as "compare and pick".** If either argument is NaN, they return the second argument (unlike JavaScript).
- **A native program needs `export function main(): i32` (no arguments).**
