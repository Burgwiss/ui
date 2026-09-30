import type { Meta, StoryObj } from '@storybook/react-vite';

import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from './Breadcrumb';

const meta = {
    title: 'Molecules/Breadcrumb',
    component: Breadcrumb,
    tags: ['autodocs'],
    parameters: { layout: 'centered' },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The standard trail: ancestor links, separators, and the current page last. */
export const Default: Story = {
    render: () => (
        <Breadcrumb aria-label="Brotkrumen">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#kurse">Kurse</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbLink href="#arabisch">Arabisch A1</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Lektionen</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};

/** Use `BreadcrumbEllipsis` (with `srLabel`) to collapse middle levels of a deep trail. */
export const Collapsed: Story = {
    render: () => (
        <Breadcrumb aria-label="Brotkrumen">
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="#start">Start</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbEllipsis srLabel="Weitere Ebenen" />
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                    <BreadcrumbPage>Einstellungen</BreadcrumbPage>
                </BreadcrumbItem>
            </BreadcrumbList>
        </Breadcrumb>
    ),
};
