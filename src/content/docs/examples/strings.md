---
title: "strings.um"
description: "A string is an immutable value holding UTF-8 bytes. Like an array, it is owned and moves on assignment."
---

A string is an immutable value holding UTF-8 bytes. Like an array, it is owned and moves on assignment.

Source: [examples/strings.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/strings.um)

```um title="strings.um"
// 文字列は UTF-8 のバイト列を持つ、書き換えできない値。配列と同じく所有され、代入で移動する。
// expect: hello
// expect: hello, world
// expect: 12
// expect: true
// expect: false
// expect: x = 42, y = -1.5, ok = true
// expect: こんにちは 15
// expect: 104
// expect: a	b "q" \ ${
// expect: 3
// expect: 18446744073709551615 -9223372036854775808
// expect: 0.1 1e+21 NaN
// expect: abcabcabc
// expect: 0
// expect: 2
// expect: beta!

struct User {
  name: string;
  age: i32;
}

function greet(name: string): string {
  return `hello, ${name}`;
}

function repeat(s: string, n: i32): string {
  let out = "";
  for (let i = 0; i < n; i++) {
    out = out + s;
  }
  return out;
}

export function main(): i32 {
  const h = "hello";
  print(h);
  const g = greet("world");
  print(g);
  print(g.length);
  print(h == "hello");
  print(h != 'hello');

  const x = 42;
  const y: f64 = -1.5;
  print(`x = ${x}, y = ${y}, ok = ${x > 1}`);

  const jp = "こんにちは";
  print(`${jp} ${jp.length}`);
  print(h[0]);
  print("a\tb \"q\" \\ \${");

  let bytes = 0;
  for (const b of "abc") {
    bytes += 1;
  }
  print(bytes);

  const big: u64 = 18446744073709551615;
  const small: i64 = -9223372036854775807 - 1;
  print(`${big} ${small}`);
  const nan: f64 = 0.0 / 0.0;
  print(`${0.1} ${1e21} ${nan}`);

  print(repeat("abc", 3));
  print(repeat("abc", 0).length);

  const base = "beta";
  const u: User = { name: base.clone() + "!", age: 3 };
  print(u.age - 1);
  print(u.name);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
hello
hello, world
12
true
false
x = 42, y = -1.5, ok = true
こんにちは 15
104
a	b "q" \ ${
3
18446744073709551615 -9223372036854775808
0.1 1e+21 NaN
abcabcabc
0
2
beta!
```
