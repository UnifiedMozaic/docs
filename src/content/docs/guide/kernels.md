---
title: Kernels and Buffer
description: Kernel functions, which mean the same thing on the CPU and the GPU, and Buffer, the data they share.
sidebar:
  order: 5
---

A `kernel function` is a function that can also run on the GPU. `dispatch(kernel, count, args...)` runs it for each index from 0 up to (but not including) the count. Its meaning is defined so that running on the CPU or on the GPU gives the same result. On the native CPU, large dispatches are split across multiple threads.

```um
struct Particle {
  pos: f32;
  vel: f32;
}

kernel function integrate(i: u32, ps: mut Buffer<Particle>, dt: f32): void {
  ps[i].pos = ps[i].pos + ps[i].vel * dt;
}

export function main(): i32 {
  let ps = new Buffer<Particle>(1000);   // fixed length, zero-filled
  dispatch(integrate, ps.length, mut ps, 0.016);
  return 0;
}
```

- **`Buffer<T>` is where data shared by the CPU and the GPU lives.** Its length is fixed, and its elements are limited to `i32` / `u32` / `f32` and `struct`s, fixed-length arrays and vectors of them, plus the 8- and 16-bit integers `i8` / `u8` / `i16` / `u16` (only as the element itself; not as struct fields or fixed-length array elements). Ownership works the same as for growable arrays. See [Buffers of 8- and 16-bit integers](#buffers-of-8--and-16-bit-integers) below.
- **The types usable inside a kernel are `bool` / `i32` / `u32` / `f32`, and `struct`s and fixed-length arrays of them, vectors and matrices of `f32` / `i32` / `u32`, and enums whose values are only `i32` / `u32` / `f32` / `bool`.** 8- and 16-bit integers can only be read, written and converted as single values (see below). Floating-point literals are `f32`.
- **A kernel can write only to `[i]` of a `mut` Buffer.** `i` is the first argument (`u32`); each element is handled by a separate invocation, so there are no conflicts. Neighbouring elements are read from a different (non-`mut`) Buffer. To write to any element, use `RacyBuffer` (see [Threads](/guide/threads/)).
- **A kernel cannot allocate, `print`, call ordinary functions, or recurse.** Helper functions are also written as `kernel function`s.
- **A kernel never stops the program (the GPU has no way to stop).** Out-of-range indices are clamped to the last element. Integer division by zero gives `x / 0 = x` and `x % 0 = 0`, and the shift amount is taken modulo the bit width.
- **The `dispatch` count must not exceed the length of the Buffers written to.** If it does, the program stops.
- **`dispatch` chooses where to run automatically.** To be explicit, write `cpu.dispatch` / `gpu.dispatch`. Builds that can run on the GPU are Metal on a Mac (`UM_METAL=1`) and wasm32 (WebGPU). In other native builds `dispatch` always uses the CPU, and `gpu.dispatch` is a compile error. `gpu.dispatch` stops the program when run where no GPU is available.
- **In builds that can run on the GPU, structs and arrays passed by value to a dispatched kernel cannot contain `bool`** (the bit representation differs between CPU and GPU; use a `u32` 0 / 1, or call it with `cpu.dispatch`).
- **To run the CPU and the GPU at the same time, use `gpu.submit`** (see [GPU on Metal (Mac)](/guide/metal/)).

Examples: [examples/kernels.um](/examples/kernels/), [examples/particles_kernel.um](/examples/particles-kernel/), [examples/parallel_kernels.um](/examples/parallel-kernels/).

## Buffers of 8- and 16-bit integers

`Buffer<i8>` / `Buffer<u8>` / `Buffer<i16>` / `Buffer<u16>` (and `RacyBuffer`s with the same elements) are available. Small integers such as quantised neural-network weights (i8 / i16) can be shared with the GPU as they are, without repacking.

```um
kernel function affine(i: u32, out: mut RacyBuffer<i32>, w: Buffer<i8>, x: Buffer<u8>, n: u32): void {
  let acc: i32 = 0;
  for (let k: u32 = 0; k < n; k++) { acc = acc + (w[i * n + k] as i32) * (x[k] as i32); }
  out[i] = acc;
}
const t = gpu.submit(affine, rows, mut out, w, x, n);  // w and x are only read, so plain Buffers are fine
const mine = affineCpu(w, x, 2, n);                     // meanwhile the CPU can read the same weights
gpu.wait(t);
```

- **Inside a kernel, 8- and 16-bit values can only be read, written, compared and converted with `as`.** Widen with `as i32` / `as u32` before computing, and narrow with `as i8` and so on when writing (`as` keeps the low bits; the same value on CPU and GPU). On the GPU they are held in 32-bit registers, and this avoids re-truncating after every operation. Direct conversion to and from floating point is not available either (go through a 32-bit integer). Outside kernels, all operations are available, as for other integers.
- **They cannot be used as by-value arguments of a dispatched kernel** (take an `i32` and convert inside the kernel). They can be used as arguments and return values of kernel helper functions.
- **Allocations are rounded up to a multiple of 4 bytes** (the length stays as requested), because the GPU reads and writes in 4-byte units.
- **GPU implementation**: Metal (MSL) reads and writes `char` / `uchar` / `short` / `ushort` directly. WebGPU (WGSL) has no 8- or 16-bit integers, so the data is passed as a `u32` array and elements are accessed through extraction functions. Because another invocation may write a neighbouring element in the same word at the same time, writes change only their own bits with atomic operations (`atomicAnd` + `atomicOr`, or compare-exchange for RacyBuffer). The WGSL version was checked to give the same results as the CPU on Deno's WebGPU (wgpu) (the kernels in `tests/metal/small_ints.um`).
- **When a written Buffer has 8- or 16-bit elements, Metal's early completion check by checksum is not used** (it waits for Metal's completion notification).
- There is no `f16` Buffer yet (f16 in WGSL is an extension, and its rounding rules cannot be made to match the CPU).
- Example: [examples/small_ints.um](/examples/small-ints/).

## Standard functions (packed small integers)

The functions in `runtime/prelude.um` can be called from any program. They are for packing ternary weights, as in BitNet, at 2 bits each into a `Buffer<u32>`.

```um
let weights = new Buffer<u32>(packed2Words(count));   // number of words needed
packed2Set(mut weights, k, -1);                       // write (CPU only; stops when out of range)
const w = packed2Get(weights, k);                     // read (-2 to 1; usable inside kernels)
out[i] = ternaryDot(weights, i * inputs, x, 0, inputs); // sum of products of ternary weights and inputs (no multiplication)
```

These are functions, not a dedicated type you can index as `w[i]`. They assume ternary weights packed 2 bits at a time (packing 5 per byte is not supported). There are also 1-bit `packed1Words` / `packed1Get` / `packed1Set`. Example: [examples/packed_weights.um](/examples/packed-weights/). [examples/bitnet.um](/examples/bitnet/) shows a ternary (-1 / 0 / +1) linear layer (BitNet-style) written as a kernel.
