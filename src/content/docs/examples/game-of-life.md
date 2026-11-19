---
title: "game_of_life.um"
description: "Game of Life with a kernel and two Buffers. Each round dispatches twice, a→b and b→a (a Buffer cannot be moved to swap them inside a loop)."
---

Game of Life with a kernel and two Buffers. Each round dispatches twice, a→b and b→a (a Buffer cannot be moved to swap them inside a loop).

Source: [examples/game_of_life.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/game_of_life.um)

```um title="game_of_life.um"
// kernel と 2 つの Buffer で作るライフゲーム。1 周で a→b、b→a の 2 回 dispatch する（ループ内で Buffer を移動して入れ替えることはできないため）。
// expect: 8
// expect: 8
// expect: 3
// expect: 1469956991

kernel function lifeStep(i: u32, next: mut Buffer<u32>, cur: Buffer<u32>, w: u32, h: u32): void {
  const x = i % w;
  const y = i / w;
  let n: u32 = 0;
  for (let dy: u32 = 0; dy < 3; dy++) {
    for (let dx: u32 = 0; dx < 3; dx++) {
      if (dx == 1 && dy == 1) {
        continue;
      }
      const nx = (x + w + dx - 1) % w;
      const ny = (y + h + dy - 1) % h;
      n += cur[ny * w + nx];
    }
  }
  const alive = cur[i];
  if (alive == 1 && (n == 2 || n == 3)) {
    next[i] = 1;
  } else if (alive == 0 && n == 3) {
    next[i] = 1;
  } else {
    next[i] = 0;
  }
}

function countAlive(b: Buffer<u32>): u32 {
  let c: u32 = 0;
  for (const v of b) {
    c += v;
  }
  return c;
}

export function main(): i32 {
  const w: u32 = 8;
  const h: u32 = 8;
  let a = new Buffer<u32>(64);
  let b = new Buffer<u32>(64);
  // glider
  a[1] = 1;
  a[10] = 1;
  a[16] = 1;
  a[17] = 1;
  a[18] = 1;
  // blinker
  a[45] = 1;
  a[46] = 1;
  a[47] = 1;
  for (let gen = 0; gen < 6; gen++) {
    dispatch(lifeStep, 64, mut b, a, w, h);
    dispatch(lifeStep, 64, mut a, b, w, h);
    if (gen % 2 == 1) {
      print(countAlive(a));
    }
  }
  let hash: u32 = 0;
  for (let i = 0; i < 64; i++) {
    hash = hash * 31 + a[i];
  }
  print(hash);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
8
8
3
1469956991
```
