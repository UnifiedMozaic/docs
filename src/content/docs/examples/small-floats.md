---
title: "small_floats.um"
description: "f8 and f4 are 8-bit and 4-bit floating-point types, for data where memory size matters, such as quantised weights."
---

f8 and f4 are 8-bit and 4-bit floating-point types, for data where memory size matters, such as quantised weights.

Source: [examples/small_floats.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/small_floats.um)

```um title="small_floats.um"
// f8 と f4 は、8ビットと4ビットの浮動小数点。量子化した重みのように、メモリの量が効くデータのための型。
// 演算の結果は、正確な値をその型で表せる最も近い値に丸めたもの（範囲外は最大値に張り付く）。
// expect: 0.3125
// expect: 448
// expect: 448
// expect: -448
// expect: 0.001953125
// expect: 0
// expect: 1.5
// expect: 6
// expect: 6
// expect: 0.5
// expect: 2
// expect: -4
// expect: true
// expect: 2
// expect: 12
// expect: NaN
// expect: 0
// expect: 1.625
// expect: 1

struct Weights {
  a: f8;
  b: f4;
}

export function main(): i32 {
  const x: f8 = 0.3;
  print(x);
  const big: f8 = 448;
  print(big);
  print(big * 2);
  print(-big - big);
  const tiny: f8 = 0.001953125;
  print(tiny);
  print(tiny / 4);

  const p: f4 = 1.4;
  print(p);
  const q: f4 = 100;
  print(q);
  print(p * 4);
  print((0.3 as f4));
  // 2 と 3 のちょうど中間は、偶数側（2）に丸める。
  print((2.5 as f4));
  print((-3.7 as f4));
  print(p < q);
  print((p as f32 + 0.5) as i32);

  let ws: f8[] = [0.5, 1.5, 4];
  let sum: f32 = 0;
  for (const w of ws) {
    sum += (w as f32) * 2;
  }
  print(sum);

  const nan: f8 = ((0.0 as f32) / 0.0) as f8;
  print(nan);
  print((nan as f32) as f4);

  const w: Weights = { a: 1.6, b: 1.1 };
  print(w.a);
  print(w.b);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
0.3125
448
448
-448
0.001953125
0
1.5
6
6
0.5
2
-4
true
2
12
NaN
0
1.625
1
```
