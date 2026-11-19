---
title: WebGPU and MSL output
description: Running on the GPU in a browser (experimental), and MSL output.
sidebar:
  order: 7
---

## Running on the GPU in a browser (WebGPU, experimental)

**This path is experimental and will not be maintained going forward.** Kernel features added from now on target only the CPU and Metal, and may not be supported in WGSL (they may be compile errors).

When building for wasm32, dispatched kernels are translated to WGSL (the WebGPU shading language) and embedded in the wasm. `instantiate` in `runtime/host.mjs` runs those kernels with WebGPU.

```js
import { instantiate } from './runtime/host.mjs';
const exports = await instantiate(wasmBytes, { print: console.log });
await exports.main();   // returns a Promise where a GPU is available, so always await it
```

- **The automatic choice is simple.** If a GPU is available and the element count is at or above a threshold (4096 by default; change it with `gpuThreshold`), it runs on the GPU. There is no choice by measurement.
- **Each dispatch sends the Buffers and reads back those written to,** because in WebGPU the CPU and GPU memory are separate. Small jobs, and processing that goes back and forth with the CPU often, are faster on the CPU.
- **`gpu.submit` runs the work to completion on the spot and returns ticket 0.**
- **JSPI (a feature that suspends WebAssembly execution to wait for a Promise) is required,** because WebGPU readback can only be done asynchronously. Where JSPI or WebGPU is missing, it runs as if there were no GPU, and `dispatch` runs on the CPU. It works in desktop Chrome / Edge 137 or later.
- **What has been checked**: it was run once in a Chromium-based browser on Android (Adreno GPU), and 2 of 3 tests matched. The remaining one differed only in an out-of-range float→integer conversion, and the fix for it has not been rechecked on the device. Kernels with 8- and 16-bit integers were checked to match the CPU on Deno's WebGPU.
- **To see the generated WGSL,** run `node src/cli.ts build x.um --emit-wgsl`.

## MSL (Metal Shading Language) output

`node src/cli.ts build x.um --emit-msl` writes the MSL for each kernel to `<output>.<kernel>.metal` (the same translation that goes into `UM_METAL=1` builds).

- **Checks with Metal**: the MSL of all 51 kernels in the tests and examples was checked to compile with the Metal compiler (Apple M4) (2026-11-15). Running on the GPU is checked on a Mac by confirming that the kernels in `tests/metal` give the same results as the CPU (`node tests/run.ts` runs this on a Mac).
- **Checks without Metal**: the generated MSL is compiled as C++14 with `clang++` together with a stub header (`tests/msl/metal_stub.h`) (all kernels in `tests/gpu` and `examples`), and the kernels in `tests/msl/kernels.um` are run as C++ over every index and their checksums compared with the CPU results (`node tests/run.ts` does this when `clang++` is available). Passing as C++ does not mean conforming to the Metal specification, so Metal-specific rules are checked by running on a Mac.
