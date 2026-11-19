---
title: GPU on Metal (Mac)
description: UM_METAL=1 builds, choosing where to run, gpu.submit, environment variables and limits.
sidebar:
  order: 6
---

On macOS, building with `UM_METAL=1` produces a native executable that can also run kernels on the GPU through Metal (the runtime is `runtime/metal.m`). This has been checked on Apple Silicon (Apple M4).

```sh
UM_METAL=1 node src/cli.ts build x.um --target host -o x    # --target arm64-macos also works
./x
```

- **`UM_METAL=1` is a compile-time setting.** Without it, native builds do not use the GPU (`dispatch` uses the CPU and `gpu.dispatch` is a compile error). `UM_METAL=1` has no effect outside a Mac.
- **Kernels are translated to MSL (Metal Shading Language) and embedded in the executable; Metal compiles them the first time they run on the GPU.** Floating-point approximations are turned off (`MTLMathModeSafe` and precise math functions), and the kernels in `tests/metal/parity.um` give the same results as the CPU. Before macOS 15 some of the precision settings are unavailable, and `sqrt` rounding may differ from the CPU (unverified).
- **Buffers are shared with the GPU without copying** (unified memory). In `UM_METAL=1` builds, Buffers are allocated on page boundaries and passed to the GPU as they are.
- **GPU setup (tens of milliseconds) is not done until the GPU is first used.** Programs that only need the CPU do not pay for it.

## Choosing where to run (`dispatch` / `cpu.dispatch` / `gpu.dispatch`)

| Form | Where it runs |
| --- | --- |
| `dispatch(k, n, ...)` | Picks whichever is faster by measurement (see below) |
| `cpu.dispatch(k, n, ...)` | Always the CPU (multiple threads) |
| `gpu.dispatch(k, n, ...)` | Always the GPU. Stops if no GPU is available (`panic: the GPU is not available`) |

The automatic choice in `dispatch` measures CPU and GPU time for each kernel.

- **The first two runs are on the CPU, and their time is measured.** Work that takes less than 50 microseconds per run on the CPU is never tried on the GPU (handing it to the GPU once already takes longer than that).
- **Heavier work is also tried twice on the GPU, and after that the side expected to be faster is chosen.** The estimate compares "GPU fixed overhead + time per element × count" with "CPU time per element × count".
- **The side not chosen is re-measured now and then** (about once every 64 runs; the interval widens the larger the difference and the longer the winner stays the same).
- **The result is the same even if the choice changes midway** (because kernel meaning is the same on CPU and GPU; excluding racy writes to a RacyBuffer).
- `UM_GPU_THRESHOLD=N` turns off measurement and uses a fixed rule: the GPU when the element count is N or more.

## Making synchronous dispatches faster

`dispatch` / `gpu.dispatch` do not return until the GPU work has finished. On top of that, mechanisms that reduce round-trip overhead work automatically.

