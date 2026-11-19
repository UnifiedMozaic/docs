---
title: "generic_classes.um"
description: "ジェネリックな class。使われた型ごとに、フィールドとメソッドが複製される。"
---

ジェネリックな class。使われた型ごとに、フィールドとメソッドが複製される。

ソース: [examples/generic_classes.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/generic_classes.um)

```um title="generic_classes.um"
// ジェネリックな class。使われた型ごとに、フィールドとメソッドが複製される。
// expect: 3
// expect: 30
// expect: 2
// expect: c
// expect: 2
// expect: true
// expect: 7.5
// expect: 4
// expect: 1

class Stack<T> {
  private items: T[];

  constructor() {
    this.items = [];
  }

  push(v: own T): void {
    this.items.push(v);
  }

  pop(): T {
    return this.items.pop();
  }

  size(): usize {
    return this.items.length;
  }

  isEmpty(): bool {
    return this.items.length == 0;
  }
}

class Cell<T> {
  value: T;
  writes: i32 = 0;

  constructor(v: T) {
    this.value = v;
  }

  set(v: T): void {
    this.value = v;
    this.writes += 1;
  }
}

class Counter<K> {
  private keys: K[];
  private counts: i32[];

  constructor() {
    this.keys = [];
    this.counts = [];
  }

  add(key: K): void {
    for (let i: usize = 0; i < this.keys.length; i++) {
      if (this.keys[i] == key) {
        this.counts[i] += 1;
        return;
      }
    }
    this.keys.push(key);
    this.counts.push(1);
  }

  distinct(): usize {
    return this.keys.length;
  }
}

function drain<T>(s: mut Stack<T>): usize {
  let n: usize = 0;
  while (!s.isEmpty()) {
    s.pop();
    n += 1;
  }
  return n;
}

export function main(): i32 {
  let nums = new Stack<i32>();
  nums.push(own 10);
  nums.push(own 20);
  nums.push(own 30);
  print(nums.size());
  print(nums.pop());
  print(nums.size());

  let words: Stack<string> = new Stack();
  words.push(own "a");
  words.push(own "b");
  words.push(own "c");
  print(words.pop());
  print(drain(mut words));
  print(words.isEmpty());

  let cell = new Cell<f64>(1.5);
  cell.set(7.5);
  print(cell.value);

  let seen = new Counter<i32>();
  for (let i = 0; i < 10; i++) {
    seen.add(i % 4);
  }
  print(seen.distinct());
  print(cell.writes);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
3
30
2
c
2
true
7.5
4
1
```
