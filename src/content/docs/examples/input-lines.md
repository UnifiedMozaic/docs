---
title: "input_lines.um"
description: "Reading standard input line by line. readLine() returns a line without the newline, and null at the end of input."
---

Reading standard input line by line. readLine() returns a line without the newline, and null at the end of input.

Source: [examples/input_lines.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/input_lines.um)

```um title="input_lines.um"
// 標準入力を1行ずつ読む。readLine() は改行を除いた1行を返し、入力の終わりで null を返す。
// inputReady() は、readLine() が待たずに戻るなら true（探索の途中で「stop」が来ていないかを見るのに使う）。
// stdin: usi
// stdin: isready
// stdin:
// stdin: position startpos moves 7g7f 3c3d
// stdin: go btime 1000 wtime 1000
// stdin: quit
// stdin: never read
// expect: true
// expect: id name um
// expect: usiok
// expect: readyok
// expect: empty line
// expect: words 5
// expect: move 7g7f
// expect: move 3c3d
// expect: bestmove resign
// expect: lines 6
// expect: rest 1
// expect: true

// 空白で区切った語を取り出す。文字列はバイト列なので、切り出しはバイトを集めて stringFromBytes で文字列にする。
function words(line: string): string[] {
  let out: string[] = [];
  let cur: u8[] = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] == 32) {
      if (cur.length > 0) {
        out.push(stringFromBytes(cur));
        cur.clear();
      }
    } else {
      cur.push(line[i]);
    }
  }
  if (cur.length > 0) {
    out.push(stringFromBytes(cur));
  }
  return out;
}

export function main(): i32 {
  // 入力がもう届いているので、待たずに読める。
  print(inputReady());
  let lines = 0;
  while (true) {
    const line = readLine();
    if (line == null) {
      break;
    }
    lines++;
    const ws = words(line);
    if (ws.length == 0) {
      print("empty line");
      continue;
    }
    if (ws[0] == "usi") {
      print("id name um");
      print("usiok");
    } else if (ws[0] == "isready") {
      print("readyok");
    } else if (ws[0] == "position") {
      print(`words ${ws.length}`);
      for (let i: usize = 3; i < ws.length; i++) {
        print("move " + ws[i]);
      }
    } else if (ws[0] == "go") {
      print("bestmove resign");
    } else if (ws[0] == "quit") {
      break;
    }
  }
  print(`lines ${lines}`);
  // 残りを読み切る。使わなかった結果（文字列 | null）も、その場で解放される。
  let rest = 0;
  while (true) {
    const line = readLine();
    if (line == null) {
      break;
    }
    rest++;
  }
  print(`rest ${rest}`);
  readLine();
  // 入力が終わったあとは、readLine() はすぐ null を返すので、inputReady() は true。
  print(inputReady());
  return 0;
}
```

## Standard input

From the `// stdin:` lines; the test runner gives these lines as standard input.

```text
usi
isready

position startpos moves 7g7f 3c3d
go btime 1000 wtime 1000
quit
never read
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
true
id name um
usiok
readyok
empty line
words 5
move 7g7f
move 3c3d
bestmove resign
lines 6
rest 1
true
```
