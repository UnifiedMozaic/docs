---
title: "small_float_arith.um"
description: "f8 / f4 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。"
---

f8 / f4 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。

ソース: [examples/small_float_arith.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/small_float_arith.um)

```um title="small_float_arith.um"
// f8 / f4 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。
// 期待値は、別に書いた C の参照実装（値の一覧を式から作り、総当たりで最も近い値を選ぶ）で求めた。
// expect: 1930969171
export function main(): i32 {
  let s: u32 = 12345;
  let acc: u32 = 0;
  for (let i = 0; i < 200000; i++) {
    s = s * 1664525 + 1013904223;
    let da: f32 = 4099;
    if ((s >> 28) % 2 != 0) {
      da = 37;
    }
    const fa = (((s >> 8) & 65535) as f32 - 32768) / da;
    const a8 = fa as f8;
    const a4 = fa as f4;
    s = s * 1664525 + 1013904223;
    let db: f32 = 16001;
    if ((s >> 28) % 2 != 0) {
      db = 977;
    }
    const fb = (((s >> 8) & 65535) as f32 - 32768) / db;
    const b8 = fb as f8;
    const b4 = fb as f4;
    acc = acc * 31 + (((a8 + b8) as f32) * 64) as i32 as u32;
    acc = acc * 31 + (((a8 * b8) as f32) * 64) as i32 as u32;
    acc = acc * 31 + (((a8 / b8) as f32) * 64) as i32 as u32;
    acc = acc * 31 + (((a8 - b8) as f32) * 64) as i32 as u32;
    acc = acc * 31 + (((a4 + b4) as f32) * 64) as i32 as u32;
    acc = acc * 31 + (((a4 * b4) as f32) * 64) as i32 as u32;
    acc = acc * 31 + (((a4 / b4) as f32) * 64) as i32 as u32;
    acc = acc * 31 + (((a4 - b4) as f32) * 64) as i32 as u32;
  }
  print(acc);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
1930969171
```
