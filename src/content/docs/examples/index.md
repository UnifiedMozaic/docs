---
title: "Examples"
description: "Runnable UnifiedMozaic programs from the main repository."
sidebar:
  order: 0
---

These programs come from [`examples/`](https://github.com/UnifiedMozaic/UnifiedMozaic/tree/main/examples) in the main repository, quoted as they are. Every one of them is runnable and doubles as a test: the test runner (`node tests/run.ts`) compares the output with the `// expect:` lines.

Comments in the code are in Japanese, as in the original files.

| Program | About |
| --- | --- |
| [arrays.um](/examples/arrays/) | Fixed-length arrays. Indexing is bounds-checked. |
| [audit_regressions.um](/examples/audit-regressions/) | Regression tests for bugs found in an audit. Each of them used to read freed memory or free memory twice. |
| [bank_accounts.um](/examples/bank-accounts/) | A bank simulation with a class that holds an array of structs: i64 balances, fees, frozen accounts and counting failures. |
| [basics.um](/examples/basics/) | Functions, recursion, loops and conditionals. |
| [bitnet.um](/examples/bitnet/) | A BitNet-style linear layer: the weights are ternary (-1 / 0 / +1), so no multiplication is needed. |
| [bytes_and_files.um](/examples/bytes-and-files/) | stringFromBytes, which makes a string from bytes; readFile / writeFile, which read and write a whole file; and the clock. |
| [class_enum_default.um](/examples/class-enum-default/) | An enum can be used as the initial value of a class field. A user-defined type with a type parameter of the same name can be passed to a standard generic type. |
| [classes.um](/examples/classes/) | A class is a value type without inheritance. Methods and the constructor are written inside it. |
| [conveniences.um](/examples/conveniences/) | Forms familiar from TypeScript that work as they are: the conditional expression `a ? b : c`, declarations without an initial value (they start at zero), and the loop variable taking its type from a comparison with length. |
| [do_while.um](/examples/do-while/) | do ... while runs the body at least once before checking the condition. |
| [enums.um](/examples/enums/) | An enum is a value that is one of several choices. Each choice can carry values. |
| [fill.um](/examples/fill/) | Bulk writes xs.fill(v) / xs.fill(v, start, end). Available on growable arrays, Buffer and RacyBuffer. |
| [game_of_life.um](/examples/game-of-life/) | Game of Life with a kernel and two Buffers. Each round dispatches twice, a→b and b→a (a Buffer cannot be moved to swap them inside a loop). |
| [generic_classes.um](/examples/generic-classes/) | Generic classes. Fields and methods are duplicated for each type they are used with. |
| [generic_structs.um](/examples/generic-structs/) | A generic struct is duplicated for each combination of types it is used with. |
| [generics.um](/examples/generics/) | A generic function is duplicated with concrete types for each call (no run-time cost). |
| [global_consts.um](/examples/global-consts/) | Top-level constants: `const NAME: T = constant expression;`. The value is computed at compile time, and where it is used it is a value of that type. |
| [gpu_submit.um](/examples/gpu-submit/) | gpu.submit asks for a kernel to run and returns without waiting for it to finish. It returns a ticket (u64). |
| [half_arith.um](/examples/half-arith/) | Arithmetic on f16 over many random values, printing a summary value of the results. |
| [half_floats.um](/examples/half-floats/) | f16 is IEEE 754 half precision (16 bits). The result of an operation is the exact value rounded to f16. |
| [histogram_bits.um](/examples/histogram-bits/) | A histogram (an array of structs), xorshift64, and counting bits with popcount / clz / ctz. |
| [hoisted_loops.um](/examples/hoisted-loops/) | A for loop whose index is i ± a constant does its bounds checks outside the loop. |
| [input_lines.um](/examples/input-lines/) | Reading standard input line by line. readLine() returns a line without the newline, and null at the end of input. |
| [interfaces.um](/examples/interfaces/) | An interface is a promise that a type has certain methods. A class meets it with implements, and a generic function requires it with `T extends Name`. Calls are resolved at compile time (no run-time cost). |
| [kernel_edges.um](/examples/kernel-edges/) | Calling a kernel directly as an ordinary function, or passing an empty Buffer, is still memory-safe with a defined result. |
| [kernel_neighbours.um](/examples/kernel-neighbours/) | Inside a kernel, putting the index of a neighbouring element in a variable before reading it. |
| [kernels.um](/examples/kernels/) | A kernel function is a function that can also run on the GPU. dispatch runs it for each index from 0 up to (but not including) count. |
| [masked_shift.um](/examples/masked-shift/) | Masked shifts Math.shl / Math.shr, and bounds-check elimination. |
| [matrices.um](/examples/matrices/) | mat2 / mat3 / mat4 are the standard matrix types. Products and transposes are computed with functions, and they can be used inside kernels. |
| [matrix_class.um](/examples/matrix-class/) | A matrix of f64[] wrapped in a class (product, transpose, trace). Its methods modify this, so it is declared with let. |
| [min_heap.um](/examples/min-heap/) | A binary heap (priority queue) class on i32[]. It uses a private array field and usize index arithmetic. |
| [nested_arrays.um](/examples/nested-arrays/) | Growable arrays can own elements that have heap data (strings, arrays, and structs holding them). |
| [nested_arrays_stress.um](/examples/nested-arrays-stress/) | Exercises freeing and moving in arrays whose elements have heap data (checked by the memory-checked runs). |
| [nullable.um](/examples/nullable/) | `T \| null` expresses in the type that there may be no value. |
| [numbers.um](/examples/numbers/) | Integers wrap by default. Type conversions are explicit with as. |
| [optional_arrays.um](/examples/optional-arrays/) | A parenthesised type: an array of strings that may be null. |
| [ownership.um](/examples/ownership/) | A growable array `T[]` (the same type as `Array<T>`) keeps its elements on the heap. |
| [packed_weights.um](/examples/packed-weights/) | Using the standard functions to pack ternary (-1 / 0 / +1) weights at 2 bits each and compute a sum of products. |
| [parallel_kernels.um](/examples/parallel-kernels/) | On native targets, a large dispatch is split across multiple threads. |
| [particles_kernel.um](/examples/particles-kernel/) | A particle simulation that updates a Buffer of structs with a kernel. The f32 results match f32 arithmetic in other languages. |
| [prefetch.um](/examples/prefetch/) | Prefetching with Math.prefetch(arr, i), which asks the CPU to load the memory holding arr[i] into the cache before it is used. |
| [racy_buffer.um](/examples/racy-buffer/) | A RacyBuffer is a Buffer that may be read and written without synchronisation. |
| [racy_shared.um](/examples/racy-shared/) | The sharing rules for RacyBuffer: elements can be written through a read-only borrow, and a read-only borrow can be passed as it is to a kernel's mut RacyBuffer. |
| [results.um](/examples/results/) | Enum choices can also carry values with heap data, such as strings and arrays. |
| [simd.um](/examples/simd/) | 128-bit SIMD vectors: i8x16 / u8x16 / i16x8 / u16x8 / i32x4 / u32x4 / f32x4. |
| [small_float_arith.um](/examples/small-float-arith/) | Arithmetic on f8 / f4 over many random values, printing a summary value of the results. |
| [small_floats.um](/examples/small-floats/) | f8 and f4 are 8-bit and 4-bit floating-point types, for data where memory size matters, such as quantised weights. |
| [small_ints.um](/examples/small-ints/) | Buffers of 8- and 16-bit integers (i8 / u8 / i16 / u16), and using the same weights on the CPU and the GPU. |
| [sorting.um](/examples/sorting/) | Sorting a random sequence from an LCG class with quicksort (mutable borrow) and merge sort (returns an array). |
| [strings.um](/examples/strings/) | A string is an immutable value holding UTF-8 bytes. Like an array, it is owned and moves on assignment. |
| [structs.um](/examples/structs/) | Structs are value types. Unqualified arguments are read-only borrows; mut is a mutable borrow. |
| [swap_in_loop.um](/examples/swap-in-loop/) | Swapping inside a loop. A moved variable can be used in the next iteration if it is assigned again before the end of the current one. |
| [switches.um](/examples/switches/) | switch can replace a chain of ifs. Each case ends with break or return. |
| [threads.um](/examples/threads/) | Threads: thread.spawn / thread.spawnEach / thread.join, sharing a RacyBuffer, and atomic operations. |
| [tokenizer.um](/examples/tokenizer/) | Splitting i32[] character codes into tokens with a state machine. Uses an array of structs, u8 fields and i64 numbers. |
| [vectors.um](/examples/vectors/) | vec2 / vec3 / vec4 are standard types. Operators work component-wise, and they can be used inside kernels. |
