---
title: "bytes_and_files.um"
description: "バイト列から文字列を作る stringFromBytes、ファイル全体を読み書きする readFile / writeFile、時計の clock。"
---

バイト列から文字列を作る stringFromBytes、ファイル全体を読み書きする readFile / writeFile、時計の clock。

ソース: [examples/bytes_and_files.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/bytes_and_files.um)

```um title="bytes_and_files.um"
// バイト列から文字列を作る stringFromBytes、ファイル全体を読み書きする readFile / writeFile、時計の clock。
// expect: 7g7f
// expect: 0
// expect: true
// expect: 1000
// expect: 499500
// expect: true
// expect: 0
// expect: true
// expect: false
// expect: true
// expect: weights ok
// expect: true

// 駒の動き（USI の表記）を、バイトを並べて作る。
function moveText(fromFile: u8, fromRank: u8, toFile: u8, toRank: u8): string {
  const bytes: u8[] = [48 + fromFile, 96 + fromRank, 48 + toFile, 96 + toRank];
  return stringFromBytes(bytes);
}

// 重みのファイルを読む。読めなければ null。
function loadWeights(path: string): i32[] | null {
  const bytes = readFile(path);
  if (bytes == null) {
    return null;
  }
  let out: i32[] = [];
  for (const b of bytes) {
    out.push(b as i32);
  }
  return out;
}

export function main(): i32 {
  const t0 = clock();
  print(moveText(7, 7, 7, 6));
  const none: u8[] = [];
  print(stringFromBytes(none).length);

  let data: u8[] = [];
  for (let i = 0; i < 1000; i++) {
    data.push((i % 256) as u8);
  }
  print(writeFile("um_example_weights.bin", data));
  const back = readFile("um_example_weights.bin");
  if (back != null) {
    print(back.length);
    let sum = 0;
    for (let i: usize = 0; i < back.length; i++) {
      sum += i as i32 - (back[i] as i32) + (back[i] as i32);
    }
    print(sum);
  }

  // 空のファイルは、長さ 0 の配列として読める（null ではない）。
  print(writeFile("um_example_empty.bin", none));
  const empty = readFile("um_example_empty.bin");
  if (empty != null) {
    print(empty.length);
  }

  // ないファイルは null。名前に 0 のバイトを含むものは、読めも書けもしない。
  const missing = readFile("um_example_no_such_file.bin");
  print(missing == null);
  print(writeFile("um_example\0hidden.bin", data));
  print(readFile("um_example\0hidden.bin") == null);

  const w = loadWeights("um_example_weights.bin");
  if (w != null) {
    if (w.length == 1000 && w[999] == 231) {
      print("weights ok");
    }
  }
  // 使わなかった結果もその場で解放される。
  readFile("um_example_weights.bin");

  // clock() は開始からの秒数で、逆戻りしない。
  const t1 = clock();
  print(t1 >= t0 && t0 >= 0.0);
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
7g7f
0
true
1000
499500
true
0
true
false
true
weights ok
true
```
