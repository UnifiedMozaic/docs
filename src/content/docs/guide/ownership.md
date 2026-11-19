---
title: Ownership
description: Memory management without a GC, through borrowing, mutable borrowing and moving.
sidebar:
  order: 4
---

Values with heap data (strings, growable arrays, `Buffer`, and `struct` / `class` values that hold them in fields) always have exactly one owner. Neither a GC nor reference counting is used.

```um
function total(xs: i32[]): i32 { ... }          // borrow (read only)
function fill(xs: mut i32[]): void { ... }      // mutable borrow (modifies)
function consume(xs: own i32[]): void { ... }   // takes ownership

let a: i32[] = [1, 2, 3];
total(a);          // only lends it; a can still be used
fill(mut a);
const b = a;       // move; a can no longer be used (compile error)
const c = b.clone(); // use clone when you want an independent copy
consume(own b);    // hand over ownership
// c is freed automatically when it goes out of scope
```

- **Moves happen on** assignment, `return`, `own` arguments, and fields of object literals.
- **Only a whole variable can be moved.** You cannot take a value out of a field or element, or move a borrowed value (use `clone()`).
- **Numbers, and `struct` / `class` values and fixed-length arrays without heap data, are copied as before.**
- **Growable arrays can also own elements with heap data** (`string[]`, `i32[][]`, arrays of structs holding strings or arrays, and structs holding arrays of themselves = trees). `push` and array literals move elements in, and `pop()` returns an element with its ownership. `xs[i]` only borrows; you cannot take the element out and move it. An array literal of arrays is created with its type written (`let g: i32[][] = [a, b];`; without the type it is taken to be a fixed-length array, which is an error).
- **`.clone()` on arrays of elements with heap data, and putting elements with heap data in fixed-length arrays `T[N]`, are not available yet.** To duplicate, loop over the elements, `.clone()` each one and `push` it.
- **Fixed-length arrays and `struct`s can hold at most 4096 values.** They are copied as values, so use `T[]` or `Buffer<T>` for large data.
- **`===` / `!==` are accepted with the same meaning as `==` / `!=`.**

Examples: [examples/ownership.um](/examples/ownership/), [examples/nested_arrays.um](/examples/nested-arrays/).
