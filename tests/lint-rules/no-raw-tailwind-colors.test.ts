import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
// @ts-expect-error - JS module without types
import rule from '../../tools/eslint-rules/no-raw-tailwind-colors.js';

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

tester.run('no-raw-tailwind-colors', rule as never, {
    valid: [
        { code: 'const x = <div className="bg-primary text-accent" />;' },
        { code: 'const x = <div className="bg-card border-card text-foreground" />;' },
        { code: 'const s = "bg-red-500"; /* not in className */' },
    ],
    invalid: [
        {
            code: 'const x = <div className="bg-red-500" />;',
            errors: [{ messageId: 'rawColor' }],
        },
        {
            code: 'const x = <div className="hover:text-gray-700" />;',
            errors: [{ messageId: 'rawColor' }],
        },
        {
            code: 'import { cn } from "x"; const x = <div className={cn("border-slate-300")} />;',
            errors: [{ messageId: 'rawColor' }],
        },
    ],
});
