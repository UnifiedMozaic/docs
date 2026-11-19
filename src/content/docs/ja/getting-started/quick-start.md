---
title: クイックスタート
description: 最初の UnifiedMozaic のプログラムをビルドして実行する。
sidebar:
  order: 3
---

取ってきたリポジトリの中で実行します（[環境構築](/ja/getting-started/installation/)）。`um` コマンドを使えるようにした場合は、`node src/cli.ts` を `um` に置き換えられます。

## ネイティブバイナリ

```sh
node src/cli.ts build examples/structs.um --target host -o structs
./structs                   # 32、1.5、2.5、3.5、7、1 と出る
```

## Metal での GPU 実行（Apple Silicon）

kernel を Metal で GPU 実行するネイティブバイナリ:

```sh
UM_METAL=1 node src/cli.ts build examples/gpu_submit.um --target host -o gpu_submit
./gpu_submit                # 30、true、285、3 と出る
```

## WebAssembly

wasm32 が既定のターゲットです。wasm32 を出せる clang が必要です。

```sh
node src/cli.ts build examples/structs.um -o structs.wasm
node runtime/run-node.mjs structs.wasm
```

## 型検査だけ

```sh
node src/cli.ts check examples/structs.um
```

`--json` を付けると、診断を機械可読な形で出します。

## 生成されるコードを見る

```sh
node src/cli.ts build examples/kernels.um --emit-llvm -o kernels.ll
node src/cli.ts build examples/kernels.um --target host --emit-msl -o kernels   # kernels.<名前>.metal
```

## 次に

- [`examples/`](https://github.com/UnifiedMozaic/UnifiedMozaic/tree/main/examples) のプログラムはどれも動き、テストを兼ねています（`// expect:` の行）。
- [エディタ](/ja/getting-started/editor/)を用意する。
