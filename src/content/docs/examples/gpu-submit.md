---
title: "gpu_submit.um"
description: "gpu.submit asks for a kernel to run and returns without waiting for it to finish. It returns a ticket (u64)."
---

gpu.submit asks for a kernel to run and returns without waiting for it to finish. It returns a ticket (u64).

Source: [examples/gpu_submit.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/gpu_submit.um)

```um title="gpu_submit.um"
// gpu.submit は、kernel の実行を頼んで、終わるのを待たずに戻る。返ってくるのは券（u64）。
//   gpu.ready(t)  券 t の仕事が終わって結果が読めるなら true（待たない）
//   gpu.wait(t)   終わるまで待つ
// 待たずに戻るので、頼んだ仕事と自分が同じ領域を同時に触りうる。そのため、渡せるのは RacyBuffer だけ。
// GPU がない環境では、gpu.submit はその場で最後まで実行する（券は「もう終わっている」ものになる）。
// expect: 30
// expect: true
// expect: 285
// expect: 3

kernel function square(i: u32, out: mut RacyBuffer<i32>, src: RacyBuffer<i32>): void {
  out[i] = src[i] * src[i];
}

export function main(): i32 {
  let src = new RacyBuffer<i32>(10);
  for (let i: u32 = 0; i < 10; i++) {
    src[i] = i as i32;
  }
  let out = new RacyBuffer<i32>(10);

  // 頼んでから、待つ。
  const t = gpu.submit(square, 5, mut out, src);
  gpu.wait(t);
  let sum: i32 = 0;
  for (const v of out) {
    sum += v;
  }
  print(sum);
  // 待ったあとは、何度確かめても true。
  print(gpu.ready(t));

  // 頼んだあと、終わるまで別のことをする。
  const t2 = gpu.submit(square, 10, mut out, src);
  let other: i32 = 0;
  while (!gpu.ready(t2)) {
    other += 1;
  }
  sum = 0;
  for (const v of out) {
    sum += v;
  }
  print(sum);

  // 続けていくつも頼める。終わる順番は頼んだ順。
  let a = new RacyBuffer<i32>(4);
  let b = new RacyBuffer<i32>(4);
  let c = new RacyBuffer<i32>(4);
  const ta = gpu.submit(square, 4, mut a, src);
  const tb = gpu.submit(square, 4, mut b, src);
  const tc = gpu.submit(square, 4, mut c, src);
  gpu.wait(tc);
  gpu.wait(ta);
  gpu.wait(tb);
  let same: i32 = 0;
  if (a[3] == 9) {
    same += 1;
  }
  if (b[3] == 9) {
    same += 1;
  }
  if (c[3] == 9) {
    same += 1;
  }
  print(same);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
30
true
285
3
```
