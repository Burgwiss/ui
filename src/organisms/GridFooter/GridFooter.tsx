import { ChevronLeft, ChevronRight } from 'lucide-react';

import { IconButton } from '../../molecules/IconButton';

export interface GridFooterProps {
    /** e.g. "1–25 von 120" — already translated by the app. */
    summary: string;
    /** null = no previous page (the button renders disabled). */
    onPrev: (() => void) | null;
    onNext: (() => void) | null;
    labels: { previous: string; next: string; pager: string };
}

/** The standard grid footer: the count summary left, the pager right. */
export function GridFooter({ summary, onPrev, onNext, labels }: GridFooterProps) {
    return (
        <>
            <p className="text-sm text-muted-foreground tabular-nums">{summary}</p>
            <nav
                aria-label={labels.pager}
                className="ml-auto flex items-center gap-0.5 rounded-lg border border-border p-0.5"
            >
                <IconButton
                    label={labels.previous}
                    disabled={!onPrev}
                    onClick={onPrev ?? undefined}
                    icon={<ChevronLeft className="size-4" aria-hidden="true" />}
                />
                <IconButton
                    label={labels.next}
                    disabled={!onNext}
                    onClick={onNext ?? undefined}
                    icon={<ChevronRight className="size-4" aria-hidden="true" />}
                />
            </nav>
        </>
    );
}
