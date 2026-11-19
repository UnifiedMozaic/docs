---
title: "classes.um"
description: "A class is a value type without inheritance. Methods and the constructor are written inside it."
---

A class is a value type without inheritance. Methods and the constructor are written inside it.

Source: [examples/classes.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/classes.um)

```um title="classes.um"
// class は継承なしの値型。メソッドとコンストラクタを中に書ける。
// this を書き換えるメソッドかどうかはコンパイラが本体から判断し、
// 書き換えるメソッドは let で宣言した変数に対してだけ呼べる。
// expect: 0
// expect: 6
// expect: 3
// expect: 6
// expect: 10
// expect: 25
// expect: 2
// expect: 7
// expect: 60
// expect: 4
// expect: 42

class Counter {
  private count: i32;
  step: i32;
  calls: i32 = 0;

  constructor(step: i32) {
    this.count = 0;
    this.step = step;
  }

  get(): i32 {
    return this.count;
  }

  increment(): void {
    this.count += this.step;
    this.calls++;
  }

  // 自分では書き換えないが、書き換えるメソッドを呼ぶので、これも書き換えるメソッドになる。
  incrementTwice(): void {
    this.increment();
    this.increment();
  }
}

struct Vec2 {
  x: f32;
  y: f32;
}

class Body {
  pos: Vec2;
  vel: Vec2;
  mass: f32 = 2;

  constructor(x: f32, y: f32) {
    this.pos = { x, y };
    this.vel = { x: 1, y: 2 };
  }

  private scaled(v: Vec2, s: f32): Vec2 {
    return { x: v.x * s, y: v.y * s };
  }

  momentum(): Vec2 {
    return this.scaled(this.vel, this.mass);
  }

  step(dt: f32): void {
    const d = this.scaled(this.vel, dt);
    this.pos.x += d.x;
    this.pos.y += d.y;
  }
}

// 初期値だけで作れる class はコンストラクタを省略できる。
class Stats {
  total: i32 = 0;
  n: i32 = 0;

  add(v: i32): void {
    this.total += v;
    this.n++;
  }
}

function bump(c: mut Counter): void {
  c.incrementTwice();
}

function makeCounter(): Counter {
  return new Counter(42);
}

export function main(): i32 {
  let c = new Counter(3);
  print(c.get());
  c.incrementTwice();
  print(c.get());
  print(c.step);

  // 代入はコピー。コピーを進めても元は変わらない。
  let d = c;
  bump(mut d);
  d.increment();
  print(c.get());

  let b = new Body(10, 20);
  print(b.pos.x);
  b.step(2.5);
  print(b.pos.y);
  const m = b.momentum();
  print(m.x);

  let s = new Stats();
  const xs: i32[4] = [10, 20, 30, 7];
  for (const x of xs) {
    if (x == 7) {
      print(x);
      continue;
    }
    s.add(x);
  }
  print(s.total);
  print(s.n + 1);

  // 一時値に対して、書き換えるメソッドを呼んでもよい（一時値が書き換わるだけ）。
  let t = makeCounter();
  t.increment();
  print(t.get());
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
0
6
3
6
10
25
2
7
60
4
42
```
