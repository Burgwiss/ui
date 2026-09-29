import type { Decorator, Preview } from '@storybook/react-vite';
import { useEffect, type ReactNode } from 'react';

import './storybook.css';

/**
 * Two toolbars re-skin every story:
 *  - Mode: light / dark (the `.dark` class, as the apps set it).
 *  - Brand: a few primary colours, to prove components only ever read tokens —
 *    an app themes the library by overriding CSS variables, nothing else.
 */
const BRANDS: Record<string, Record<string, string>> = {
    neutral: {},
    teal: {
        '--primary': 'oklch(0.52 0.09 220)',
        '--primary-foreground': 'oklch(0.985 0 0)',
        '--ring': 'oklch(0.52 0.09 220)',
    },
    violet: {
        '--primary': 'oklch(0.49 0.2 290)',
        '--primary-foreground': 'oklch(0.985 0 0)',
        '--ring': 'oklch(0.49 0.2 290)',
    },
};

function ThemeFrame({
    mode,
    brand,
    children,
}: {
    mode: string;
    brand: string;
    children: ReactNode;
}) {
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle('dark', mode === 'dark');
        const keys = new Set(Object.values(BRANDS).flatMap((b) => Object.keys(b)));
        keys.forEach((k) => root.style.removeProperty(k));
        Object.entries(BRANDS[brand] ?? {}).forEach(([k, v]) => root.style.setProperty(k, v));
    }, [mode, brand]);
    return <>{children}</>;
}

const withTheme: Decorator = (Story, context) => (
    <ThemeFrame mode={context.globals.mode as string} brand={context.globals.brand as string}>
        <Story />
    </ThemeFrame>
);

const preview: Preview = {
    decorators: [withTheme],
    globalTypes: {
        mode: {
            description: 'Colour mode',
            toolbar: {
                title: 'Mode',
                icon: 'mirror',
                items: ['light', 'dark'],
                dynamicTitle: true,
            },
        },
        brand: {
            description: 'Brand colour (token override)',
            toolbar: {
                title: 'Brand',
                icon: 'paintbrush',
                items: Object.keys(BRANDS),
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: { mode: 'light', brand: 'neutral' },
    parameters: {
        layout: 'centered',
        controls: { expanded: true },
        a11y: { test: 'error' },
        options: {
            storySort: {
                order: ['Einführung', 'Tokens', 'Atoms', 'Molecules', 'Organisms', 'Templates'],
            },
        },
    },
};

export default preview;
