import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { PageEditor, type PageEditorDevice, type PageEditorProps } from './PageEditor';

const LABELS: PageEditorProps['labels'] = {
    preview: 'Kursseite (Vorschau zum Bearbeiten)',
    tools: 'Vorschau',
    desktop: 'Computer',
    phone: 'Handy',
    aside: 'Seitenstatus',
    resizeAside: 'Seitenleiste verbreitern oder verschmälern',
};

function Harness(props: Partial<PageEditorProps>) {
    const [device, setDevice] = useState<PageEditorDevice>('desktop');
    return (
        <PageEditor
            toolbar={<button type="button">Veröffentlichen</button>}
            aside={<p>Checkliste</p>}
            device={device}
            onDeviceChange={setDevice}
            labels={LABELS}
            {...props}
        >
            <h1>Arabisch für Anfänger</h1>
        </PageEditor>
    );
}

const frame = () => screen.getByRole('region', { name: LABELS.preview });

describe('PageEditor', () => {
    it('puts the toolbar on top, the page in a named preview, the aside on the right', () => {
        render(<Harness />);
        expect(screen.getByRole('button', { name: 'Veröffentlichen' })).toBeInTheDocument();
        expect(within(frame()).getByRole('heading')).toHaveTextContent('Arabisch');
        expect(screen.getByRole('complementary', { name: 'Seitenstatus' })).toHaveTextContent(
            'Checkliste',
        );
    });

    it('floats a preview toolbar that switches between computer and phone width', async () => {
        const user = userEvent.setup();
        render(<Harness />);
        const tools = screen.getByRole('toolbar', { name: 'Vorschau' });
        const desktop = within(tools).getByRole('button', { name: 'Computer' });
        const phone = within(tools).getByRole('button', { name: 'Handy' });
        expect(desktop).toHaveAttribute('aria-pressed', 'true');
        expect(frame()).toHaveAttribute('data-device', 'desktop');
        await user.click(phone);
        expect(phone).toHaveAttribute('aria-pressed', 'true');
        expect(desktop).toHaveAttribute('aria-pressed', 'false');
        expect(frame()).toHaveAttribute('data-device', 'phone');
    });

    it('adds the page’s own tools to the floating toolbar', () => {
        render(<Harness previewTools={<button type="button">Rückgängig</button>} />);
        expect(
            within(screen.getByRole('toolbar', { name: 'Vorschau' })).getByRole('button', {
                name: 'Rückgängig',
            }),
        ).toBeInTheDocument();
    });

    it('works without an aside', () => {
        render(<Harness aside={undefined} />);
        expect(screen.queryByRole('complementary')).toBeNull();
    });

    it('passes axe', async () => {
        const { container } = render(<Harness />);
        expect(await axe(container)).toHaveNoViolations();
    });
});
