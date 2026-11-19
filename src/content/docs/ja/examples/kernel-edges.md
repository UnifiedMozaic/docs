---
title: "kernel_edges.um"
description: "kernel を通常の関数として直接呼んだ場合や、空の Buffer を渡した場合も、メモリ安全で結果が決まっている。"
---

kernel を通常の関数として直接呼んだ場合や、空の Buffer を渡した場合も、メモリ安全で結果が決まっている。

ソース: [examples/kernel_edges.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/kernel_edges.um)

```um title="kernel_edges.um"
// kernel を通常の関数として直接呼んだ場合や、空の Buffer を渡した場合も、メモリ安全で結果が決まっている。
// expect: 9
// expect: 0
// expect: 0
// expect: 5
// expect: 7
// expect: -2147483648
// expect: 0
// expect: 3

kernel function pick(src: Buffer<i32>, at: u32): i32 {
  return src[at];
}

kernel function store(i: u32, out: mut Buffer<i32>, v: i32): void {
  out[i] = v;
}

kernel function table(n: u32): i32 {
  const t: i32[4] = [1, 3, 5, 7];
  return t[n];
}

kernel function divide(a: i32, b: i32): i32 {
  return a / b;
}

kernel function remainder(a: i32, b: i32): i32 {
  return a % b;
}

kernel function copy(i: u32, out: mut Buffer<i32>, src: Buffer<i32>): void {
  out[i] = src[i];
}

export function main(): i32 {
  const src: Buffer<i32> = [7, 8, 9];
  // 範囲外の読み出しは最後の要素。
  print(pick(src, 100));

  // 空の Buffer の読み出しは 0。
  const empty = new Buffer<i32>(0);
  print(pick(empty, 0));
  print(empty.length);

  // dispatch を通さず直接呼んで範囲外に書くと、最後の要素に書かれる（メモリ外には出ない）。
  let out = new Buffer<i32>(2);
  store(9, mut out, 5);
  print(out[1]);

  print(table(50));
  const min: i32 = -2147483648;
  print(divide(min, -1));
  print(remainder(min, -1));

  // 要素数 0 の dispatch は何もしない。Buffer の複製と移動も通常の値と同じ。
  let dst = new Buffer<i32>(3);
  dispatch(copy, 0, mut dst, src);
  dispatch(copy, 3, mut dst, src.clone());
  const moved = dst;
  print(moved.length);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
9
0
0
5
7
-2147483648
0
3
```
