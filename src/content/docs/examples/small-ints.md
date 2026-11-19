---
title: "small_ints.um"
description: "Buffers of 8- and 16-bit integers (i8 / u8 / i16 / u16), and using the same weights on the CPU and the GPU."
---

Buffers of 8- and 16-bit integers (i8 / u8 / i16 / u16), and using the same weights on the CPU and the GPU.

Source: [examples/small_ints.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/small_ints.um)

```um title="small_ints.um"
// 8 / 16 ビットの整数の Buffer（i8 / u8 / i16 / u16）と、CPU と GPU で同じ重みを使う書き方。
//
// - Buffer<i8> などは、CPU では普通の配列と同じに読み書きでき、kernel にも渡せる（GPU でも同じ値になる）。
// - kernel の中の 8 / 16 ビットの値は、読み書き・比較・`as` での変換だけ。計算は `as i32` で広げてから。
// - gpu.submit には、kernel が読むだけの普通の Buffer も渡せる。重みを1つの Buffer に置けば、
//   CPU の評価と GPU の評価が同じ領域を読む（写しを2つ持たなくてよい）。
//
// expect: -540
// expect: -540
// expect: -98
// expect: 300

kernel function affine(i: u32, out: mut RacyBuffer<i32>, w: Buffer<i8>, x: Buffer<u8>, b: Buffer<i16>, n: u32): void {
  let acc: i32 = b[i] as i32;
  for (let k: u32 = 0; k < n; k++) {
    acc = acc + (w[i * n + k] as i32) * (x[k] as i32);
  }
  out[i] = acc;
}

// CPU 版: 同じ Buffer をそのまま読む。
function affineCpu(w: Buffer<i8>, x: Buffer<u8>, b: Buffer<i16>, row: u32, n: u32): i32 {
  let acc: i32 = b[row] as i32;
  for (let k: u32 = 0; k < n; k++) {
    acc = acc + (w[row * n + k] as i32) * (x[k] as i32);
  }
  return acc;
}

export function main(): i32 {
  const rows: u32 = 4;
  const n: u32 = 8;
  let w = new Buffer<i8>(rows * n);
  let x = new Buffer<u8>(n);
  let b = new Buffer<i16>(rows);
  for (let i = 0; i < w.length; i++) { w[i] = ((i as i32) * 7 % 11 - 5) as i8; }
  for (let i = 0; i < x.length; i++) { x[i] = (i * 30 + 20) as u8; }
  for (let i = 0; i < b.length; i++) { b[i] = ((i as i32) * 100 - 150) as i16; }

  let out = new RacyBuffer<i32>(rows);
  const t = gpu.submit(affine, rows, mut out, w, x, b, n);
  const mine = affineCpu(w, x, b, 2, n);   // GPU が計算しているあいだに、CPU も同じ重みを読む
  gpu.wait(t);
  print(out[2]);
  print(mine);

  // 切り詰め: i32 から i8 へは下位 8 ビット（ラップ）。u8 から i32 へは 0 で広げる。
  const big: i32 = 1950;
  print(big as i8);        // 1950 = 7 * 256 + 158 → -98
  print((200 as u8) as i32 + 100);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
-540
-540
-98
300
```
