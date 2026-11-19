---
title: "half_arith.um"
description: "f16 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。"
---

f16 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。

ソース: [examples/half_arith.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/half_arith.um)

```um title="half_arith.um"
// f16 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。
// 期待値は、同じ計算を C の _Float16 で行って求めた（正確な結果を丸める、IEEE 754 どおりの演算）。
// expect: 2629255277
export function main(): i32 {
  let s: u32 = 12345;
  let acc: u32 = 0;
  for (let i = 0; i < 200000; i++) {
    s = s * 1664525 + 1013904223;
    const a: f16 = ((((s >> 8) & 65535) as f32 - 32768) / 37) as f16;
    s = s * 1664525 + 1013904223;
    const b: f16 = ((((s >> 8) & 65535) as f32 - 32768) / 4099) as f16;
    const r1: f16 = a + b;
    const r2: f16 = a * b;
    const r3: f16 = a / b;
    const r4: f16 = a - b;
    acc = acc * 31 + ((r1 as f32) * 8) as i32 as u32;
    acc = acc * 31 + ((r2 as f32) / 64) as i32 as u32;
    acc = acc * 31 + ((r3 as f32) * 512) as i32 as u32;
    acc = acc * 31 + ((r4 as f32) * 8) as i32 as u32;
  }
  print(acc);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
2629255277
```
