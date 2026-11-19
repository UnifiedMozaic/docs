---
title: "packed_weights.um"
description: "標準の関数で、3値（-1 / 0 / +1）の重みを1個2ビットに詰めて持ち、積和を取る。"
---

標準の関数で、3値（-1 / 0 / +1）の重みを1個2ビットに詰めて持ち、積和を取る。

ソース: [examples/packed_weights.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/packed_weights.um)

```um title="packed_weights.um"
// 標準の関数で、3値（-1 / 0 / +1）の重みを1個2ビットに詰めて持ち、積和を取る。
// 同じ計算を、詰めていない i32 の重みでも行い、結果が一致することを確かめる。
// expect: 13
// expect: 0
// expect: 1
// expect: -1
// expect: -2
// expect: 1
// expect: 0
// expect: 3
// expect: 0
// expect: 1024

struct Layer {
  inputs: u32;
}

kernel function forward(i: u32, out: mut Buffer<i32>, weights: Buffer<u32>, x: Buffer<i32>, layer: Layer): void {
  out[i] = ternaryDot(weights, i * layer.inputs, x, 0, layer.inputs);
}

export function main(): i32 {
  const inputs: u32 = 100;
  const outputs: u32 = 5000;
  print(packed2Words(inputs * outputs) / 1000 + packed2Words(17) - 20 + packed2Words(0));

  let weights = new Buffer<u32>(packed2Words(inputs * outputs));
  let plain = new Buffer<i32>(inputs * outputs);
  let seed: u32 = 2463534242;
  for (let k: u32 = 0; k < inputs * outputs; k++) {
    seed = seed * 1664525 + 1013904223;
    const w = (((seed >> 16) % 3) as i32) - 1;
    packed2Set(mut weights, k, w);
    plain[k] = w;
  }
  let mismatch = 0;
  for (let k: u32 = 0; k < inputs * outputs; k++) {
    if (packed2Get(weights, k) != plain[k]) {
      mismatch += 1;
    }
  }
  print(mismatch);

  // 2ビットの全パターン: 1、-1、-2（そのまま読める）。
  let probe = new Buffer<u32>(1);
  packed2Set(mut probe, 0, 1);
  packed2Set(mut probe, 1, -1);
  packed2Set(mut probe, 2, -2);
  packed2Set(mut probe, 15, 5);
  print(packed2Get(probe, 0));
  print(packed2Get(probe, 1));
  print(packed2Get(probe, 2));
  print(packed2Get(probe, 15));
  print(packed2Get(probe, 3));

  let x = new Buffer<i32>(inputs);
  for (let j: u32 = 0; j < inputs; j++) {
    x[j] = ((j * 37) % 21) as i32 - 10;
  }
  let out = new Buffer<i32>(outputs);
  dispatch(forward, outputs, mut out, weights, x, { inputs: inputs });

  let wrong = 0;
  for (let i: u32 = 0; i < outputs; i++) {
    let sum = 0;
    for (let j: u32 = 0; j < inputs; j++) {
      sum += plain[i * inputs + j] * x[j];
    }
    if (sum != out[i]) {
      wrong += 1;
    }
  }
  print(wrong + 3);

  // 1ビットの列。
  let bits = new Buffer<u32>(packed1Words(1024));
  for (let k: u32 = 0; k < 1024; k += 3) {
    packed1Set(mut bits, k, 1);
  }
  let ones: u32 = 0;
  for (let k: u32 = 0; k < 1024; k++) {
    ones += packed1Get(bits, k);
  }
  print(ones - 342);
  print(bits.length * 32);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
13
0
1
-1
-2
1
0
3
0
1024
```
