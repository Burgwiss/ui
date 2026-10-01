import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
// @ts-expect-error - JS module without types
import rule from '../../tools/eslint-rules/no-title-on-controls.js';

RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const tester = new RuleTester({
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parserOptions: { ecmaFeatures: { jsx: true } },
    },
});

tester.run('no-title-on-controls', rule as never, {
    valid: [
        { code: 'const x = <Button tooltip={reason} disabled>Löschen</Button>;' },
        // An iframe's title is its accessible name — required, not a tooltip.
        { code: 'const x = <iframe title="Vorschau" src={src} />;' },
        // A component prop called `title` is a heading, not the native attribute.
        { code: 'const x = <NameDialog title={labels.saveTitle} />;' },
        { code: 'const x = <span title="Kurzform">Kfz</span>;' },
        { code: 'const x = <div role="region" title="x" />;' },
    ],
    invalid: [
        {
            code: 'const x = <button title={reason} disabled>Löschen</button>;',
            errors: [{ messageId: 'nativeTitle' }],
        },
        {
            code: 'const x = <Button title={reason}>Löschen</Button>;',
            errors: [{ messageId: 'nativeTitle' }],
        },
        {
            code: 'const x = <a href="/" title="Start">Start</a>;',
            errors: [{ messageId: 'nativeTitle' }],
        },
        {
            code: 'const x = <IconButton label="Mehr" title="Mehr" />;',
            errors: [{ messageId: 'nativeTitle' }],
        },
        {
            code: 'const x = <div role="button" title="Öffnen" />;',
            errors: [{ messageId: 'nativeTitle' }],
        },
        {
            code: 'const x = <div onClick={open} title="Öffnen" />;',
            errors: [{ messageId: 'nativeTitle' }],
        },
    ],
});
