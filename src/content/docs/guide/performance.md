---
title: Performance features
description: Masked shifts, bounds-check elimination, fill, SIMD, prefetch, and speed.
sidebar:
  order: 10
---

## Masked shifts and bounds-check elimination

Shifts by a variable amount and array indexing normally carry run-time checks (stop if the shift amount is at least the bit width; stop on an out-of-range index). Where speed matters, these two features avoid the checks.

**Masked shifts `Math.shl(x, k)` / `Math.shr(x, k)`.** The shift amount `k` is first reduced modulo the bit width of the value (`k & (bit width - 1)`), then the shift is done. With no range check, the branch disappears. The meaning is the same as `<<` / `>>` in kernels, and it agrees across CPU, GPU (Metal / WebGPU) and wasm. `k` may be negative or large, and may be a different integer type from the value (in `Math.shl(1 as u64, sq)`, `sq` can stay `i32`). Right shifts depend on the signedness of the value (arithmetic for signed, logical for unsigned). Use them where the writer knows the shift amount always fits, as with bitboards.

```um
const bit = Math.shl(1 as u64, sq);   // does not stop even if sq is 64 or more (taken modulo 64)
const hi  = Math.shr(x, 48);
```

**Skipping checks on indices proven to be in range.** Where the compiler can tell that an index is always in range, it automatically drops the bounds check (the result is the same as with the check; since dropping it is dangerous, it does so only when certain). The forms it recognises:

