---
title: "optional_arrays.um"
description: "A parenthesised type: an array of strings that may be null."
---

A parenthesised type: an array of strings that may be null.

Source: [examples/optional_arrays.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/optional_arrays.um)

```um title="optional_arrays.um"
// かっこで囲んだ型: 「null かもしれない文字列」の配列。
// expect: 3
// expect: a
// expect: (none)
// expect: c
// expect: 2

export function main(): i32 {
  let names: (string | null)[] = [];
  names.push("a");
  names.push(null);
  names.push("c");
  print(names.length);
  let present = 0;
  for (const n of names) {
    if (n != null) {
      print(n);
      present += 1;
    } else {
      print("(none)");
    }
  }
  print(present);
  let grid: (i32[] | null)[] = [null, [1, 2]];
  grid[0] = [3];
  grid[1] = null;
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
3
a
(none)
c
2
```
