---
title: "histogram_bits.um"
description: "ヒストグラム（構造体の配列）と xorshift64、popcount / clz / ctz によるビット数の集計。"
---

ヒストグラム（構造体の配列）と xorshift64、popcount / clz / ctz によるビット数の集計。

ソース: [examples/histogram_bits.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/histogram_bits.um)

```um title="histogram_bits.um"
// ヒストグラム（構造体の配列）と xorshift64、popcount / clz / ctz によるビット数の集計。
// expect: 500
// expect: 79
// expect: 6
// expect: 45
// expect: 36
// expect: 39
// expect: 44
// expect: 46
// expect: 43
// expect: 48
// expect: 44
// expect: 35
// expect: 41
// expect: 3915
// expect: 76
// expect: 99
// expect: 8049
// expect: 68
// expect: 1
// expect: 0

struct Bucket {
  count: u32;
  sum: i64;
  min: i32;
  max: i32;
}

class Histogram {
  buckets: Bucket[] = [];
  width: i32;
  total: u32 = 0;
  overflow: u32 = 0;

  constructor(nBuckets: i32, width: i32) {
    this.width = width;
    for (let i = 0; i < nBuckets; i++) {
      this.buckets.push({ count: 0, sum: 0, min: 2147483647, max: -2147483648 });
    }
  }

  add(v: i32): void {
    this.total++;
    if (v < 0) {
      this.overflow++;
      return;
    }
    const idx = (v / this.width) as usize;
    if (idx >= this.buckets.length) {
      this.overflow++;
      return;
    }
    this.buckets[idx].count++;
    this.buckets[idx].sum += v as i64;
    this.buckets[idx].min = Math.min(this.buckets[idx].min, v);
    this.buckets[idx].max = Math.max(this.buckets[idx].max, v);
  }

  mode(): i32 {
    let best = 0;
    for (let i = 1; i < this.buckets.length; i++) {
      if (this.buckets[i].count > this.buckets[best].count) {
        best = i as i32;
      }
    }
    return best;
  }
}

function bitCounts(values: u32[]): u32[] {
  let counts = new Array<u32>(33);
  for (const v of values) {
    const k = Math.popcount(v) as usize;
    counts[k] += 1;
  }
  return counts;
}

export function main(): i32 {
  let h = new Histogram(10, 25);
  let seed: u64 = 88172645463325252;
  let raw: u32[] = [];
  for (let i = 0; i < 500; i++) {
    seed ^= seed << 13;
    seed ^= seed >> 7;
    seed ^= seed << 17;
    const v = (seed % 300) as i32 - 20;
    h.add(v);
    raw.push((seed >> 32) as u32);
  }
  print(h.total);
  print(h.overflow);
  print(h.mode());
  for (const b of h.buckets) {
    print(b.count);
  }
  print(h.buckets[3].sum);
  print(h.buckets[3].min);
  print(h.buckets[3].max);
  const bc = bitCounts(raw);
  let weighted: u32 = 0;
  for (let i = 0; i < bc.length; i++) {
    weighted += bc[i] * (i as u32);
  }
  print(weighted);
  print(bc[16]);
  print(Math.clz(raw[0]));
  print(Math.ctz(raw[1] | 1024));
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
500
79
6
45
36
39
44
46
43
48
44
35
41
3915
76
99
8049
68
1
0
```
