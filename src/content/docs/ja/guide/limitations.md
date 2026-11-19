---
title: まだないもの
description: まだない機能と、持たない方針の機能。
sidebar:
  order: 11
---

- **言語**: 関数値（アロー関数、`map` / `filter` などのコールバック）、グローバル変数（最上位の `let`。値の変わらない最上位の `const` は使えます）、配列や `struct` の定数、型の別名（`type`）、`static`、`readonly`、getter / setter、`async` / `await`、`unsafe`、interface を値の型として使うこと、ジェネリックなメソッド、ジェネリック関数の export、`switch` の case の途中の `break`、行列の演算子。
- **配列**: ヒープを持つ要素の配列の `.clone()`、固定長配列にヒープを持つ要素を入れること、配列の一部を指すビュー、`f4` を1バイトに2個詰めること、2^32 要素以上の Buffer。
- **kernel と GPU**: `f16` / `f8` / `f4` の Buffer と kernel、Metal 以外のネイティブの GPU、ループをまたいで dispatch をまとめること（いまは隣り合った dispatch 文だけ）。
- **入出力**: 上の「入出力」にある関数だけです。標準エラー出力、ファイルの追記や一部だけの読み書き、フォルダの操作、コマンドライン引数、ネットワークはありません。
- **wasm32**: スレッド（合流の時点でその場で実行します）、simd128。

次のものは、TypeScript にはありますが、この言語では持たない方針です（書くとエラーで置き換え先を示します）: 継承（`extends`、`protected`、`abstract`）、例外（`try` / `throw`。失敗は `Result<T, E>` で返します）、`var`、`for...in`、`T | null` 以外の union 型、省略できるフィールドや引数、引数の既定値、`number` / `any`。
