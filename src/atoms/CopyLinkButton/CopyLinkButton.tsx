import { Check, Copy } from 'lucide-react';
import * as React from 'react';

import { Button } from '../Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../Tooltip';

export interface CopyLinkButtonProps {
    /** The URL to copy to the clipboard. */
    url: string;
    /** Tooltip / accessible name for the idle state. */
    label: string;
    /** Label announced after a successful copy. */
    copiedLabel: string;
    /** `icon` (default) shows only the icon; `sm` also shows the label text beside it. */
    size?: 'icon' | 'sm';
    /**
     * Optional extra sentence for screen readers only (e.g. "The link still
     * requires sign-in."). Rendered visually hidden, after the button.
     */
    hint?: string;
}

/**
 * A "copy this link" button: copies `url` to the clipboard, then flips to a
 * tick for about 2 seconds with a polite live-region announcement for screen
 * readers. Use it next to a shareable link. It is icon-only by default; pass
 * `size="sm"` to also show the label as text. The app passes both labels
 * (`label`, `copiedLabel`) in its own language.
 *
 * NOTE on WHICH url to hand it: the link the recipient can actually open — a
 * public share link, never an auth-gated in-app URL that would hand them a
 * login wall.
 *
 * Needs `navigator.clipboard` (secure contexts only); where it is missing or
 * denied the button stays idle rather than claiming success.
 *
 * @summary Icon button that copies a URL to the clipboard and confirms with a tick and a screen-reader announcement.
 */
export function CopyLinkButton({
    url,
    label,
    copiedLabel,
    size = 'icon',
    hint,
}: CopyLinkButtonProps) {
    const [copied, setCopied] = React.useState(false);
    const timer = React.useRef<number | null>(null);

    React.useEffect(
        () => () => {
            if (timer.current !== null) {
                window.clearTimeout(timer.current);
            }
        },
        [],
    );

    const handleCopy = React.useCallback(() => {
        const done = () => {
            setCopied(true);
            if (timer.current !== null) {
                window.clearTimeout(timer.current);
            }
            timer.current = window.setTimeout(() => setCopied(false), 2000);
        };

        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(url).then(done, () => {
                /* clipboard denied — leave idle, no false success */
            });
        }
    }, [url]);

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size={size}
                        onClick={handleCopy}
                        aria-label={copied ? copiedLabel : label}
                    >
                        {copied ? (
                            <Check className="size-4 text-success" aria-hidden="true" />
                        ) : (
                            <Copy className="size-4" aria-hidden="true" />
                        )}
                        {size === 'sm' ? <span>{copied ? copiedLabel : label}</span> : null}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? copiedLabel : label}</TooltipContent>
            </Tooltip>
            {/* Polite announcement so SR users hear the copy succeeded. */}
            <span role="status" className="sr-only">
                {copied ? copiedLabel : ''}
            </span>
            {hint ? <span className="sr-only">{hint}</span> : null}
        </TooltipProvider>
    );
}
