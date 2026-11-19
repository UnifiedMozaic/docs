---
title: "structs.um"
description: "Structs are value types. Unqualified arguments are read-only borrows; mut is a mutable borrow."
---

Structs are value types. Unqualified arguments are read-only borrows; mut is a mutable borrow.

Source: [examples/structs.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/structs.um)

```um title="structs.um"
// 構造体は値型。修飾なしの引数は読み取り借用、mut は可変借用。
// expect: 32
// expect: 1.5
// expect: 2.5
// expect: 3.5
// expect: 7
// expect: 1

struct Vec3 {
  x: f32;
  y: f32;
  z: f32;
}

struct Particle {
  pos: Vec3;
  vel: Vec3;
  id: i32;
}

function dot(a: Vec3, b: Vec3): f32 {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scale(v: Vec3, s: f32): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function step(p: mut Particle, dt: f32): void {
  p.pos = add(p.pos, scale(p.vel, dt));
}

export function main(): i32 {
  const a: Vec3 = { x: 1, y: 2, z: 3 };
  const b: Vec3 = { x: 4, y: 5, z: 6 };
  print(dot(a, b));

  let p: Particle = { pos: a, vel: { x: 1, y: 1, z: 1 }, id: 7 };
  step(mut p, 0.5);
  print(p.pos.x);
  print(p.pos.y);
  print(p.pos.z);
  print(p.id);

  // 代入はコピー。コピー先を書き換えても元は変わらない。
  let q = p;
  q.vel.x = 9;
  print(p.vel.x);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
32
1.5
2.5
3.5
7
1
```
