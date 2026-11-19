---
title: 概要
description: UnifiedMozaic とは何か、何ができるか。
sidebar:
  order: 1
---

TypeScript 風の文法で書く、静的型の小さな言語です。LLVM を通して、GC なしのネイティブバイナリと WebAssembly にコンパイルします。CPU と GPU のコードを同じソース（`.um`）に書けます。

:::caution[実験的なプロジェクトです]
1 人で開発していて、言語もランタイムもよく変わります。
:::

## 特徴

- **TypeScript に近い文法と、明示的な型。** 幅つきの数値型（`i8`〜`i64`、`u8`〜`u64`、`f16` / `f32` / `f64`、小さい小数 `f4` / `f8`）、`struct`、`class`（継承なし）、`enum` と `match`、interface、ジェネリクス、文字列、null になりうる型。暗黙の型変換はありません。
- **GC の代わりに所有権。** 配列などヒープを持つ値の所有者は常に 1 つです。引数は読み取り借用（既定）・可変借用（`mut`）・移動（`own`）で、コンパイル時に検査します。
- **既定で安全。** 範囲外アクセス・整数のゼロ除算・ビット幅以上のシフトは、理由を示して停止します。整数のオーバーフローはラップします。未定義動作も `unsafe` もありません。
- **CPU と GPU を 1 つのソースで。** `kernel` 関数はどの実行先でも同じ意味です。CPU のスレッドプール、Metal（MSL）による Apple の GPU、実験的に WebGPU（WGSL）で動きます。`dispatch` は CPU と GPU を実測で選び、`gpu.submit` / `gpu.ready` / `gpu.wait` で GPU の仕事を待たずに進められます。
- **スレッド。** `thread.spawn` / `thread.join`。複数のスレッドで書き換えられるのは `RacyBuffer` だけ（要素の読み書きはアトミック）なので、データ競合は起きません。
- **速さが要る所のための機能。** 128 ビットの SIMD の型（`i8x16`、`i16x8`、`f32x4` など）、`Math.prefetch`、マスクつきシフト、範囲チェックの除去、一括の書き込み `fill`。
- **人にも AI にも読みやすい診断。** エラーには原因コード・位置・直し方のヒントが付き、`check --json` で機械可読な形でも出せます。
- **npm の依存なし。** コンパイラは Node.js がそのまま実行する TypeScript で、外部のツールは `clang` だけです。

## 例

```um
struct Particle {
  pos: f32;
  vel: f32;
}

// kernel は添字ごとに 1 回ずつ、CPU（全コア）か GPU で実行される。
kernel function integrate(i: u32, ps: mut Buffer<Particle>, dt: f32): void {
  ps[i].pos = ps[i].pos + ps[i].vel * dt;
}

export function main(): i32 {
  let ps = new Buffer<Particle>(1000);        // 長さ固定、ゼロ埋め
  ps[0].vel = 2;
  dispatch(integrate, ps.length, mut ps, 0.5);
  print(ps[0].pos);                           // 1
  return 0;
}
```

## 構成

```
src/        コンパイラ: lexer → parser → checker → codegen（LLVM IR）→ driver（clang）
            と、kernel の変換 msl.ts（Metal）・wgsl.ts（WebGPU）
runtime/    ネイティブ（C）・Metal（Objective-C）・wasm のランタイムと JS のホスト
examples/   サンプル（テストを兼ねる）
tests/      テストランナーとテストケース
assets/     ロゴ
docs/       説明書
```

## ライセンス

[Apache License, Version 2.0](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/LICENSE-APACHE) と [MIT license](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/LICENSE-MIT) のどちらかを選んで使えます。

セキュリティ方針と脆弱性の報告のしかたは [SECURITY.md](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/SECURITY.md) にあります。
