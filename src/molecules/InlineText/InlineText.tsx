import { Pencil, Plus } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';

import { cn } from '../../lib/cn';

export interface InlineTextProps {
    /** The text (controlled). Empty shows the placeholder prompt. */
    value: string;
    /** Called with the new, trimmed text when a change is kept — not on every keystroke, not when unchanged. */
    onChange: (value: string) => void;
    /** What the text is, e.g. "Titel": names the button and the field. */
    label: string;
    /** What belongs here, shown while empty, e.g. "Wie heißt der Kurs?". */
    placeholder: string;
    /** A paragraph rather than a line: Enter adds a line, Ctrl/⌘+Enter keeps. */
    multiline?: boolean;
    /** On a dark or coloured surface (e.g. `bg-primary`): light outlines and prompt. */
    inverse?: boolean;
    /** The element around the text, so headings stay headings. Default `p`. */
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
    /** Typography of the text — the field takes the same, so nothing jumps when editing. */
    className?: string;
}

/**
 * Text on a page that you edit where it stands — the heart of a WYSIWYG page
 * editor. It reads as the finished text, shows a dashed outline and a pencil
 * on hover, and turns into a field with the same typography on click. Enter
 * (Ctrl/⌘+Enter for a paragraph) or leaving the field keeps the change, Escape
 * throws it away, and focus comes back to the text. Empty, it shows a prompt
 * saying what belongs here instead of leaving a hole. For a form field with a
 * visible label use `Input`/`Textarea`.
 *
 * @summary Click-to-edit text for in-place page editing, with an empty-state prompt.
 */
export function InlineText({
    value,
    onChange,
    label,
    placeholder,
    multiline = false,
    inverse = false,
    as: Tag = 'p',
    className,
}: InlineTextProps) {
    const [editing, setEditing] = useState(false);
    const field = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
    const shown = useRef<HTMLButtonElement>(null);
    const refocus = useRef(false);

    useEffect(() => {
        if (editing) {
            field.current?.focus();
            field.current?.select();
        } else if (refocus.current) {
            refocus.current = false;
            shown.current?.focus();
        }
    }, [editing]);

    const done = (keep: boolean, keyboard: boolean) => {
        const next = field.current?.value.trim() ?? '';
        refocus.current = keyboard;
        setEditing(false);
        if (keep && next !== value) onChange(next);
    };

    if (editing) {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                done(false, true);
            } else if (
                event.key === 'Enter' &&
                !(event.nativeEvent as globalThis.KeyboardEvent).isComposing &&
                (!multiline || event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                done(true, true);
            }
        };
        const props = {
            ref: field,
            defaultValue: value,
            'aria-label': label,
            placeholder,
            onKeyDown,
            onBlur: () => done(true, false),
            className: cn(
                'block w-full resize-none rounded-md px-2 py-0.5 text-inherit outline-none ring-2',
                inverse ? 'bg-black/20 ring-primary-foreground' : 'bg-background ring-ring',
                '-mx-2 w-[calc(100%+1rem)]',
                className,
            ),
        };
        return multiline ? (
            <textarea rows={Math.max(3, value.split('\n').length + 1)} {...props} />
        ) : (
            <input {...props} />
        );
    }

    if (!value)
        return (
            <button
                ref={shown}
                type="button"
                onClick={() => setEditing(true)}
                className={cn(
                    'flex w-full items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-start text-sm transition-colors',
                    inverse
                        ? 'border-primary-foreground/50 text-primary-foreground hover:border-primary-foreground'
                        : 'border-border text-muted-foreground hover:border-ring hover:text-foreground',
                )}
            >
                <Plus className="size-4 shrink-0" aria-hidden="true" />
                <span>
                    <span className={cn('font-medium', !inverse && 'text-foreground')}>
                        {label}
                    </span>{' '}
                    — {placeholder}
                </span>
            </button>
        );

    return (
        <Tag className={className}>
            <button
                ref={shown}
                type="button"
                aria-label={`${label}: ${value}`}
                onClick={() => setEditing(true)}
                className={cn(
                    'group/inline relative -mx-2 block w-[calc(100%+1rem)] cursor-text rounded-md px-2 py-0.5 text-start whitespace-pre-line',
                    'outline-offset-2 hover:outline-2 hover:outline-dashed focus-visible:outline-2 focus-visible:outline-solid',
                    inverse
                        ? 'hover:outline-primary-foreground/60 focus-visible:outline-primary-foreground'
                        : 'hover:outline-ring/60 focus-visible:outline-ring',
                )}
            >
                {value}
                <Pencil
                    aria-hidden="true"
                    className="absolute -end-5 top-1 hidden size-3.5 opacity-70 group-hover/inline:block"
                />
            </button>
        </Tag>
    );
}
