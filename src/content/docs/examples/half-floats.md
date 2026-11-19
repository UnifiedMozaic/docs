---
title: "half_floats.um"
description: "f16 is IEEE 754 half precision (16 bits). The result of an operation is the exact value rounded to f16."
---

f16 is IEEE 754 half precision (16 bits). The result of an operation is the exact value rounded to f16.

Source: [examples/half_floats.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/half_floats.um)

```um title="half_floats.um"
// f16 は IEEE 754 の半精度（16ビット）。演算の結果は、正確な値を f16 に丸めたものになる。
// expect: 0.0999755859375
// expect: 0.2998046875
// expect: 1.5
// expect: 65504
// expect: Infinity
// expect: 2048
// expect: 2050
// expect: 5.960464477539063e-8
// expect: 0
// expect: 3
// expect: -7
// expect: 1.4140625
// expect: true
// expect: 2
// expect: 10

struct Weights {
  scale: f16;
  bias: f16;
}

function dot(xs: f16[], ys: f16[]): f32 {
  let sum: f32 = 0;
  for (let i: usize = 0; i < xs.length; i++) {
    sum += (xs[i] as f32) * (ys[i] as f32);
  }
  return sum;
}

export function main(): i32 {
  const a: f16 = 0.1;
  const b: f16 = 0.2;
  print(a);
  print(a + b);
  print((3 as f16) / 2);

  const big: f16 = 65504;
  print(big);
  print(big + big);

  // 2048 より上では f16 は偶数しか表せない。2049 は偶数丸めで 2048、2050 はそのまま。
  const k: f16 = 2048;
  print(k + 1);
  print(k + 2);

  // 最小の非正規化数と、その半分（0 に丸められる）。
  const tiny: f16 = 0.00000005960464477539063;
  print(tiny);
  print(tiny / 2);

  print((3.7 as f16) as i32);
  let neg: f16 = 7.25;
  neg = -neg;
  print(neg as i32);
  print(Math.sqrt(2 as f16));
  print(a < b);

  const w: Weights = { scale: 0.5, bias: 1.5 };
  print(w.scale * 1 + w.bias);

  let xs: f16[] = [1, 2, 3];
  let ys: f16[] = [0.5, 1, 2.5];
  print(dot(xs, ys));
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
0.0999755859375
0.2998046875
1.5
65504
Infinity
2048
2050
5.960464477539063e-8
0
3
-7
1.4140625
true
2
10
```
