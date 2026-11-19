---
title: "tokenizer.um"
description: "Splitting i32[] character codes into tokens with a state machine. Uses an array of structs, u8 fields and i64 numbers."
---

Splitting i32[] character codes into tokens with a state machine. Uses an array of structs, u8 fields and i64 numbers.

Source: [examples/tokenizer.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/tokenizer.um)

```um title="tokenizer.um"
// i32[] の文字コードを状態機械でトークンに分ける。構造体の配列、u8 のフィールド、i64 の数値を使う。
// expect: 17
// expect: 5
// expect: 2
// expect: 6
// expect: 4
// expect: 0
// expect: 99999999999
// expect: 11
// expect: 9
// expect: 10000000007002

// Character codes: digits 48..57, letters 97..122, '+' 43, '*' 42, space 32, '(' 40, ')' 41
struct Token {
  kind: u8;      // 1 = number, 2 = ident, 3 = operator, 4 = paren
  start: i32;
  length: i32;
  value: i64;
}

function isDigit(c: i32): bool {
  return c >= 48 && c <= 57;
}

function isAlpha(c: i32): bool {
  return c >= 97 && c <= 122;
}

function tokenize(src: i32[]): Token[] {
  let tokens: Token[] = [];
  let state = 0; // 0 = start, 1 = in number, 2 = in ident
  let start = 0;
  let value: i64 = 0;
  let n = src.length as i32;
  for (let i = 0; i <= n; i++) {
    let c = 32;
    if (i < n) {
      c = src[i];
    }
    if (state == 1 && !isDigit(c)) {
      tokens.push({ kind: 1, start, length: i - start, value });
      state = 0;
    } else if (state == 2 && !(isAlpha(c) || isDigit(c))) {
      tokens.push({ kind: 2, start, length: i - start, value: 0 });
      state = 0;
    }
    if (state == 0) {
      if (isDigit(c)) {
        state = 1;
        start = i;
        value = (c - 48) as i64;
      } else if (isAlpha(c)) {
        state = 2;
        start = i;
      } else if (c == 43 || c == 42) {
        tokens.push({ kind: 3, start: i, length: 1, value: c as i64 });
      } else if (c == 40 || c == 41) {
        tokens.push({ kind: 4, start: i, length: 1, value: c as i64 });
      }
    } else if (state == 1) {
      value = value * 10 + (c - 48) as i64;
    }
  }
  return tokens;
}

function evalSum(tokens: Token[]): i64 {
  let total: i64 = 0;
  let product: i64 = 1;
  let depth = 0;
  let maxDepth = 0;
  for (const t of tokens) {
    if (t.kind == 1) {
      product *= t.value;
    } else if (t.kind == 3 && t.value == 43) {
      total += product;
      product = 1;
    } else if (t.kind == 4) {
      if (t.value == 40) {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else {
        depth--;
      }
    }
  }
  total += product;
  return total * 100 + maxDepth as i64;
}

export function main(): i32 {
  // "12+x1*30 + (7*(4+ab9))+99999999999"
  const text: i32[] = [
    49, 50, 43, 120, 49, 42, 51, 48, 32, 43, 32, 40, 55, 42, 40, 52, 43, 97, 98, 57, 41, 41, 43,
    57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57,
  ];
  const toks = tokenize(text);
  print(toks.length);
  let counts: i32[4] = [0, 0, 0, 0];
  for (const t of toks) {
    counts[(t.kind - 1) as usize]++;
  }
  for (const c of counts) {
    print(c);
  }
  print(toks[2].value);
  print(toks[toks.length - 1].value);
  print(toks[toks.length - 1].length);
  print(toks[5].start);
  print(evalSum(toks));
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
17
5
2
6
4
0
99999999999
11
9
10000000007002
```
