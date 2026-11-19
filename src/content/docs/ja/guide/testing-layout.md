---
title: テストと構成
description: テストの実行と、リポジトリの構成。
sidebar:
  order: 12
---

## テスト

```sh
node tests/run.ts
```

`examples/` の各プログラムを wasm32 とこのマシンのネイティブで実行して出力を照合し（`// expect:` 行と比べます。`// stdin: 行` と書いた行は標準入力として与えます）、arm64 macOS 向けのオブジェクト生成を確認します。AddressSanitizer か valgrind がある環境では（Mac では AddressSanitizer と `leaks`）、メモリ検査つきでも実行して、解放後使用・範囲外アクセス・二重解放・解放漏れがないことを確かめます。あわせて、エラーになるべきコード（`tests/errors/`）と停止するべきコード（`tests/panics/`）を確認します。スレッドのテスト（`tests/threads/`、ネイティブだけ）は、ThreadSanitizer つきでも実行してデータ競合がないことを確かめます。`tests/metal/` は、Mac では Metal で実行して CPU の結果と比べ、それ以外では arm64 向けに作れることだけを確かめます。

- 個別に実行するオプションはありません。1つだけ確かめるときは、そのファイルをビルドして実行し、`// expect:` 行と出力を見比べます。
- wasm32 のテストは、wasm32 を出せる clang がない環境（Mac の Xcode の clang など）では飛ばされます。

## 構成

```
src/lexer.ts     字句解析
src/parser.ts    構文解析
src/checker.ts   型検査と借用の検査、kernel の制約、定数の評価
src/codegen.ts   LLVM IR（テキスト）の生成
src/msl.ts       kernel から MSL（Metal）への変換
src/wgsl.ts      kernel から WGSL（WebGPU。実験的）への変換
src/driver.ts    clang の呼び出し
src/cli.ts       コマンド
runtime/         ネイティブ（native.c）、Metal（metal.m）、wasm（wasm_rt.c と host.mjs。WebGPU での実行を含む）のランタイム、標準の関数（prelude.um）
assets/logo/     ロゴ（SVG と PNG）
examples/        動くサンプル（テストを兼ねる）
tests/           テストランナーと、エラー系・停止系・スレッド・Metal・MSL などのケース
docs/            このガイド
```

プロジェクト自体のセキュリティ方針は [SECURITY.md](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/SECURITY.md) にあります。
