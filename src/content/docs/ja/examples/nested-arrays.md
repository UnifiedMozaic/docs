---
title: "nested_arrays.um"
description: "可変長配列は、ヒープを持つ要素（文字列、配列、それらを持つ struct）を所有できる。"
---

可変長配列は、ヒープを持つ要素（文字列、配列、それらを持つ struct）を所有できる。

ソース: [examples/nested_arrays.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/nested_arrays.um)

```um title="nested_arrays.um"
// 可変長配列は、ヒープを持つ要素（文字列、配列、それらを持つ struct）を所有できる。
// 要素は配列に移動し、配列が解放されるときに一緒に解放される。
// expect: 3
// expect: 17
// expect: beta
// expect: 2
// expect: gamma!
// expect: 0
// expect: 6
// expect: 85
// expect: 3
// expect: 12
// expect: 7
// expect: 10

struct Person {
  name: string;
  scores: i32[];
}

struct Tree {
  value: i32;
  kids: Tree[];
}

function join(words: string[]): string {
  let out = "";
  for (const w of words) {
    out = out + w + " ";
  }
  return out;
}

function sumTree(t: Tree): i32 {
  let s = t.value;
  for (const k of t.kids) {
    s += sumTree(k);
  }
  return s;
}

function build(depth: i32, value: i32): Tree {
  let t: Tree = { value: value, kids: [] };
  if (depth > 0) {
    t.kids.push(build(depth - 1, value * 2));
    t.kids.push(build(depth - 1, value * 2 + 1));
  }
  return t;
}

export function main(): i32 {
  let words: string[] = ["alpha", "beta"];
  const g = "gamma";
  words.push(g);
  print(words.length);
  print(join(words).length);
  print(words[1]);

  let last = words.pop();
  print(words.length);
  last = last + "!";
  print(last);
  words[0] = "replaced";
  words.clear();
  print(words.length);

  let grid: i32[][] = [];
  for (let y = 0; y < 3; y++) {
    let row: i32[] = [];
    for (let x = 0; x <= y; x++) {
      row.push(x + y * 10);
    }
    grid.push(row);
  }
  let cells = 0;
  let total = 0;
  for (const row of grid) {
    cells += row.length as i32;
    for (const v of row) {
      total += v;
    }
  }
  print(cells);
  print(total + grid[2][2] - 22 + 1);

  let people: Person[] = [];
  people.push({ name: "ann", scores: [90, 80] });
  people.push({ name: "bob", scores: [] });
  people.push({ name: "cy", scores: [1] });
  print(people.length);
  people.pop();
  let line = "";
  for (const p of people) {
    line = line + `${p.name}:${p.scores.length} `;
  }
  print(line.length);

  const tree = build(2, 1);
  print(tree.kids.length as i32 + tree.kids[1].kids.length as i32 + tree.kids[0].kids[1].value - 2);
  print(sumTree(tree) - 18);

  // 途中で抜けても、移動しなかった値も移動した値も1回だけ解放される。
  let spare: string[] = [];
  for (let i = 0; i < 4; i++) {
    const s = `item${i}`;
    if (i % 2 == 0) {
      spare.push(s);
    }
  }
  let zeros = new Array<string>(3);
  zeros[1] = "x";
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
3
17
beta
2
gamma!
0
6
85
3
12
7
10
```
