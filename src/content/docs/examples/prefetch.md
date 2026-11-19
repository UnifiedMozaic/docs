---
title: "prefetch.um"
description: "Prefetching with Math.prefetch(arr, i), which asks the CPU to load the memory holding arr[i] into the cache before it is used."
---

Prefetching with Math.prefetch(arr, i), which asks the CPU to load the memory holding arr[i] into the cache before it is used.

Source: [examples/prefetch.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/prefetch.um)

```um title="prefetch.um"
// 先読み Math.prefetch(arr, i)。arr[i] のあるメモリを、使う前にキャッシュへ読み込むよう CPU に頼む。
// 置換表のような大きな表で、「次に読む場所」が先に分かるときに使う。
// 結果は返さず、プログラムの動作は変わらない。範囲外の添字でも何も起きない。wasm32 では何もしない。
//
// expect: 1
// expect: 499500

export function main(): i32 {
  let table = new Array<u64>(1 << 16);
  const mask: u64 = (1 << 16) - 1;
  let key: u64 = 88172645463325252;
  let sum: u64 = 0;
  for (let i = 0; i < 1000; i++) {
    const next = key * 6364136223846793005 + 1442695040888963407;
    Math.prefetch(table, next & mask);  // 次に読む場所を先に頼んでおく
    table[(key & mask) as usize] = table[(key & mask) as usize] + 1;
    sum = sum + table[(key & mask) as usize];
    key = next;
  }
  Math.prefetch(table, -5 as i64);        // 範囲外: 何も起きない
  Math.prefetch(table, 1000000000 as u64);
  print(sum >= 1000 ? 1 : 0);
  let buf = new Buffer<i32>(1000);
  let total: i64 = 0;
  for (let i = 0; i < buf.length; i++) {
    Math.prefetch(buf, i + 16);
    buf[i] = i as i32;
    total = total + (buf[i] as i64);
  }
  print(total);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
1
499500
```
