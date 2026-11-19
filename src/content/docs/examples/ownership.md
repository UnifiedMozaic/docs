---
title: "ownership.um"
description: "A growable array `T[]` (the same type as `Array<T>`) keeps its elements on the heap."
---

A growable array `T[]` (the same type as `Array<T>`) keeps its elements on the heap.

Source: [examples/ownership.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/ownership.um)

```um title="ownership.um"
// 可変長配列 `T[]`（`Array<T>` と同じ型）はヒープに要素を持つ。
// ヒープを持つ値の所有者は常に1つ。代入・return・own 引数で所有権が移動し、
// 所有者がスコープを抜けると自動で解放される。関数の引数（修飾なし・mut）は借用。
// expect: 4
// expect: 19
// expect: 4
// expect: 3
// expect: 23
// expect: 119
// expect: 10
// expect: -1
// expect: 23
// expect: 23
// expect: 30
// expect: 4
// expect: 55
// expect: 0
// expect: 2
// expect: 26
// expect: 9
// expect: 2.5
// expect: 8
// expect: 4
// expect: 90
// expect: 0
// expect: 7
// expect: 11
// expect: 2
// expect: 3
// expect: 12

struct Point {
  x: i32;
  y: i32;
}

class Stack {
  private items: i32[] = [];
  pushes: i32 = 0;

  push(v: i32): void {
    this.items.push(v);
    this.pushes++;
  }

  pop(): i32 {
    return this.items.pop();
  }

  size(): usize {
    return this.items.length;
  }

  sum(): i32 {
    let total = 0;
    for (const v of this.items) {
      total += v;
    }
    return total;
  }
}

struct Mesh {
  points: Point[];
  name: i32;
}

// 借用: 読むだけ。
function sum(xs: i32[]): i32 {
  let total = 0;
  for (let i = 0; i < xs.length; i++) {
    total += xs[i];
  }
  return total;
}

// 可変借用: 呼び出し側の配列を書き換える。
function appendRange(xs: mut i32[], from: i32, to: i32): void {
  for (let v = from; v < to; v++) {
    xs.push(v);
  }
}

// 所有権を受け取る。関数の終わりで解放される。
function consume(xs: own i32[]): usize {
  return xs.length;
}

// 新しい配列を作って返す（所有権が呼び出し側へ移動する）。
function squares(n: i32): i32[] {
  let out: i32[] = [];
  for (let i = 0; i < n; i++) {
    out.push(i * i);
  }
  return out;
}

function firstOver(xs: i32[], limit: i32): i32 {
  for (const x of xs) {
    const scratch = squares(3);
    if (x > limit) {
      // 早期 return でも scratch は解放される。
      return x + scratch[2];
    }
  }
  return -1;
}

function makeMesh(n: i32): Mesh {
  let points: Point[] = [];
  for (let i = 0; i < n; i++) {
    points.push({ x: i, y: i * 10 });
  }
  return { points, name: n };
}

export function main(): i32 {
  // リテラル、push / pop、添字、length
  let xs: i32[] = [1, 2, 3];
  xs.push(4);
  xs[0] = 10;
  print(xs.length);
  print(sum(xs));
  print(xs.pop());
  print(xs.length);

  // 可変借用で伸ばす（容量の拡張をまたぐ）
  appendRange(mut xs, 100, 120);
  print(xs.length);
  print(xs[22]);

  // clone は独立したコピー
  let ys = xs.clone();
  ys[0] = -1;
  print(xs[0]);
  print(ys[0]);

  // 代入は移動。zs が所有者になり、ys はもう使えない。
  const zs = ys;
  print(zs.length);

  // own 引数に渡すと、所有権ごと渡る。
  print(consume(own zs));

  // 一時値は文の終わりで解放される。
  print(sum(squares(5)));
  print(squares(4).length);
  squares(100);

  // 再代入すると、古い配列は解放される。
  xs = squares(6);
  print(sum(xs));
  xs.clear();
  print(xs.length);

  // 条件つきの移動。どちらの分岐を通っても、ちょうど1回解放される。
  let a = squares(3);
  let b: i32[] = [];
  if (sum(a) > 100) {
    b = a;
  } else {
    b = [7, 8];
  }
  print(b.length);

  // ループの中で確保した配列は、周回ごとに解放される。break / continue でも同じ。
  let kept = 0;
  for (let i = 0; i < 10; i++) {
    const tmp = squares(i + 1);
    if (i == 2) {
      continue;
    }
    if (i == 5) {
      break;
    }
    kept += tmp[i];
  }
  print(kept);
  print(firstOver([1, 5, 9], 4));

  // ゼロ埋めの配列
  let grid = new Array<f64>(8);
  grid[3] = 2.5;
  print(grid[3] + grid[4]);
  print(grid.length);

  // 配列を持つ struct と class
  let m = makeMesh(3);
  m.points.push({ x: 7, y: 70 });
  print(m.points.length);
  print(m.points[3].y + m.points[2].y);
  m.points = [];
  print(m.points.length);

  let s = new Stack();
  s.push(5);
  s.push(6);
  s.push(7);
  print(s.pop());
  print(s.sum());
  print(s.size());
  print(s.pushes);

  // class の値も移動する。
  let t = s;
  t.push(1);
  print(t.sum());
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
4
19
4
3
23
119
10
-1
23
23
30
4
55
0
2
26
9
2.5
8
4
90
0
7
11
2
3
12
```
