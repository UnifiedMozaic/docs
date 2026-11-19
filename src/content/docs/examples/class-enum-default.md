---
title: "class_enum_default.um"
description: "An enum can be used as the initial value of a class field. A user-defined type with a type parameter of the same name can be passed to a standard generic type."
---

An enum can be used as the initial value of a class field. A user-defined type with a type parameter of the same name can be passed to a standard generic type.

Source: [examples/class_enum_default.um](https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples/class_enum_default.um)

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

## Expected output

From the `// expect:` lines. The test runner checks this output on wasm32 and native.

```text
1
ok
```
