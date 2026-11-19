---
title: "hoisted_loops.um"
description: "添字が i ± 定数 の for ループは、境界検査をループの外で済ませる。"
---

添字が i ± 定数 の for ループは、境界検査をループの外で済ませる。

ソース: [examples/hoisted_loops.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/hoisted_loops.um)

```um title="hoisted_loops.um"
// 添字が i ± 定数 の for ループは、境界検査をループの外で済ませる。
// 結果は検査つきのときと同じでなければならない。
// expect: 8068791
// expect: 57
// expect: 21
// expect: 9
// expect: 15
// expect: 70
// expect: 40
// expect: 6

function stencil(dst: mut i64[], src: i64[]): void {
  for (let i: usize = 1; i + 1 < src.length; i++) {
    dst[i] = src[i - 1] + src[i] * 2 + src[i + 1];
  }
}

function twice(x: i32): i32 {
  return x * 2;
}

export function main(): i32 {
  let a: i64[] = [];
  let b: i64[] = [];
  for (let i = 0; i < 1000; i++) {
    a.push((i * 7 % 13) as i64 + i as i64);
    b.push(0);
  }
  stencil(mut b, a);
  stencil(mut a, b);
  let sum: i64 = 0;
  for (const v of a) {
    sum += v;
  }
  print(sum);

  // 配列がループの中で伸びる: この配列は対象から外れ、毎回検査される。
  let grow: i32[] = [1, 2, 3];
  for (let i = 0; i < 6; i++) {
    if (i < 3) {
      grow.push(grow[i] * 2);
    }
  }
  let g = 0;
  for (let i = 0; i < 6; i++) {
    g += grow[i];
  }
  print(g + 39);

  // 逆向き、飛び飛び、途中で抜ける。
  let xs: i32[] = [1, 2, 3, 4, 5, 6];
  let r = 0;
  for (let i = 5; i >= 0; i--) {
    r += xs[i];
  }
  print(r);
  r = 0;
  for (let i = 0; i < 6; i += 2) {
    r += xs[i];
  }
  print(r);
  r = 0;
  for (let i = 0; i < 6; i++) {
    if (xs[i] == 4) {
      continue;
    }
    if (xs[i] == 6) {
      break;
    }
    r += twice(xs[i]) / 2 + 1;
  }
  print(r);

  // 入れ子。外側と内側の両方の変数が添字になる。
  let grid: i32[] = [];
  for (let i = 0; i < 20; i++) {
    grid.push(i % 5);
  }
  r = 0;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 5; x++) {
      r += grid[x] + grid[y];
    }
  }
  print(r);

  // 条件式に副作用がある（呼び出し回数が変わってはいけない）。
  let calls: i32[] = [0];
  let total = 0;
  for (let i = 0; bump(mut calls) <= 9; i++) {
    total += xs[i % 6] + xs[0] - 1;
    if (i < 6) {
      total += xs[i] - xs[i];
    }
  }
  print(total + calls[0] + 3);

  // ループ変数が配列より先へ進んでも、アクセスしなければ止まらない。
  r = 0;
  for (let i: u32 = 0; i < 100; i++) {
    if (i < 3) {
      r += xs[i];
    }
  }
  print(r);
  return 0;
}

function bump(c: mut i32[]): i32 {
  c[0] = c[0] + 1;
  return c[0];
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
8068791
57
21
9
15
70
40
6
```
