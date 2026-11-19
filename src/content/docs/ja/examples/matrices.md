---
title: "matrices.um"
description: "mat2 / mat3 / mat4 は標準の行列型。関数で積や転置を計算でき、kernel の中でも使える。"
---

mat2 / mat3 / mat4 は標準の行列型。関数で積や転置を計算でき、kernel の中でも使える。

ソース: [examples/matrices.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/matrices.um)

```um title="matrices.um"
// mat2 / mat3 / mat4 は標準の行列型。関数で積や転置を計算でき、kernel の中でも使える。
// expect: 1
// expect: 0
// expect: 19
// expect: 50
// expect: 17
// expect: 39
// expect: 3
// expect: 12
// expect: 14
// expect: 36

kernel function transform(i: u32, out: mut Buffer<vec3<f32>>, src: Buffer<vec3<f32>>, m: mat3<f32>): void {
  out[i] = mat3MulVec(m, src[i]);
}

export function main(): i32 {
  const id: mat2<i32> = mat2Identity();
  print(id.m[0]);
  print(id.m[1]);

  const a: mat2<i32> = { m: [1, 2, 3, 4] };
  const b: mat2<i32> = { m: [5, 6, 7, 8] };
  const ab = mat2Mul(a, b);
  print(ab.m[0]);
  print(ab.m[3]);
  const v = mat2MulVec(a, vec2(5, 6));
  print(v.x);
  print(v.y);
  print(mat2Transpose(a).m[1]);

  // 拡大と入れ替えを組み合わせた行列を、kernel で各点に掛ける。
  let scale: mat3<f32> = mat3Identity();
  scale.m[0] = 2;
  scale.m[4] = 3;
  scale.m[8] = 4;
  const swap: mat3<f32> = { m: [0, 1, 0, 1, 0, 0, 0, 0, 1] };
  const m = mat3Mul(swap, scale);
  let src = new Buffer<vec3<f32>>(4);
  for (let i: u32 = 0; i < 4; i++) {
    src[i] = vec3(i as f32, 1, 2);
  }
  let dst = new Buffer<vec3<f32>>(4);
  dispatch(transform, 4, mut dst, src, m);
  print(dst[0].x + dst[1].x + dst[2].x + dst[3].x);
  print(dst[0].y + dst[1].y + dst[2].y + dst[3].y + 2);

  const one: mat4<f64> = mat4Identity();
  const seq: mat4<f64> = { m: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] };
  const big = mat4Mul(one, mat4Transpose(seq));
  print(big.m[3] + big.m[12] + 19);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
1
0
19
50
17
39
3
12
14
36
```
