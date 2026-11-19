---
title: kernel と Buffer
description: CPU と GPU で同じ意味になる kernel 関数と、共有のデータの置き場 Buffer。
sidebar:
  order: 5
---

`kernel function` は、GPU でも実行できる関数です。`dispatch(kernel, 個数, 引数...)` で、0 から個数未満の各添字について実行します。CPU で実行しても GPU で実行しても同じ結果になるように意味を決めてあります。ネイティブの CPU では、大きな dispatch を複数のスレッドに分けて実行します。

```um
struct Particle {
  pos: f32;
  vel: f32;
}

kernel function integrate(i: u32, ps: mut Buffer<Particle>, dt: f32): void {
  ps[i].pos = ps[i].pos + ps[i].vel * dt;
}

export function main(): i32 {
  let ps = new Buffer<Particle>(1000);   // 長さ固定、ゼロ埋め
  dispatch(integrate, ps.length, mut ps, 0.016);
  return 0;
}
```

- **`Buffer<T>` は CPU と GPU が共有するデータの置き場です。** 長さは固定で、要素は `i32` / `u32` / `f32` と、それらの `struct`・固定長配列・ベクトル、それに 8 / 16 ビットの整数 `i8` / `u8` / `i16` / `u16`（要素そのものとしてだけ。struct のフィールドや固定長配列の要素にはできない）に限ります。所有権の扱いは可変長配列と同じです。下の「8 / 16 ビットの整数の Buffer」を参照。
- **kernel の中で使える型は `bool` / `i32` / `u32` / `f32` と、それらの `struct`・固定長配列、`f32` / `i32` / `u32` のベクトルと行列、値が `i32` / `u32` / `f32` / `bool` だけの enum です。** 8 / 16 ビットの整数は、単独の値として読み書きと変換だけに使えます（下の「8 / 16 ビットの整数の Buffer」）。小数リテラルは `f32` になります。
- **kernel が書き込めるのは、`mut` の Buffer の `[i]` だけです。** `i` は第1引数（`u32`）で、各要素を別々の実行が担当するので競合しません。隣の要素は、別の（`mut` でない）Buffer から読みます。どの要素にも書きたいときは `RacyBuffer`（下の「スレッド」）を使います。
- **kernel は確保・`print`・通常の関数の呼び出し・再帰ができません。** 補助関数も `kernel function` として書きます。
- **kernel は停止しません（GPU に停止がないため）。** 範囲外の添字は最後の要素に切り詰めます。整数のゼロ除算は `x / 0 = x`、`x % 0 = 0`、シフト量はビット幅で割った余りです。
- **`dispatch` の個数は、書き込み先の Buffer の長さ以下でなければなりません。** 超えると停止します。
- **実行先は `dispatch` が自動で選びます。** 明示するときは `cpu.dispatch` / `gpu.dispatch` と書きます。GPU で実行できるビルドは、Mac の Metal（`UM_METAL=1`）と wasm32（WebGPU）です。それ以外のネイティブのビルドでは `dispatch` は常に CPU で、`gpu.dispatch` はコンパイルエラーです。`gpu.dispatch` は、GPU が使えない環境で実行すると停止します。
- **GPU で実行できるビルドでは、dispatch する kernel に値として渡す struct や配列に `bool` を含められません**（CPU と GPU でビット表現が違うため。`u32` の 0 / 1 を使うか、`cpu.dispatch` で呼びます）。
- **CPU と GPU を同時に走らせるには `gpu.submit` を使います**（下の「Metal（Mac）での GPU 実行」）。

例: [examples/kernels.um](/ja/examples/kernels/)、[examples/particles_kernel.um](/ja/examples/particles-kernel/)、[examples/parallel_kernels.um](/ja/examples/parallel-kernels/)。

## 8 / 16 ビットの整数の Buffer

`Buffer<i8>` / `Buffer<u8>` / `Buffer<i16>` / `Buffer<u16>`（と同じ要素の `RacyBuffer`）が使えます。量子化したニューラルネットの重み（i8 / i16）のような小さい整数を、詰め直さずにそのまま GPU と共有できます。

```um
kernel function affine(i: u32, out: mut RacyBuffer<i32>, w: Buffer<i8>, x: Buffer<u8>, n: u32): void {
  let acc: i32 = 0;
  for (let k: u32 = 0; k < n; k++) { acc = acc + (w[i * n + k] as i32) * (x[k] as i32); }
  out[i] = acc;
}
const t = gpu.submit(affine, rows, mut out, w, x, n);  // w と x は読むだけなので普通の Buffer でよい
const mine = affineCpu(w, x, 2, n);                     // そのあいだに CPU も同じ重みを読める
gpu.wait(t);
```

- **kernel の中の 8 / 16 ビットの値は、読み書き・比較・`as` での変換だけです。** 計算は `as i32` / `as u32` で広げてから行い、書くときに `as i8` などで戻します（`as` は下位のビットを残す。CPU と GPU で同じ値）。GPU では 32 ビットのレジスタに入れて持つので、演算ごとに切り詰め直す手間を避けるためです。浮動小数点との直接の変換もできません（32 ビットの整数を経由する）。kernel の外では、ほかの整数と同じにすべての演算が使えます。
- **dispatch する kernel の値の引数には使えません**（`i32` で受けて kernel の中で変換）。kernel の補助関数の引数と戻り値には使えます。
- **確保は 4 バイトの倍数に切り上げます**（長さは頼んだ数のまま）。GPU が 4 バイト単位で読み書きするためです。
- **GPU での実装**: Metal（MSL）では `char` / `uchar` / `short` / `ushort` をそのまま読み書きします。WebGPU（WGSL）には 8 / 16 ビットの整数がないので、`u32` の配列として渡し、要素を取り出す関数を通します。書き込みは、同じ語の隣の要素を別の実行が同時に書くので、アトミックな演算（`atomicAnd` + `atomicOr`、RacyBuffer では比較交換）で自分のビットだけを変えます。WGSL の版は Deno の WebGPU（wgpu）で、CPU と同じ結果になることを確かめました（`tests/metal/small_ints.um` の kernel）。
- **書く Buffer が 8 / 16 ビットの要素だと、Metal の検算による早い完了の確認は使いません**（Metal の完了の知らせを待つ）。
- `f16` の Buffer はまだありません（WGSL の f16 は拡張機能で、丸めの決まりを CPU と揃えられないため）。
- 例: [examples/small_ints.um](/ja/examples/small-ints/)。

## 標準の関数（詰めた小さい整数）

`runtime/prelude.um` の関数は、どのプログラムからもそのまま呼べます。BitNet のような3値の重みを、1個2ビットで `Buffer<u32>` に詰めて扱うためのものです。

```um
let weights = new Buffer<u32>(packed2Words(count));   // 必要なワード数
packed2Set(mut weights, k, -1);                       // 書く（CPU専用。範囲外は停止）
const w = packed2Get(weights, k);                     // 読む（-2 〜 1。kernel の中でも使える）
out[i] = ternaryDot(weights, i * inputs, x, 0, inputs); // 3値の重みと入力の積和（掛け算なし）
```

`w[i]` と書ける専用の型ではなく、関数です。3値の重みを「2ビットずつ詰める」形に決め打ちしています（5個を1バイトに詰める形は未対応）。1ビットの `packed1Words` / `packed1Get` / `packed1Set` もあります。例: [examples/packed_weights.um](/ja/examples/packed-weights/)。[examples/bitnet.um](/ja/examples/bitnet/) には、重みが -1 / 0 / +1 の3値の線形層（BitNet 風）を kernel で書いた例があります。
