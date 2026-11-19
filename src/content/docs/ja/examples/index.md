---
title: "サンプル"
description: "本体リポジトリにある、動く UnifiedMozaic のプログラム。"
sidebar:
  order: 0
---

本体リポジトリの [`examples/`](https://github.com/UnifiedMozaic/UnifiedMozaic/tree/main/examples) のプログラムを、そのまま載せています。どれも動き、テストを兼ねています。テストランナー（`node tests/run.ts`）が、出力を `// expect:` の行と照合します。

| プログラム | 内容 |
| --- | --- |
| [arrays.um](/ja/examples/arrays/) | 固定長配列。添字アクセスは境界検査つき。 |
| [audit_regressions.um](/ja/examples/audit-regressions/) | 監査で見つかった不具合の再発防止。どれも以前は解放済みの領域を読むか、二重に解放していた。 |
| [bank_accounts.um](/ja/examples/bank-accounts/) | 構造体の配列を持つ class の銀行シミュレーション。i64 の残高、手数料、凍結口座、失敗の集計。 |
| [basics.um](/ja/examples/basics/) | 関数・再帰・ループ・条件分岐。 |
| [bitnet.um](/ja/examples/bitnet/) | BitNet 風の線形層: 重みは -1 / 0 / +1 の3値で、掛け算が要らない。 |
| [bytes_and_files.um](/ja/examples/bytes-and-files/) | バイト列から文字列を作る stringFromBytes、ファイル全体を読み書きする readFile / writeFile、時計の clock。 |
| [class_enum_default.um](/ja/examples/class-enum-default/) | class のフィールドの初期値に enum を使える。標準のジェネリックな型に、同じ名前の型引数を持つ自作の型も渡せる。 |
| [classes.um](/ja/examples/classes/) | class は継承なしの値型。メソッドとコンストラクタを中に書ける。 |
| [conveniences.um](/ja/examples/conveniences/) | TypeScript で書き慣れた形のうち、そのまま使えるもの:条件式 `a ? b : c`、初期値を省いた宣言（ゼロで始まる）、length との比較でのループ変数の型合わせ。 |
| [do_while.um](/ja/examples/do-while/) | do ... while は、本体を少なくとも1回実行してから条件を確かめる。 |
| [enums.um](/ja/examples/enums/) | enum は「いくつかの選択肢のどれか」を表す値。選択肢ごとに値を持てる。 |
| [fill.um](/ja/examples/fill/) | 一括の書き込み xs.fill(v) / xs.fill(v, start, end)。可変長配列、Buffer、RacyBuffer で使える。 |
| [game_of_life.um](/ja/examples/game-of-life/) | kernel と 2 つの Buffer で作るライフゲーム。1 周で a→b、b→a の 2 回 dispatch する（ループ内で Buffer を移動して入れ替えることはできないため）。 |
| [generic_classes.um](/ja/examples/generic-classes/) | ジェネリックな class。使われた型ごとに、フィールドとメソッドが複製される。 |
| [generic_structs.um](/ja/examples/generic-structs/) | ジェネリックな struct は、使われた型の組み合わせごとに複製される。 |
| [generics.um](/ja/examples/generics/) | ジェネリック関数は、呼び出しごとに具体的な型で複製される（実行時のコストはない）。 |
| [global_consts.um](/ja/examples/global-consts/) | 最上位の定数: `const 名前: 型 = 定数式;`。値はコンパイル時に求まり、使う所ではその型の値になる。 |
| [gpu_submit.um](/ja/examples/gpu-submit/) | gpu.submit は、kernel の実行を頼んで、終わるのを待たずに戻る。返ってくるのは券（u64）。 |
| [half_arith.um](/ja/examples/half-arith/) | f16 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。 |
| [half_floats.um](/ja/examples/half-floats/) | f16 は IEEE 754 の半精度（16ビット）。演算の結果は、正確な値を f16 に丸めたものになる。 |
| [histogram_bits.um](/ja/examples/histogram-bits/) | ヒストグラム（構造体の配列）と xorshift64、popcount / clz / ctz によるビット数の集計。 |
| [hoisted_loops.um](/ja/examples/hoisted-loops/) | 添字が i ± 定数 の for ループは、境界検査をループの外で済ませる。 |
| [input_lines.um](/ja/examples/input-lines/) | 標準入力を1行ずつ読む。readLine() は改行を除いた1行を返し、入力の終わりで null を返す。 |
| [interfaces.um](/ja/examples/interfaces/) | interface は「このメソッドを持つ」という約束。class が implements で満たし、ジェネリック関数が `T extends 名前` で求める。呼び出しはコンパイル時に決まる（実行時のコストはない）。 |
| [kernel_edges.um](/ja/examples/kernel-edges/) | kernel を通常の関数として直接呼んだ場合や、空の Buffer を渡した場合も、メモリ安全で結果が決まっている。 |
| [kernel_neighbours.um](/ja/examples/kernel-neighbours/) | kernel の中で、隣の要素の添字を変数に入れてから読む書き方。 |
| [kernels.um](/ja/examples/kernels/) | kernel 関数は GPU でも実行できる関数。dispatch で、0 から count 未満の各添字について実行する。 |
| [masked_shift.um](/ja/examples/masked-shift/) | マスクつきシフト Math.shl / Math.shr と、範囲チェックの除去。 |
| [matrices.um](/ja/examples/matrices/) | mat2 / mat3 / mat4 は標準の行列型。関数で積や転置を計算でき、kernel の中でも使える。 |
| [matrix_class.um](/ja/examples/matrix-class/) | class でラップした f64[] の行列（積・転置・トレース）。メソッドが this を書き換えるので let で宣言する。 |
| [min_heap.um](/ja/examples/min-heap/) | i32[] を使った二分ヒープ（優先度付きキュー）の class。private な配列フィールドと usize の添字計算を使う。 |
| [nested_arrays.um](/ja/examples/nested-arrays/) | 可変長配列は、ヒープを持つ要素（文字列、配列、それらを持つ struct）を所有できる。 |
| [nested_arrays_stress.um](/ja/examples/nested-arrays-stress/) | ヒープを持つ要素の配列で、解放と移動が絡む場面をまとめて通す（メモリ検査つきの実行で確かめる）。 |
| [nullable.um](/ja/examples/nullable/) | `T \| null` は「値がないかもしれない」ことを型で表す。 |
| [numbers.um](/ja/examples/numbers/) | 整数は既定でラップする。型の変換は as で明示する。 |
| [optional_arrays.um](/ja/examples/optional-arrays/) | かっこで囲んだ型: 「null かもしれない文字列」の配列。 |
| [ownership.um](/ja/examples/ownership/) | 可変長配列 `T[]`（`Array<T>` と同じ型）はヒープに要素を持つ。 |
| [packed_weights.um](/ja/examples/packed-weights/) | 標準の関数で、3値（-1 / 0 / +1）の重みを1個2ビットに詰めて持ち、積和を取る。 |
| [parallel_kernels.um](/ja/examples/parallel-kernels/) | 大きな dispatch は、ネイティブでは複数のスレッドに分けて実行される。 |
| [particles_kernel.um](/ja/examples/particles-kernel/) | 構造体の Buffer を kernel で更新する粒子シミュレーション。f32 の結果は他の言語の f32 演算と一致する。 |
| [prefetch.um](/ja/examples/prefetch/) | 先読み Math.prefetch(arr, i)。arr[i] のあるメモリを、使う前にキャッシュへ読み込むよう CPU に頼む。 |
| [racy_buffer.um](/ja/examples/racy-buffer/) | RacyBuffer は、同期なしで読み書きしてよい Buffer。 |
| [racy_shared.um](/ja/examples/racy-shared/) | RacyBuffer の共有の規則: 要素は読み取り借用からでも書ける。kernel の mut RacyBuffer には読み取り借用のまま渡せる。 |
| [results.um](/ja/examples/results/) | enum の選択肢は、文字列や配列のようなヒープを持つ値も持てる。 |
| [simd.um](/ja/examples/simd/) | 128 ビットの SIMD のベクトル: i8x16 / u8x16 / i16x8 / u16x8 / i32x4 / u32x4 / f32x4。 |
| [small_float_arith.um](/ja/examples/small-float-arith/) | f8 / f4 の四則演算を、乱数で作った多数の値について行い、結果をまとめた値を出す。 |
| [small_floats.um](/ja/examples/small-floats/) | f8 と f4 は、8ビットと4ビットの浮動小数点。量子化した重みのように、メモリの量が効くデータのための型。 |
| [small_ints.um](/ja/examples/small-ints/) | 8 / 16 ビットの整数の Buffer（i8 / u8 / i16 / u16）と、CPU と GPU で同じ重みを使う書き方。 |
| [sorting.um](/ja/examples/sorting/) | LCG の class で作った乱数列を、クイックソート（mut 借用）とマージソート（配列を返す）で並べる。 |
| [strings.um](/ja/examples/strings/) | 文字列は UTF-8 のバイト列を持つ、書き換えできない値。配列と同じく所有され、代入で移動する。 |
| [structs.um](/ja/examples/structs/) | 構造体は値型。修飾なしの引数は読み取り借用、mut は可変借用。 |
| [swap_in_loop.um](/ja/examples/swap-in-loop/) | ループの中での入れ替え。移動した変数は、周回の終わりまでに代入し直せば次の周回でも使える。 |
| [switches.um](/ja/examples/switches/) | switch は if の連なりに置き換えられる。各 case は break か return で終える。 |
| [threads.um](/ja/examples/threads/) | スレッド: thread.spawn / thread.spawnEach / thread.join、RacyBuffer の共有とアトミック演算。 |
| [tokenizer.um](/ja/examples/tokenizer/) | i32[] の文字コードを状態機械でトークンに分ける。構造体の配列、u8 のフィールド、i64 の数値を使う。 |
| [vectors.um](/ja/examples/vectors/) | vec2 / vec3 / vec4 は標準の型。演算子で成分ごとの計算ができ、kernel の中でも使える。 |
