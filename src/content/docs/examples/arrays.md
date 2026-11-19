---
title: "arrays.um"
description: "Fixed-length arrays. Indexing is bounds-checked."
---

Fixed-length arrays. Indexing is bounds-checked.

Source: [examples/arrays.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/arrays.um)

```um title="arrays.um"
// 固定長配列。添字アクセスは境界検査つき。
// expect: 15
// expect: 1
// expect: 2
// expect: 3
// expect: 4
// expect: 5
// expect: 6
// expect: 9

struct Grid {
  cells: i32[9];
  width: i32;
}

function sum(xs: i32[5]): i32 {
  let total = 0;
  for (let i = 0; i < xs.length; i++) {
    total += xs[i];
  }
  return total;
}

function sort(xs: mut i32[5]): void {
  for (let i = 0; i < xs.length; i++) {
    for (let j = 0; j < xs.length - 1 - i; j++) {
      if (xs[j] > xs[j + 1]) {
        const tmp = xs[j];
        xs[j] = xs[j + 1];
        xs[j + 1] = tmp;
      }
    }
  }
}

function identity(): f64[4] {
  return [1, 0, 0, 1];
}

export function main(): i32 {
  let xs: i32[5] = [5, 3, 1, 4, 2];
  print(sum(xs));
  sort(mut xs);
  for (let i = 0; i < 5; i++) {
    print(xs[i]);
  }

  let g: Grid = { cells: [0, 0, 0, 0, 0, 0, 0, 0, 0], width: 3 };
  g.cells[1 * g.width + 2] = 6;
  print(g.cells[5]);
  print(g.cells.length);

  const m = identity();
  if (m[0] + m[3] != 2) {
    return 1;
  }
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
15
1
2
3
4
5
6
9
```
