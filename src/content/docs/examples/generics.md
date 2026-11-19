---
title: "generics.um"
description: "A generic function is duplicated with concrete types for each call (no run-time cost)."
---

A generic function is duplicated with concrete types for each call (no run-time cost).

Source: [examples/generics.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/generics.um)

```um title="generics.um"
// ジェネリック関数は、呼び出しごとに具体的な型で複製される（実行時のコストはない）。
// 型引数は実引数の型から決まる。
// expect: 7
// expect: 2.5
// expect: 9
// expect: 3
// expect: 30
// expect: 6.5
// expect: c
// expect: 4
// expect: 2
// expect: 120
// expect: 3
// expect: 8
// expect: 21

struct Point {
  x: i32;
  y: i32;
}

function larger<T>(a: T, b: T): T {
  if (a > b) {
    return a;
  }
  return b;
}

function sum<T>(xs: T[]): T {
  let total: T = 0;
  for (const x of xs) {
    total += x;
  }
  return total;
}

function last<T>(xs: T[]): T {
  return xs[xs.length - 1];
}

function count<T>(xs: T[]): usize {
  return xs.length;
}

function fill<T>(xs: mut T[], value: T, n: i32): void {
  for (let i = 0; i < n; i++) {
    xs.push(value);
  }
}

function pick<A, B>(first: A, second: B, useFirst: bool): A {
  if (useFirst) {
    return first;
  }
  return first;
}

// 自分自身を呼ぶ。
function power<T>(base: T, n: u32): T {
  if (n == 0) {
    return 1;
  }
  return base * power(base, n - 1);
}

// 他のジェネリック関数を呼ぶ。
function largest<T>(xs: T[]): T {
  let best = xs[0];
  for (const x of xs) {
    best = larger(best, x);
  }
  return best;
}

// kernel にもできる。
kernel function clampTo<T>(v: T, lo: T, hi: T): T {
  return Math.min(Math.max(v, lo), hi);
}

kernel function limit(i: u32, out: mut Buffer<i32>, top: i32): void {
  out[i] = clampTo(out[i], 0, top);
}

export function main(): i32 {
  print(larger(3, 7));
  print(larger(2.5, 1.5));
  const big: u64 = 9;
  print(larger(big, 4));

  const ints: i32[] = [1, 2, 3, 4];
  print(count(ints) - 1);
  print(sum(ints) * 3);
  const floats: f64[] = [1.5, 2, 3];
  print(sum(floats));

  let words: string[] = ["a", "b", "c"];
  print(words[count(words) - 1]);
  let more: i32[] = [];
  fill(mut more, 9, 4);
  print(count(more));
  print(last(more) - 7);

  print((power(2, 3) as f64) * power(1.5, 2) / 2.25 * 15 + (pick(0, "x", true) as f64));
  const p: Point = { x: 3, y: 4 };
  print(pick(p, 1.5, false).x);
  print(largest(ints) * 2);

  let buf: Buffer<i32> = [-5, 3, 99];
  dispatch(limit, 3, mut buf, 18);
  print(buf[0] + buf[1] + buf[2]);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
7
2.5
9
3
30
6.5
c
4
2
120
3
8
21
```
