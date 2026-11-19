---
title: "simd.um"
description: "128-bit SIMD vectors: i8x16 / u8x16 / i16x8 / u16x8 / i32x4 / u32x4 / f32x4."
---

128-bit SIMD vectors: i8x16 / u8x16 / i16x8 / u16x8 / i32x4 / u32x4 / f32x4.

Source: [examples/simd.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/simd.um)

```um title="simd.um"
// 128 ビットの SIMD のベクトル: i8x16 / u8x16 / i16x8 / u16x8 / i32x4 / u32x4 / f32x4。
// 型は同じ要素の固定長配列の別名（i16x8 は i16[8]）なので、添字で各レーンを読み書きでき、struct のフィールドや
// 配列の要素にもできる。+ - * はレーンごと（整数はラップ）。CPU だけで使える（kernel ではエラー）。
//
// NNUE の差分更新（i16 の加減）とアフィン層（i8 の内積）を、ベクトル 1 本ずつで書く例。
//
// expect: 6
// expect: -32768
// expect: -8
// expect: -1
// expect: 4.5
// expect: 1
// expect: 1
// expect: 9
// expect: 2

// 累積の差分更新: acc += w[add] - w[sub]（i16 のラップ）。
function update(acc: mut i16[], w: i16[], add: u32, sub: u32, n: u32): void {
  for (let j: u32 = 0; j < n; j += 8) {
    const v = Simd.load(acc, j) + Simd.load(w, add * n + j) - Simd.load(w, sub * n + j);
    Simd.store(mut acc, j, v);
  }
}

// i8 の内積（u8 の入力は 0〜127 に収まっているので i8 として掛ける。NEON の sdot になる）。
function dot8(x: i8[], w: i8[], n: u32): i32 {
  let acc: i32x4;
  for (let j: u32 = 0; j < n; j += 16) {
    acc = Simd.dot(acc, Simd.load(x, j), Simd.load(w, j));
  }
  return Simd.sum(acc);
}

export function main(): i32 {
  const a: i16x8 = [1, 2, 3, 4, 5, 6, 7, 32767];
  const b: i16x8 = Simd.splat(1);
  const c = a + b;
  print(c[4] as i32);       // 5 + 1
  print(c[7] as i32);       // 32767 + 1 はラップ

  const n: u32 = 32;
  let acc = new Array<i16>(n as usize);
  let w = new Array<i16>((4 * n) as usize);
  for (let i = 0; i < w.length; i++) { w[i] = (i % 50) as i16; }
  update(mut acc, w, 3, 1, n);
  print(acc[5] as i32 + (acc[20] as i32) * 2);   // (w[101] - w[37]) + 2 (w[116] - w[52]) = (1 - 37) + 2 * (16 - 2)

  // min / max / shuffle
  const p: i32x4 = [5, -3, 8, 0];
  const q: i32x4 = [1, 2, 3, 4];
  const lo = Simd.min(p, q);
  const mix = Simd.shuffle(p, q, [0, 4, 1, 5]);   // [p0, q0, p1, q1]
  print(lo[3] + mix[1] + mix[3] - 4);             // 0 + 1 + 2 - 4
  const f: f32x4 = [1.5, 2, 0.5, 0.5];
  print(Simd.sum(f));

  // dot（i8）と mulAddWide（i16 の隣どうしの積の和）
  let xs = new Array<i8>(64);
  let ws = new Array<i8>(64);
  let want = 0;
  for (let i = 0; i < 64; i++) {
    xs[i] = (i % 128) as i8;
    ws[i] = (i % 7 - 3) as i8;
    want = want + (i % 128) * (i % 7 - 3);
  }
  print(dot8(xs, ws, 64) == want ? 1 : 0);
  const s: i16x8 = [1000, 2000, -3, 4, 5, 6, 7, 8];
  const t: i16x8 = [30000, 30000, 2, 2, 1, 1, 1, 1];
  const m = Simd.mulAddWide(Simd.splat(0), s, t);   // [1000*30000 + 2000*30000, -6 + 8, 11, 15]
  print(m[0] == 90000000 && m[1] == 2 ? 1 : 0);
  print(m[2] - 2);
  // 範囲の端: 最後の 16 要素はちょうど読める
  print(Simd.load(xs, 48)[15] as i32 - 61);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
6
-32768
-8
-1
4.5
1
1
9
2
```
