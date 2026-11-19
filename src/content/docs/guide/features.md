---
title: More features and top-level constants
description: enum and match, Result, nullable types, generics, interfaces, strings, top-level constants and more.
sidebar:
  order: 2
---

## More features

Short descriptions with examples. Every example doubles as a test and runs as it is.

| Feature | Key points | Examples |
| --- | --- | --- |
| `enum` and `match` | Each choice can carry values (`Shape.Circle(1.5)`). `match` is a statement, and not handling every choice is a compile error. Enums whose values are only `i32` / `u32` / `f32` / `bool` can also be used in kernels. | [enums.um](/examples/enums/) |
| `Result<T, E>` | A standard enum (`Result.Ok(v)` / `Result.Err(e)`). Enum values can also hold strings and arrays. There are no exceptions (`try` / `throw`). | [results.um](/examples/results/) |
| `T \| null` | Check before use, for example with `if (x != null)` (only `const` variables are narrowed). `x ?? default` also works. To use it as an array element type, wrap it in parentheses: `(string \| null)[]`. There are no other union types. | [nullable.um](/examples/nullable/), [optional_arrays.um](/examples/optional-arrays/) |
| Generics | `function f<T>(...)`, `struct Pair<A, B>`, `class Stack<T>`, `enum Maybe<T>`. Type arguments are inferred from the arguments (or the expected type), and the code is duplicated for each type used. Generic methods and exporting generic functions are not available yet. | [generics.um](/examples/generics/), [generic_structs.um](/examples/generic-structs/), [generic_classes.um](/examples/generic-classes/) |
| `interface` | A promise that a type has certain methods. A class meets it with `implements`, and a generic function requires it with `T extends Name`. Calls are resolved at compile time. An interface cannot be used as the type of a value. | [interfaces.um](/examples/interfaces/) |
| `switch` / `do ... while` | `switch` branches on integers, `bool` and strings. Each `case` ends with `break` / `return` / `continue` (falling through to the next case is an error; listing several labels to share a body is allowed). | [switches.um](/examples/switches/), [do_while.um](/examples/do-while/) |
| Strings | An immutable value holding UTF-8 bytes. Concatenate with `+` and compare with `==`; `.length` and `s[i]` work in bytes. | [strings.um](/examples/strings/) |
| Arrays of elements with heap data | You can write `string[]`, `i32[][]`, arrays of structs that hold arrays, and structs holding arrays of themselves (trees) (see [Ownership](/guide/ownership/)). | [nested_arrays.um](/examples/nested-arrays/) |
| Vectors and matrices | `vec2` / `vec3` / `vec4` compute component-wise with operators. `mat2` / `mat3` / `mat4` are computed with functions (such as `mat3Mul`). `f32` / `i32` / `u32` vectors can be used in kernels and in `Buffer`, and matrices inside kernels. | [vectors.um](/examples/vectors/), [matrices.um](/examples/matrices/) |
| Small floating-point types | `f16` (IEEE 754 half precision), `f8` (FP8 E4M3), `f4` (FP4 E2M1). The result of an operation is the exact value rounded to that type. They cannot be used in kernels or `Buffer` yet. | [half_floats.um](/examples/half-floats/), [small_floats.um](/examples/small-floats/) |
| Multiple files | `import { a, b } from "./lib/math.um";`. Only what the other file marks with `export` can be imported. All files share one namespace. | [tests/modules/basic](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/tests/modules/basic/main.um) |

## Top-level constants

You can write named constants outside functions. Their values are computed at compile time.

```um
const FILES: i32 = 9;
const SQUARES: i32 = FILES * FILES;        // can use other constants
const BIG: u64 = (1 as u64) << 40;
export const NAME: string = "um-engine";   // can be imported from other files

function sum(xs: i32[SQUARES]): i32 { ... } // can also be the length of a fixed-length array
```

- **The type is always written.** Allowed types are integers, `f32`, `f64`, `bool` and `string` (constants of arrays or `struct`s, and of `f4` / `f8` / `f16`, are not available yet).
- **The initialiser can only contain literals, other constants, unary and binary operators, `as` and parentheses.** Function calls and the like are compile errors. Constants can use each other regardless of the order they are written in (mutual dependence is an error).
- **Values are computed with the same meaning as at run time.** The expression is type-checked with the same rules as `const x: T = expression` (literals take the constant's type). Integers wrap, and conversion from floating point to integer saturates. `&&` / `||` do not compute the right-hand side if the left-hand side decides the result. Computations that would stop the program at run time (integer division by zero, shifts by the bit width or more) are compile errors.
- **Where it is used, it is treated as a value of its type.** There are no implicit conversions, so using an `i32` constant where a `usize` is expected needs `as`. In `for (let i = 0; i < N; i++)`, `i` gets the type of `N`.
- **They can be used inside kernels** (only constants of types usable in kernels; the same values go into the code for the GPU).
- **An argument or local variable with the same name takes precedence.** Assigning to a constant is a compile error. A constant cannot have the same name as a function or type (all files share one namespace, and the names of standard functions and types such as `vec3` or `vec3Add` cannot be used either). The `N` in an array length `T[N]` refers only to top-level constants, so a local variable with the same name at that point is a compile error.
- **They can be written in `switch` `case`s** (because a `case` can contain an expression).
- **There are no global variables (top-level `let`).** Keep changing values inside functions and pass them as `mut` arguments.

Example: [examples/global_consts.um](/examples/global-consts/).
