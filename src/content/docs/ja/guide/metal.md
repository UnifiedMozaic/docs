---
title: Metal（Mac）での GPU 実行
description: UM_METAL=1 のビルド、実行先の選び方、gpu.submit、環境変数、制限。
sidebar:
  order: 6
---

macOS では、`UM_METAL=1` を付けてビルドすると、kernel を Metal で GPU でも実行するネイティブバイナリになります（ランタイムは `runtime/metal.m`）。Apple Silicon（Apple M4）で確かめています。

```sh
UM_METAL=1 node src/cli.ts build x.um --target host -o x    # --target arm64-macos でもよい
./x
```

- **`UM_METAL=1` はコンパイル時の指定です。** 付けないと、ネイティブのビルドは GPU を使いません（`dispatch` は CPU、`gpu.dispatch` はコンパイルエラー）。Mac 以外では `UM_METAL=1` は効きません。
- **kernel は MSL（Metal Shading Language）に変換されてバイナリに入り、初めて GPU で実行するときに Metal がコンパイルします。** 浮動小数点の近似は切ってあり（`MTLMathModeSafe` と精度の高い数学関数）、`tests/metal/parity.um` の kernel は CPU と同じ結果になります。macOS 15 より前では精度の指定の一部が使えず、`sqrt` の丸めが CPU と違う可能性があります（未確認）。
- **Buffer はコピーせずに GPU と共有します**（ユニファイドメモリ）。`UM_METAL=1` のビルドでは Buffer をページ境界に確保し、そのまま GPU に渡します。
- **GPU の準備（数十ミリ秒）は、初めて GPU を使うときまでしません。** CPU だけで済むプログラムには、この手間がかかりません。

## 実行先の選び方（`dispatch` / `cpu.dispatch` / `gpu.dispatch`）

| 書き方 | 実行先 |
| --- | --- |
| `dispatch(k, n, ...)` | 実測で速いほうを選びます（下の説明） |
| `cpu.dispatch(k, n, ...)` | 常に CPU（複数のスレッド） |
| `gpu.dispatch(k, n, ...)` | 常に GPU。GPU が使えなければ停止（`panic: the GPU is not available`） |

`dispatch` の自動判断は、kernel ごとに CPU と GPU の時間を測って決めます。

- **最初の2回は CPU で実行して時間を測ります。** CPU での1回が 50 マイクロ秒未満の仕事は、GPU を試しません（GPU に1回渡すだけでそれ以上かかるため）。
- **それより重い仕事は、GPU でも2回試し、以後は見込みの速いほうを選びます。** 見込みは「GPU の固定の手間 + 1要素あたりの時間 × 個数」と「CPU の1要素あたりの時間 × 個数」の比較です。
- **選ばれなかった側も、ときどき測り直します**（およそ 64 回に1回。差が大きいほど、勝ち負けが変わらないほど間隔を広げます）。
- **途中で実行先が変わっても、結果は同じです**（kernel の意味を CPU と GPU で揃えてあるため。RacyBuffer で競合する書き方は除きます）。
- `UM_GPU_THRESHOLD=N` を付けると実測をやめ、「要素数が N 以上なら GPU」という固定の規則になります。

## 同期の dispatch を速くする仕組み

`dispatch` / `gpu.dispatch` は、GPU の仕事が終わるまで戻りません。そのうえで、往復の手間を減らす仕組みが自動で働きます。

- **続けて書いた dispatch 文は、1回の提出にまとめます。** 次の文も dispatch 文で、どちらの個数と引数も変数かリテラルだけのとき、完了を待たずに次と一緒に提出します（前の kernel の書き込みは、次の kernel から見えます）。
- **同じ形の dispatch を何度も呼ぶと、常駐の経路に乗ります。** 「形」は、1回の提出にまとまる dispatch の並び（1つでもよい。最大 8 個）と、それぞれの kernel・Buffer の組です。同じ形を 8 回見ると、その形の命令を先に GPU に提出して合図を待たせておき、以後は引数と個数を書いて合図を出すだけで走らせます。同時に待機させておける形は 4 つまでです。しばらく（約 1 秒）使われない待機と、関係する Buffer が解放されるときの待機は片付けます。`UM_GPU_RESIDENT=0` で使いません。
- **完了の知らせを待たずに、検算で結果を取り込みます。** GPU が書いた範囲の検算値を、依頼の番号を混ぜて GPU と CPU の両方で計算し、一致したら結果が読めると判断します（Metal の完了の知らせは、GPU が終わってから数十マイクロ秒遅れて届くため）。使うのは、書く Buffer が 4 つ以下、要素の大きさが 4 バイトの倍数、それぞれ 65536 語以下のときです。外れると完了の知らせを待ちます（結果は同じ）。`UM_GPU_RESIDENT=status` で常に完了の知らせを待ちます。

