# UnifiedMozaic docs

Source of [docs.unifiedmozaic.org](https://docs.unifiedmozaic.org), built with [Astro Starlight](https://starlight.astro.build/).

## Development

Requires Node.js 22.23.4 or later (Astro 7).

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview
```

## Layout

```
src/content/docs/            English (source of truth)
src/content/docs/ja/         Japanese translation (same paths as English)
src/grammars/                TextMate grammar for ```um code blocks
src/assets/                  logo (from UnifiedMozaic/UnifiedMozaic assets/logo/)
src/styles/monochrome.css    black-and-white theme
public/                      favicon and social preview image
```

Sections: Getting Started / Guide / Reference / Examples.

## Languages

English is the source of truth. Japanese pages live under `src/content/docs/ja/` at the same path as their English page. A page without a Japanese version falls back to English, with a notice.

## Regenerating the Examples

The pages under `src/content/docs/examples/` and `src/content/docs/ja/examples/` are generated from the main repository's `examples/*.um`. Do not edit them by hand.

```sh
npm run gen:examples -- ../UnifiedMozaic   # path to a checkout of UnifiedMozaic/UnifiedMozaic
```

The code is quoted as it is; expected output comes only from `// expect:` lines. English summaries are in `scripts/examples-en.json` (a translation of each file's leading comment). A new example without an English summary makes the script fail.

## Code highlighting

Code blocks tagged `um` (or `unifiedmozaic`) are highlighted with the grammar from [UnifiedMozaic/vscode-extension](https://github.com/UnifiedMozaic/vscode-extension) (`syntaxes/unifiedmozaic.tmLanguage.json`), loaded into Expressive Code (Shiki) in `astro.config.mjs`. To update the copy:

```sh
npm run sync:grammar                      # from GitHub (main)
npm run sync:grammar -- ../vscode-extension   # from a local checkout
```

## Deploying (Cloudflare Pages)

| Setting | Value |
| --- | --- |
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `22.23.4` (or later) |
| Custom domain | `docs.unifiedmozaic.org` |

## Writing rules

See [AGENTS.md](AGENTS.md).

## License

Licensed under either of [Apache License, Version 2.0](LICENSE-APACHE) or [MIT license](LICENSE-MIT) at your option.
