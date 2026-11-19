---
title: "threads.um"
description: "スレッド: thread.spawn / thread.spawnEach / thread.join、RacyBuffer の共有とアトミック演算。"
---

スレッド: thread.spawn / thread.spawnEach / thread.join、RacyBuffer の共有とアトミック演算。

ソース: [examples/threads.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/threads.um)

```um title="threads.um"
// スレッド: thread.spawn / thread.spawnEach / thread.join、RacyBuffer の共有とアトミック演算。
// wasm32 にはスレッドがないので、合流の時点でその場で実行する（出力は同じ）。

function square(x: i32): i32 {
  return x * x;
}

function greet(name: string, n: i32): string {
  return `${name} #${n}`;
}

// own で受け取った配列を書き換えて返す。
function doubled(xs: own i32[]): i32[] {
  for (let i = 0; i < xs.length; i++) {
    xs[i] = xs[i] * 2;
  }
  return xs;
}

// 読み取り借用で共有した配列の、k 番目の区間の和。
function partSum(k: u32, data: i32[], parts: u32): i64 {
  const n = data.length as u32;
  let sum: i64 = 0;
  for (let i = k * n / parts; i < (k + 1) * n / parts; i++) {
    sum += data[i] as i64;
  }
  return sum;
}

// スレッドごとの枠に書く（ほかのスレッドとは別の要素）。
function countInto(k: u32, slots: RacyBuffer<u64>, n: u32): void {
  for (let i: u32 = 0; i < n; i++) {
    slots[k] = slots[k] + 1;
  }
}

// 全スレッドで同じ要素に足す（fetchAdd は正確）。
function addMany(k: u32, total: RacyBuffer<u32>, n: u32): u32 {
  for (let i: u32 = 0; i < n; i++) {
    total.fetchAdd(0, 1);
  }
  return k;
}

struct Worker {
  id: u32;
  log: string[];
}

function work(w: own Worker, rounds: i32): Worker {
  for (let i = 0; i < rounds; i++) {
    w.log.push(`w${w.id}:${i}`);
  }
  return w;
}

function noop(x: i32): void {
  if (x < 0) {
    print(x);
  }
}

export function main(): i32 {
  // 数を返す
  const h = thread.spawn(square, 12);
  print(thread.join(h));

  // 文字列を返す（読み取り借用で文字列を渡す）
  const who = "worker";
  const hs = thread.spawn(greet, who, 3);
  print(thread.join(hs));

  // own で渡した配列を返してもらう
  let xs: i32[] = [1, 2, 3];
  const hd: Thread<i32[]> = thread.spawn(doubled, own xs);
  xs = thread.join(hd);
  print(xs[0] + xs[1] + xs[2]);

  // spawnEach: 結果は items と同じ順
  const ids: u32[] = [0, 1, 2, 3];
  let data: i32[] = [];
  for (let i = 0; i < 1000; i++) {
    data.push(i);
  }
  {
    const g = thread.spawnEach(partSum, own ids, data, 4);
    const sums = thread.join(g);
    let total: i64 = 0;
    for (const s of sums) {
      total += s;
    }
    print(sums.length);
    print(total);
  }

  // RacyBuffer のスレッドごとの枠に書いて、メインで足す
  const slots = new RacyBuffer<u64>(4);
  {
    const ks: u32[] = [0, 1, 2, 3];
    const g = thread.spawnEach(countInto, own ks, slots, 1000);
  }
  print(slots[0] + slots[1] + slots[2] + slots[3]);

  // fetchAdd の合計は正確
  const total = new RacyBuffer<u32>(1);
  {
    const ks: u32[] = [0, 1, 2, 3, 4, 5, 6, 7];
    const g = thread.spawnEach(addMany, own ks, total, 5000);
    const back = thread.join(g);
    print(back[7]);
  }
  print(total.load(0));
  print(total.compareExchange(0, 40000, 7));
  print(total[0]);

  // スレッドごとの状態を移動で渡し、戻り値で返してもらう
  let ws: Worker[] = [];
  for (let i: u32 = 0; i < 3; i++) {
    ws.push({ id: i, log: [] });
  }
  {
    const g = thread.spawnEach(work, own ws, 2);
    ws = thread.join(g);
  }
  print(ws[2].log[1]);

  // 合流しなかったスレッドは、ブロックの終わりで自動で合流する
  {
    const h1 = thread.spawn(noop, 1);
    const h2 = thread.spawn(square, 5);
  }
  // thread.yield() は CPU をほかのスレッドに譲る（RacyBuffer の印を見ながら待つループで使う。値はない）
  thread.yield();
  print(thread.cpus() >= 1);
  return 0;
}

// expect: 144
// expect: worker #3
// expect: 12
// expect: 4
// expect: 499500
// expect: 4000
// expect: 7
// expect: 40000
// expect: 40000
// expect: 7
// expect: w2:1
// expect: true
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
144
worker #3
12
4
499500
4000
7
40000
40000
7
w2:1
true
```
