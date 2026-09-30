import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import type { ComponentType } from 'react';
import { describe, expect, it } from 'vitest';

import * as preview from '../.storybook/preview';

/**
 * Every story is a test. Each one must render without throwing and pass axe —
 * so writing a story for a new component also writes its smoke + a11y test.
 * Behaviour tests still live next to the component (<Name>.test.tsx).
 */
setProjectAnnotations(preview);

const modules = import.meta.glob<Record<string, unknown>>('../src/**/*.stories.tsx', {
    eager: true,
});

for (const [path, mod] of Object.entries(modules)) {
    const stories = composeStories(mod as Parameters<typeof composeStories>[0]);
    describe(path.replace('../src/', ''), () => {
        for (const [name, composed] of Object.entries(stories)) {
            const Story = composed as ComponentType;
            it(`${name} renders and passes axe`, async () => {
                const { container } = render(<Story />);
                expect(container.firstChild).not.toBeNull();
                // preload: false — axe otherwise waits for <video>/<audio> to
                // load, which never happens in jsdom, and the test hangs.
                expect(await axe(container, { preload: false })).toHaveNoViolations();
            });
        }
    });
}
