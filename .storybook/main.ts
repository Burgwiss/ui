import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Stories live next to their component (`src/<level>/<Name>/<Name>.stories.tsx`)
 * so the catalogue cannot drift from the code. Docs pages (MDX) live in
 * `src/docs/`. The sidebar is ordered by atomic level — see preview.tsx.
 */
const config: StorybookConfig = {
    stories: ['../src/docs/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
    framework: { name: '@storybook/react-vite', options: {} },
    async viteFinal(viteConfig) {
        viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
        return viteConfig;
    },
};

export default config;
