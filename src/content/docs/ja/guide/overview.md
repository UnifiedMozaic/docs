---
title: 概要
description: UnifiedMozaic の言語ガイド。必要なもの、いま書けるもの、決まりごと。
sidebar:
  order: 1
---

UnifiedMozaic は、TypeScript 風の文法で書き、GC なしでネイティブバイナリと WebAssembly に落とす言語です。CPU と GPU のコードを同じソース（`.um`）で書けます。このガイドでは、いま書けるものと、その決まりごとを説明します。

```um
struct Vec3 {
  x: f32;
  y: f32;
  z: f32;
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

// mut は可変借用。呼び出し側にも mut と書く。
function scaleInPlace(v: mut Vec3, s: f32): void {
  v.x *= s;
  v.y *= s;
  v.z *= s;
}

export function main(): i32 {
  let v: Vec3 = add({ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 });
  scaleInPlace(mut v, 0.5);
  print(v.x);
  return 0;
}
```

**いまの状態:** 言語とランタイムは試験段階で、よく変わります。`kernel` 関数は、ネイティブでは CPU の複数のスレッドで、Mac（Apple Silicon）では Metal で GPU でも実行できます（下の「Metal（Mac）での GPU 実行」）。wasm32 向けの WebGPU での実行は実験的で、今後は保守しません（下の「ブラウザでの GPU 実行（WebGPU、実験的）」）。

## 必要なもの・使い方

入れ方は [環境構築](/ja/getting-started/installation/)、最初の一歩は [README.ja.md](/ja/getting-started/quick-start/) にあります。要点だけ書きます。

- Node.js 22.18 以上（TypeScript をそのまま実行します。npm パッケージへの依存はありません）
- LLVM 18 以上の `clang`。wasm32 を出すには `wasm-ld` も必要です
  - macOS: Xcode の clang は wasm に対応していないため、wasm32 を使う場合は `brew install llvm lld` で入れたものを使ってください（`UM_CLANG` で clang の場所を指定できます）

```sh
# wasm32（既定）
node src/cli.ts build examples/structs.um -o structs.wasm
node runtime/run-node.mjs structs.wasm

# このマシン向けのネイティブバイナリ
node src/cli.ts build examples/structs.um --target host -o structs
./structs

# Mac で kernel を GPU（Metal）でも実行するネイティブバイナリ
UM_METAL=1 node src/cli.ts build examples/kernels.um --target host -o kernels

# Apple Silicon の macOS 向け（Mac 以外ではオブジェクトファイルまで）
node src/cli.ts build examples/structs.um --target arm64-macos -o structs

# 型検査だけ。--json で診断を機械可読な形で出す
node src/cli.ts check examples/structs.um --json

# 生成される LLVM IR を見る（--emit-wgsl / --emit-msl で kernel のシェーダも書き出す）
node src/cli.ts build examples/structs.um --emit-llvm -o structs.ll
```

ブラウザでは `runtime/host.mjs` の `instantiate(bytes)` で読み込み、`export` した関数を呼びます。

## いま書けるもの

