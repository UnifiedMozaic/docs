---
title: "sorting.um"
description: "Sorting a random sequence from an LCG class with quicksort (mutable borrow) and merge sort (returns an array)."
---

Sorting a random sequence from an LCG class with quicksort (mutable borrow) and merge sort (returns an array).

Source: [examples/sorting.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/sorting.um)

```um title="sorting.um"
// LCG の class で作った乱数列を、クイックソート（mut 借用）とマージソート（配列を返す）で並べる。
// expect: true
// expect: true
// expect: 578515827
// expect: 578515827
// expect: -500
// expect: 497
// expect: -437372297

class Lcg {
  private state: u32;

  constructor(seed: u32) {
    this.state = seed;
  }

  next(): u32 {
    this.state = this.state * 1664525 + 1013904223;
    return this.state;
  }

  range(n: u32): u32 {
    return (this.next() >> 8) % n;
  }
}

function quickSort(arr: mut i32[], lo: i32, hi: i32): void {
  if (lo >= hi) {
    return;
  }
  const pivot = arr[((lo + hi) / 2) as usize];
  let i = lo;
  let j = hi;
  while (i <= j) {
    while (arr[i as usize] < pivot) {
      i++;
    }
    while (arr[j as usize] > pivot) {
      j--;
    }
    if (i <= j) {
      const tmp = arr[i as usize];
      arr[i as usize] = arr[j as usize];
      arr[j as usize] = tmp;
      i++;
      j--;
    }
  }
  quickSort(mut arr, lo, j);
  quickSort(mut arr, i, hi);
}

function mergeSort(arr: i32[]): i32[] {
  const n = arr.length;
  if (n <= 1) {
    return arr.clone();
  }
  const mid = n / 2;
  let left: i32[] = [];
  let right: i32[] = [];
  for (let i = 0; i < n; i++) {
    if (i < mid) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  const l = mergeSort(left);
  const r = mergeSort(right);
  let out: i32[] = [];
  let a: usize = 0;
  let b: usize = 0;
  while (a < l.length && b < r.length) {
    if (l[a] <= r[b]) {
      out.push(l[a]);
      a++;
    } else {
      out.push(r[b]);
      b++;
    }
  }
  while (a < l.length) {
    out.push(l[a]);
    a++;
  }
  while (b < r.length) {
    out.push(r[b]);
    b++;
  }
  return out;
}

function isSorted(xs: i32[]): bool {
  for (let i = 1; i < xs.length; i++) {
    if (xs[i - 1] > xs[i]) {
      return false;
    }
  }
  return true;
}

function checksum(xs: i32[]): i32 {
  let h: i32 = 17;
  for (const x of xs) {
    h = h * 31 + x;
  }
  return h;
}

export function main(): i32 {
  let rng = new Lcg(2024);
  let data: i32[] = [];
  for (let i = 0; i < 200; i++) {
    data.push(rng.range(1000) as i32 - 500);
  }
  let a = data.clone();
  quickSort(mut a, 0, a.length as i32 - 1);
  const b = mergeSort(data);
  print(isSorted(a));
  print(isSorted(b));
  print(checksum(a));
  print(checksum(b));
  print(a[0]);
  print(a[199]);
  print(checksum(data));
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
true
true
578515827
578515827
-500
497
-437372297
```
