---
title: "bitnet.um"
description: "BitNet 風の線形層: 重みは -1 / 0 / +1 の3値で、掛け算が要らない。"
---

BitNet 風の線形層: 重みは -1 / 0 / +1 の3値で、掛け算が要らない。

ソース: [examples/bitnet.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/bitnet.um)

```um title="bitnet.um"
// BitNet 風の線形層: 重みは -1 / 0 / +1 の3値で、掛け算が要らない。
// 重みは1個あたり2ビット（00 = 0、01 = +1、10 = -1）で u32 に16個ずつ詰めて持つ。
// 出力1個ぶんを kernel の1回の実行が担当するので、GPU でもそのまま並列に動く形になっている。
// expect: 6
// expect: -3
// expect: 0
// expect: 9
// expect: 5
// expect: 8
// expect: 31

struct Layer {
  inputs: u32;
  outputs: u32;
}

// 出力 row の重み col を取り出す。
kernel function weightAt(packed: Buffer<u32>, inputs: u32, row: u32, col: u32): i32 {
  const index = row * inputs + col;
  const bits = (packed[index / 16] >> ((index % 16) * 2)) & 3;
  if (bits == 1) {
    return 1;
  }
  if (bits == 2) {
    return -1;
  }
  return 0;
}

kernel function forward(i: u32, out: mut Buffer<i32>, packed: Buffer<u32>, x: Buffer<i32>, layer: Layer): void {
  let sum = 0;
  for (let j: u32 = 0; j < layer.inputs; j++) {
    const w = weightAt(packed, layer.inputs, i, j);
    // 3値なので、掛け算の代わりに足すか引くかを選ぶだけでよい。
    if (w == 1) {
      sum += x[j];
    } else if (w == -1) {
      sum -= x[j];
    }
  }
  out[i] = sum;
}

// ゼロでない重みの数を、ビット演算だけで数える（2ビットの組のどちらかが立っていれば非ゼロ）。
kernel function countNonZero(i: u32, out: mut Buffer<u32>, packed: Buffer<u32>): void {
  const word = packed[i];
  const low = word & 0x55555555;
  const high = (word >> 1) & 0x55555555;
  out[i] = Math.popcount(low | high);
}

function setWeight(packed: mut Buffer<u32>, index: u32, w: i32): void {
  let bits: u32 = 0;
  if (w == 1) {
    bits = 1;
  } else if (w == -1) {
    bits = 2;
  }
  const shift = (index % 16) * 2;
  const cleared = packed[index / 16] & ~(3 as u32 << shift);
  packed[index / 16] = cleared | (bits << shift);
}

export function main(): i32 {
  const layer: Layer = { inputs: 4, outputs: 3 };
  let packed = new Buffer<u32>(1);

  // 3行4列の重み
  const weights: i32[12] = [
    1, 1, 1, 0,
    -1, 0, 0, -1,
    1, -1, 1, -1,
  ];
  for (let k: u32 = 0; k < 12; k++) {
    setWeight(mut packed, k, weights[k]);
  }

  const x: Buffer<i32> = [1, 2, 3, 2];
  let y = new Buffer<i32>(3);
  dispatch(forward, layer.outputs, mut y, packed, x, layer);
  for (const v of y) {
    print(v);
  }

  let nonZero = new Buffer<u32>(1);
  dispatch(countNonZero, 1, mut nonZero, packed);
  print(nonZero[0]);

  print(Math.popcount(0b10110 as u32) + Math.ctz(4 as u32));
  print(Math.popcount(-1 as i8));
  print(Math.clz(1 as u32));
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
6
-3
0
9
5
8
31
```
