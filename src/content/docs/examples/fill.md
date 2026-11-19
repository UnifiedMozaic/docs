---
title: "fill.um"
description: "Bulk writes xs.fill(v) / xs.fill(v, start, end). Available on growable arrays, Buffer and RacyBuffer."
---

Bulk writes xs.fill(v) / xs.fill(v, start, end). Available on growable arrays, Buffer and RacyBuffer.

Source: [examples/fill.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/fill.um)

```um title="fill.um"
// 一括の書き込み xs.fill(v) / xs.fill(v, start, end)。可変長配列、Buffer、RacyBuffer で使える。
// [start, end) の要素をすべて v にする（end は含まない）。長さは変わらない。範囲が 0 <= start <= end <= 長さ
// でなければ停止する。大きな表（16 MiB 以上）は、ネイティブでは複数のスレッドで書く。
// RacyBuffer は読み取り借用からでも書け、ほかのスレッドが同時に読んでも、ちぎれた値は見えない。
//
// expect: 7
// expect: 0
// expect: 49
// expect: -1.5
// expect: 0
// expect: 1
// expect: 33554432
// expect: 0

function clearShared(tt: RacyBuffer<u64>): void {
  tt.fill(0);   // 読み取り借用からでも書ける
}

export function main(): i32 {
  let xs = new Array<i32>(10);
  xs.fill(7);
  print(xs[9]);
  xs.fill(0, 2, 5);
  print(xs[2] + xs[3] + xs[4]);
  let s = 0;
  for (const x of xs) { s += x; }
  print(s);   // 7 が 7 個 = 49
  let fs = new Buffer<f32>(5);
  fs.fill(-1.5, 1, 5);
  print(fs[4]);
  print(fs[0]);
  let flags = new Array<bool>(3);
  flags.fill(true);
  print(flags[1] ? 1 : 0);
  let tt = new RacyBuffer<u64>(1 << 25);   // 256 MiB: 複数のスレッドで書く
  tt.fill(0x0102030405060708);
  let ok = 0;
  for (let i = 0; i < tt.length; i++) { if (tt[i] == 0x0102030405060708) { ok++; } }
  print(ok);
  clearShared(tt);
  print(tt[12345] as i32);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
7
0
49
-1.5
0
1
33554432
0
```
