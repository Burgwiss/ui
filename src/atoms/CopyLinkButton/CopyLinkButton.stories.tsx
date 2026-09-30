import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyLinkButton } from './CopyLinkButton';

const meta = {
    title: 'Atoms/CopyLinkButton',
    component: CopyLinkButton,
    tags: ['autodocs'],
    args: {
        url: 'https://example.org/beitreten/abc123',
        label: 'Einladungslink kopieren',
        copiedLabel: 'Link kopiert',
    },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof CopyLinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default compact form, for a dense row where the tooltip explains the icon. */
export const IconOnly: Story = {};

/** Shows the label as visible text when the icon alone would be unclear. */
export const WithText: Story = {
    args: { size: 'sm' },
};

/** Adds a screen-reader-only extra sentence, e.g. that the link still needs sign-in. */
export const WithHiddenHint: Story = {
    args: { hint: 'Der Link erfordert weiterhin eine Anmeldung.' },
};
