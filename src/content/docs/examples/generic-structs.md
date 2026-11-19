---
title: "generic_structs.um"
description: "A generic struct is duplicated for each combination of types it is used with."
---

A generic struct is duplicated for each combination of types it is used with.

Source: [examples/generic_structs.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/generic_structs.um)

```um title="generic_structs.um"
// ジェネリックな struct は、使われた型の組み合わせごとに複製される。
// expect: 3
// expect: 2.5
// expect: 7
// expect: b
// expect: 10
// expect: 4
// expect: 6
// expect: 15
// expect: 1
// expect: none

struct Pair<A, B> {
  first: A;
  second: B;
}

struct Stack<T> {
  items: T[];
}

struct Tree<T> {
  value: T;
  kids: Tree<T>[];
}

function swap<A, B>(p: Pair<A, B>): Pair<B, A> {
  return { first: p.second, second: p.first };
}

function push<T>(s: mut Stack<T>, v: T): void {
  s.items.push(v);
}

function size<T>(s: Stack<T>): usize {
  return s.items.length;
}

function total(t: Tree<i32>): i32 {
  let sum = t.value;
  for (const k of t.kids) {
    sum += total(k);
  }
  return sum;
}

function find<T>(s: Stack<T>, v: T): Pair<usize, T> | null {
  for (let i: usize = 0; i < s.items.length; i++) {
    if (s.items[i] == v) {
      return { first: i, second: v };
    }
  }
  return null;
}

export function main(): i32 {
  const p: Pair<i32, f64> = { first: 3, second: 2.5 };
  print(p.first);
  print(p.second);
  const q = swap(p);
  print(q.second + 4);

  let names: Stack<string> = { items: [] };
  names.items.push("a");
  names.items.push("b");
  print(names.items[1]);

  let nums: Stack<i32> = { items: [] };
  for (let i = 0; i < 4; i++) {
    push(mut nums, i + 1);
  }
  let sum = 0;
  for (const n of nums.items) {
    sum += n;
  }
  print(sum);
  print(size(nums));

  const nested: Pair<Pair<i32, i32>, Stack<i32>> = { first: { first: 1, second: 5 }, second: { items: [9] } };
  print(nested.first.first + nested.first.second);

  let tree: Tree<i32> = { value: 1, kids: [] };
  tree.kids.push({ value: 2, kids: [] });
  tree.kids.push({ value: 4, kids: [{ value: 8, kids: [] }] });
  print(total(tree));

  const hit = find(nums, 2);
  if (hit != null) {
    print(hit.first);
  }
  const miss = find(nums, 99);
  if (miss == null) {
    print("none");
  }
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
3
2.5
7
b
10
4
6
15
1
none
```
