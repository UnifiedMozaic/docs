# Writing rules for this site

These apply to people and AI agents alike.

1. **Do not write what the sources do not say.** The source of truth is the main repository, [UnifiedMozaic/UnifiedMozaic](https://github.com/UnifiedMozaic/UnifiedMozaic): its `README.md` / `README.ja.md`, the documents in `docs/` (`setup.md` / `setup.ja.md` and the language guide `guide.ja.md`), and the programs in `examples/`. Do not fill gaps in these documents by guessing. If something is not written there, leave it out, or ask for it to be written in the main repository first.
2. **English is the source of truth; Japanese is a translation.** Change the English page first, then the Japanese page at the same path under `src/content/docs/ja/`. A translation does not add or drop content.
3. **Code samples are real.** Prefer programs that exist in the main repository's `examples/` and quote them as they are. Write expected output only when the source states it (for example `// expect:` lines or the README).
4. **Two colours.** The logo and the site theme use black and white only (see `assets/logo/README.md` in the main repository).
5. Tag UnifiedMozaic code blocks with `um`.

## Current sources

- **Getting Started**: `README.md` / `README.ja.md` and `docs/setup.md` / `docs/setup.ja.md` of the main repository.
- **Guide**: `docs/guide.ja.md` of the main repository. It exists only in Japanese, so the English Guide pages are a translation of it. When the English original is written, it becomes the source.
- **Examples**: generated from `examples/*.um` with `npm run gen:examples` (see README.md).
- **Reference**: not written yet. There is no separate specification document; anything written here must come from the sources above.
