// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Syntax highlighting for UnifiedMozaic (.um).
// The grammar is a copy of syntaxes/unifiedmozaic.tmLanguage.json from
// UnifiedMozaic/vscode-extension. Update it with `npm run sync:grammar`.
const umGrammar = JSON.parse(
	readFileSync(new URL('./src/grammars/unifiedmozaic.tmLanguage.json', import.meta.url), 'utf8'),
);
const umLanguage = {
	...umGrammar,
	name: 'um',
	aliases: ['unifiedmozaic'],
};

export default defineConfig({
	site: 'https://docs.unifiedmozaic.org',
	integrations: [
		starlight({
			title: 'UnifiedMozaic',
			description: 'One language. Every core.',
			logo: {
				light: './src/assets/logo-black.svg',
				dark: './src/assets/logo-white.svg',
				alt: 'UnifiedMozaic',
			},
			favicon: '/favicon.svg',
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://docs.unifiedmozaic.org/og.png' } },
			],
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/UnifiedMozaic/UnifiedMozaic' },
			],
			editLink: {
				baseUrl: 'https://github.com/UnifiedMozaic/docs/edit/main/',
			},
			// English is the source of truth; Japanese is a translation.
			defaultLocale: 'root',
			locales: {
				root: { label: 'English', lang: 'en' },
				ja: { label: '日本語', lang: 'ja' },
			},
			sidebar: [
				{
					label: 'Getting Started',
					translations: { ja: 'はじめに' },
					items: [
						{ slug: 'getting-started/overview' },
						{ slug: 'getting-started/installation' },
						{ slug: 'getting-started/quick-start' },
						{ slug: 'getting-started/editor' },
					],
				},
				{
					label: 'Guide',
					translations: { ja: 'ガイド' },
					items: [{ autogenerate: { directory: 'guide' } }],
				},
				{
					label: 'Reference',
					translations: { ja: 'リファレンス' },
					items: [{ autogenerate: { directory: 'reference' } }],
				},
				{
					label: 'Examples',
					translations: { ja: 'サンプル' },
					items: [{ autogenerate: { directory: 'examples' } }],
				},
			],
			customCss: ['./src/styles/monochrome.css'],
			expressiveCode: {
				shiki: {
					langs: [umLanguage],
				},
			},
		}),
	],
});
