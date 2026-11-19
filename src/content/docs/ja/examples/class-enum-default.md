---
title: "class_enum_default.um"
description: "class のフィールドの初期値に enum を使える。標準のジェネリックな型に、同じ名前の型引数を持つ自作の型も渡せる。"
---

class のフィールドの初期値に enum を使える。標準のジェネリックな型に、同じ名前の型引数を持つ自作の型も渡せる。

ソース: [examples/class_enum_default.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/class_enum_default.um)

```um title="class_enum_default.um"
// class のフィールドの初期値に enum を使える。標準のジェネリックな型に、同じ名前の型引数を持つ自作の型も渡せる。
// expect: 1
// expect: ok

enum E { On, Off }

class Lamp {
  state: E = E.Off;

  isOff(): bool {
    match (this.state) {
      E.Off => return true,
      E.On => return false,
    }
  }
}

function check(): Result<E, E> {
  return Result.Ok(E.On);
}

export function main(): i32 {
  const l = new Lamp();
  print(l.isOff() as i32);
  match (check()) {
    Result.Ok(_) => print("ok"),
    Result.Err(_) => print("err"),
  }
  return 0;
}
```

## 期待する出力

`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。

```text
1
ok
```
