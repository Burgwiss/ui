import type { Meta, StoryObj } from '@storybook/react-vite';

import { useStoryText } from '../../../.storybook/locale';
import { InitialsAvatar } from './InitialsAvatar';

const meta = {
    title: 'Atoms/InitialsAvatar',
    component: InitialsAvatar,
    tags: ['autodocs'],
    args: { name: 'Amira Haddad' },
    parameters: { layout: 'centered' },
} satisfies Meta<typeof InitialsAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Try any name; two-word names give first and last initial. */
export const Playground: Story = {};

/** The intended use: `colored` discs beside visible names, so people are told apart at a glance. */
export const InList: Story = {
    render: () => (
        <ul className="flex flex-col gap-2">
            {['Amira Haddad', 'Jonas Schneider', 'Lena Brandt', 'Cher'].map((name) => (
                <li key={name} className="flex items-center gap-3 text-sm">
                    <InitialsAvatar name={name} colored />
                    <span>{name}</span>
                </li>
            ))}
        </ul>
    ),
};

/** Pick `sm` for dense rows, `md` (default) for standard rows, `lg` for headers, `xl` for large placeholder areas. */
export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <InitialsAvatar name="Amira Haddad" size="sm" />
            <InitialsAvatar name="Amira Haddad" size="md" />
            <InitialsAvatar name="Amira Haddad" size="lg" />
            <InitialsAvatar name="Amira Haddad" size="xl" />
        </div>
    ),
};

/** A video tile without camera: `xl` and `colored` keep the person visible on a muted area; the caption carries the name. */
export const GrossFuerVideokachel: Story = {
    name: 'Groß für Videokachel',
    render: function Render() {
        const t = useStoryText();
        return (
            <figure className="flex w-80 flex-col overflow-hidden rounded-lg bg-muted text-foreground">
                <div className="flex aspect-video items-center justify-center">
                    <InitialsAvatar name="Amira Haddad" size="xl" colored />
                </div>
                <figcaption className="truncate p-2 text-sm">
                    {t({ de: 'Amira Haddad (du)', en: 'Amira Haddad (you)', ar: 'Amira Haddad (أنت)', tr: 'Amira Haddad (sen)' })}
                </figcaption>
            </figure>
        );
    },
};
