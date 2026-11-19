---
title: "racy_buffer.um"
description: "A RacyBuffer is a Buffer that may be read and written without synchronisation."
---

A RacyBuffer is a Buffer that may be read and written without synchronisation.

Source: [examples/racy_buffer.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/racy_buffer.um)

```um title="racy_buffer.um"
// RacyBuffer は、同期なしで読み書きしてよい Buffer。
// kernel はどの要素にも書ける。複数のスレッドが同じ要素に同時に書くので、
// 「読んで足して書く」は取りこぼしが起きうる（メモリは壊れない）。結果が実行ごとに変わってよい用途に使う。
// expect: true
// expect: true
// expect: 4096
// expect: 7
// expect: true

// 各要素が、自分の値に対応する箱に印を付ける。同じ値を書くだけなので、競合しても結果は決まる。
kernel function mark(i: u32, seen: mut RacyBuffer<u32>, data: Buffer<u32>): void {
  seen[data[i] % 64] = 1;
}

// 数える。取りこぼしがありうるので、合計は「要素数以下」としか言えない。
kernel function count(i: u32, hist: mut RacyBuffer<u32>, data: Buffer<u32>): void {
  const bin = data[i] % 8;
  hist[bin] = hist[bin] + 1;
}

// 範囲外の添字は最後の要素に切り詰められる（どこにも書けてしまうことはない）。
kernel function wild(i: u32, out: mut RacyBuffer<f32>): void {
  out[i * 1000003] = 7;
}

export function main(): i32 {
  const n: u32 = 200000;
  let data = new Buffer<u32>(n);
  for (let i: u32 = 0; i < n; i++) {
    data[i] = i * 2654435761;
  }

  let seen = new RacyBuffer<u32>(64);
  dispatch(mark, n, mut seen, data);
  let marked: u32 = 0;
  for (let b: u32 = 0; b < 64; b++) {
    marked += seen[b];
  }
  print(marked == 64);

  let hist = new RacyBuffer<u32>(8);
  dispatch(count, n, mut hist, data);
  let total: u32 = 0;
  for (const h of hist) {
    total += h;
  }
  print(total > 0 && total <= n);

  let out = new RacyBuffer<f32>(4096);
  dispatch(wild, 100000, mut out);
  print(out.length);
  print(out[4095]);
  let fine = true;
  for (const v of out) {
    if (v != 0 && v != 7) {
      fine = false;
    }
  }
  print(fine);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
true
true
4096
7
true
```
