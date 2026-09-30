import type { Meta, StoryObj } from '@storybook/react-vite';

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from './Table';

const meta = {
    title: 'Organisms/Table',
    component: Table,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// Proven render copied from design-system/registry.tsx (entry id: 'table').
/** Minimal table: a header row and a body row, the structure every other table builds on. */
export const Default: Story = {
    render: () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>Lena Schmidt</TableCell>
                    <TableCell>Maths</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    ),
};

/** Give the table a visible description with `TableCaption` (rendered below the table). */
export const WithCaption: Story = {
    name: 'With caption',
    render: () => (
        <Table>
            <TableCaption>A list of teachers and their subjects.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Classes</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>Lena Schmidt</TableCell>
                    <TableCell>Maths</TableCell>
                    <TableCell>3</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Tomas Becker</TableCell>
                    <TableCell>History</TableCell>
                    <TableCell>2</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Amira Hassan</TableCell>
                    <TableCell>Biology</TableCell>
                    <TableCell>4</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    ),
};

/** Totals or summaries: `TableFooter` adds a muted, bold row, with numeric columns right-aligned. */
export const WithFooter: Story = {
    name: 'With footer',
    render: () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Enrolled</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>Maths 7a</TableCell>
                    <TableCell className="text-right">24</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>History 8b</TableCell>
                    <TableCell className="text-right">19</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Biology 9c</TableCell>
                    <TableCell className="text-right">27</TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right">70</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    ),
};

/** Highlight a chosen row: put `data-state="selected"` on its `TableRow`. */
export const SelectedRow: Story = {
    name: 'Selected row',
    render: () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell>Lena Schmidt</TableCell>
                    <TableCell>Maths</TableCell>
                </TableRow>
                <TableRow data-state="selected">
                    <TableCell>Tomas Becker</TableCell>
                    <TableCell>History</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>Amira Hassan</TableCell>
                    <TableCell>Biology</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    ),
};
