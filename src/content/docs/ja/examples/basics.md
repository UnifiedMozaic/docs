---
title: "basics.um"
description: "関数・再帰・ループ・条件分岐。"
---

関数・再帰・ループ・条件分岐。

ソース: [examples/basics.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/basics.um)

```um title="basics.um"
// 関数・再帰・ループ・条件分岐。
// expect: 55
// expect: 3628800
// expect: 25
// expect: true
// expect: 2.5

function fib(n: i32): i32 {
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

function factorial(n: i64): i64 {
  let r: i64 = 1;
  for (let i: i64 = 2; i <= n; i++) {
    r *= i;
  }
  return r;
}

function sumOdd(limit: i32): i32 {
  let sum = 0;
  let i = 0;
  while (true) {
    i += 1;
    if (i > limit) {
      break;
    }
    if (i % 2 === 0) {
      continue;
    }
    sum += i;
  }
  return sum;
}

function isEven(n: i32): bool {
  return n % 2 == 0 && n >= 0 || n == -2;
}

function average(a: f64, b: f64): f64 {
  return (a + b) / 2;
}

export function main(): i32 {
  print(fib(10));
  print(factorial(10));
  print(sumOdd(10));
  print(isEven(4));
  print(average(2, 3));
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
55
3628800
25
true
2.5
```
