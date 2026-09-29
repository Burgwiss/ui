import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
// @ts-expect-error - JS module without types
import rule from '../../tools/eslint-rules/no-tint-on-tint-foreground.js';

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

tester.run('no-tint-on-tint-foreground', rule as never, {
    valid: [
        // The fix: dedicated on-tint token.
        { code: 'const x = <div className="bg-success/10 text-success-tint-foreground" />;' },
        // Solid token on a SOLID fill (no opacity) is the intended use.
        { code: 'const x = <div className="bg-success text-success-foreground" />;' },
        // Tint + a DIFFERENT tone is fine.
        { code: 'const x = <div className="bg-success/10 text-foreground" />;' },
        { code: 'const x = <div className="bg-card text-destructive" />;' },
        // Border tint is not text — no contrast concern.
        {
            code: 'const x = <div className="border-success/30 bg-card text-success-tint-foreground" />;',
        },
        // Not in a className.
        { code: 'const s = "bg-success/10 text-success"; /* not className */' },
        // primary/accent are per-school themed — out of this rule’s scope.
        { code: 'const x = <div className="bg-primary/10 text-primary" />;' },
    ],
    invalid: [
        {
            code: 'const x = <div className="border-success/30 bg-success/10 text-success" />;',
            errors: [{ messageId: 'tintOnTint' }],
        },
        {
            code: 'const x = <div className="bg-destructive/10 text-destructive" />;',
            errors: [{ messageId: 'tintOnTint' }],
        },
        {
            // variant prefixes + opacity modifier still match.
            code: 'const x = <div className="dark:bg-warning/20 hover:text-warning/90" />;',
            errors: [{ messageId: 'tintOnTint' }],
        },
        {
            // single-string cn() argument.
            code: 'import { cn } from "x"; const x = <div className={cn("bg-success/10 text-success")} />;',
            errors: [{ messageId: 'tintOnTint' }],
        },
    ],
});
