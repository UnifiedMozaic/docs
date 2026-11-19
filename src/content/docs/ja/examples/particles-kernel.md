---
title: "particles_kernel.um"
description: "構造体の Buffer を kernel で更新する粒子シミュレーション。f32 の結果は他の言語の f32 演算と一致する。"
---

構造体の Buffer を kernel で更新する粒子シミュレーション。f32 の結果は他の言語の f32 演算と一致する。

ソース: [examples/particles_kernel.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/particles_kernel.um)

```um title="particles_kernel.um"
// 構造体の Buffer を kernel で更新する粒子シミュレーション。f32 の結果は他の言語の f32 演算と一致する。
// expect: 288
// expect: 7.5
// expect: 0.004557669162750244
// expect: 2
// expect: 19.97829818725586

struct Particle {
  x: f32;
  y: f32;
  vx: f32;
  vy: f32;
  bounces: u32;
}

kernel function step(i: u32, ps: mut Buffer<Particle>, dt: f32, gravity: f32, size: f32): void {
  let p = ps[i];
  p.vy = p.vy - gravity * dt;
  p.x = p.x + p.vx * dt;
  p.y = p.y + p.vy * dt;
  if (p.y < 0) {
    p.y = -p.y;
    p.vy = -p.vy * 0.5;
    p.bounces = p.bounces + 1;
  }
  if (p.x > size) {
    p.x = size - (p.x - size);
    p.vx = -p.vx;
  }
  if (p.x < 0) {
    p.x = -p.x;
    p.vx = -p.vx;
  }
  ps[i] = p;
}

kernel function energy(i: u32, out: mut Buffer<f32>, ps: Buffer<Particle>, gravity: f32): void {
  const p = ps[i];
  out[i] = 0.5 * (p.vx * p.vx + p.vy * p.vy) + gravity * p.y;
}

function initParticles(n: u32): Buffer<Particle> {
  let ps = new Buffer<Particle>(n);
  for (let i: u32 = 0; i < n; i++) {
    ps[i].x = (i * 3 % 10) as f32;
    ps[i].y = (10 + i % 7) as f32;
    ps[i].vx = (i % 5) as f32 - 2.0;
    ps[i].vy = 0.0;
  }
  return ps;
}

export function main(): i32 {
  const n: u32 = 16;
  let ps = initParticles(n);
  let e = new Buffer<f32>(n);
  for (let s = 0; s < 100; s++) {
    dispatch(step, n, mut ps, 0.0625, 9.5, 10.0);
  }
  dispatch(energy, n, mut e, ps, 9.5);
  let total: f32 = 0.0;
  let bounces: u32 = 0;
  for (let i: u32 = 0; i < n; i++) {
    total += e[i];
    bounces += ps[i].bounces;
  }
  print(bounces);
  print(ps[0].x);
  print(ps[5].y);
  print(ps[15].vx);
  print(total);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
288
7.5
0.004557669162750244
2
19.97829818725586
```
