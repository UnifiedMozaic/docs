---
title: "global_consts.um"
description: "最上位の定数: `const 名前: 型 = 定数式;`。値はコンパイル時に求まり、使う所ではその型の値になる。"
---

最上位の定数: `const 名前: 型 = 定数式;`。値はコンパイル時に求まり、使う所ではその型の値になる。

ソース: [examples/global_consts.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/global_consts.um)

```um title="global_consts.um"
// 最上位の定数: `const 名前: 型 = 定数式;`。値はコンパイル時に求まり、使う所ではその型の値になる。
// 初期化に書けるのは、リテラル・他の定数・演算子・`as`・かっこ。
// expect: 81
// expect: 9
// expect: 1099511627776
// expect: 268435455
// expect: 0.5
// expect: 6.283185307179586
// expect: -27
// expect: um-engine 1
// expect: true
// expect: 4
// expect: 2147483647
// expect: 10
// expect: 4
// expect: 9.5
// expect: 7
// expect: pawn
// expect: 3
// expect: 16777216
// expect: 12
// expect: 40
// expect: 2.5
// expect: 32
// expect: 0
// expect: 0
// expect: 1
// expect: false true
const FILES: i32 = 9;
const SQUARES: i32 = FILES * FILES;
const BIG: u64 = (1 as u64) << 40;
const MASK: u32 = ~(0 as u32) >> 4;
const HALF: f32 = 1.0 / 2.0;
const TAU: f64 = 3.141592653589793 * 2.0;
const NEG: i32 = -FILES * 3;
const VERSION: i32 = 1;
const NAME: string = "um" + "-engine";
const DEBUG: bool = SQUARES > 80 && !false;
// 整数はラップし、小数から整数への変換は飽和する（実行時と同じ意味）。
const WRAPPED: u8 = 250 + 10;
const SATURATED: i32 = 1e20 as i32;
// 配列の長さにも使える。
const HAND: usize = 4;
// 先に書いた定数だけでなく、後ろに書いた定数も使える（互いに頼り合うとエラー）。
const TWICE: i32 = LATER * 2;
const LATER: i32 = 6;
// 整数から f32 への変換は、最も近い値に1回で丸める。
const ROUNDED: f32 = 16777217 as f32;

// 負の定数に `-` を付けられる（kernel の中でも。GPU 向けのコードでは値をかっこで囲む）。
const NEG_HALF: f32 = -0.5;
// 値が 0 の符号なしの定数とも比較できる（リテラルの `< 0` と違い、エラーにならない）。
const FLOOR: u32 = 0;
// `&&` / `||` は、左辺で結果が決まれば右辺を計算しない（実行時と同じ。右辺のゼロ除算は起きない）。
const ZERO: i32 = 0;
const GUARDED: bool = false && (1 / ZERO == 1);
const EITHER: bool = true || (1 / ZERO == 1);

const PAWN: i32 = 1;
const LANCE: i32 = 2;

class Counter {
  step: i32 = FILES + 1;
  total: i32 = 0;

  add(): void {
    this.total += this.step;
  }
}

// kernel の中でも使える（GPU 向けのコードにも同じ値が入る）。
kernel function fill(i: u32, out: mut Buffer<f32>): void {
  out[i] = HALF * (i as f32) + (FILES as f32);
}

kernel function negate(i: u32, out: mut Buffer<f32>, ints: mut Buffer<i32>): void {
  out[i] = -NEG_HALF + (i as f32);
  ints[i] = -NEG + (i as i32) - NEG;
}

function sum(xs: i32[HAND]): i32 {
  let t = 0;
  // i は比較相手の定数の型（usize）になる。
  for (let i = 0; i < HAND; i++) {
    t += xs[i];
  }
  return t;
}

function pieceName(p: i32): string {
  switch (p) {
    case PAWN:
      return "pawn";
    case LANCE:
      return "lance";
    default:
      return "other";
  }
}

// 引数やローカル変数が同じ名前なら、そちらが優先される。
function shadow(FILES: i32): i32 {
  return FILES;
}

export function main(): i32 {
  print(SQUARES);
  print(FILES);
  print(BIG);
  print(MASK);
  print(HALF);
  print(TAU);
  print(NEG);
  print(`${NAME} ${VERSION}`);
  print(DEBUG);
  print(WRAPPED);
  print(SATURATED);
  const hand: i32[HAND] = [1, 2, 3, 4];
  print(sum(hand));
  print(hand.length);
  let b = new Buffer<f32>(3);
  dispatch(fill, 3, mut b);
  print(b[1]);
  print(shadow(7));
  print(pieceName(PAWN));
  const SQUARES = 3;
  print(SQUARES);
  print(ROUNDED);
  print(TWICE);
  let c = new Counter();
  c.add();
  c.add();
  c.add();
  c.add();
  print(c.total);
  let nf = new Buffer<f32>(3);
  let ni = new Buffer<i32>(3);
  dispatch(negate, 3, mut nf, mut ni);
  print(nf[2]);
  print(ni[2] - 24);
  // ループ変数が定数と同じ名前でも、条件の中の名前はループ変数を指す（どちらのループも1回も回らない）。
  let turns = 0;
  for (let FILES = 10; FILES > FILES; FILES--) { turns++; }
  print(turns);
  for (let FILES = 0; FILES + 1 < FILES; FILES++) { turns++; }
  print(turns);
  let depth: u32 = 3;
  if (depth >= FLOOR) { print(1); }
  if (depth < FLOOR) { print(2); }
  print(`${GUARDED} ${EITHER}`);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
81
9
1099511627776
268435455
0.5
6.283185307179586
-27
um-engine 1
true
4
2147483647
10
4
9.5
7
pawn
3
16777216
12
40
2.5
32
0
0
1
false true
```
