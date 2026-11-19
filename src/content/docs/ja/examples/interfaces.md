---
title: "interfaces.um"
description: "interface は「このメソッドを持つ」という約束。class が implements で満たし、ジェネリック関数が `T extends 名前` で求める。呼び出しはコンパイル時に決まる（実行時のコストはない）。"
---

interface は「このメソッドを持つ」という約束。class が implements で満たし、ジェネリック関数が `T extends 名前` で求める。呼び出しはコンパイル時に決まる（実行時のコストはない）。

ソース: [examples/interfaces.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/interfaces.um)

```um title="interfaces.um"
// interface は「このメソッドを持つ」という約束。class が implements で満たし、
// ジェネリック関数が `T extends 名前` で求める。呼び出しはコンパイル時に決まる（実行時のコストはない）。
// expect: 12.56
// expect: 6
// expect: 50.24
// expect: 1856
// expect: square
// expect: 2

interface Shape {
  area(): f64;
  scale(k: f64): void;
}

interface Named {
  name(): string;
}

class Circle implements Shape {
  r: f64;

  constructor(r: f64) {
    this.r = r;
  }

  area(): f64 {
    return 3.14 * this.r * this.r;
  }

  scale(k: f64): void {
    this.r = this.r * k;
  }
}

class Rect implements Shape, Named {
  w: f64;
  h: f64;

  constructor(w: f64, h: f64) {
    this.w = w;
    this.h = h;
  }

  area(): f64 {
    return this.w * this.h;
  }

  scale(k: f64): void {
    this.w = this.w * k;
    this.h = this.h * k;
  }

  name(): string {
    return "square";
  }
}

function areaOf<T extends Shape>(s: T): f64 {
  return s.area();
}

function grow<T extends Shape>(s: mut T, k: f64): f64 {
  s.scale(k);
  return s.area();
}

function total<A extends Shape, B extends Shape>(a: A, b: B): f64 {
  return a.area() + b.area();
}

function label<T extends Named>(x: T): string {
  return x.name();
}

export function main(): i32 {
  let c = new Circle(2);
  let r = new Rect(2, 3);
  print(areaOf(c));
  print(areaOf(r));
  print(grow(mut c, 2));
  c.scale(0.5);
  print((total(c, r) * 100) as i32);
  print(label(r));
  print(label(r).length - 4);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
12.56
6
50.24
1856
square
2
```
