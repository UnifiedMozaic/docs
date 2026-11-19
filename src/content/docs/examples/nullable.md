---
title: "nullable.um"
description: "`T | null` expresses in the type that there may be no value."
---

`T | null` expresses in the type that there may be no value.

Source: [examples/nullable.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/nullable.um)

```um title="nullable.um"
// `T | null` は「値がないかもしれない」ことを型で表す。
// 使う前に null でないことを確かめないと、コンパイルエラーになる。
// expect: 2
// expect: -1
// expect: 30
// expect: none
// expect: bob
// expect: 7
// expect: 0
// expect: 5
// expect: 11
// expect: 3
// expect: true

struct Point {
  x: i32;
  y: i32;
}

struct User {
  name: string;
  age: i32 | null;
}

function indexOf(xs: i32[], target: i32): usize | null {
  for (let i: usize = 0; i < xs.length; i++) {
    if (xs[i] == target) {
      return i;
    }
  }
  return null;
}

function firstPositive(xs: i32[]): Point | null {
  for (const x of xs) {
    if (x > 0) {
      return { x: x, y: x * 2 };
    }
  }
  return null;
}

function nameOf(found: bool): string | null {
  if (found) {
    return "bob";
  }
  return null;
}

function orZero(v: i32 | null): i32 {
  return v ?? 0;
}

function describe(u: User): i32 {
  const age = u.age;
  if (age == null) {
    return -1;
  }
  // ここから先では age は i32。
  return age + 1;
}

export function main(): i32 {
  const xs: i32[] = [5, -3, 10, 0];
  const at = indexOf(xs, 10);
  if (at != null) {
    print(at);
  }
  const missing = indexOf(xs, 99);
  if (missing == null) {
    print(-1);
  } else {
    print(missing);
  }

  const p = firstPositive(xs);
  if (p != null) {
    print(p.x * 2 + p.y * 2);
  }

  const a = nameOf(false);
  if (a == null) {
    print("none");
  }
  const b = nameOf(true);
  if (b != null) {
    print(b);
  }

  print(orZero(7));
  print(orZero(null));

  let maybe: i32 | null = null;
  maybe = 5;
  const snapshot = maybe;
  print(snapshot ?? 9);

  const young: User = { name: "ann", age: 10 };
  const unknown: User = { name: "cy", age: null };
  print(describe(young));
  print(describe(unknown) + 4);

  // 入れ子のブロックで分かったことは、そのブロックの中だけで有効。
  const q = firstPositive([-1, -2]);
  let ok = false;
  if (xs.length > 0) {
    if (q == null) {
      ok = true;
    }
  }
  print(ok);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
2
-1
30
none
bob
7
0
5
11
3
true
```
