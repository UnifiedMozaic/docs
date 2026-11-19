---
title: Safety and error messages
description: What the language guarantees, and the shape of its diagnostics.
sidebar:
  order: 9
---

## Safety

There is no `unsafe` yet, so all code you can write falls within the following guarantees.

| What can happen | Behaviour |
| --- | --- |
| Out-of-bounds array access | Stops (a constant index is a compile error) |
| Integer overflow | Wraps. Not undefined behaviour |
| Division by zero (integer) | Stops |
| Minimum value ÷ -1 | Wraps |
| Shift by the bit width or more | Stops |
| Out-of-range conversion from floating point to integer | Saturates. NaN becomes 0 |
| Uninitialised variables or fields | Cannot be written (initialisation is required; constructors are checked to initialise every field) |
| Use after free, double free | Cannot happen (using a moved-from variable is a compile error) |
| Leaks | Cannot happen (freed when the owner goes out of scope; except when the program stops) |
| Growing an array being iterated or borrowed, invalidating element locations | Compile error |
| `pop` from an empty array | Stops |
| Out of memory, overflow of allocation size | Stops |
| Out-of-bounds access, division by zero, oversized shifts inside a kernel | Does not stop; gives a defined result (see [Kernels and Buffer](/guide/kernels/)) |
| Multiple invocations writing the same element (data race) | Cannot happen (a kernel can write only its own `[i]`; `RacyBuffer` uses atomic instructions) |
| Data races between threads | Cannot happen (only `RacyBuffer` elements can be shared and modified, and their reads and writes are atomic instructions) |
| Freeing or modifying a value a thread is reading | Compile error (a lent variable is frozen until the end of the block, and joining comes before freeing) |
| Freeing a Buffer the GPU is using | Before freeing, waits for the GPU work using that Buffer to finish |
| Passing a mutably borrowed variable as another argument or the receiver of the same call | Compile error |
| Stack overflow | Stops (wasm by the runtime's check; native with guard pages and stack probes) |

A stop is exit code 101 with `panic: reason (line N)` on native, and a `UmPanic` exception on wasm. A stop while other threads are running exits without the `atexit` cleanup (`_exit`).

## Error messages

Code in this language is assumed to be written mainly by AI, so diagnostics carry a cause code, a location and a hint on how to fix it. Things people tend to write out of TypeScript habit (`number`, `any`, `try`, `extends`, arrow functions and so on) are shown with what to use instead.

```
$ node src/cli.ts check bad.um
bad.um:1:15: error[ts-feature]: type 'number' is not available
  hint: there is no `number`; pick a sized type: `i32`, `i64`, `f32` or `f64`
```

Examples of code that must fail to compile are in [`tests/errors/`](https://github.com/UnifiedMozaic/UnifiedMozaic/tree/main/tests/errors).
