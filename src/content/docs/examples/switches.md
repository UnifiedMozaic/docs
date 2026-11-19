---
title: "switches.um"
description: "switch can replace a chain of ifs. Each case ends with break or return."
---

switch can replace a chain of ifs. Each case ends with break or return.

Source: [examples/switches.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/switches.um)

```um title="switches.um"
// switch は if の連なりに置き換えられる。各 case は break か return で終える。
// expect: one
// expect: few
// expect: few
// expect: many
// expect: 10
// expect: red
// expect: other
// expect: 3
// expect: 6

function size(n: i32): string {
  switch (n) {
    case 1:
      return "one";
    case 2:
    case 3:
      return "few";
    default:
      return "many";
  }
}

function colour(name: string): string {
  let out = "";
  switch (name) {
    case "r":
    case "red": {
      out = "red";
      break;
    }
    case "g":
      out = "green";
      break;
    default:
      out = "other";
  }
  return out;
}

function next(): i32 {
  return 2;
}

export function main(): i32 {
  print(size(1));
  print(size(2));
  print(size(3));
  print(size(9));

  let total = 0;
  for (let i = 0; i < 6; i++) {
    switch (i % 3) {
      case 0:
        total += 1;
        break;
      case 1:
        continue;
      default:
        total += 4;
    }
  }
  print(total);
  print(colour("r"));
  const key = "zzz";
  print(colour(key));
  print(key.length);

  // 対象が関数の結果なら、評価は1回だけ。
  let hits = 0;
  switch (next() * 3) {
    case 6:
      hits += 6;
      break;
    case 2:
      hits += 100;
      break;
  }
  print(hits);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
one
few
few
many
10
red
other
3
6
```
