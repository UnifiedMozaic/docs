---
title: "audit_regressions.um"
description: "Regression tests for bugs found in an audit. Each of them used to read freed memory or free memory twice."
---

Regression tests for bugs found in an audit. Each of them used to read freed memory or free memory twice.

Source: [examples/audit_regressions.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/audit_regressions.um)

```um title="audit_regressions.um"
// 監査で見つかった不具合の再発防止。どれも以前は解放済みの領域を読むか、二重に解放していた。
// メモリ検査つきの実行で確かめる。
// expect: zg
// expect: zg
// expect: false
// expect: a
// expect: abc
// expect: bx
// expect: abc!
// expect: t1
// expect: a
// expect: a
// expect: 1
// expect: hello
// expect: inner
// expect: 2

struct P { name: string; tags: string[]; }
enum Ev { A(i: usize, s: string), B }
enum Maybe<T> { Some(v: T), None }

class B {
  s: string;
  constructor() { this.s = "abcdefgh"; }
  reset(): string { this.s = "z"; return "g"; }
}

function g(a: mut string): string { a = "z"; return "g"; }
function same(a: mut string): string { a = "zzzzzzzz"; return "abcdefgh"; }
function mk(): string[] { return ["a", "b"]; }
function mkP(): P { return { name: "abc", tags: ["t1"] }; }
function nxt(c: mut usize): usize { c += 1; return c - 1; }

export function main(): i32 {
  // 右辺が左辺の変数を書き換える。左辺は右辺のあとで読まれる。
  let a = "abcdefgh";
  print(a + g(mut a));
  let b = new B();
  print(b.s + b.reset());
  let s = "abcdefgh";
  print(s == same(mut s));

  // 一時値の中身を取り出して使う。解放は元の一時値の1回だけ。
  print(mk()[0]);
  print(mkP().name);
  let ys: string[][] = [["a"], ["b"]];
  print(ys.pop()[0] + "x");
  print(`${mkP().name}!`);
  print(mkP().tags[0]);
  mk()[0];

  // match の対象の添字は1回だけ評価される。
  let xs: Maybe<string>[] = [Maybe.Some("a"), Maybe.Some("b"), Maybe.Some("c")];
  let c: usize = 0;
  match (xs[nxt(mut c)]) {
    Maybe.Some(v) => { print(v); print(v); }
    Maybe.None => {}
  }
  print(c);

  // 枝の名前が、対象の添字に使った名前と同じでも取り違えない。
  let arr: Ev[] = [Ev.A(1, "hello"), Ev.A(0, "other")];
  let i: usize = 0;
  match (arr[i]) {
    Ev.A(i, s) => { print(s); }
    Ev.B => {}
  }

  // 入れ子の match。内側の名前は内側の値の型になる。
  let x: Maybe<Maybe<string>> = Maybe.Some(Maybe.Some("inner"));
  let depth = 0;
  match (x) {
    Maybe.Some(m) => {
      depth += 1;
      match (m) {
        Maybe.Some(q) => { depth += 1; print(q); }
        Maybe.None => {}
      }
    }
    Maybe.None => {}
  }
  print(depth);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
zg
zg
false
a
abc
bx
abc!
t1
a
a
1
hello
inner
2
```
