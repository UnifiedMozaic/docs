---
title: スレッド
description: thread.spawn / thread.join と RacyBuffer。
sidebar:
  order: 8
---

`thread.spawn(f, 引数...)` で関数を新しいスレッドで実行し、`thread.join(h)` で終わるのを待って戻り値を受け取ります。`thread.spawnEach(f, own items, 引数...)` は配列の要素ごとに1本ずつ起動し（k 番目は `f(items[k], 引数...)`、要素は移動）、`thread.join` は戻り値の配列を items と同じ順で返します。`thread.cpus()` は論理 CPU 数、`thread.yield()` は CPU をほかの動けるスレッドに譲ります（RacyBuffer の印を見ながら待つループ用。ほかに動けるスレッドがなければすぐ戻る。wasm32 では何もしない）。

```um
function search(w: own Worker, sh: Shared, root: Position): Worker { ... }

const sh: Shared = { tt: new RacyBuffer<u64>(n), stop: new RacyBuffer<u32>(1) };
{
  const g = thread.spawnEach(search, own workers, sh, root);  // 補助スレッド
  ...                                                          // メインはメインの仕事（入出力、時間の管理）
  sh.stop.store(0, 1);
  workers = thread.join(g);                                    // Worker ごと返ってくる
}
```

- **持ち手（`thread.spawn` の結果）は、`const` の宣言の初期化式としてだけ書けます。** 移動・代入・`return`・引数・フィールド・配列の要素にはできません（型 `Thread<R>` / `Threads<R>` を書けるのは、その `const` の注釈だけ）。`thread.join` は持ち手を消費し、合流しなかった持ち手は、宣言を含むブロックの終わり（`return` / `break` / `continue` で抜けるときも）で自動で合流します（戻り値は捨てる）。
- **スレッドへの渡し方**: コピーされる型は写し、`own` は移動（スレッドが所有して返すか解放する）、修飾なしのヒープを持つ値は読み取り借用で共有します。`mut` の引数を持つ関数は起動できません。読み取り借用で貸した変数は、`const` の宣言からブロックの終わりまで（`join` のあとも）書き換え・移動・`mut` 渡しができません。合流後に書き換えるなら、起動を内側のブロック `{ ... }` に入れます。一時値は貸せません（`const` に入れてから）。
- **複数のスレッドが書き換えられるのは `RacyBuffer` の要素だけです。** kernel の外では、`RacyBuffer` の要素は読み取り借用からでも書けます（長さと領域は変わらない）。要素の読み書き `b[i]` は順序の保証がないアトミック命令（kernel の外は relaxed）で、値は実行ごとに変わりえますが、メモリは壊れません。`for...of` と `clone()` も要素を1つずつアトミックに読みます。要素の型は `i8` / `u8` / `i16` / `u16` / `i32` / `u32` / `f32` と、kernel の外でだけ `i64` / `u64`（置換表など）。8 / 16 ビットの要素も、隣の要素を別のスレッドが同時に書いて混ざることはありません。kernel は `mut RacyBuffer` のどの要素にも読み書きできます。
- **アトミック演算**: `b.load(i)`、`b.store(i, v)`、`b.fetchAdd(i, v)`（前の値を返す）、`b.compareExchange(i, expected, desired)`（前の値を返す）。順序は seq_cst で、`store` より前の書き込み（`b[i]` を含む）は、その値を `load` で見たスレッドから見えます。「データを書いてから印を立てる」受け渡しにはこれを使います（`b[i]` どうしには順序がない）。`fetchAdd` / `compareExchange` は整数だけで、kernel の中では使えません。
- **kernel の `mut RacyBuffer` には、読み取り借用の `RacyBuffer` もそのまま渡せます**（`gpu.submit(k, n, mut sh.out, sh.inp)`。kernel は領域を差し替えられないため）。`dispatch` / `gpu.submit` / `gpu.ready` / `gpu.wait` はどのスレッドからでも呼べ、券はどのスレッドで待ってもかまいません。
- **`print` 1回の出力（1行）はほかのスレッドと混ざりません。** `readLine()` / `inputReady()` はメインスレッドだけで使えます（ほかで呼ぶと停止）。どのスレッドで停止しても、プログラム全体が止まります（メッセージは1回）。
- 同時に存在できるスレッドは 256 本まで（超えると停止）。スタックは 64 MiB（`UM_THREAD_STACK_MB` で変更）。起動と合流の手間は1本 10〜15 マイクロ秒（Apple M4）。
- **kernel を CPU で並列に実行するスレッドプール**は、既定で論理 CPU 数のスレッド（呼んだスレッドを含む。最大 64）を使います。`UM_THREADS` で数を変えられます。プールのスレッドは仕事のあと 100 マイクロ秒は寝ずに次を待ちます（`UM_POOL_SPIN_US` で変更。0 ならすぐ寝る）。プールは同時に1つの仕事だけなので、ほかのスレッドが使っている最中の `cpu.dispatch` は、呼んだスレッドだけで実行します。
- **wasm32 にはスレッドがありません。** 書き方はすべて受け付け、合流の時点（`thread.join` か自動の合流）で関数をその場で最後まで実行します（`spawnEach` は要素の順、`thread.cpus()` は 1）。ほかのスレッドの結果を待って回るプログラム（集めて GPU に投げる係など）は wasm32 では終わりません。

例: [examples/threads.um](/ja/examples/threads/)、[examples/racy_shared.um](/ja/examples/racy-shared/)、[examples/racy_buffer.um](/ja/examples/racy-buffer/)。
