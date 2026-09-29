import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

/**
 * The package's reason to exist is that its components know nothing about the
 * app they run in. That rule lives in eslint.config.js; these tests prove it
 * actually fires (a guard that cannot go red is not a guard) and that it does
 * not fire on stories, which may use example copy freely.
 */
const eslint = new ESLint();

async function errorsFor(code: string, filePath: string) {
    const [result] = await eslint.lintText(code, { filePath });
    return (result?.messages ?? []).filter((m) => m.severity === 2).map((m) => m.ruleId);
}

const component = 'src/molecules/Example/Example.tsx';

describe('package guards', () => {
    it.each([
        ["import { Link } from '@inertiajs/react';"],
        ["import { route } from 'ziggy-js';"],
        ["import { useNavigate } from 'react-router-dom';"],
        ["import { thing } from '@/lib/thing';"],
        ["import axios from 'axios';"],
        ["import { useTranslation } from '../../hooks/useTranslation';"],
        ["import { useTranslation } from 'react-i18next';"],
    ])('refuses an app dependency in a component: %s', async (line) => {
        const errors = await errorsFor(`${line}\nexport const x = 1;\n`, component);
        expect(errors).toContain('no-restricted-imports');
    });

    it('refuses copy written into a component', async () => {
        const errors = await errorsFor(
            'export const X = () => <p>Kurs wurde gespeichert</p>;\n',
            component,
        );
        expect(errors).toContain('local/no-untranslated-jsx-text');
    });

    it('refuses a raw Tailwind colour', async () => {
        const errors = await errorsFor(
            'export const X = () => <p className="bg-blue-500" />;\n',
            component,
        );
        expect(errors).toContain('local/no-raw-tailwind-colors');
    });

    it('lets stories use example copy', async () => {
        const errors = await errorsFor(
            'export const X = () => <p>Kurs wurde gespeichert</p>;\n',
            'src/molecules/Example/Example.stories.tsx',
        );
        expect(errors).not.toContain('local/no-untranslated-jsx-text');
    });

    it('accepts a clean component', async () => {
        const errors = await errorsFor(
            "import { cn } from '../../lib/cn';\nexport const X = ({ label }: { label: string }) => <p className={cn('bg-primary')}>{label}</p>;\n",
            component,
        );
        expect(errors).toEqual([]);
    });
});
