---
title: 入出力
description: readLine、inputReady、clock、readFile、writeFile。
sidebar:
  order: 3
---

```um
while (true) {
  const line = readLine();          // string | null
  if (line == null) { break; }      // 入力の終わり
  print("got " + line);
}
```

| 関数 | 動作 |
| --- | --- |
| `readLine(): string \| null` | 標準入力から1行読みます。末尾の改行（とその前の `\r` 1つ）は含みません。入力の終わりでは `null`。行の長さに上限はありません。待つ前に標準出力を流します。 |
| `inputReady(): bool` | `readLine()` が待たずに戻るなら `true`（改行までの1行が届いているか、入力が終わっているとき。行の途中までしか届いていなければ `false`）。標準出力も流します。軽いので、探索の途中で何度も呼べます。 |
| `clock(): f64` | プログラムの開始からの秒数。逆戻りしません。 |
| `stringFromBytes(bytes: u8[]): string` | バイト列を写した新しい文字列を作ります（UTF-8 かどうかは確かめません）。 |
| `readFile(path: string): u8[] \| null` | ファイル全体をバイト列として読みます。読めなければ `null`。 |
| `writeFile(path: string, bytes: u8[]): bool` | ファイルを作って（あれば中身を置き換えて）書きます。すべて書けたら `true`。 |

- **引数は借りるだけで、結果は新しい値です。** `string | null` と `u8[] | null` は、`const` に入れて `if (x != null)` で確かめてから使います。
- **同じ名前の関数をプログラムが定義していれば、そちらが優先されます。** kernel の中では使えません。
- **`print` の出力はまとめて書き出されます。** 相手のプログラムとパイプで話すときは、`readLine()` か `inputReady()` を呼んだ時点（と終了時）に相手へ届きます。
- **名前に 0 のバイトを含むファイルは読めず、書けません**（`null` / `false`）。
- **標準入力が「待たない」設定（O_NONBLOCK）でも、`readLine()` は行が届くまで待ちます**（まだ届いていないことを、入力の終わりとは扱いません）。
- **2 GiB 以上のファイルや行も読み書きできます**（OS への依頼を 1 GiB ずつに分けます）。
- **wasm32 では、入出力は読み込む側が渡した口だけを通ります。** `instantiate(bytes, { readLine, inputReady, readFile, writeFile })` で渡します。渡さなければ `readLine()` は `null`、`inputReady()` は `true`（入力は終わっている）、`readFile()` は `null`、`writeFile()` は `false` です。ファイルの名前は UTF-8 の文字列として口に渡すので、UTF-8 として読めない名前は wasm32 では失敗（`null` / `false`）になります。`runtime/run-node.mjs` は標準入力とファイルをそのままつなぎます（Node には待たずに読めるかを確かめる方法がないので、`inputReady()` は読み込み済みの分だけで答えます）。**wasm32 の入出力は、オブジェクトファイルが作れることまでしか確かめていません（実行は未確認）。**

例: [examples/input_lines.um](/ja/examples/input-lines/)、[examples/bytes_and_files.um](/ja/examples/bytes-and-files/)。
