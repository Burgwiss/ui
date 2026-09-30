import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from './Card';

describe('Card', () => {
    it('renders every part with its data-slot so styles can target it', () => {
        const { container } = render(
            <Card>
                <CardHeader>
                    <CardTitle>Titel</CardTitle>
                    <CardDescription>Beschreibung</CardDescription>
                    <CardAction>Aktion</CardAction>
                </CardHeader>
                <CardContent>Inhalt</CardContent>
                <CardFooter>Fuß</CardFooter>
            </Card>,
        );
        for (const slot of [
            'card',
            'card-header',
            'card-title',
            'card-description',
            'card-action',
            'card-content',
            'card-footer',
        ]) {
            expect(container.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
        }
        expect(screen.getByText('Titel')).toBeInTheDocument();
    });

    it('defaults to the default size and exposes size="sm" via data-size', () => {
        const { container, rerender } = render(<Card>x</Card>);
        expect(container.firstChild).toHaveAttribute('data-size', 'default');
        rerender(<Card size="sm">x</Card>);
        expect(container.firstChild).toHaveAttribute('data-size', 'sm');
    });

    it('uses theme tokens for the surface', () => {
        const { container } = render(<Card>x</Card>);
        const cls = (container.firstChild as HTMLElement).className;
        expect(cls).toContain('bg-card');
        expect(cls).toContain('text-card-foreground');
    });

    it('merges caller classNames and passes native props through', () => {
        const { container } = render(
            <Card className="w-96" id="k" aria-label="Kurskarte">
                x
            </Card>,
        );
        const el = container.firstChild as HTMLElement;
        expect(el.className).toContain('w-96');
        expect(el).toHaveAttribute('id', 'k');
        expect(el).toHaveAttribute('aria-label', 'Kurskarte');
    });
});
