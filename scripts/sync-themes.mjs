#!/usr/bin/env node
/**
 * Copies the Burgwiss theme presets into Storybook.
 *
 * Burgwiss generates each preset's REAL resolved CSS with its ThemeResolver
 * (`php artisan marketing:generate-preset-css`) and commits it as
 * `resources/js/Components/Theme/presetPreviewCss.generated.ts`. Copying that
 * file — instead of hand-writing preset colours here — means this Storybook
 * shows exactly what a school gets, including the contrast nudges the resolver
 * makes.
 *
 * The copy is committed, so the Storybook builds without a Burgwiss checkout.
 * Run again after a preset changes:
 *
 *   npm run themes:sync                         (expects ../burgwiss)
 *   BURGWISS_DIR=/path/to/burgwiss npm run themes:sync
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const burgwiss = resolve(process.env.BURGWISS_DIR ?? resolve(here, '../../burgwiss'));
const source = resolve(burgwiss, 'resources/js/Components/Theme/presetPreviewCss.generated.ts');
const target = resolve(here, '../.storybook/themes/presets.generated.ts');

let text;
try {
    text = readFileSync(source, 'utf8');
} catch {
    console.error(`Cannot read ${source}\nSet BURGWISS_DIR to a Burgwiss checkout.`);
    process.exit(1);
}
if (!text.includes('GENERATED_PRESET_PREVIEWS')) {
    console.error(`${source} does not look like the preset file (no GENERATED_PRESET_PREVIEWS).`);
    process.exit(1);
}
const header = `// COPIED from burgwiss:${'resources/js/Components/Theme/presetPreviewCss.generated.ts'}\n// by scripts/sync-themes.mjs — do not edit; run \`npm run themes:sync\`.\n\n`;
writeFileSync(target, header + text);
console.log(`Wrote ${target}`);
