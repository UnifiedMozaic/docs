---
title: "masked_shift.um"
description: "Masked shifts Math.shl / Math.shr, and bounds-check elimination."
---

Masked shifts Math.shl / Math.shr, and bounds-check elimination.

Source: [examples/masked_shift.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/masked_shift.um)

```um title="masked_shift.um"
// マスクつきシフト Math.shl / Math.shr と、範囲チェックの除去。
//
// Math.shl(x, k) / Math.shr(x, k) は、シフト量 k を値のビット幅で割った余りにしてからずらす。
// 範囲検査を付けないので、シフト量が変わるビットボードのような計算で、停止の分岐が消える。
// 意味は kernel の `<<` / `>>` と同じ（32 ビットなら k & 31、64 ビットなら k & 63）。
//
// あわせて、添字が「必ず範囲内」とコンパイラに分かる所（固定長配列への i & 定数、Math.ctz の結果、
// 前の比較で分かる値）では、添字の範囲検査も省かれる。結果は検査ありと同じになる。
//
// expect: 1024
// expect: 1
// expect: 255
// expect: -16
// expect: 3
// expect: 4050
// expect: 3732

// ビットボード風: 立っているビットを下から順に取り出し、位置ごとの重みを足す。
function weightedBits(bb: u64, w: i32[64]): i32 {
  let acc: i32 = 0;
  let x = bb;
  while (x != 0) {
    const sq = Math.ctz(x) as i32;   // 0..63。固定長 64 の配列には必ず収まる（検査なし）
    acc += w[sq];
    x = x & (x - 1);                 // いちばん下のビットを消す
  }
  return acc;
}

// マスクつきシフトで 1 ビットを立てる。sq が 64 以上でも停止しない（64 で割った余り）。
function bit(sq: i32): u64 {
  return Math.shl(1 as u64, sq);
}

export function main(): i32 {
  // マスクつきシフトの基本
  print((Math.shl(1 as u64, 10)) as f64);    // 1024
  print((Math.shl(1 as u64, 64)) as f64);    // 1（64 & 63 = 0）
  print((Math.shr(0xFF00 as u32, 8)) as f64); // 255
  print((Math.shr(-256 as i32, 4)) as f64);  // -16（符号つきは算術シフト）

  // bit() を使ってビットボードを組み立てる
  let bb: u64 = 0;
  bb = bb | bit(0) | bit(9) | bit(63);
  print((Math.popcount(bb)) as f64);          // 3

  // 位置ごとの重みを引く
  let w: i32[64];
  for (let i = 0; i < 64; i++) { w[i] = (i * i) as i32; }
  print(weightedBits(bb, w) as f64);          // 0 + 81 + 3969 = 4050

  // 添字のマスク（固定長 16 の配列）: 検査なしで必ず範囲内
  let t: i32[16];
  for (let i = 0; i < 16; i++) { t[i] = (100 - i) as i32; }
  let s: i32 = 0;
  for (let k = 0; k < 40; k++) { s += t[k & 15]; }
  print(s as f64);                            // k&15 は 0..15 を 2 回半 + 余り
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
1024
1
255
-16
3
4050
3732
```
