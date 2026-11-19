---
title: "min_heap.um"
description: "A binary heap (priority queue) class on i32[]. It uses a private array field and usize index arithmetic."
---

A binary heap (priority queue) class on i32[]. It uses a private array field and usize index arithmetic.

Source: [examples/min_heap.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/min_heap.um)

```um title="min_heap.um"
// i32[] を使った二分ヒープ（優先度付きキュー）の class。private な配列フィールドと usize の添字計算を使う。
// expect: 20
// expect: -499
// expect: -413
// expect: -73
// expect: 256
// expect: 480
// expect: true
// expect: 1405683364

class MinHeap {
  private items: i32[] = [];

  size(): usize {
    return this.items.length;
  }

  isEmpty(): bool {
    return this.items.length == 0;
  }

  push(value: i32): void {
    this.items.push(value);
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) / 2;
      if (this.items[parent] <= this.items[i]) {
        break;
      }
      const tmp = this.items[parent];
      this.items[parent] = this.items[i];
      this.items[i] = tmp;
      i = parent;
    }
  }

  peek(): i32 {
    return this.items[0];
  }

  pop(): i32 {
    const top = this.items[0];
    const last = this.items.pop();
    const n = this.items.length;
    if (n > 0) {
      this.items[0] = last;
      let i: usize = 0;
      while (true) {
        const l = 2 * i + 1;
        const r = 2 * i + 2;
        let smallest = i;
        if (l < n && this.items[l] < this.items[smallest]) {
          smallest = l;
        }
        if (r < n && this.items[r] < this.items[smallest]) {
          smallest = r;
        }
        if (smallest == i) {
          break;
        }
        const tmp = this.items[i];
        this.items[i] = this.items[smallest];
        this.items[smallest] = tmp;
        i = smallest;
      }
    }
    return top;
  }
}

export function main(): i32 {
  let heap = new MinHeap();
  let seed: u32 = 12345;
  for (let k = 0; k < 20; k++) {
    seed = seed * 1103515245 + 12345;
    heap.push(((seed >> 16) % 1000) as i32 - 500);
  }
  print(heap.size());
  print(heap.peek());
  let prev = -1000;
  let sorted = true;
  let checksum: i32 = 0;
  while (!heap.isEmpty()) {
    const v = heap.pop();
    if (v < prev) {
      sorted = false;
    }
    prev = v;
    checksum = checksum * 31 + v;
    if (heap.size() % 5 == 0) {
      print(v);
    }
  }
  print(sorted);
  print(checksum);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
20
-499
-413
-73
256
480
true
1405683364
```
