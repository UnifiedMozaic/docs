---
title: "parallel_kernels.um"
description: "On native targets, a large dispatch is split across multiple threads."
---

On native targets, a large dispatch is split across multiple threads.

Source: [examples/parallel_kernels.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/parallel_kernels.um)

```um title="parallel_kernels.um"
// 大きな dispatch は、ネイティブでは複数のスレッドに分けて実行される。
// 添字が i ± 定数 の形のアクセスは、範囲内になる区間で検査が省かれる。
// どちらの場合も、結果は1要素ずつ順に実行したときと同じでなければならない。
// expect: 0
// expect: 0
// expect: 0
// expect: 0
// expect: 0
// expect: 0
// expect: 7

kernel function stencil(i: u32, out: mut Buffer<i32>, src: Buffer<i32>): void {
  out[i] = src[i - 2] + src[i] * 3 + src[i + 3];
}

// 長さの違う Buffer。短い方は最後の要素に切り詰められる。
kernel function mix(i: u32, out: mut Buffer<i32>, a: Buffer<i32>, b: Buffer<i32>): void {
  out[i] = a[i + 1] - b[i];
}

kernel function fill(i: u32, out: mut Buffer<i32>, k: i32): void {
  out[i] = (i as i32) * k;
}

function at(b: Buffer<i32>, i: u32): i32 {
  if (i >= b.length) {
    return b[b.length - 1];
  }
  return b[i];
}

function checkStencil(n: u32, len: u32): u32 {
  let src = new Buffer<i32>(len);
  for (let i: u32 = 0; i < len; i++) {
    src[i] = ((i * 2654435761) >> 7) as i32;
  }
  let out = new Buffer<i32>(len);
  dispatch(stencil, n, mut out, src);
  let bad: u32 = 0;
  for (let i: u32 = 0; i < len; i++) {
    let want = 0;
    if (i < n) {
      // i - 2 は折り返して大きな値になり、最後の要素に切り詰められる。
      want = at(src, i - 2) + at(src, i) * 3 + at(src, i + 3);
    }
    if (out[i] != want) {
      bad += 1;
    }
  }
  return bad;
}

export function main(): i32 {
  print(checkStencil(100000, 100000));
  print(checkStencil(50000, 100000));
  print(checkStencil(5000, 5000));
  print(checkStencil(4, 4));
  print(checkStencil(1, 1));

  const n: u32 = 70000;
  let a = new Buffer<i32>(n);
  let b = new Buffer<i32>(1000);
  let out = new Buffer<i32>(n);
  dispatch(fill, n, mut a, 3);
  dispatch(fill, 1000, mut b, 5);
  dispatch(mix, n, mut out, a, b);
  let bad: u32 = 0;
  for (let i: u32 = 0; i < n; i++) {
    if (out[i] != at(a, i + 1) - at(b, i)) {
      bad += 1;
    }
  }
  print(bad);

  // 要素数 0 の dispatch は何もしない。
  let one: Buffer<i32> = [7];
  dispatch(fill, 0, mut one, 9);
  print(one[0]);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
0
0
0
0
0
0
7
```