| 分類 | 内容 |
| --- | --- |
| 型 | `i8`〜`i64`、`u8`〜`u64`、`usize`、`f4`、`f8`、`f16`、`f32`、`f64`、`bool`、`string`、`struct`、`enum`（値つき。`match` で分岐）、`class`、固定長配列 `T[N]`、可変長配列 `T[]`（`Array<T>` と同じ）、`Buffer<T>`、`RacyBuffer<T>`、`T \| null`、標準の `Result<T, E>`、ベクトルと行列 `vec2<T>`〜`vec4<T>` / `mat2<T>`〜`mat4<T>`、SIMD の `i8x16` など |
| 宣言 | `function`、`export function`、`kernel function`、`struct`、`enum`、`class`（フィールド、初期値、`constructor`、メソッド、`private`、`implements`）、`interface`、ジェネリックな関数・struct・class・enum・kernel、最上位の定数 `const NAME: T = 定数式;`（`export const` も可）、`import { a, b } from "./x.um";` |
| 文 | `let` / `const`（`let x: T;` はゼロで初期化）、代入と複合代入、`++` / `--`、`if` / `else`、`while`、`do ... while`、`for (;;)`、`for...of`、`switch`、`match`、`break`、`continue`、`return` |
| 式 | 四則演算と剰余、比較、`&&` / `\|\|` / `!`、条件式 `a ? b : c`、`x ?? 既定値`、ビット演算とシフト、`as` による変換、関数とメソッドの呼び出し、`new`、`this`、フィールドと添字、オブジェクトリテラル、配列リテラル、`new Array<T>(n)`、`xs.length`、テンプレート文字列 `` `x = ${x}` ``、`String(x)` |
| 配列のメソッド | `push`、`pop`、`clear`、`clone`、一括の書き込み `fill(v)` / `fill(v, start, end)`（Buffer / RacyBuffer にも。下の「一括の書き込み」） |
| 組み込み | `print(x)`（数、`bool`、文字列）、`dispatch` / `cpu.dispatch` / `gpu.dispatch`、`gpu.submit` / `gpu.ready` / `gpu.wait`、`thread.*`（下の「スレッド」）、`Math.sqrt` / `floor` / `ceil` / `abs` / `min` / `max`、ビット演算の `Math.popcount` / `clz` / `ctz`、マスクつきシフト `Math.shl` / `Math.shr`（下の「マスクつきシフトと範囲チェックの除去」）、先読み `Math.prefetch(arr, i)`（下の「先読み」）、SIMD の `Simd.*`（下の「SIMD のベクトル」） |
| 入出力の組み込み | `readLine()`、`inputReady()`、`clock()`、`stringFromBytes(bytes)`、`readFile(path)`、`writeFile(path, bytes)`（下の「入出力」） |

それぞれの書き方は、下の各節と「そのほかの機能」の例にあります。

決まりごと:

- **暗黙の型変換はありません。** `i32` と `f64` を混ぜるときは `as` で明示します。数値リテラルは文脈の型に合わせます。
- **引数の渡し方は3種類です。** 修飾なしは読み取り借用、`mut` は可変借用、`own` は所有権の移動です。`mut` と `own` は呼び出し側にも書きます。
- **構造体・`class`・配列は値型です。** 代入すると、ヒープを持たない値はコピーされ、ヒープを持つ値は移動します（下の「所有権」）。
- **`class` に継承はありません。** `struct` はオブジェクトリテラルで、`class` は `new` で作ります。共通のメソッドの約束には `interface` を使います。
- **メソッドが `this` を書き換えるかどうかは、コンパイラが本体から判断します。** 書き換えるメソッドは、`let` で宣言した変数か `mut` の引数に対してだけ呼べます。
- **コンストラクタは全フィールドを初期化します。** 最上位の `this.x = ...` か、フィールドの初期値（`x: i32 = 0`）で与えます。初期化が済むまで `this` 全体は使えません。
- **`for...of` の要素は、数などはコピー、ヒープを持つ要素（文字列や配列）は借用です。** 借用するときは `for (const x of xs)` と書きます。境界検査は入りません。反復中の配列は書き換えられません。
- **`for (let i = 0; i < xs.length; i++)` の `i` は、比較相手の型（ここでは `usize`）になります。** それ以外の場所では `xs.length` は `usize` なので、`i32` と混ぜるときは `as` が要ります。
- **`usize` の幅はターゲットで違います（wasm32 は32ビット、ネイティブは64ビット）。** 幅に依存する計算には `u32` や `u64` を明示してください。
- **符号なし整数に `>= 0` と書くとコンパイルエラーです。** 常に真で、逆順のループが止まらなくなるためです。
- **代入は右辺を先に評価します。** `a[f()] = g()` は `g()`、`f()` の順です（JavaScript とは逆）。右辺が配列を伸ばしても、代入先を安全に求められるようにするためです。
- **`print` の浮動小数点の表記は、どのターゲットでも JavaScript と同じです。**
- **`Math.min` / `Math.max` は「比較して選ぶ」定義です。** どちらかが NaN のときは2番目の引数を返します（JavaScript とは違います）。
- **ネイティブのプログラムには `export function main(): i32`（引数なし）が要ります。**
