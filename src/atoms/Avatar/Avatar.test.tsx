import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from './Avatar';

describe('Avatar', () => {
    it('shows the fallback when no image is provided', () => {
        render(
            <Avatar>
                <AvatarFallback>AH</AvatarFallback>
            </Avatar>,
        );
        expect(screen.getByText('AH')).toBeInTheDocument();
    });

    it('exposes the size through data-size (default when unset)', () => {
        const { container, rerender } = render(
            <Avatar>
                <AvatarFallback>A</AvatarFallback>
            </Avatar>,
        );
        expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute(
            'data-size',
            'default',
        );

        rerender(
            <Avatar size="lg">
                <AvatarFallback>A</AvatarFallback>
            </Avatar>,
        );
        expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute('data-size', 'lg');
    });

    it('forwards the ref to the root — needed by Radix `asChild` triggers', () => {
        const ref = createRef<HTMLSpanElement>();
        render(
            <Avatar ref={ref}>
                <AvatarFallback>A</AvatarFallback>
            </Avatar>,
        );
        expect(ref.current).toBeInstanceOf(HTMLElement);
        expect(ref.current).toHaveAttribute('data-slot', 'avatar');
    });

    it('merges a caller className', () => {
        const { container } = render(
            <Avatar className="size-20">
                <AvatarFallback>A</AvatarFallback>
            </Avatar>,
        );
        expect(container.querySelector('[data-slot="avatar"]')?.className).toContain('size-20');
    });

    it('renders the badge and the group parts with their slots', () => {
        const { container } = render(
            <AvatarGroup>
                <Avatar>
                    <AvatarFallback>A</AvatarFallback>
                    <AvatarBadge data-testid="badge" />
                </Avatar>
                <AvatarGroupCount>+2</AvatarGroupCount>
            </AvatarGroup>,
        );
        expect(container.querySelector('[data-slot="avatar-group"]')).not.toBeNull();
        expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'avatar-badge');
        expect(screen.getByText('+2')).toHaveAttribute('data-slot', 'avatar-group-count');
    });

    it('forwards refs on the fallback, badge and group parts', () => {
        const fb = createRef<HTMLSpanElement>();
        const badge = createRef<HTMLSpanElement>();
        const group = createRef<HTMLDivElement>();
        const count = createRef<HTMLDivElement>();
        render(
            <AvatarGroup ref={group}>
                <Avatar>
                    <AvatarFallback ref={fb}>A</AvatarFallback>
                    <AvatarBadge ref={badge} />
                </Avatar>
                <AvatarGroupCount ref={count}>+1</AvatarGroupCount>
            </AvatarGroup>,
        );
        for (const r of [fb, badge, group, count]) {
            expect(r.current).toBeInstanceOf(HTMLElement);
        }
    });
});
