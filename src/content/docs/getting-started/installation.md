---
title: Installation
description: Install Node.js and clang, get the compiler, and set up the um command.
sidebar:
  order: 2
---

You need only **Node.js** and **clang**; there are no npm packages to install.

## Supported platforms

| Platform | Native | GPU (Metal) | wasm32 |
| --- | --- | --- | --- |
| macOS (Apple Silicon) | yes | yes | yes, with Homebrew's LLVM |
| Linux (x86_64 / arm64) | yes | — | yes (needs `lld`) |
| Windows | not tested; use Linux under WSL2 | — | — |

## 1. Node.js (22.18 or later)

The compiler is TypeScript that Node.js runs directly (type stripping, enabled by default since 22.18).

```sh
# macOS
brew install node

# Linux (example with nvm; distribution packages are often too old)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 22
```

```sh
node --version   # v22.18.0 or later
```

## 2. clang (LLVM 18 or later)

```sh
# macOS: the clang from Xcode or the Command Line Tools (also provides the Metal framework)
xcode-select --install

# Linux (Debian / Ubuntu): lld provides wasm-ld for wasm32 linking
sudo apt install clang lld
```

```sh
clang --version  # 18 or later
```

:::note[wasm32 on macOS]
Xcode's clang cannot target wasm32. Install Homebrew's LLVM and point `UM_CLANG` at it; native and Metal builds work with it as well.

```sh
brew install llvm lld
export UM_CLANG="$(brew --prefix llvm)/bin/clang"   # add this to ~/.zshrc or similar
```
:::

For GPU execution on a Mac you need Apple Silicon with Xcode or the Command Line Tools (Metal).

## 3. Get the compiler

```sh
git clone https://github.com/UnifiedMozaic/UnifiedMozaic.git
cd UnifiedMozaic
```

## 4. The `um` command (optional)

Run `npm link` inside the repository to put `um` on your `PATH`. It is a link, so there is nothing to reinstall after `git pull`.

```sh
npm link
um --help
```

- If you get `um: command not found`, check that the `bin` directory under `npm prefix -g` is on your `PATH`.
- To remove it: `npm unlink -g unifiedmozaic`.
- Without `npm link`, replace `um` with `node src/cli.ts`.
- Installing from the npm registry (`npm install -g`) is not supported yet.

## 5. Tests

```sh
node tests/run.ts           # same as npm test
```

This takes a few minutes. It runs every example on wasm32 and native and compares the output, checks programs that must fail to compile (`tests/errors/`) or must stop at run time (`tests/panics/`), and runs thread tests under ThreadSanitizer and memory tests under AddressSanitizer or valgrind when available.

Anything your machine lacks is skipped with a note:

- no wasm32-capable clang (for example Xcode's clang on a Mac) → wasm32 tests are skipped
- none of AddressSanitizer, valgrind or `leaks` (Mac) → memory-checked runs are skipped; on Linux, `sudo apt install valgrind` adds them
- no Metal → `tests/metal/` is only compiled for arm64

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `ERR_UNKNOWN_FILE_EXTENSION ".ts"`, or a `SyntaxError` at a type annotation | Node.js is too old; use 22.18 or later |
| `clang が見つかりません` / `the LLVM toolchain (clang) failed` | Install clang, or set `UM_CLANG` to its path |
| `この clang は wasm32 を出力できない` (this clang cannot target wasm32) | macOS: set `UM_CLANG` to Homebrew's LLVM as above. Linux: install `lld` |
| `gpu.dispatch` is a compile error | The GPU path exists only for native Mac builds with `UM_METAL=1`; otherwise use `dispatch` or `cpu.dispatch` |
| `panic: the GPU is not available` at run time | `gpu.dispatch` stops when there is no GPU; `dispatch` (automatic) falls back to the CPU |
