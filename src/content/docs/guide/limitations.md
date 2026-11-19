---
title: Not yet available
description: Features that do not exist yet, and features the language will not have.
sidebar:
  order: 11
---

- **Language**: function values (arrow functions, callbacks such as `map` / `filter`), global variables (top-level `let`; top-level `const` with an unchanging value is available), constants of arrays or `struct`s, type aliases (`type`), `static`, `readonly`, getters / setters, `async` / `await`, `unsafe`, using an interface as the type of a value, generic methods, exporting generic functions, `break` in the middle of a `switch` case, operators on matrices.
- **Arrays**: `.clone()` on arrays of elements with heap data, putting elements with heap data in fixed-length arrays, views onto part of an array, packing two `f4` into one byte, Buffers of 2^32 elements or more.
- **Kernels and GPU**: `f16` / `f8` / `f4` Buffers and kernels, native GPUs other than Metal, combining dispatches across loops (currently only adjacent dispatch statements).
- **I/O**: only the functions in [Input and output](/guide/input-output/). There is no standard error output, appending to files or reading and writing part of a file, directory operations, command-line arguments, or networking.
- **wasm32**: threads (they run on the spot at the join point), simd128.

The following exist in TypeScript, but this language intends not to have them (writing them is an error that shows what to use instead): inheritance (`extends`, `protected`, `abstract`), exceptions (`try` / `throw`; failures are returned as `Result<T, E>`), `var`, `for...in`, union types other than `T | null`, optional fields or arguments, default argument values, `number` / `any`.
