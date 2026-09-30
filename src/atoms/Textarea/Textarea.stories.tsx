import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '../Label';
import { Textarea } from './Textarea';

const meta = {
    title: 'Atoms/Textarea',
    component: Textarea,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The standard usage: a Label wired to the field by `htmlFor` and `id`. */
export const WithLabel: Story = {
    render: () => (
        <div className="flex w-80 flex-col gap-1.5">
            <Label htmlFor="notiz">Notiz</Label>
            <Textarea id="notiz" placeholder="Was sollen die Teilnehmenden wissen?" />
        </div>
    ),
};

/** Disabled and `aria-invalid` (error) styling, to see how a blocked or failed field looks. */
export const States: Story = {
    render: () => (
        <div className="flex w-80 flex-col gap-3">
            <Textarea aria-label="Deaktiviert" disabled defaultValue="Gesperrt" />
            <Textarea aria-label="Ungültig" aria-invalid defaultValue="Zu kurz" />
        </div>
    ),
};
