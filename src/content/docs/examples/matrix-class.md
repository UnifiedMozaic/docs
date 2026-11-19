---
title: "matrix_class.um"
description: "A matrix of f64[] wrapped in a class (product, transpose, trace). Its methods modify this, so it is declared with let."
---

A matrix of f64[] wrapped in a class (product, transpose, trace). Its methods modify this, so it is declared with let.

Source: [examples/matrix_class.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/matrix_class.um)

```um title="matrix_class.um"
// class でラップした f64[] の行列（積・転置・トレース）。メソッドが this を書き換えるので let で宣言する。
// expect: 11
// expect: 14
// expect: 24.5
// expect: 32
// expect: 43
// expect: 24.5
// expect: 2

class Matrix {
  rows: i32;
  cols: i32;
  data: f64[];

  constructor(rows: i32, cols: i32) {
    this.rows = rows;
    this.cols = cols;
    this.data = new Array<f64>(rows * cols);
  }

  get(r: i32, c: i32): f64 {
    return this.data[r * this.cols + c];
  }

  set(r: i32, c: i32, v: f64): void {
    this.data[r * this.cols + c] = v;
  }

  multiply(other: Matrix): Matrix {
    let result = new Matrix(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0.0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.get(i, k) * other.get(k, j);
        }
        result.set(i, j, sum);
      }
    }
    return result;
  }

  transpose(): Matrix {
    let t = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        t.set(j, i, this.get(i, j));
      }
    }
    return t;
  }

  trace(): f64 {
    let s = 0.0;
    for (let i = 0; i < this.rows; i++) {
      s += this.get(i, i);
    }
    return s;
  }
}

export function main(): i32 {
  let a = new Matrix(2, 3);
  let b = new Matrix(3, 2);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 3; j++) {
      a.set(i, j, (i * 3 + j + 1) as f64);
      b.set(j, i, ((j * 2 + i + 1) as f64) * 0.5);
    }
  }
  const c = a.multiply(b);
  print(c.get(0, 0));
  print(c.get(0, 1));
  print(c.get(1, 0));
  print(c.get(1, 1));
  print(c.trace());
  const t = c.transpose();
  print(t.get(0, 1));
  print(t.rows);
  return 0;
}
```

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
11
14
24.5
32
43
24.5
2
```
