import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '../../lib/cn';

export interface EmptyStateProps {
    /** Outline icon (lucide-react) shown in the muted disc. */
    icon: LucideIcon;
    /** Short, scannable heading. */
    title: string;
    /** One supportive sentence. Optional. */
    description?: string;
    /**
     * Primary next-step affordance — typically a `<Button asChild>` wrapping a
     * link, or a plain `<Button>`. Optional: some empty states are purely
     * informational (e.g. "all caught up") with no action.
     */
    action?: ReactNode;
    /** Extra classes for the outer card, e.g. a width or margin. */
    className?: string;
}

/**
 * The block to show where a list or panel would be but there is nothing yet: a muted icon
 * disc, a heading, one supporting sentence and an optional next-step action, centred in a
 * card surface. Use it instead of a one-line "Nothing here yet." sentence; for an error
 * use `Alert`. The icon is decorative (`aria-hidden`) — the heading carries the meaning for
 * screen readers. The app supplies `title` and `description` already translated.
 *
 * @summary Centred "nothing here yet" block with icon, heading, one sentence and an optional action.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center rounded-xl border border-border bg-card px-6 py-10 text-center text-card-foreground',
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
                <Icon className="size-6" />
            </span>
            <p className="text-base font-medium text-foreground">{title}</p>
            {description && (
                <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
