---
title: 環境構築
description: Node.js と clang を入れ、コンパイラを取ってきて、um コマンドを使えるようにする。
sidebar:
  order: 2
---

必要なのは **Node.js** と **clang** だけで、npm パッケージのインストールはありません。

## 対応している環境

| 環境 | ネイティブ | GPU（Metal） | wasm32 |
| --- | --- | --- | --- |
| macOS（Apple Silicon） | ○ | ○ | Homebrew の LLVM を入れれば ○ |
| Linux（x86_64 / arm64） | ○ | — | ○（`lld` が要る） |
| Windows | 試していません。WSL2 の Linux で使ってください | — | — |

## 1. Node.js（22.18 以上）

コンパイラは TypeScript のソースを Node.js がそのまま実行します（型を消すだけの実行。22.18 から既定で使えます）。

```sh
# macOS
brew install node

# Linux（nvm を使う例。ディストリビューションの nodejs は古いことが多い）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install 22
```

```sh
node --version   # v22.18.0 以上
```

## 2. clang（LLVM 18 以上）

```sh
# macOS: Xcode か Command Line Tools の clang を使う（Metal のフレームワークも入る）
xcode-select --install

# Linux（Debian / Ubuntu）: lld は wasm32 のリンクに使う（wasm-ld）
sudo apt install clang lld
```

```sh
clang --version  # 18 以上
```

:::note[macOS で wasm32 も出したいとき]
Xcode の clang は wasm32 を出せないので、Homebrew の LLVM を入れて `UM_CLANG` で指定します。ネイティブと Metal のビルドもこの clang で動きます。

```sh
brew install llvm lld
export UM_CLANG="$(brew --prefix llvm)/bin/clang"   # ~/.zshrc などに書いておく
```
:::

Mac の GPU で実行するには、Apple Silicon と、Xcode か Command Line Tools（Metal）が必要です。

## 3. コンパイラを取ってくる

```sh
git clone https://github.com/UnifiedMozaic/UnifiedMozaic.git
cd UnifiedMozaic
```

## 4. `um` コマンドを使えるようにする（任意）

リポジトリの中で `npm link` を実行すると、`um` コマンドがどこからでも使えるようになります。リンクなので、`git pull` したあとに入れ直す必要はありません。

```sh
npm link
um --help
```

- `um: command not found` のときは、`npm prefix -g` の下の `bin` が `PATH` に入っているか確かめてください。
- やめるときは `npm unlink -g unifiedmozaic`。
- `npm link` を使わない場合は、`um` を `node src/cli.ts` に読み替えてください。
- npm のレジストリからのインストール（`npm install -g`）にはまだ対応していません。

## 5. テスト

```sh
node tests/run.ts           # npm test でも同じ
```

数分かかります。各サンプルを wasm32 とネイティブで実行して出力を照合し、コンパイルエラーになるべきコード（`tests/errors/`）と停止するべきコード（`tests/panics/`）を確かめます。ThreadSanitizer・AddressSanitizer・valgrind があれば、それらをつけても実行します。

環境にないものは、理由を表示して飛ばします。

- wasm32 を出せる clang がない（Mac の Xcode の clang など）→ wasm32 のテストを飛ばす。
- AddressSanitizer・valgrind・`leaks`（Mac）のどれもない → メモリ検査つきの実行を飛ばす。Linux では `sudo apt install valgrind` で足せます。
- Metal がない → `tests/metal/` は arm64 向けに作れることだけを確かめる。

## うまくいかないとき

| 症状 | 対処 |
| --- | --- |
| `ERR_UNKNOWN_FILE_EXTENSION ".ts"` や、型の注釈での `SyntaxError` | Node.js が古い。22.18 以上にする |
| `clang が見つかりません` / `the LLVM toolchain (clang) failed` | clang を入れるか、`UM_CLANG` で場所を指定する |
| `この clang は wasm32 を出力できない` | macOS は上の Homebrew の LLVM を `UM_CLANG` で指定する。Linux は `lld` を入れる |
| `gpu.dispatch` がコンパイルエラーになる | GPU の経路は `UM_METAL=1` を付けた Mac のネイティブのビルドだけ。付けないときは `dispatch` か `cpu.dispatch` を使う |
| 実行時に `panic: the GPU is not available` | `gpu.dispatch` は GPU がないと停止する。`dispatch`（自動）なら CPU で動く |
