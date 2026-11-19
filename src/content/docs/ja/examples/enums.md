---
title: "enums.um"
description: "enum は「いくつかの選択肢のどれか」を表す値。選択肢ごとに値を持てる。"
---

enum は「いくつかの選択肢のどれか」を表す値。選択肢ごとに値を持てる。

ソース: [examples/enums.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/enums.um)

```um title="enums.um"
// enum は「いくつかの選択肢のどれか」を表す値。選択肢ごとに値を持てる。
// match はすべての選択肢を扱っているかをコンパイル時に確かめる。
// expect: 12.566370614359172
// expect: 6
// expect: 0
// expect: 3
// expect: rect
// expect: other
// expect: 7
// expect: -1
// expect: 30
// expect: 1 2 0

enum Shape {
  Circle(r: f64),
  Rect(w: f64, h: f64),
  Empty,
}

enum Op {
  Add(n: i32),
  Mul(n: i32),
  Neg,
  Reset,
}

struct Slot {
  id: i32;
  shape: Shape;
}

function area(s: Shape): f64 {
  match (s) {
    Shape.Circle(r) => {
      return 3.141592653589793 * r * r;
    }
    Shape.Rect(w, h) => {
      return w * h;
    }
    Shape.Empty => {
      return 0;
    }
  }
}

function apply(x: i32, op: Op): i32 {
  match (op) {
    Op.Add(n) => return x + n,
    Op.Mul(n) => return x * n,
    Op.Neg => return -x,
    _ => return 0,
  }
}

// kernel の中でも使える（値が i32 / u32 / f32 / bool の enum）。
enum Rule {
  Scale(k: f32),
  Offset(d: f32),
  Keep,
}

kernel function step(i: u32, out: mut Buffer<f32>, rule: Rule): void {
  match (rule) {
    Rule.Scale(k) => {
      out[i] = out[i] * k;
    }
    Rule.Offset(d) => {
      out[i] = out[i] + d;
    }
    Rule.Keep => {}
  }
}

export function main(): i32 {
  print(area(Shape.Circle(2)));
  print(area(Shape.Rect(2, 3)));
  print(area(Shape.Empty));

  let slots: Slot[] = [];
  slots.push({ id: 1, shape: Shape.Circle(1) });
  slots.push({ id: 2, shape: Shape.Rect(1, 1) });
  slots.push({ id: 3, shape: Shape.Empty });
  let total = 0;
  for (const s of slots) {
    match (s.shape) {
      Shape.Empty => {}
      _ => {
        total += s.id;
      }
    }
  }
  print(total);

  let kind: Shape = Shape.Rect(1, 2);
  for (let i = 0; i < 2; i++) {
    match (kind) {
      Shape.Rect(_, h) => {
        print("rect");
        kind = Shape.Circle(h);
      }
      _ => print("other"),
    }
  }

  let x = 3;
  x = apply(x, Op.Add(4));
  print(x);
  print(apply(apply(x, Op.Mul(0)), Op.Reset) - 1);

  let buf: Buffer<f32> = [1, 2, 3];
  dispatch(step, 3, mut buf, Rule.Scale(2));
  dispatch(step, 3, mut buf, Rule.Offset(3));
  dispatch(step, 3, mut buf, Rule.Keep);
  print(buf[0] + buf[1] + buf[2] + 9);

  const a = apply(1, Op.Mul(1));
  const b = apply(-2, Op.Neg);
  const c = apply(5, Op.Reset);
  print(`${a} ${b} ${c}`);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
12.566370614359172
6
0
3
rect
other
7
-1
30
1 2 0
```