- **Indexing a fixed-length array `T[N]`** when the value always falls in `[0, N)`. For example `a[x & 15]` (`T[16]` or larger), `a[Math.ctz(w)]` (`T[65]` or larger; `ctz` / `clz` give 0 to the bit width), `a[x % N]`.
- **When an earlier comparison establishes it.** `if (i < N) { a[i] }` or `while (i < n) { ... }`, and after an early `return` / `break` (after `if (i >= N) return;`, `i < N`). For signed variables, only when the lower bound is also known (unsigned values are always 0 or more).
- Heap arrays (`T[]` / `Buffer`) have lengths decided at run time, so they are not covered by this automatic elimination (loops of the form `for (let i = 0; i < a.length; i++)` move the checks out of the loop by a different mechanism; see [Speed](#speed) below).

There is deliberately no dangerous "remove all checks" switch.

Example: [examples/masked_shift.um](/examples/masked-shift/).

## Bulk writes (fill)

`xs.fill(v)` sets every element to `v`, and `xs.fill(v, start, end)` sets the elements in `[start, end)` (end not included). Available on growable arrays, `Buffer` and `RacyBuffer`; the length does not change.

```um
tt.fill(0);              // clear a large table such as a transposition table (RacyBuffer<u64>)
xs.fill(-1, 10, 20);     // set xs[10] to xs[19] to -1
```

- **Elements must be numbers or `bool`** (write a loop for structs and the like). If the range is not `0 <= start <= end <= length`, the program stops (the same as an out-of-range index). `start` / `end` can be any integer type.
- **A `RacyBuffer` can be written through a read-only borrow, just like element writes.** The writes are indivisible (relaxed) per element, so another thread reading at the same time sees only the old value or the new one (never a torn value). Plain arrays and Buffers need `mut`.
- **16 MiB or more is written by multiple threads on native targets** (the same thread pool that runs kernels in parallel on the CPU; if another thread is using the pool, only the calling thread writes). A plain array where every byte is the same value (such as 0) uses `memset`. On wasm32 it is written by one thread.
- Buffers have no `clear()` (their length is fixed). To set everything to 0, use `b.fill(0)`.
- Speed (Apple M4, setting a `RacyBuffer<u64>` to 0, compared with a per-element loop): 256 MiB 8.6 → 3.3 ms, 1 GiB 35 → 14 ms, 2 GiB 70 → 27 ms (about 2.6 times).
- **The length (element count) of a Buffer / RacyBuffer stays `u32`** (the type of `b.length`, because GPU dispatch counts and indices are 32-bit). The byte size, multiplied by the element size, is handled as 64-bit, so a `RacyBuffer<u64>` can have up to 2^32 - 1 elements (nearly 32 GiB) (allocating and filling a 4 GiB `RacyBuffer<u64>` was checked). Buffers with 2^32 elements or more are not available yet. The length of a growable array `T[]` is `usize` (64-bit on native).
- Example: [examples/fill.um](/examples/fill/).

## SIMD vectors

There are 128-bit vector types `i8x16` / `u8x16` / `i16x8` / `u16x8` / `i32x4` / `u32x4` / `f32x4` and their operations `Simd.*`. They become LLVM vector instructions: NEON on arm64 (`sdot`, `smull` and so on), and instructions with the same meaning (or per-lane computation) on wasm32 and others. **They can only be used on the CPU** (an error in kernels; GPU kernels are already parallel per element).

```um
// incremental update of a neural network (i16) and the dot product of an affine layer (i8)
for (let j: u32 = 0; j < n; j += 8) {
  Simd.store(mut acc, j, Simd.load(acc, j) + Simd.load(w, add * n + j) - Simd.load(w, sub * n + j));
}
let s: i32x4;
for (let j: u32 = 0; j < n; j += 16) { s = Simd.dot(s, Simd.load(x, j), Simd.load(w, j)); }
const y = Simd.sum(s);
```

- **The types are aliases of fixed-length arrays of the same element** (`i16x8` is the same type as `i16[8]`). Lanes can be read and written with `v[k]`, created with array literals, and used as struct fields or array elements (`i16x8[]`). Like `vec2` / `vec3` / `vec4` they are value types, and `+ - *` work.
- **Operations** (`a` and `b` are vectors of the same type; integers wrap, `f32` is a single IEEE rounding):

| Form | Meaning |
| --- | --- |
| `a + b`, `a - b`, `a * b` (`Simd.add` / `sub` / `mul`) | Per lane |
| `Simd.min(a, b)` / `Simd.max(a, b)` | Per lane. The same "compare and pick" definition as `Math.min` / `Math.max` (unsigned types compare as unsigned; `b` if there is a NaN) |
| `Simd.splat(x)` | Every lane is x. The type comes from the expected type or from the type of x (`const v: i16x8 = Simd.splat(3)`) |
| `Simd.shuffle(a, b, [i0, ..., iL-1])` | Lane k is `a[ik]` if `ik < L`, otherwise `b[ik - L]`. The indices are integer literals |
| `Simd.dot(acc: i32x4, a: i8x16, b: i8x16)` | `acc[k] + a[4k]*b[4k] + … + a[4k+3]*b[4k+3]` (NEON's `sdot`) |
| `Simd.mulAddWide(acc: i32x4, a: i16x8, b: i16x8)` | `acc[k] + a[2k]*b[2k] + a[2k+1]*b[2k+1]` (wrapping in i32) |
| `Simd.sum(v)` | Sum of all lanes (integers wrap in the element type; `f32` adds in order from lane 0) |
| `Simd.load(xs, i)` / `Simd.store(mut xs, i, v)` | Read / write L elements at once starting at `xs[i]`. `xs` is a growable array, a `Buffer` or a fixed-length array (not a `RacyBuffer`). Stops if `i + L` exceeds the length |

- **The values are the same on every target.** On arm64 macOS, `Simd.dot` uses `sdot` directly; elsewhere it uses generic vector instructions that give the same values (`tests/simd/lanes.um` checks both paths against scalar computation; the generic path can be selected at compile time with `UM_GENERIC_SIMD=1`). On wasm32, LLVM computes per lane (simd128 is not used yet).
- **Speed** (Apple M4, small measurements): Apple clang 21 vectorises a straightforward loop whose bounds checks can be hoisted (`s += (w[j] as i32) * (x[j] as i32)`) into `sdot` by itself, so writing it with SIMD is about the same (a 1024 × 16 dot product: loop 190–340 ns, `Simd.dot` with the sum split into 2 accumulators 200–230 ns; with only 1 it is slower at 400 ns. An incremental update of 1024 i16: loop 38–55 ns, SIMD 44–56 ns). The bounds check of `Simd.load` is also moved out of the loop. Use them when you want to write it without relying on automatic vectorisation (shuffles, horizontal sums, older clang).
- Example: [examples/simd.um](/examples/simd/).

## Prefetch

`Math.prefetch(arr, i)` asks the CPU to load the memory holding `arr[i]` into the cache before it is used (LLVM's `llvm.prefetch`: a prefetch for reading, with maximum locality; `prfm pldl1keep` on arm64). Use it with large tables such as transposition tables, when the next location to read is known in advance.

```um
Math.prefetch(table, slot * 4);   // request the next location to read in advance
doOtherWork();                    // do other work in the meantime
const e = table[slot * 4];        // it has arrived by the time it is read
```

- **It returns nothing and does not change what the program does.** Nothing happens even for an out-of-range index (no check and no stop). However, the location of the array itself (such as `k` in `tables[k]`) is checked as usual.
- `arr` is a variable (or a field or element of one) holding a growable array, a `Buffer` or a `RacyBuffer`. Fixed-length arrays and temporary values cannot be used. The index can be any integer type.
- **It does nothing on wasm32** (the index expression is still evaluated). **It cannot be used inside kernels** (the GPU has no prefetch).
- Effect (Apple M4, a small measurement reading a 1 GiB table in random order): with 20–40 multiplications of work between reads, one read went from about 33 → 27 ns and 55 → 45 ns (about -18%). Without other work it does not get faster (the CPU overlaps the reads ahead by itself).
- Example: [examples/prefetch.um](/examples/prefetch/).

## Speed

Compared with the same computations written in C (measured on Linux x86_64), many items are on par with C at `-O2`. Loops where bounds checks on indexing remain (such as stencil computations reading neighbouring elements) are roughly 20–60% slower than C. `for...of` and kernels have no bounds-check branches.
