---
title: Threads
description: thread.spawn / thread.join and RacyBuffer.
sidebar:
  order: 8
---

`thread.spawn(f, args...)` runs a function on a new thread, and `thread.join(h)` waits for it to finish and receives its return value. `thread.spawnEach(f, own items, args...)` starts one thread per array element (the k-th runs `f(items[k], args...)`; elements are moved), and `thread.join` then returns an array of return values in the same order as items. `thread.cpus()` is the number of logical CPUs, and `thread.yield()` gives the CPU to other runnable threads (for loops that wait while watching a flag in a RacyBuffer; it returns immediately if no other thread can run; it does nothing on wasm32).

```um
function search(w: own Worker, sh: Shared, root: Position): Worker { ... }

const sh: Shared = { tt: new RacyBuffer<u64>(n), stop: new RacyBuffer<u32>(1) };
{
  const g = thread.spawnEach(search, own workers, sh, root);  // helper threads
  ...                                                          // the main thread does its own work (I/O, time management)
  sh.stop.store(0, 1);
  workers = thread.join(g);                                    // each Worker comes back
}
```

- **A handle (the result of `thread.spawn`) can only be written as the initialiser of a `const` declaration.** It cannot be moved, assigned, `return`ed, passed as an argument, or stored in a field or array element (the types `Thread<R>` / `Threads<R>` can only be written in that `const`'s annotation). `thread.join` consumes the handle, and a handle that was not joined is joined automatically at the end of the block containing its declaration (including when leaving with `return` / `break` / `continue`; the return value is discarded).
- **Passing values to a thread**: types that are copied are copied, `own` moves (the thread owns the value and returns or frees it), and unqualified values with heap data are shared as read-only borrows. Functions with `mut` arguments cannot be started. A variable lent as a read-only borrow cannot be modified, moved or passed as `mut` from the `const` declaration to the end of the block (even after `join`). To modify it after joining, put the start in an inner block `{ ... }`. Temporary values cannot be lent (put them in a `const` first).
- **Only the elements of a `RacyBuffer` can be modified by multiple threads.** Outside kernels, `RacyBuffer` elements can be written even through a read-only borrow (the length and memory do not change). Element reads and writes `b[i]` are atomic instructions with no ordering guarantee (relaxed outside kernels); the values may differ between runs, but memory is not corrupted. `for...of` and `clone()` also read elements atomically one at a time. Element types are `i8` / `u8` / `i16` / `u16` / `i32` / `u32` / `f32`, plus `i64` / `u64` outside kernels only (for transposition tables and the like). With 8- and 16-bit elements too, neighbouring elements written at the same time by other threads do not get mixed. A kernel can read and write any element of a `mut RacyBuffer`.
- **Atomic operations**: `b.load(i)`, `b.store(i, v)`, `b.fetchAdd(i, v)` (returns the previous value), `b.compareExchange(i, expected, desired)` (returns the previous value). The ordering is seq_cst: writes before a `store` (including `b[i]`) are visible to a thread that sees that value with `load`. Use these for "write the data, then raise a flag" hand-offs (`b[i]` accesses have no ordering among themselves). `fetchAdd` / `compareExchange` are for integers only and cannot be used inside kernels.
- **A read-only-borrowed `RacyBuffer` can be passed as it is to a kernel's `mut RacyBuffer`** (`gpu.submit(k, n, mut sh.out, sh.inp)`, because a kernel cannot replace the memory). `dispatch` / `gpu.submit` / `gpu.ready` / `gpu.wait` can be called from any thread, and a ticket can be waited on from any thread.
- **The output of one `print` call (one line) is not mixed with other threads.** `readLine()` / `inputReady()` can only be used on the main thread (calling them elsewhere stops the program). A stop on any thread stops the whole program (with one message).
- Up to 256 threads can exist at once (more stops the program). The stack is 64 MiB (change it with `UM_THREAD_STACK_MB`). Starting and joining costs 10–15 microseconds per thread (Apple M4).
- **The thread pool that runs kernels in parallel on the CPU** uses as many threads as logical CPUs by default (including the calling thread; at most 64). Change the number with `UM_THREADS`. Pool threads wait for the next job without sleeping for 100 microseconds after a job (change with `UM_POOL_SPIN_US`; 0 sleeps immediately). The pool takes one job at a time, so a `cpu.dispatch` made while another thread is using it runs only on the calling thread.
- **wasm32 has no threads.** Every form is accepted, and the function runs to completion on the spot at the join point (`thread.join` or the automatic join) (`spawnEach` in element order; `thread.cpus()` is 1). Programs that loop waiting for the results of other threads (such as one that collects work and sends it to the GPU) never finish on wasm32.

Examples: [examples/threads.um](/examples/threads/), [examples/racy_shared.um](/examples/racy-shared/), [examples/racy_buffer.um](/examples/racy-buffer/).