目安（Apple M4、小さな評価を1回ずつ GPU に渡して毎回答えを読む計測）: 1回の往復は常駐と検算を使って約 0.1 ms です。同じ仕事が CPU で数十マイクロ秒で終わるなら、CPU のほうが速くなります。1回に 1024 件 × 2048 回の積和をする重い評価では、GPU（約 0.2 ms）が CPU の全コア（約 0.45 ms）より速くなりました。

## CPU と GPU を同時に走らせる（`gpu.submit` / `gpu.ready` / `gpu.wait`）

```um
const t = gpu.submit(k, n, mut out, weights);   // 待たずに戻る。券（u64）を返す
doOtherWork();                                   // そのあいだ CPU は別の仕事
if (gpu.ready(t)) { ... }                        // 終わっていれば true（待たない）
gpu.wait(t);                                     // 終わるまで待つ
print(out[0]);                                   // ready / wait のあとに読めば新しい結果
```

- **`gpu.submit` に渡す Buffer のうち、kernel が書くものは `RacyBuffer` でなければなりません**（コンパイルエラー）。待たずに戻るので、CPU と GPU が同じ領域を同時に触りうるためです。読み取り借用の `RacyBuffer` も `mut` として渡せます。
- **kernel が読むだけの普通の `Buffer` も渡せます。** 重みのように一度作って読むだけのデータを `Buffer` に置けば、CPU は普通の（アトミックでない）読み込みで同じ領域を読めます。kernel が終わる前に CPU がその Buffer を書き換えると、kernel は古い値と新しい値の混ざったものを読むことがあります（停止や範囲外の読み書きは起きません）。
- **`gpu.ready` / `gpu.wait` の前に読んだ値は古いことがあります。** 同じ Buffer に続けて頼んだ仕事は、頼んだ順に実行されます。
- **終わった券と券 0 は、いつ確かめても「終わっている」です。** 券はどのスレッドで待ってもかまいません。
- **Buffer が解放されるときは、それを使っている仕事が終わるのを待ちます。**
- **預けたままの券が 1024 件を超えると、いちばん古い仕事の終わりをその場で待ちます**（結果は変わりません）。
- **実際に待たずに戻るのは Metal だけです。** GPU のないビルド・環境（`UM_METAL` なし、`UM_GPU=0`）と wasm32 では、その場で最後まで実行して券 0 を返します（結果は同じ）。`UM_GPU_COPY=1` のときも、その場で実行します。
- 書く Buffer の検算による早い完了の確認（上と同じ条件）は、`gpu.ready` / `gpu.wait` でも使います。
- 目安（Apple M4）: `gpu.submit` 1回の呼び出しは数マイクロ秒です。小さな評価を 8 件ほど預けたまま回すと、1件ずつ待つ `gpu.dispatch` の 3〜4 倍の処理量になりました。

例: [examples/gpu_submit.um](/ja/examples/gpu-submit/)（GPU なしでも動きます）。

## 環境変数

実行時に読むもの（Metal のランタイム）:

| 変数 | 意味 |
| --- | --- |
| `UM_GPU=0` | GPU を使いません。`dispatch` はすべて CPU、`gpu.dispatch` は停止、`gpu.submit` はその場で CPU で実行します |
| `UM_GPU_THRESHOLD=N` | 自動判断の実測をやめ、要素数が N 以上なら GPU にします |
| `UM_GPU_RESIDENT=0` | 常駐の経路を使いません |
| `UM_GPU_RESIDENT=status` | 検算による早い完了の確認を使わず、常に Metal の完了の知らせを待ちます |
| `UM_GPU_TRACE=1` | 実行先・共有した Buffer の数・時間・常駐の開始と停止などを標準エラー出力に出します |
| `UM_GPU_COPY=1` | 比較用。Buffer を共有せず、毎回コピーして渡します（遅くなります） |

CPU の並列実行とスレッドについては、下の「スレッド」の `UM_THREADS`、`UM_POOL_SPIN_US`、`UM_THREAD_STACK_MB` を見てください。

## 制限

- **1つの dispatch に渡せる Buffer は 64 個までです**（超えると停止）。Buffer が 17 個以上か、Buffer 以外の引数が 512 バイトを超える dispatch は、まとめずに1つだけで提出します。
- **GPU の個数と添字は 32 ビットです**（Buffer の長さは `u32`）。
- `f16` / `f8` / `f4` / `f64`、64 ビットの整数、SIMD のベクトル、`Math.prefetch` は kernel では使えません。
- GPU の仕事がシェーダのコンパイルや実行に失敗すると、プログラムは停止します（`panic: the GPU could not run a kernel (...)`）。
