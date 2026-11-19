---
title: "racy_shared.um"
description: "RacyBuffer の共有の規則: 要素は読み取り借用からでも書ける。kernel の mut RacyBuffer には読み取り借用のまま渡せる。"
---

RacyBuffer の共有の規則: 要素は読み取り借用からでも書ける。kernel の mut RacyBuffer には読み取り借用のまま渡せる。

ソース: [examples/racy_shared.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/racy_shared.um)

```um title="racy_shared.um"
// RacyBuffer の共有の規則: 要素は読み取り借用からでも書ける。kernel の mut RacyBuffer には読み取り借用のまま渡せる。
// 64 ビットの要素（u64 / i64）は kernel の外で使える（置換表など）。

kernel function addOne(i: u32, out: mut RacyBuffer<u32>, from: RacyBuffer<u32>): void {
  out[i] = from[i] + 1;
}

struct Shared {
  table: RacyBuffer<u64>;
  stop: RacyBuffer<u32>;
}

// 読み取り借用の struct の中の RacyBuffer に書く（置換表の save と同じ形）。
function save(sh: Shared, key: u64, value: u64): void {
  const slot = (key % (sh.table.length as u64)) as u32;
  sh.table[slot] = value;
}

// 読み取り借用の RacyBuffer を、gpu.submit の mut 引数へ渡す（GPU がなければその場で実行する）。
function bump(b: RacyBuffer<u32>): void {
  const t = gpu.submit(addOne, b.length, mut b, b);
  gpu.wait(t);
}

function reader(sh: Shared): u64 {
  // 合図が立つまで回る。合図は別のスレッド（wasm32 では、起動の順に実行されるので、先に立っている）が立てる。
  while (sh.stop.load(0) == 0) {
  }
  return sh.table[3];
}

export function main(): i32 {
  // const の RacyBuffer の要素に書く
  const big = new RacyBuffer<u64>(8);
  big[1] = 18446744073709551615;
  print(big[1]);
  const neg = new RacyBuffer<i64>(2);
  neg[0] = -5;
  print(neg.fetchAdd(0, -10));
  print(neg[0]);

  let sh: Shared = { table: new RacyBuffer<u64>(16), stop: new RacyBuffer<u32>(1) };
  save(sh, 35, 99);
  print(sh.table[3]);

  // スレッドに貸している（凍結中の）RacyBuffer の要素にも書ける
  {
    sh.stop.store(0, 1);
    const h = thread.spawn(reader, sh);
    sh.table[3] = sh.table[3] + 1;
    print(thread.join(h) >= 99);
  }

  const b = new RacyBuffer<u32>(4);
  bump(b);
  bump(b);
  print(b[0] + b[3]);
  for (const x of b) {
    b[0] = x + 10;
  }
  print(b[0]);
  return 0;
}

// expect: 18446744073709551615
// expect: -5
// expect: -15
// expect: 99
// expect: true
// expect: 4
// expect: 12
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
18446744073709551615
-5
-15
99
true
4
12
```
