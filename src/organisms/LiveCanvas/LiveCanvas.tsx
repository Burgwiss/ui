import {
    createContext,
    useContext,
    useId,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent,
    type ReactNode,
} from 'react';

import { cn } from '../../lib/cn';

interface CanvasContext {
    baseId: string;
    selected: string | null;
    active: string | null;
    select: (id: string | null) => void;
    setActive: (id: string) => void;
}

const Ctx = createContext<CanvasContext | null>(null);

const domId = (baseId: string, id: string) => `${baseId}-${id.replace(/[^A-Za-z0-9_-]/g, '_')}`;

export interface LiveCanvasProps {
    /** The canvas's accessible name, e.g. "Stilbuch". */
    label: string;
    /** The selected target's id, or null for "the whole thing". */
    selected: string | null;
    /** Called with the clicked or keyboard-chosen target's id, or `null` to select nothing (click on the artboard, Escape, or toggling the selected target off). */
    onSelect: (id: string | null) => void;
    /** A small caption above the artboard. */
    caption?: ReactNode;
    /** Styles for the artboard — CSS variables here repaint everything inside, live. */
    artboardStyle?: CSSProperties;
    /** Classes for the artboard, e.g. a theme scope. */
    artboardClassName?: string;
    /** Render the artboard in dark mode. */
    dark?: boolean;
    /** Dim the artboard while a change is being applied, rather than blanking it. */
    pending?: boolean;
    /** The samples: `LiveCanvasTarget`s, optionally grouped in `LiveCanvasGroup`s, laid out however you like. */
    children: ReactNode;
}

/**
 * A canvas you SELECT in: real components laid out on an artboard, each
 * wrapped in a `LiveCanvasTarget`. Clicking a target selects it; clicking the
 * artboard around them selects nothing. Pair it with an inspector that edits
 * what is selected — styles given in `artboardStyle` repaint the artboard live.
 *
 * Nothing on the canvas drags, resizes or edits in place, and the samples
 * inside a target are `inert`: they are shown, not used.
 *
 * Keyboard: the canvas is one tab stop (a listbox). Arrows move between
 * targets, Enter or Space selects, Escape selects nothing.
 *
 * Use it to pick a building block to edit next to an inspector (a design
 * studio, a style book). It is not a free-form editor and not a preview.
 *
 * @summary Selectable artboard of real components (`LiveCanvasTarget`) for pairing with an inspector, with live restyling.
 */
export function LiveCanvas({
    label,
    selected,
    onSelect,
    caption,
    artboardStyle,
    artboardClassName,
    dark = false,
    pending = false,
    children,
}: LiveCanvasProps) {
    const baseId = useId();
    const [active, setActive] = useState<string | null>(null);
    const list = useRef<HTMLDivElement>(null);

    const targets = () =>
        Array.from(list.current?.querySelectorAll<HTMLElement>('[role=option]') ?? []);
    const current = active ?? selected;

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const all = targets();
        if (all.length === 0) return;
        const index = all.findIndex((el) => el.dataset.target === current);
        const go = (next: number) => {
            event.preventDefault();
            const el = all[(next + all.length) % all.length];
            if (!el?.dataset.target) return;
            setActive(el.dataset.target);
            el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
        };
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                return go(index < 0 ? 0 : index + 1);
            case 'ArrowUp':
            case 'ArrowLeft':
                return go(index < 0 ? all.length - 1 : index - 1);
            case 'Home':
                return go(0);
            case 'End':
                return go(all.length - 1);
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (current !== null) onSelect(current === selected ? null : current);
                return;
            case 'Escape':
                if (selected !== null) {
                    event.preventDefault();
                    onSelect(null);
                }
                return;
        }
    };

    return (
        <Ctx.Provider value={{ baseId, selected, active: current, select: onSelect, setActive }}>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted p-8">
                {caption && (
                    <p className="mx-auto mb-2 w-full max-w-4xl text-xs font-medium text-muted-foreground">
                        {caption}
                    </p>
                )}
                {/* The artboard. A click past every target selects nothing — the
                    inspector goes back to the whole thing. */}
                <div
                    role="presentation"
                    onClick={() => onSelect(null)}
                    style={artboardStyle}
                    className={cn(
                        'theme-scope mx-auto w-full max-w-4xl rounded-xl border border-border bg-background p-8 text-foreground shadow-sm transition-opacity',
                        dark && 'dark',
                        pending && 'opacity-60',
                        artboardClassName,
                    )}
                >
                    <div
                        ref={list}
                        role="listbox"
                        aria-label={label}
                        tabIndex={0}
                        aria-activedescendant={current ? domId(baseId, current) : undefined}
                        onKeyDown={onKeyDown}
                        className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-8 focus-visible:ring-offset-background"
                    >
                        {children}
                    </div>
                </div>
            </div>
        </Ctx.Provider>
    );
}

export interface LiveCanvasTargetProps {
    /** Stable id, e.g. `'button.primary'`. */
    id: string;
    /** Its name: shown on the tag when selected, and read to screen readers. */
    label: string;
    /** Stretch to the full width instead of hugging the sample. */
    wide?: boolean;
    /** The sample component to show; it is rendered `inert`. */
    children: ReactNode;
}

/**
 * One selectable thing on a LiveCanvas. Its sample is `inert` — no pointer,
 * no tab stop — so a real input or button can be shown without being a
 * control inside a control.
 */
export function LiveCanvasTarget({ id, label, wide = false, children }: LiveCanvasTargetProps) {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('LiveCanvasTarget must be inside a LiveCanvas');
    const isSelected = ctx.selected === id;
    const isActive = ctx.active === id;

    return (
        // Keyboard selection lives on the listbox (aria-activedescendant), as
        // the ARIA listbox pattern prescribes; the option itself only takes
        // the pointer. tabIndex -1: focusable by script, not a tab stop.
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
            id={domId(ctx.baseId, id)}
            tabIndex={-1}
            role="option"
            aria-selected={isSelected}
            aria-label={label}
            data-target={id}
            data-active={isActive || undefined}
            onClick={(event) => {
                // A click on a target must not also reach the artboard, or
                // selecting anything would immediately select nothing.
                event.stopPropagation();
                ctx.setActive(id);
                ctx.select(isSelected ? null : id);
            }}
            className={cn(
                'relative cursor-pointer rounded-md outline-offset-4 transition-[outline-color]',
                wide ? 'w-full' : 'w-fit',
                isSelected
                    ? 'outline-2 outline-ring outline-solid'
                    : 'outline-1 outline-ring/25 outline-dashed hover:outline-ring/70',
                !isSelected && isActive && 'outline-2 outline-ring/70',
            )}
        >
            {isSelected && (
                <span
                    aria-hidden="true"
                    className="absolute start-0 -top-6 z-10 rounded bg-primary px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap text-primary-foreground"
                >
                    {label}
                </span>
            )}
            <div inert>{children}</div>
        </div>
    );
}

/** A captioned group of targets. */
export function LiveCanvasGroup({
    caption,
    children,
}: {
    /** The group's heading, shown small in capitals and used as the group's accessible name. */
    caption: string;
    /** The `LiveCanvasTarget`s in this group. */
    children: ReactNode;
}) {
    return (
        <div role="group" aria-label={caption} className="space-y-3">
            <p
                aria-hidden="true"
                className="text-[10px] font-semibold tracking-[0.07em] text-muted-foreground uppercase"
            >
                {caption}
            </p>
            {children}
        </div>
    );
}
