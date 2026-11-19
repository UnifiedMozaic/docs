---
title: そのほかの機能と最上位の定数
description: enum と match、Result、null になりうる型、ジェネリクス、interface、文字列、最上位の定数など。
sidebar:
  order: 2
---

## そのほかの機能

短い説明と例です。例はどれもテストを兼ねていて、そのまま動きます。

| 機能 | 要点 | 例 |
| --- | --- | --- |
| `enum` と `match` | 選択肢ごとに値を持てます（`Shape.Circle(1.5)`）。`match` は文で、すべての選択肢を扱わないとコンパイルエラーです。値が `i32` / `u32` / `f32` / `bool` だけの enum は kernel でも使えます。 | [enums.um](/ja/examples/enums/) |
| `Result<T, E>` | 標準の enum（`Result.Ok(v)` / `Result.Err(e)`）。enum の値には文字列や配列も持てます。例外（`try` / `throw`）はありません。 | [results.um](/ja/examples/results/) |
| `T \| null` | 使う前に `if (x != null)` などで確かめます（`const` の変数だけが絞り込まれます）。`x ?? 既定値` も使えます。配列の要素にするときは `(string \| null)[]` とかっこで囲みます。ほかの union 型はありません。 | [nullable.um](/ja/examples/nullable/)、[optional_arrays.um](/ja/examples/optional-arrays/) |
| ジェネリクス | `function f<T>(...)`、`struct Pair<A, B>`、`class Stack<T>`、`enum Maybe<T>`。型引数は実引数（または求められている型）から決まり、使われた型ごとに複製されます。ジェネリックなメソッドとジェネリック関数の export はまだありません。 | [generics.um](/ja/examples/generics/)、[generic_structs.um](/ja/examples/generic-structs/)、[generic_classes.um](/ja/examples/generic-classes/) |
| `interface` | 「このメソッドを持つ」という約束です。class が `implements` で満たし、ジェネリック関数が `T extends 名前` で求めます。呼び出しはコンパイル時に決まります。interface を値の型として使うことはできません。 | [interfaces.um](/ja/examples/interfaces/) |
| `switch` / `do ... while` | `switch` は整数・`bool`・文字列で分岐します。各 `case` は `break` / `return` / `continue` で終えます（次の case へ落ちる書き方はエラー。ラベルを並べて本体を共有するのは可）。 | [switches.um](/ja/examples/switches/)、[do_while.um](/ja/examples/do-while/) |
| 文字列 | UTF-8 のバイト列を持つ、書き換えできない値です。`+` で連結、`==` で比較、`.length` と `s[i]` はバイト単位です。 | [strings.um](/ja/examples/strings/) |
| ヒープを持つ要素の配列 | `string[]`、`i32[][]`、配列を持つ struct の配列、自分自身の配列を持つ struct（木）が書けます（下の「所有権」）。 | [nested_arrays.um](/ja/examples/nested-arrays/) |
| ベクトルと行列 | `vec2` / `vec3` / `vec4` は演算子で成分ごとに計算できます。`mat2` / `mat3` / `mat4` は関数（`mat3Mul` など）で計算します。`f32` / `i32` / `u32` のベクトルは kernel と `Buffer` で、行列は kernel の中でも使えます。 | [vectors.um](/ja/examples/vectors/)、[matrices.um](/ja/examples/matrices/) |
| 小さい浮動小数点 | `f16`（IEEE 754 半精度）、`f8`（FP8 E4M3）、`f4`（FP4 E2M1）。演算の結果は、正確な値をその型に丸めたものです。kernel と `Buffer` ではまだ使えません。 | [half_floats.um](/ja/examples/half-floats/)、[small_floats.um](/ja/examples/small-floats/) |
| 複数のファイル | `import { a, b } from "./lib/math.um";`。相手のファイルで `export` を付けたものだけ import できます。名前は全ファイルで1つの空間です。 | [tests/modules/basic](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/tests/modules/basic/main.um) |

## 最上位の定数

関数の外に、名前つきの定数を書けます。値はコンパイル時に求まります。

```um
const FILES: i32 = 9;
const SQUARES: i32 = FILES * FILES;        // 他の定数を使える
const BIG: u64 = (1 as u64) << 40;
export const NAME: string = "um-engine";   // 他のファイルから import できる

function sum(xs: i32[SQUARES]): i32 { ... } // 固定長配列の長さにも使える
```

- **型は必ず書きます。** 使える型は整数、`f32`、`f64`、`bool`、`string` です（配列や `struct` の定数、`f4` / `f8` / `f16` の定数はまだありません）。
- **初期化に書けるのは、リテラル・他の定数・単項と二項の演算子・`as`・かっこだけです。** 関数の呼び出しなどはコンパイルエラーです。定数どうしは書く順番によらず使えます（互いに頼り合うとエラー）。
- **値の計算は実行時と同じ意味です。** 式は `const x: T = 式` と同じ規則で型を検査します（リテラルは定数の型に合わせます）。整数はラップし、小数から整数への変換は飽和します。`&&` / `||` は、左辺で結果が決まれば右辺を計算しません。実行時なら停止する計算（整数のゼロ除算、ビット幅以上のシフト）はコンパイルエラーです。
- **使う所では、その型の値として扱われます。** 暗黙の型変換はないので、`i32` の定数を `usize` の所で使うには `as` が要ります。`for (let i = 0; i < N; i++)` の `i` は `N` の型になります。
- **kernel の中でも使えます**（kernel で使える型の定数に限ります。GPU 向けのコードにも同じ値が入ります）。
- **同じ名前の引数やローカル変数があれば、そちらが優先されます。** 定数への代入はコンパイルエラーです。関数・型と同じ名前の定数は作れません（名前は全ファイルで1つの空間です。`vec3` や `vec3Add` のような標準の関数・型の名前も使えません）。配列の長さ `T[N]` の `N` は最上位の定数だけを指すので、その場所に同じ名前のローカル変数があるとコンパイルエラーです。
- **`switch` の `case` にも書けます**（`case` には式を書けるため）。
- **グローバル変数（最上位の `let`）はありません。** 変わる値は関数の中に置き、`mut` 引数で渡します。

例: [examples/global_consts.um](/ja/examples/global-consts/)。
