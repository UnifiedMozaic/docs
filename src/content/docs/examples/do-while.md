---
title: "do_while.um"
description: "do ... while runs the body at least once before checking the condition."
---

do ... while runs the body at least once before checking the condition.

Source: [examples/do_while.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/do_while.um)

```um title="do_while.um"
// do ... while は、本体を少なくとも1回実行してから条件を確かめる。
// expect: 1
// expect: 16
// expect: 3
// expect: 9

export function main(): i32 {
  let runs = 0;
  do {
    runs += 1;
  } while (runs < 0);
  print(runs);

  let x = 1;
  do {
    x = x * 2;
  } while (x < 10);
  print(x);

  // continue は条件の評価へ進む。
  let i = 0;
  let odd = 0;
  do {
    i += 1;
    if (i % 2 == 0) {
      continue;
    }
    odd += 1;
  } while (i < 5);
  print(odd);

  let n = 0;
  do {
    n += 3;
    if (n >= 9) {
      break;
    }
  } while (true);
  print(n);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
1
16
3
9
```
