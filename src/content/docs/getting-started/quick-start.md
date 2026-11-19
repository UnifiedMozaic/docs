---
title: Quick start
description: Build and run your first UnifiedMozaic programs.
sidebar:
  order: 3
---

Run these commands inside the cloned repository (see [Installation](/getting-started/installation/)). If you set up the `um` command, you can use `um` in place of `node src/cli.ts`.

## Native executable

```sh
node src/cli.ts build examples/structs.um --target host -o structs
./structs                   # prints 32, 1.5, 2.5, 3.5, 7, 1
```

## GPU through Metal (Apple Silicon)

A native executable that runs kernels on the GPU through Metal:

```sh
UM_METAL=1 node src/cli.ts build examples/gpu_submit.um --target host -o gpu_submit
./gpu_submit                # prints 30, true, 285, 3
```

## WebAssembly

wasm32 is the default target. It needs a wasm32-capable clang.

```sh
node src/cli.ts build examples/structs.um -o structs.wasm
node runtime/run-node.mjs structs.wasm
```

## Type-check only

```sh
node src/cli.ts check examples/structs.um
```

Add `--json` for machine-readable diagnostics.

## Inspect generated code

```sh
node src/cli.ts build examples/kernels.um --emit-llvm -o kernels.ll
node src/cli.ts build examples/kernels.um --target host --emit-msl -o kernels   # kernels.<name>.metal
```

## Next steps

- The programs in [Examples](/examples/) are runnable; each one doubles as a test (`// expect:` lines).
- Read the [language guide](/guide/overview/).
- Set up your [editor](/getting-started/editor/).
