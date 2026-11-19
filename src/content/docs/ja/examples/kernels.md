---
title: "kernels.um"
description: "kernel 関数は GPU でも実行できる関数。dispatch で、0 から count 未満の各添字について実行する。"
---

kernel 関数は GPU でも実行できる関数。dispatch で、0 から count 未満の各添字について実行する。

ソース: [examples/kernels.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/kernels.um)

```um title="kernels.um"
// kernel 関数は GPU でも実行できる関数。dispatch で、0 から count 未満の各添字について実行する。
// 実行先（CPU か GPU）は dispatch が選ぶ。どちらで実行しても同じ結果になるよう意味を定義してある:
//   - 書き込みは `mut` の Buffer の [i] だけ（各要素を別々の実行が担当するので競合しない）
//   - 範囲外の添字は停止せず、最後の要素に切り詰める
//   - 整数のゼロ除算は停止せず x / 0 = x、x % 0 = 0。シフト量はビット幅で割った余り

struct Particle {
  pos: f32;
  vel: f32;
}

kernel function integrate(i: u32, ps: mut Buffer<Particle>, dt: f32): void {
  ps[i].pos = ps[i].pos + ps[i].vel * dt;
}

// kernel から呼べる補助関数も kernel として書く。
kernel function lerp(a: f32, b: f32, t: f32): f32 {
  return a + (b - a) * t;
}

kernel function mix(i: u32, out: mut Buffer<f32>, a: Buffer<f32>, b: Buffer<f32>, t: f32): void {
  out[i] = lerp(a[i], b[i], t);
}

// 隣の要素は、書き込み先とは別の Buffer から読む。
kernel function blur(i: u32, out: mut Buffer<f32>, src: Buffer<f32>): void {
  let left = i;
  if (i > 0) {
    left = i - 1;
  }
  // 右端では i + 1 が範囲外になり、最後の要素に切り詰められる。
  out[i] = (src[left] + src[i] + src[i + 1]) / 3;
}

kernel function collatz(i: u32, steps: mut Buffer<u32>): void {
  let n = i + 1;
  let count: u32 = 0;
  while (n != 1) {
    if (n % 2 == 0) {
      n = n / 2;
    } else {
      n = 3 * n + 1;
    }
    count++;
  }
  steps[i] = count;
}

kernel function edgeCases(i: u32, out: mut Buffer<i32>, d: Buffer<i32>): void {
  out[i] = 100 / d[i] + 7 % d[i] + (1 << (d[i] + 32));
}

kernel function norm(i: u32, out: mut Buffer<f32>, xs: Buffer<f32>, ys: Buffer<f32>): void {
  const len = Math.sqrt(xs[i] * xs[i] + ys[i] * ys[i]);
  out[i] = Math.min(len, 10) + Math.abs(xs[i]) * 0;
}

// expect: 0.5
// expect: 2
// expect: 4.5
// expect: 2.5
// expect: 1
// expect: 2
// expect: 3
// expect: 3.5
// expect: 0
// expect: 1
// expect: 7
// expect: 8
// expect: 111
// expect: 101
// expect: 54
// expect: 5
// expect: 10
// expect: 4
// expect: 9
export function main(): i32 {
  let ps: Buffer<Particle> = [
    { pos: 0, vel: 1 },
    { pos: 1, vel: 2 },
    { pos: 2, vel: 5 },
  ];
  dispatch(integrate, ps.length, mut ps, 0.5);
  for (const p of ps) {
    print(p.pos);
  }

  const a: Buffer<f32> = [0, 10, 20];
  const b: Buffer<f32> = [10, 20, 30];
  let mixed = new Buffer<f32>(3);
  cpu.dispatch(mix, 1, mut mixed, a, b, 0.25);
  print(mixed[0]);

  const src: Buffer<f32> = [0, 3, 3, 3, 4.5];
  let smooth = new Buffer<f32>(5);
  dispatch(blur, 5, mut smooth, src);
  print(smooth[0]);
  print(smooth[1]);
  print(smooth[2]);
  print(smooth[3]);

  let steps = new Buffer<u32>(27);
  dispatch(collatz, steps.length, mut steps);
  print(steps[0]);
  print(steps[1]);
  print(steps[2]);
  print(steps[5]);
  print(steps[26]);

  const divisors: Buffer<i32> = [0, 5];
  let results = new Buffer<i32>(2);
  dispatch(edgeCases, 2, mut results, divisors);
  print(results[0]);
  print(results[1]);

  const xs: Buffer<f32> = [3, 30];
  const ys: Buffer<f32> = [4, 40];
  let lens = new Buffer<f32>(2);
  dispatch(norm, 2, mut lens, xs, ys);
  print(lens[0]);
  print(lens[1]);

  // Math は kernel の外でも使える。
  print(Math.max(Math.abs(-4), 3));
  print(Math.floor(9.75));
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
0.5
2
4.5
2.5
1
2
3
3.5
0
1
7
8
111
101
54
5
10
4
9
```
