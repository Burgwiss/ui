import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
// @ts-expect-error - JS module without types
import rule from '../../tools/eslint-rules/no-untranslated-jsx-text.js';

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

tester.run('no-untranslated-jsx-text', rule as never, {
    valid: [
        { code: 'const x = <div>{t("nav.home")}</div>;' },
        { code: 'const x = <code>SELECT * FROM users</code>;' },
        { code: 'const x = <div>x</div>;' },
        { code: 'const x = <div>auth.login.title</div>;' },
    ],
    invalid: [
        {
            code: 'const x = <h1>Welcome to the dashboard</h1>;',
            errors: [{ messageId: 'untranslated' }],
        },
        {
            code: 'const x = <p>Please choose a course.</p>;',
            errors: [{ messageId: 'untranslated' }],
        },
    ],
});
