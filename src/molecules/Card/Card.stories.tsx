import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '../../atoms/Button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './Card';

const meta = {
    title: 'Molecules/Card',
    component: Card,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A full card: title, description, header action, body and footer button. */
export const Default: Story = {
    render: (args) => (
        <Card {...args} className="w-80">
            <CardHeader>
                <CardTitle>Arabisch A1</CardTitle>
                <CardDescription>Zwölf Lektionen, ab 4. November.</CardDescription>
                <CardAction>
                    <Button variant="outline" size="sm">
                        Bearbeiten
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>Achtzehn Teilnehmende sind angemeldet.</CardContent>
            <CardFooter>
                <Button size="sm">Teilnehmende ansehen</Button>
            </CardFooter>
        </Card>
    ),
};

/** Use `size="sm"` for tighter padding in dense grids or dashboards. */
export const Compact: Story = {
    render: () => (
        <Card size="sm" className="w-64">
            <CardHeader>
                <CardTitle>Offene Rechnungen</CardTitle>
            </CardHeader>
            <CardContent>3 Rechnungen warten auf Zahlung.</CardContent>
        </Card>
    ),
};
