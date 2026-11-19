# Writing rules for this site

These apply to people and AI agents alike.

1. **Do not write what the sources do not say.** The source of truth is the main repository, [UnifiedMozaic/UnifiedMozaic](https://github.com/UnifiedMozaic/UnifiedMozaic): its `README.md`, `AGENTS.md` and `HANDOFF.md`, and its language, IR and core library specifications. Do not fill gaps in a specification by guessing. If something is not written there, leave it out, or ask for it to be written in the main repository first.
2. **English is the source of truth; Japanese is a translation.** Change the English page first, then the Japanese page at the same path under `src/content/docs/ja/`. A translation does not add or drop content.
3. **Code samples are real.** Prefer programs that exist in the main repository's `examples/` and quote them as they are. Write expected output only when the source states it (for example `// expect:` lines or the README).
4. **Two colours.** The logo and the site theme use black and white only (see `assets/logo/README.md` in the main repository).
5. Tag UnifiedMozaic code blocks with `um`.
