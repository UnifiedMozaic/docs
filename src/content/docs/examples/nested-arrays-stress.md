---
title: "nested_arrays_stress.um"
description: "Exercises freeing and moving in arrays whose elements have heap data (checked by the memory-checked runs)."
---

Exercises freeing and moving in arrays whose elements have heap data (checked by the memory-checked runs).

Source: [examples/nested_arrays_stress.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/nested_arrays_stress.um)

```um title="nested_arrays_stress.um"
// ヒープを持つ要素の配列で、解放と移動が絡む場面をまとめて通す（メモリ検査つきの実行で確かめる）。
// expect: 4
// expect: 2
// expect: zz
// expect: 3
// expect: 1
// expect: 5
// expect: 9
// expect: done

struct Bag {
  label: string;
  items: string[];
}

function make(n: i32): string[] {
  let out: string[] = [];
  for (let i = 0; i < n; i++) {
    out.push(`s${i}`);
  }
  return out;
}

function firstLong(words: string[]): i32 {
  for (const w of words) {
    if (w.length > 2) {
      return w.length as i32;
    }
  }
  return 0;
}

function take(words: own string[]): usize {
  return words.length;
}

export function main(): i32 {
  let words = make(5);
  words.pop();
  print(words.length);

  // 取り出した要素を別の位置へ。古い要素は解放される。
  words[0] = words.pop();
  words[1] = "zz";
  words.pop();
  print(words.length);
  print(words[1]);

  // 入れ子: 行の差し替え、行への追加、外側の伸長。
  let grid: i32[][] = [[1], [2, 3]];
  grid[0] = [];
  grid[1].push(grid.length as i32);
  for (let i = 0; i < 40; i++) {
    grid.push(grid[1].clone());
  }
  print(grid[41].length);

  // struct の中の配列。丸ごと差し替えると古い中身が解放される。
  let bag: Bag = { label: "a", items: make(3) };
  bag.items = make(1);
  bag = { label: "b", items: make(2) };
  bag.items.pop();
  print(bag.items.length);

  // 一時的な配列の上を回り、途中で関数から戻る。
  print(firstLong(make(200)) + firstLong(["ab", "abcd"]) - 2);

  // 所有権ごと渡す。条件によって移動したりしなかったりする。
  let total: usize = 0;
  for (let i = 0; i < 6; i++) {
    let w = make(i);
    if (i % 2 == 1) {
      total += take(own w);
    }
  }
  print(total);

  let bags: Bag[] = [];
  for (let i = 0; i < 20; i++) {
    bags.push({ label: `bag${i}`, items: make(i % 4) });
  }
  bags[3] = { label: "new", items: [] };
  bags.clear();
  bags.push({ label: "last", items: make(2) });
  print("done");
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
4
2
zz
3
1
5
9
done
```
