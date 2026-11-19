---
title: "kernel_neighbours.um"
description: "Inside a kernel, putting the index of a neighbouring element in a variable before reading it."
---

Inside a kernel, putting the index of a neighbouring element in a variable before reading it.

Source: [examples/kernel_neighbours.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/kernel_neighbours.um)

```um title="kernel_neighbours.um"
// kernel の中で、隣の要素の添字を変数に入れてから読む書き方。
// 範囲内になる区間では検査が省かれるが、結果は1要素ずつ順に実行したときと同じでなければならない。
// expect: 0
// expect: 0
// expect: 0
// expect: 0

kernel function smooth(i: u32, out: mut Buffer<i32>, src: Buffer<i32>): void {
  let left = i;
  if (i > 0) {
    left = i - 1;
  }
  let right = i + 1;
  if (i % 7 == 0) {
    right = i + 3;
  }
  const far = left - 2;
  out[i] = src[left] * 3 + src[i] + src[right] * 5 + src[far] + src[right + 1];
}

function at(b: Buffer<i32>, i: u32): i32 {
  if (i >= b.length) {
    return b[b.length - 1];
  }
  return b[i];
}

function check(n: u32, len: u32): u32 {
  let src = new Buffer<i32>(len);
  for (let i: u32 = 0; i < len; i++) {
    src[i] = ((i * 2654435761) >> 9) as i32;
  }
  let out = new Buffer<i32>(len);
  dispatch(smooth, n, mut out, src);
  let bad: u32 = 0;
  for (let i: u32 = 0; i < n; i++) {
    let left = i;
    if (i > 0) {
      left = i - 1;
    }
    let right = i + 1;
    if (i % 7 == 0) {
      right = i + 3;
    }
    // left - 2 は i が小さいと折り返して大きな値になり、最後の要素に切り詰められる。
    const want = at(src, left) * 3 + at(src, i) + at(src, right) * 5 + at(src, left - 2) + at(src, right + 1);
    if (out[i] != want) {
      bad += 1;
    }
  }
  return bad;
}

export function main(): i32 {
  print(check(100000, 100000));
  print(check(5000, 5003));
  print(check(6, 6));
  print(check(1, 1));
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
```
