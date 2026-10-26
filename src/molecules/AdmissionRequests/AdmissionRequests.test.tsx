import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
    AdmissionRequests,
    type AdmissionRequest,
    type AdmissionRequestsLabels,
} from './AdmissionRequests';

const labels: AdmissionRequestsLabels = {
    title: 'Gäste klopfen an',
    admit: (name) => `${name} zulassen`,
    deny: (name) => `${name} ablehnen`,
    hint: 'Häkchen: zulassen. Kreuz: ablehnen.',
    more: (n) => `und ${n} weitere`,
    showAll: 'Alle anzeigen',
};

const people: AdmissionRequest[] = [
    { id: 'a', name: 'Amira Haddad', detail: 'wartet seit 2 Min.' },
    { id: 'b', name: 'Bilal Karim' },
    { id: 'c', name: 'Chadia Omar' },
    { id: 'd', name: 'Dawud Saleh' },
    { id: 'e', name: 'Esma Yilmaz' },
];

const setup = (props: Partial<Parameters<typeof AdmissionRequests>[0]> = {}) => {
    const onAdmit = vi.fn();
    const onDeny = vi.fn();
    render(
        <AdmissionRequests
            requests={people.slice(0, 2)}
            onAdmit={onAdmit}
            onDeny={onDeny}
            labels={labels}
            {...props}
        />,
    );
    return { onAdmit, onDeny };
};

describe('AdmissionRequests', () => {
    it('renders nothing when nobody waits', () => {
        const { container } = render(
            <AdmissionRequests
                requests={[]}
                onAdmit={() => {}}
                onDeny={() => {}}
                labels={labels}
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('labels the section with its heading', () => {
        setup();
        const section = screen.getByRole('region', { name: 'Gäste klopfen an' });
        expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(
            'Gäste klopfen an',
        );
    });

    it('shows each name, the optional detail and the hint', () => {
        setup();
        expect(screen.getByText('Amira Haddad')).toBeInTheDocument();
        expect(screen.getByText('wartet seit 2 Min.')).toBeInTheDocument();
        expect(screen.getByText('Bilal Karim')).toBeInTheDocument();
        expect(screen.getByText('Häkchen: zulassen. Kreuz: ablehnen.')).toBeInTheDocument();
    });

    it('omits the hint when none is given', () => {
        setup({ labels: { ...labels, hint: undefined } });
        expect(screen.queryByText('Häkchen: zulassen. Kreuz: ablehnen.')).toBeNull();
    });

    it('gives every person an admit and a deny button named after them', () => {
        setup();
        expect(screen.getByRole('button', { name: 'Amira Haddad zulassen' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Amira Haddad ablehnen' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Bilal Karim zulassen' })).toBeInTheDocument();
    });

    it('calls onAdmit with the id of that person only', async () => {
        const { onAdmit, onDeny } = setup();
        await userEvent.click(screen.getByRole('button', { name: 'Bilal Karim zulassen' }));
        expect(onAdmit).toHaveBeenCalledTimes(1);
        expect(onAdmit).toHaveBeenCalledWith('b');
        expect(onDeny).not.toHaveBeenCalled();
    });

    it('calls onDeny with the id of that person only', async () => {
        const { onAdmit, onDeny } = setup();
        await userEvent.click(screen.getByRole('button', { name: 'Amira Haddad ablehnen' }));
        expect(onDeny).toHaveBeenCalledTimes(1);
        expect(onDeny).toHaveBeenCalledWith('a');
        expect(onAdmit).not.toHaveBeenCalled();
    });

    it('announces arrivals politely', () => {
        setup();
        expect(screen.getByRole('list')).toHaveAttribute('aria-live', 'polite');
    });

    describe('max', () => {
        it('shows three people by default and counts the rest', () => {
            setup({ requests: people });
            expect(screen.getAllByRole('listitem')).toHaveLength(3);
            expect(screen.queryByText('Dawud Saleh')).toBeNull();
            expect(screen.getByText('und 2 weitere')).toBeInTheDocument();
        });

        it('honours a custom max', () => {
            setup({ requests: people, max: 4 });
            expect(screen.getAllByRole('listitem')).toHaveLength(4);
            expect(screen.getByText('und 1 weitere')).toBeInTheDocument();
        });

        it('shows the oldest first, in the order given', () => {
            setup({ requests: people, max: 2 });
            const names = screen.getAllByRole('listitem').map((li) => li.textContent);
            expect(names[0]).toContain('Amira Haddad');
            expect(names[1]).toContain('Bilal Karim');
        });

        it('shows no "more" line when everyone fits', () => {
            setup({ requests: people.slice(0, 3) });
            expect(screen.queryByText(/weitere/)).toBeNull();
        });

        it('shows no "more" line when labels.more is missing', () => {
            setup({ requests: people, labels: { ...labels, more: undefined } });
            expect(screen.queryByText(/weitere/)).toBeNull();
        });
    });

    describe('onShowAll', () => {
        it('has no show-all button without the handler', () => {
            setup({ requests: people });
            expect(screen.queryByRole('button', { name: 'Alle anzeigen' })).toBeNull();
        });

        it('has no show-all button without the label', () => {
            setup({
                requests: people,
                onShowAll: () => {},
                labels: { ...labels, showAll: undefined },
            });
            expect(screen.queryByRole('button', { name: 'Alle anzeigen' })).toBeNull();
        });

        it('calls the handler when the button is used', async () => {
            const onShowAll = vi.fn();
            setup({ requests: people, onShowAll });
            await userEvent.click(screen.getByRole('button', { name: 'Alle anzeigen' }));
            expect(onShowAll).toHaveBeenCalledTimes(1);
        });

        it('is offered even when everyone already fits', () => {
            setup({ onShowAll: () => {} });
            expect(screen.getByRole('button', { name: 'Alle anzeigen' })).toBeInTheDocument();
        });
    });

    describe('busy', () => {
        // Icon-only buttons keep focus when disabled (they carry a tooltip), so they are
        // aria-disabled rather than natively disabled.
        const aria = (name: string) => screen.getByRole('button', { name });
        const expectBlocked = (el: HTMLElement) =>
            expect(el).toHaveAttribute('aria-disabled', 'true');
        const expectActive = (el: HTMLElement) =>
            expect(el).not.toHaveAttribute('aria-disabled', 'true');

        it('disables both buttons of the busy person only', () => {
            setup({
                requests: [
                    { id: 'a', name: 'Amira Haddad', busy: true },
                    { id: 'b', name: 'Bilal Karim' },
                ],
            });
            expectBlocked(aria('Amira Haddad zulassen'));
            expectBlocked(aria('Amira Haddad ablehnen'));
            expectActive(aria('Bilal Karim zulassen'));
            expectActive(aria('Bilal Karim ablehnen'));
        });

        it('does not decide for a busy person', async () => {
            const { onAdmit, onDeny } = setup({
                requests: [{ id: 'a', name: 'Amira Haddad', busy: true }],
            });
            await userEvent.click(aria('Amira Haddad zulassen'));
            await userEvent.click(aria('Amira Haddad ablehnen'));
            expect(onAdmit).not.toHaveBeenCalled();
            expect(onDeny).not.toHaveBeenCalled();
        });
    });
});
