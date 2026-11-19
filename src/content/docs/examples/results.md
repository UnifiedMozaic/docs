---
title: "results.um"
description: "Enum choices can also carry values with heap data, such as strings and arrays."
---

Enum choices can also carry values with heap data, such as strings and arrays.

Source: [examples/results.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/results.um)

```um title="results.um"
// enum の選択肢は、文字列や配列のようなヒープを持つ値も持てる。
// Result<T, E> は標準の enum で、失敗しうる処理の結果を表す。
// expect: 21
// expect: error: not a digit: x
// expect: error: empty
// expect: 3
// expect: hello!
// expect: hello!
// expect: 6
// expect: tick 3
// expect: none
// expect: 9

enum Message {
  Text(body: string),
  Numbers(values: i32[]),
  Tick(count: i32),
  Quit,
}

function parseDigits(s: string): Result<i32, string> {
  if (s.length == 0) {
    return Result.Err("empty");
  }
  let n = 0;
  for (const b of s) {
    if (b < 48 || b > 57) {
      return Result.Err("not a digit: " + s);
    }
    n = n * 10 + ((b - 48) as i32);
  }
  return Result.Ok(n);
}

function show(r: Result<i32, string>): void {
  match (r) {
    Result.Ok(v) => print(v),
    Result.Err(why) => print("error: " + why),
  }
}

function describe(m: Message): string {
  match (m) {
    Message.Text(body) => return body + "!",
    Message.Numbers(values) => {
      let sum = 0;
      for (const v of values) {
        sum += v;
      }
      return String(sum);
    }
    Message.Tick(n) => return `tick ${n}`,
    Message.Quit => return "none",
  }
}

function half(x: i32): Result<i32, string> {
  if (x % 2 != 0) {
    return Result.Err("odd");
  }
  return Result.Ok(x / 2);
}

export function main(): i32 {
  show(parseDigits("21"));
  show(parseDigits("x"));
  show(parseDigits(""));

  let inbox: Message[] = [];
  inbox.push(Message.Text("hello"));
  inbox.push(Message.Numbers([1, 2, 3]));
  inbox.push(Message.Tick(3));
  print(inbox.length);

  // 変数を match しても、値は移動しない（中身は借りるだけ）。
  const first = Message.Text("hello");
  print(describe(first));
  print(describe(first));
  for (const m of inbox) {
    match (m) {
      Message.Text(_) => {}
      _ => print(describe(m)),
    }
  }
  print(describe(Message.Quit));

  let total = 0;
  for (let i = 0; i < 6; i++) {
    match (half(i * 2 + i % 2)) {
      Result.Ok(h) => {
        total += h;
      }
      Result.Err(_) => {
        total += 1;
      }
    }
  }
  print(total);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
21
error: not a digit: x
error: empty
3
hello!
hello!
6
tick 3
none
9
```
