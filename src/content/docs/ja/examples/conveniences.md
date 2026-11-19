---
title: "conveniences.um"
description: "TypeScript で書き慣れた形のうち、そのまま使えるもの:条件式 `a ? b : c`、初期値を省いた宣言（ゼロで始まる）、length との比較でのループ変数の型合わせ。"
---

TypeScript で書き慣れた形のうち、そのまま使えるもの:条件式 `a ? b : c`、初期値を省いた宣言（ゼロで始まる）、length との比較でのループ変数の型合わせ。

ソース: [examples/conveniences.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/conveniences.um)

```um title="conveniences.um"
// TypeScript で書き慣れた形のうち、そのまま使えるもの:
// 条件式 `a ? b : c`、初期値を省いた宣言（ゼロで始まる）、length との比較でのループ変数の型合わせ。
// 浮動小数点の表示は、どのターゲットでも JavaScript と同じ表記になる。
// expect: 7
// expect: -3
// expect: 2.5
// expect: 0
// expect: 0
// expect: 10
// expect: 22
// expect: 3
// expect: 1000000000000000
// expect: 0.00001
// expect: 1e-7
// expect: 1e+21
// expect: 0.30000000000000004
// expect: 5

struct Stats {
  count: i32;
  sum: f64;
  hist: u32[4];
}

function sign(x: i32): i32 {
  return x > 0 ? 1 : x < 0 ? -1 : 0;
}

kernel function relu(i: u32, out: mut Buffer<f32>, src: Buffer<f32>): void {
  const v = src[i];
  out[i] = v > 0 ? v : 0;
}

export function main(): i32 {
  const a = 7;
  const b = -3;
  print(a > b ? a : b);
  print(a > b ? b : a);
  const half: f64 = sign(a) > 0 ? 2.5 : 0;
  print(half);

  // 初期値を省くとゼロで始まる（数値、bool、固定長配列、struct）。
  let total: i64;
  let grid: i32[8];
  let stats: Stats;
  print(total);
  print(stats.count + (grid[3] as i32) + (stats.hist[2] as i32));

  let xs: i32[] = [1, 2, 3, 4];
  // i は xs.length と同じ型（usize）になる。
  for (let i = 0; i < xs.length; i++) {
    total += xs[i] as i64;
  }
  print(total);
  // 条件の左辺が式でも同じ。
  let pairs = 0;
  for (let i = 0; i + 1 < xs.length; i += 2) {
    pairs += xs[i] * 10 + xs[i + 1];
  }
  print(pairs - 24);

  const src: Buffer<f32> = [-1, 3, -2];
  let out = new Buffer<f32>(3);
  dispatch(relu, 3, mut out, src);
  print(out[0] + out[1] + out[2]);

  print(1000000000000000.0);
  print(0.00001);
  print(0.0000001);
  print(1e21);
  print(0.1 + 0.2);
  print(sign(-9) + sign(4) + 5);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
7
-3
2.5
0
0
10
22
3
1000000000000000
0.00001
1e-7
1e+21
0.30000000000000004
5
```