- **Consecutive dispatch statements are combined into one submission.** When the next statement is also a dispatch statement and the counts and arguments of both are only variables or literals, the first is submitted together with the next without waiting for completion (the writes of the earlier kernel are visible to the next kernel).
- **Calling a dispatch of the same shape many times puts it on a resident path.** A "shape" is the sequence of dispatches combined into one submission (one is fine; up to 8) with their kernels and Buffers. After seeing the same shape 8 times, the commands for that shape are submitted to the GPU ahead of time to wait for a signal; after that, running it only means writing the arguments and count and raising the signal. Up to 4 shapes can be waiting at once. Waits not used for a while (about 1 second), and waits whose Buffers are being freed, are cleaned up. `UM_GPU_RESIDENT=0` turns this off.
- **Results are picked up by checksum without waiting for the completion notification.** A checksum of the range the GPU wrote, mixed with the request number, is computed on both the GPU and the CPU, and when they match the results are judged readable (Metal's completion notification arrives tens of microseconds after the GPU finishes). This is used when there are at most 4 written Buffers, element sizes are multiples of 4 bytes, and each is at most 65536 words. Otherwise it waits for the completion notification (same results). `UM_GPU_RESIDENT=status` always waits for the completion notification.

As a guide (Apple M4, measuring small evaluations handed to the GPU one at a time with the answer read each time): one round trip takes about 0.1 ms with the resident path and checksums. If the same work finishes in tens of microseconds on the CPU, the CPU is faster. For a heavy evaluation doing 1024 × 2048 multiply-adds per run, the GPU (about 0.2 ms) was faster than all CPU cores (about 0.45 ms).

## Running the CPU and the GPU at the same time (`gpu.submit` / `gpu.ready` / `gpu.wait`)

```um
const t = gpu.submit(k, n, mut out, weights);   // returns without waiting; returns a ticket (u64)
doOtherWork();                                   // meanwhile the CPU does other work
if (gpu.ready(t)) { ... }                        // true if finished (does not wait)
gpu.wait(t);                                     // waits until finished
print(out[0]);                                   // reading after ready / wait gives the new result
```

- **Buffers passed to `gpu.submit` that the kernel writes must be `RacyBuffer`s** (otherwise a compile error), because it returns without waiting and the CPU and GPU could touch the same memory at the same time. A read-only-borrowed `RacyBuffer` can also be passed as `mut`.
- **Plain `Buffer`s that the kernel only reads can also be passed.** If read-only data such as weights is put in a `Buffer`, the CPU can read the same memory with ordinary (non-atomic) loads. If the CPU modifies that Buffer before the kernel finishes, the kernel may read a mix of old and new values (this does not stop the program or read or write out of range).
- **Values read before `gpu.ready` / `gpu.wait` may be stale.** Work requested on the same Buffer runs in the order it was requested.
- **A finished ticket and ticket 0 are "finished" whenever they are checked.** A ticket can be waited on from any thread.
- **When a Buffer is freed, it waits for the work using it to finish.**
- **When more than 1024 tickets are outstanding, it waits on the spot for the oldest work to finish** (the results do not change).
- **Only Metal actually returns without waiting.** In builds and environments without a GPU (no `UM_METAL`, `UM_GPU=0`) and on wasm32, the work runs to completion on the spot and ticket 0 is returned (same results). With `UM_GPU_COPY=1` it also runs on the spot.
- The early completion check by checksum of the written Buffers (same conditions as above) is also used by `gpu.ready` / `gpu.wait`.
- As a guide (Apple M4): one `gpu.submit` call takes a few microseconds. Keeping about 8 small evaluations outstanding gave 3–4 times the throughput of `gpu.dispatch` waiting for each one.

Example: [examples/gpu_submit.um](/examples/gpu-submit/) (also runs without a GPU).

## Environment variables

Read at run time (by the Metal runtime):

| Variable | Meaning |
| --- | --- |
| `UM_GPU=0` | Do not use the GPU. Every `dispatch` uses the CPU, `gpu.dispatch` stops, and `gpu.submit` runs on the CPU on the spot |
| `UM_GPU_THRESHOLD=N` | Turn off measurement for the automatic choice; use the GPU when the element count is N or more |
| `UM_GPU_RESIDENT=0` | Do not use the resident path |
| `UM_GPU_RESIDENT=status` | Do not use the early completion check by checksum; always wait for Metal's completion notification |
| `UM_GPU_TRACE=1` | Print where things ran, the number of shared Buffers, times, starts and stops of the resident path and so on to standard error |
| `UM_GPU_COPY=1` | For comparison: copy Buffers on every call instead of sharing them (slower) |

For CPU parallelism and threads, see `UM_THREADS`, `UM_POOL_SPIN_US` and `UM_THREAD_STACK_MB` in [Threads](/guide/threads/).

## Limits

- **A single dispatch can be passed at most 64 Buffers** (more stops the program). A dispatch with 17 or more Buffers, or with more than 512 bytes of non-Buffer arguments, is submitted on its own without being combined.
- **GPU counts and indices are 32-bit** (Buffer lengths are `u32`).
- `f16` / `f8` / `f4` / `f64`, 64-bit integers, SIMD vectors and `Math.prefetch` cannot be used in kernels.
- If GPU work fails to compile or run its shader, the program stops (`panic: the GPU could not run a kernel (...)`).
