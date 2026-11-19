// Generates the Examples pages from the main repository's examples/*.um.
// Usage: npm run gen:examples -- <path to a UnifiedMozaic checkout>
//
// The code is quoted exactly as it is. The summary is the program's leading
// comment (Japanese pages) or its translation in scripts/examples-en.json
// (English pages). Expected output comes only from `// expect:` lines, and
// standard input only from `// stdin:` lines, parsed the same way as
// tests/run.ts in the main repository.
import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const repo = process.argv[2];
if (!repo) {
	console.error('usage: npm run gen:examples -- <path to UnifiedMozaic checkout>');
	process.exit(1);
}
const root = new URL('..', import.meta.url).pathname;
const en = JSON.parse(await readFile(join(root, 'scripts/examples-en.json'), 'utf8'));
const GH = 'https://github.com/UnifiedMozaic/UnifiedMozaic/blob/main/examples';

const names = (await readdir(join(repo, 'examples')))
	.filter((f) => f.endsWith('.um'))
	.map((f) => f.slice(0, -3))
	.sort();

/** Same as directives() in tests/run.ts. */
const directives = (src, key) =>
	src
		.split('\n')
		.filter((l) => l.startsWith(`// ${key}: `))
		.map((l) => l.slice(key.length + 5).trim());

/** Same as stdinLines() in tests/run.ts. */
const stdinLines = (src) => {
	const out = [];
	for (const l of src.split('\n')) {
		const m = /^\/\/ stdin:(?: (.*))?$/.exec(l.replace(/\r$/, ''));
		if (m) out.push(m[1] ?? '');
	}
	return out;
};

/** The leading comment up to the end of its first sentence. */
const summaryJa = (src) => {
	const parts = [];
	for (const l of src.split('\n')) {
		if (!l.startsWith('//') || /^\/\/\s*(expect|stdin|args|env)\b/.test(l)) break;
		parts.push(l.slice(2).trim());
		if (parts.at(-1).endsWith('。')) break;
	}
	return parts.join('');
};

const yaml = (s) => JSON.stringify(s);
const fence = (lang, body, attrs = '') => '```' + lang + attrs + '\n' + body + '\n```';

const text = {
	en: {
		source: 'Source',
		output: 'Expected output',
		outputNote: 'From the `// expect:` lines. The test runner checks this output on wasm32 and native.',
		stdin: 'Standard input',
		stdinNote: 'From the `// stdin:` lines; the test runner gives these lines as standard input.',
		indexTitle: 'Examples',
		indexDesc: 'Runnable UnifiedMozaic programs from the main repository.',
		indexIntro:
			'These programs come from [`examples/`](https://github.com/UnifiedMozaic/UnifiedMozaic/tree/main/examples) in the main repository, quoted as they are. Every one of them is runnable and doubles as a test: the test runner (`node tests/run.ts`) compares the output with the `// expect:` lines.',
		indexComments: 'Comments in the code are in Japanese, as in the original files.',
		program: 'Program',
		about: 'About',
	},
	ja: {
		source: 'ソース',
		output: '期待する出力',
		outputNote: '`// expect:` の行から。テストランナーが wasm32 とネイティブでこの出力を照合します。',
		stdin: '標準入力',
		stdinNote: '`// stdin:` の行から。テストランナーはこの行を標準入力として与えます。',
		indexTitle: 'サンプル',
		indexDesc: '本体リポジトリにある、動く UnifiedMozaic のプログラム。',
		indexIntro:
			'本体リポジトリの [`examples/`](https://github.com/UnifiedMozaic/UnifiedMozaic/tree/main/examples) のプログラムを、そのまま載せています。どれも動き、テストを兼ねています。テストランナー（`node tests/run.ts`）が、出力を `// expect:` の行と照合します。',
		indexComments: '',
		program: 'プログラム',
		about: '内容',
	},
};

for (const lang of ['en', 'ja']) {
	const t = text[lang];
	const dir = join(root, 'src/content/docs', lang === 'en' ? '' : 'ja', 'examples');
	await rm(dir, { recursive: true, force: true });
	await mkdir(dir, { recursive: true });
	const rows = [];
	for (const name of names) {
		const src = (await readFile(join(repo, 'examples', `${name}.um`), 'utf8')).replace(/\n+$/, '');
		const summary = lang === 'en' ? en[name] : summaryJa(src);
		if (!summary) throw new Error(`no ${lang} summary for ${name}`);
		const expect = directives(src, 'expect');
		const stdin = stdinLines(src);
		const href = lang === 'en' ? `/examples/${name.replaceAll('_', '-')}/` : `/ja/examples/${name.replaceAll('_', '-')}/`;
		rows.push(`| [${name}.um](${href}) | ${summary.replaceAll('|', '\\|')} |`);
		const out = [
			'---',
			`title: ${yaml(`${name}.um`)}`,
			`description: ${yaml(summary)}`,
			'---',
			'',
			summary,
			'',
			`${t.source}: [examples/${name}.um](${GH}/${name}.um)`,
			'',
			fence('um', src, ` title="${name}.um"`),
		];
		if (stdin.length) out.push('', `## ${t.stdin}`, '', t.stdinNote, '', fence('text', stdin.join('\n')));
		if (expect.length) out.push('', `## ${t.output}`, '', t.outputNote, '', fence('text', expect.join('\n')));
		await writeFile(join(dir, `${name.replaceAll('_', '-')}.md`), out.join('\n') + '\n');
	}
	const index = [
		'---',
		`title: ${yaml(t.indexTitle)}`,
		`description: ${yaml(t.indexDesc)}`,
		'sidebar:',
		'  order: 0',
		'---',
		'',
		t.indexIntro,
		...(t.indexComments ? ['', t.indexComments] : []),
		'',
		`| ${t.program} | ${t.about} |`,
		'| --- | --- |',
		...rows,
	];
	await writeFile(join(dir, 'index.md'), index.join('\n') + '\n');
}
console.log(`generated ${names.length} examples`);
