---
title: "numbers.um"
description: "Integers wrap by default. Type conversions are explicit with as."
---

Integers wrap by default. Type conversions are explicit with as.

Source: [examples/numbers.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/numbers.um)

```um title="numbers.um"
// 整数は既定でラップする。型の変換は as で明示する。
// expect: -2147483648
// expect: 0
// expect: 255
// expect: -128
// expect: 4294967295
// expect: 3
// expect: -3
// expect: 127
// expect: 0
// expect: 2147483648
// expect: 0
// expect: 40
// expect: -4
// expect: 1073741820
// expect: 0.1
// expect: 18446744073709551615

export function main(): i32 {
  let big: i32 = 2147483647;
  big += 1;
  print(big);

  let b: u8 = 255;
  b += 1;
  print(b);
  print(0xFF as u8);

  const small: i8 = -128;
  print(small);
  print(-1 as u32);

  print(3.9 as i32);
  print(-3.9 as i32);
  // 浮動小数点から整数への変換は範囲外で飽和する。
  print(1000.0 as i8);
  print((0.0 / 0.0) as i32);

  // 最小値 / -1 もラップする（停止しない）。
  const min: i32 = -2147483648;
  const minusOne: i32 = -1;
  const d = min / minusOne;
  print(0 as i64 - d as i64);
  print(min % minusOne);

  print(5 << 3);
  const neg: i32 = -16;
  print(neg >> 2);
  const u: u32 = 4294967280;
  print(u >> 2);

  print(0.1);
  const all: u64 = 0xFFFFFFFFFFFFFFFF;
  print(all);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
-2147483648
0
255
-128
4294967295
3
-3
127
0
2147483648
0
40
-4
1073741820
0.1
18446744073709551615
```
