// Copies the TextMate grammar from UnifiedMozaic/vscode-extension.
// Usage: npm run sync:grammar [-- <path to a local vscode-extension checkout>]
import { readFile, writeFile } from 'node:fs/promises';

const dest = new URL('../src/grammars/unifiedmozaic.tmLanguage.json', import.meta.url);
const local = process.argv[2];
const url =
	'https://raw.githubusercontent.com/UnifiedMozaic/vscode-extension/main/syntaxes/unifiedmozaic.tmLanguage.json';

const text = local
	? await readFile(`${local}/syntaxes/unifiedmozaic.tmLanguage.json`, 'utf8')
	: await (await fetch(url)).text();

JSON.parse(text); // fail before writing if it is not valid JSON
await writeFile(dest, text);
console.log(`updated ${dest.pathname} from ${local ?? url}`);
