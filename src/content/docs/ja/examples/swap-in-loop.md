---
title: "swap_in_loop.um"
description: "ループの中での入れ替え。移動した変数は、周回の終わりまでに代入し直せば次の周回でも使える。"
---

ループの中での入れ替え。移動した変数は、周回の終わりまでに代入し直せば次の周回でも使える。

ソース: [examples/swap_in_loop.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/swap_in_loop.um)

```um title="swap_in_loop.um"
// ループの中での入れ替え。移動した変数は、周回の終わりまでに代入し直せば次の周回でも使える。
// for...of の反復中でも、反復している配列と関係のないフィールドは書き換えられる。
// expect: 2
// expect: 1
// expect: 8
// expect: 6
// expect: 3
// expect: 12
// expect: 3

kernel function step(i: u32, next: mut Buffer<i32>, cur: Buffer<i32>): void {
  next[i] = cur[i] * 2;
}

class Tally {
  items: i32[] = [];
  total: i32 = 0;
  count: i32 = 0;

  add(v: i32): void {
    this.items.push(v);
  }

  // items を反復しながら、別のフィールド total と count を更新する。
  finish(): void {
    for (const v of this.items) {
      this.total += v;
      this.count++;
    }
  }
}

struct Pair {
  left: i32[];
  right: i32[];
}

function takeFirst(xs: own i32[]): i32 {
  return xs[0];
}

export function main(): i32 {
  // 2つの配列を周回ごとに入れ替える。
  let a: i32[] = [1];
  let b: i32[] = [2];
  for (let g = 0; g < 3; g++) {
    const t = a;
    a = b;
    b = t;
  }
  print(a[0]);
  print(b[0]);

  // Buffer の入れ替え（シミュレーションで「現在」と「次」を交互に使う形）。
  let cur: Buffer<i32> = [1, 2, 3];
  let next = new Buffer<i32>(3);
  for (let g = 0; g < 3; g++) {
    dispatch(step, 3, mut next, cur);
    const old = cur;
    cur = next;
    next = old;
  }
  print(cur[0]);

  // ループの中で所有権を渡して、新しい値を入れ直す。
  let work: i32[] = [3];
  let sum = 0;
  for (let g = 0; g < 3; g++) {
    sum += takeFirst(own work);
    work = [g];
    if (g == 1) {
      continue;
    }
  }
  print(sum + work[0]);

  let tally = new Tally();
  tally.add(5);
  tally.add(3);
  tally.add(4);
  tally.finish();
  print(tally.count);
  print(tally.total);

  // 構造体の片方の配列を反復しながら、もう片方を伸ばす。
  let pair: Pair = { left: [1, 2, 3], right: [] };
  for (const v of pair.left) {
    pair.right.push(v * 2);
  }
  print(pair.right.length);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
2
1
8
6
3
12
3
```
