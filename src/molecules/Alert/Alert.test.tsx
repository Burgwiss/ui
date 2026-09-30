import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert, AlertAction, AlertDescription, AlertTitle } from './Alert';

describe('Alert', () => {
    it('is a live alert region containing its title and description', () => {
        render(
            <Alert>
                <AlertTitle>Achtung</AlertTitle>
                <AlertDescription>Etwas ist passiert.</AlertDescription>
            </Alert>,
        );
        const alert = screen.getByRole('alert');
        expect(alert).toHaveTextContent('Achtung');
        expect(alert).toHaveTextContent('Etwas ist passiert.');
    });

    it('tags each part with its data-slot', () => {
        const { container } = render(
            <Alert>
                <AlertTitle>T</AlertTitle>
                <AlertDescription>D</AlertDescription>
                <AlertAction>A</AlertAction>
            </Alert>,
        );
        for (const slot of ['alert', 'alert-title', 'alert-description', 'alert-action']) {
            expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
        }
    });

    it('uses the card look by default and the destructive token for that variant', () => {
        const { rerender } = render(<Alert>x</Alert>);
        expect(screen.getByRole('alert').className).toContain('text-card-foreground');

        rerender(<Alert variant="destructive">x</Alert>);
        const cls = screen.getByRole('alert').className;
        expect(cls).toContain('text-destructive');
        expect(cls).not.toContain('text-card-foreground');
    });

    it('merges a caller className and lets the caller override the role', () => {
        render(
            <Alert className="w-96" role="status">
                x
            </Alert>,
        );
        const el = screen.getByRole('status');
        expect(el.className).toContain('w-96');
    });

    it('positions the action at the top right', () => {
        render(
            <Alert>
                <AlertAction>Neu laden</AlertAction>
            </Alert>,
        );
        expect(screen.getByText('Neu laden').className).toContain('absolute');
    });
});
