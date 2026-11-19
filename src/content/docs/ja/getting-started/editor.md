---
title: エディタ
description: UnifiedMozaic の VSCode 拡張。
sidebar:
  order: 4
---

VSCode 向けの拡張が [UnifiedMozaic/vscode-extension](https://github.com/UnifiedMozaic/vscode-extension) にあります（色分け、保存時の型検査、F5 でビルドして実行）。

[リリース](https://github.com/UnifiedMozaic/vscode-extension/releases) の `.vsix` を入れ、設定の `unifiedmozaic.compilerPath` に UnifiedMozaic のリポジトリの場所を書きます。

```sh
code --install-extension unifiedmozaic-0.1.0.vsix
```
