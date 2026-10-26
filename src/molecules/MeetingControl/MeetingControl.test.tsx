import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Mic } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

import { MeetingControl } from './MeetingControl';

const icon = <Mic aria-hidden="true" />;

describe('MeetingControl', () => {
    it('is a button named by its label', () => {
        render(<MeetingControl label="Mikrofon ausschalten" icon={icon} />);
        expect(screen.getByRole('button', { name: 'Mikrofon ausschalten' })).toBeInTheDocument();
    });

    it('calls onClick when clicked', async () => {
        const onClick = vi.fn();
        render(<MeetingControl label="Mikrofon" icon={icon} onClick={onClick} />);
        await userEvent.click(screen.getByRole('button', { name: 'Mikrofon' }));
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    describe('pressed', () => {
        it('has no aria-pressed for a plain action', () => {
            render(<MeetingControl label="Verlassen" icon={icon} />);
            expect(screen.getByRole('button')).not.toHaveAttribute('aria-pressed');
        });

        it('sets aria-pressed true when on', () => {
            render(<MeetingControl label="Mikrofon" icon={icon} pressed />);
            expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
        });

        it('sets aria-pressed false when off (not just absent)', () => {
            render(<MeetingControl label="Mikrofon" icon={icon} pressed={false} />);
            expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
        });
    });

    describe('badge', () => {
        it.each([undefined, 0, -3])('is hidden for %s', (badge) => {
            const { container } = render(<MeetingControl label="Chat" icon={icon} badge={badge} />);
            expect(container.querySelector('[aria-hidden="true"]:not(svg)')).toBeNull();
        });

        it('shows the count', () => {
            render(<MeetingControl label="Chat" icon={icon} badge={7} />);
            expect(screen.getByText('7')).toBeInTheDocument();
        });

        it('shows 99 as is', () => {
            render(<MeetingControl label="Chat" icon={icon} badge={99} />);
            expect(screen.getByText('99')).toBeInTheDocument();
        });

        it('shows 99+ above 99', () => {
            render(<MeetingControl label="Chat" icon={icon} badge={100} />);
            expect(screen.getByText('99+')).toBeInTheDocument();
        });

        it('is decorative: the accessible name stays the label', () => {
            render(<MeetingControl label="Chat, 3 ungelesen" icon={icon} badge={3} />);
            expect(screen.getByText('3')).toHaveAttribute('aria-hidden', 'true');
            expect(screen.getByRole('button', { name: 'Chat, 3 ungelesen' })).toBeInTheDocument();
        });
    });

    describe('disabledReason', () => {
        it('does not call onClick', async () => {
            const onClick = vi.fn();
            render(
                <MeetingControl
                    label="Kamera"
                    icon={icon}
                    onClick={onClick}
                    disabledReason="Kamerazugriff blockiert"
                />,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Kamera' }));
            expect(onClick).not.toHaveBeenCalled();
        });

        it('is announced as disabled', () => {
            render(
                <MeetingControl
                    label="Kamera"
                    icon={icon}
                    disabledReason="Kamerazugriff blockiert"
                />,
            );
            expect(screen.getByRole('button', { name: 'Kamera' })).toHaveAttribute(
                'aria-disabled',
                'true',
            );
        });

        it('stays focusable so the reason can be read', async () => {
            const user = userEvent.setup();
            render(
                <MeetingControl
                    label="Kamera"
                    icon={icon}
                    disabledReason="Kamerazugriff blockiert"
                />,
            );
            await user.tab();
            const button = screen.getByRole('button', { name: 'Kamera' });
            expect(button).toHaveFocus();
            expect(button).not.toBeDisabled();
            expect(await screen.findByRole('tooltip')).toHaveTextContent('Kamerazugriff blockiert');
        });

        it('does not activate with the keyboard either', async () => {
            const onClick = vi.fn();
            const user = userEvent.setup();
            render(
                <MeetingControl
                    label="Kamera"
                    icon={icon}
                    onClick={onClick}
                    disabledReason="Kamerazugriff blockiert"
                />,
            );
            await user.tab();
            await user.keyboard('{Enter} ');
            expect(onClick).not.toHaveBeenCalled();
        });
    });

    it('is disabled with `disabled` and no reason', async () => {
        const onClick = vi.fn();
        render(<MeetingControl label="Kamera" icon={icon} onClick={onClick} disabled />);
        const button = screen.getByRole('button', { name: 'Kamera' });
        expect(button).toHaveAttribute('aria-disabled', 'true');
        await userEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    describe('options', () => {
        const options = (extra = {}) => ({
            label: 'Mikrofonoptionen',
            content: <p>Mikrofon wählen</p>,
            ...extra,
        });

        it('renders no second button without options', () => {
            render(<MeetingControl label="Mikrofon" icon={icon} />);
            expect(screen.getAllByRole('button')).toHaveLength(1);
        });

        it('renders a second button named options.label', () => {
            render(<MeetingControl label="Mikrofon" icon={icon} options={options()} />);
            expect(screen.getAllByRole('button')).toHaveLength(2);
            expect(screen.getByRole('button', { name: 'Mikrofonoptionen' })).toBeInTheDocument();
        });

        it('keeps the popover content closed until the chevron is used', () => {
            render(<MeetingControl label="Mikrofon" icon={icon} options={options()} />);
            expect(screen.queryByText('Mikrofon wählen')).toBeNull();
        });

        it('opens the popover content from the chevron', async () => {
            render(<MeetingControl label="Mikrofon" icon={icon} options={options()} />);
            await userEvent.click(screen.getByRole('button', { name: 'Mikrofonoptionen' }));
            expect(await screen.findByText('Mikrofon wählen')).toBeInTheDocument();
        });

        it('does not toggle the control when the chevron is used', async () => {
            const onClick = vi.fn();
            render(
                <MeetingControl
                    label="Mikrofon"
                    icon={icon}
                    onClick={onClick}
                    options={options()}
                />,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Mikrofonoptionen' }));
            expect(onClick).not.toHaveBeenCalled();
        });

        it('still toggles the control from the main button', async () => {
            const onClick = vi.fn();
            render(
                <MeetingControl
                    label="Mikrofon"
                    icon={icon}
                    onClick={onClick}
                    options={options()}
                />,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Mikrofon' }));
            expect(onClick).toHaveBeenCalledTimes(1);
        });

        it('reports open state changes to options.onOpenChange', async () => {
            const onOpenChange = vi.fn();
            render(
                <MeetingControl label="Mikrofon" icon={icon} options={options({ onOpenChange })} />,
            );
            await userEvent.click(screen.getByRole('button', { name: 'Mikrofonoptionen' }));
            expect(onOpenChange).toHaveBeenCalledWith(true);
        });

        it('shows controlled-open content straight away', () => {
            render(
                <MeetingControl label="Mikrofon" icon={icon} options={options({ open: true })} />,
            );
            expect(screen.getByText('Mikrofon wählen')).toBeInTheDocument();
        });

        it('disables the chevron with options.disabled', async () => {
            render(
                <MeetingControl
                    label="Mikrofon"
                    icon={icon}
                    options={options({ disabled: true })}
                />,
            );
            const chevron = screen.getByRole('button', { name: 'Mikrofonoptionen' });
            expect(chevron).toHaveAttribute('aria-disabled', 'true');
            expect(screen.getByRole('button', { name: 'Mikrofon' })).not.toHaveAttribute(
                'aria-disabled',
            );
            await userEvent.click(chevron);
            expect(screen.queryByText('Mikrofon wählen')).toBeNull();
        });
    });

    describe('tone', () => {
        it('defaults to default', () => {
            render(<MeetingControl label="Mikrofon" icon={icon} />);
            expect(screen.getByRole('button')).toHaveAttribute('data-tone', 'default');
        });

        it.each(['off', 'active', 'attention', 'danger'] as const)('exposes tone %s', (tone) => {
            render(<MeetingControl label="Mikrofon" icon={icon} tone={tone} />);
            expect(screen.getByRole('button')).toHaveAttribute('data-tone', tone);
        });
    });

    describe('showLabel', () => {
        it('shows no visible text by default', () => {
            const { container } = render(<MeetingControl label="Verlassen" icon={icon} />);
            expect(container.querySelector('span')).toBeNull();
        });

        it('shows the label as text beside the icon', () => {
            render(<MeetingControl label="Verlassen" icon={icon} showLabel />);
            expect(screen.getByText('Verlassen')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Verlassen' })).toBeInTheDocument();
        });
    });

    it('forwards its ref to the main button', () => {
        const ref = createRef<HTMLButtonElement>();
        render(<MeetingControl ref={ref} label="Mikrofon" icon={icon} />);
        expect(ref.current).toBe(screen.getByRole('button', { name: 'Mikrofon' }));
    });

    it('forwards extra props to the main button', () => {
        render(
            <MeetingControl
                label="Mikrofon"
                icon={icon}
                data-testid="mic"
                id="mic-toggle"
                options={{ label: 'Optionen', content: 'x' }}
            />,
        );
        const button = screen.getByRole('button', { name: 'Mikrofon' });
        expect(button).toHaveAttribute('data-testid', 'mic');
        expect(button).toHaveAttribute('id', 'mic-toggle');
        expect(screen.getByRole('button', { name: 'Optionen' })).not.toHaveAttribute('id');
    });

    it('puts a caller className on the button, or on the wrapper of a split control', () => {
        const { rerender } = render(
            <MeetingControl label="Mikrofon" icon={icon} className="shadow-md" />,
        );
        expect(screen.getByRole('button').className).toContain('shadow-md');
        rerender(
            <MeetingControl
                label="Mikrofon"
                icon={icon}
                className="shadow-md"
                options={{ label: 'Optionen', content: 'x' }}
            />,
        );
        expect(screen.getByRole('button', { name: 'Mikrofon' }).className).not.toContain(
            'shadow-md',
        );
        expect(
            screen
                .getByRole('button', { name: 'Mikrofon' })
                .closest('[data-slot="meeting-control-split"]')!.className,
        ).toContain('shadow-md');
    });
});
