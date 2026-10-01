import { RuleTester } from 'eslint';
import { describe, it } from 'vitest';
// @ts-expect-error - JS module without types
import rule from '../../tools/eslint-rules/no-physical-direction.js';

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

const err = [{ messageId: 'physical' }];

tester.run('no-physical-direction', rule as never, {
    valid: [
        {
            code: 'const x = <div className="ms-2 pe-4 start-0 text-start border-e rounded-es-md" />;',
        },
        { code: "const x = cn('slide-in-from-start data-[state=open]:ps-8', 'end-3');" },
        // Centring is symmetric.
        { code: 'const x = <div className="absolute left-1/2 -translate-x-1/2" />;' },
        // An explicit direction variant is a deliberate choice.
        { code: 'const x = <div className="rtl:left-0 ltr:mr-2" />;' },
        // Words, not classes.
        { code: "const x = 'right-click to open';" },
        { code: "const side = 'left';" },
        { code: 'const x = <div className="mx-2 px-4 inset-x-0 border-x" />;' },
    ],
    invalid: [
        { code: 'const x = <div className="ml-2" />;', errors: err },
        { code: 'const x = <div className="hover:pr-4" />;', errors: err },
        { code: 'const x = <div className="absolute right-0" />;', errors: err },
        { code: 'const x = <div className="-left-1" />;', errors: err },
        { code: 'const x = <div className="text-left" />;', errors: err },
        { code: 'const x = <div className="border-r" />;', errors: err },
        { code: 'const x = <div className="border-l-2" />;', errors: err },
        { code: 'const x = <div className="rounded-bl-md" />;', errors: err },
        { code: 'const x = <div className="rounded-r-lg" />;', errors: err },
        { code: "const x = cn('data-[state=open]:slide-in-from-left');", errors: err },
        { code: "const x = '[&:has([role=checkbox])]:pr-0';", errors: err },
        { code: 'const x = `top-2 ${a} right-2`;', errors: err },
        {
            code: 'const x = <div className="ml-auto pl-4" />;',
            errors: [{ messageId: 'physical' }, { messageId: 'physical' }],
        },
    ],
});
