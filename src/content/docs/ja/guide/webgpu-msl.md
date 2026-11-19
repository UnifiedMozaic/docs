---
title: WebGPU と MSL の出力
description: ブラウザでの GPU 実行（実験的）と、MSL の出力。
sidebar:
  order: 7
---

## ブラウザでの GPU 実行（WebGPU、実験的）

**この経路は実験的で、今後は保守しません。** 今後足す kernel の機能は CPU と Metal だけを対象にし、WGSL では対応しない（コンパイルエラーにする）ことがあります。

wasm32 向けにビルドすると、dispatch している kernel が WGSL（WebGPU のシェーダ言語）に変換されて wasm に埋め込まれます。`runtime/host.mjs` の `instantiate` が、WebGPU でその kernel を実行します。

```js
import { instantiate } from './runtime/host.mjs';
const exports = await instantiate(wasmBytes, { print: console.log });
await exports.main();   // GPU が使える環境では Promise が返るので、常に await する
```

- **自動判断は単純です。** GPU が使えて、要素数がしきい値（既定 4096、`gpuThreshold` で変更可）以上なら GPU で実行します。実測による判断はありません。
- **dispatch のたびに Buffer を送り、書き込み先を読み戻します。** WebGPU では CPU と GPU のメモリが別だからです。小さい仕事や、CPU と頻繁に行き来する処理では、CPU の方が速くなります。
- **`gpu.submit` は、その場で最後まで実行して券 0 を返します。**
- **JSPI（WebAssembly の実行を一時停止して Promise を待つ機能）が必要です。** WebGPU の読み戻しは非同期でしか行えないためです。JSPI か WebGPU がない環境では GPU なしとして動き、`dispatch` は CPU で実行されます。デスクトップ版の Chrome / Edge 137 以降で使えます。
- **確かめた範囲**: Android の Chrome 系ブラウザ（Adreno GPU）で一度実行し、3本のテストのうち2本が一致しました。残り1本は範囲外の小数→整数変換だけの不一致で、その修正は実機で再確認していません。8 / 16 ビットの整数の kernel は、Deno の WebGPU で CPU と一致することを確かめました。
- **生成される WGSL を見るには** `node src/cli.ts build x.um --emit-wgsl` とします。

## MSL（Metal Shading Language）の出力

`node src/cli.ts build x.um --emit-msl` で、kernel ごとの MSL が `<出力>.<kernel>.metal` に書き出されます（`UM_METAL=1` のビルドに入るものと同じ変換です）。

- **Metal での確認**: Metal コンパイラ（Apple M4）で、テストと例の 51 個の kernel の MSL がすべてコンパイルできることを確かめました（2026-11-15）。GPU での実行は、`tests/metal` の kernel が CPU と同じ結果になることを Mac で確かめています（`node tests/run.ts` が Mac で実行します）。
- **Metal のない環境での確認**: 生成した MSL を、スタブヘッダ（`tests/msl/metal_stub.h`）つきで C++14 として `clang++` でコンパイルし（`tests/gpu` と `examples` の kernel すべて）、`tests/msl/kernels.um` の kernel は C++ として全添字で実行して、CPU の結果とチェックサムを比べます（`node tests/run.ts` が `clang++` があれば行います）。C++ として通ることは Metal の仕様に合っていることを意味しないので、Metal 固有の規則は Mac での実行で確かめます。
