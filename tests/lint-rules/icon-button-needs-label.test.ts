import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
// @ts-expect-error - JS module without types
import rule from '../../tools/eslint-rules/icon-button-needs-label.js';

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

tester.run('icon-button-needs-label', rule as never, {
    valid: [
        { code: 'const x = <Button size="icon" aria-label="Close"><X /></Button>;' },
        { code: 'const x = <Tooltip><Button size="icon"><X /></Button></Tooltip>;' },
        { code: 'const x = <Button>Save</Button>;' },
        { code: 'const x = <IconButton aria-label="open"><X /></IconButton>;' },
        // <IconButton label="…"> sets aria-label internally — treat as satisfied.
        { code: 'const x = <IconButton label="Delete item" icon={<Trash2 />} />;' },
    ],
    invalid: [
        {
            code: 'const x = <Button size="icon"><X /></Button>;',
            errors: [{ messageId: 'missingLabel' }],
        },
        {
            code: 'const x = <IconButton><X /></IconButton>;',
            errors: [{ messageId: 'missingLabel' }],
        },
    ],
});
