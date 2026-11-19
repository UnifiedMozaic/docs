---
title: "vectors.um"
description: "vec2 / vec3 / vec4 は標準の型。演算子で成分ごとの計算ができ、kernel の中でも使える。"
---

vec2 / vec3 / vec4 は標準の型。演算子で成分ごとの計算ができ、kernel の中でも使える。

ソース: [examples/vectors.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/vectors.um)

```um title="vectors.um"
// vec2 / vec3 / vec4 は標準の型。演算子で成分ごとの計算ができ、kernel の中でも使える。
// expect: 5
// expect: 7
// expect: 9
// expect: 2.5
// expect: 3
// expect: 32
// expect: 5
// expect: 8
// expect: 16.5
// expect: 31
// expect: 4

struct Particle {
  pos: vec3<f32>;
  vel: vec3<f32>;
}

kernel function integrate(i: u32, ps: mut Buffer<Particle>, dt: f32): void {
  let p = ps[i];
  p.pos = p.pos + p.vel * dt;
  ps[i] = p;
}

export function main(): i32 {
  const a = vec3(1, 2, 3);
  const b: vec3<i32> = { x: 4, y: 5, z: 6 };
  const c = a + b;
  print(c.x);
  print(c.y);
  print(c.z);

  const h = vec2(5.0, 3.0) / 2;
  print(h.x);
  const n = -(a * 3 - b * 2) + vec3(0, 0, 0);
  print(n.z + n.x * 0 - 0);
  print(vec3Dot(a, b));
  print(vec2Length(vec2(3, 4)));
  const m = 2 * vec4(1, 2, 3, 4);
  print(m.w);

  let ps = new Buffer<Particle>(3);
  for (let i: u32 = 0; i < 3; i++) {
    ps[i] = { pos: vec3(i as f32, 0, 0), vel: vec3(1, 2, 3) };
  }
  for (let step = 0; step < 4; step++) {
    dispatch(integrate, 3, mut ps, 0.5);
  }
  print(ps[0].pos.x + ps[1].pos.y + ps[2].pos.z + ps[2].pos.x + 0.5);

  let total = vec2(0, 0);
  for (let i = 0; i < 5; i++) {
    total = total + vec2(i, i * 2);
    total = total * 1;
  }
  total.x += 1;
  print(total.x + total.y);
  const q = a * b / a;
  print(q.x);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
5
7
9
2.5
3
32
5
8
16.5
31
4
```
