import tailwindcss from '@tailwindcss/vite';
import type { StorybookConfig } from '@storybook/react-vite';

/**
 * Stories live next to their component (`src/<level>/<Name>/<Name>.stories.tsx`)
 * so the catalogue cannot drift from the code. Docs pages (MDX) live in
 * `src/docs/`. The sidebar is ordered by atomic level — see preview.tsx.
 */
const config: StorybookConfig = {
    stories: ['../src/docs/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    // Sample media for the page prototypes (a generated test-pattern video).
    staticDirs: ['./public'],
    addons: [
        '@storybook/addon-a11y',
        '@storybook/addon-docs',
        // MCP server at <storybook>/mcp for coding agents — see AGENTS.md.
        '@storybook/addon-mcp',
        // Stories as real-browser tests; powers the MCP `test-run` tool.
        '@storybook/addon-vitest',
        // linkTo() between stories — Pages prototypes link to each other.
        '@storybook/addon-links',
        // Sidebar badges from tags (`prototype`, `new`, `deprecated`) — see manager.ts.
        'storybook-addon-tag-badges',
    ],
    framework: { name: '@storybook/react-vite', options: {} },
    // Accurate props (types, defaults, JSDoc) for autodocs and the AI manifest.
    // Measured 2026-09-30: react-docgen-typescript puts 269 props in the
    // manifest, the default react-docgen 231 — it drops all props of Command,
    // AttachmentDropzone, Chip, Select, … The price: the manifest's `summary`
    // field stays empty (`@summary` lands in reactDocgenTypescript.tags), so
    // agents see the description's first sentence. Write that sentence first.
    typescript: { reactDocgen: 'react-docgen-typescript' },
    features: {
        // /manifests/components.json + docs.json — what coding agents read,
        // via the MCP server (dev) or straight from the static build.
        componentsManifest: true,
    },
    async viteFinal(viteConfig) {
        viteConfig.plugins = [...(viteConfig.plugins ?? []), tailwindcss()];
        return viteConfig;
    },
};

export default config;
