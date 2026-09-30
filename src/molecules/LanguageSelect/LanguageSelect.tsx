import type { ReactNode } from 'react';
import { Select as SelectPrimitive } from 'radix-ui';
import { Check } from 'lucide-react';

import { cn } from '../../lib/cn';
import { Select, SelectContent, SelectTrigger, SelectValue } from '../Select';

export interface LanguageSelectOption {
    /** BCP 47 code, e.g. `de`. The value reported by `onValueChange`; also shown (upper-cased) when there is no `flag`. */
    code: string;
    /** The language's name in its own words or the app's, already translated, e.g. "Deutsch". */
    label: string;
    /** A flag, usually an `<svg>` or `<img>`. Optional; decorative, so it is hidden from screen readers. Without it a small box with the upper-cased `code` is shown. */
    flag?: ReactNode;
    /** How many fields are filled in this language. */
    done: number;
    /** How many fields there are in total. `done >= total` counts as complete. */
    total: number;
}

export interface LanguageSelectProps {
    /** Every language of the page, in display order, each with its progress. */
    languages: LanguageSelectOption[];
    /** The `code` of the language being edited. */
    value: string;
    /** Called with the chosen language's `code`. */
    onValueChange: (code: string) => void;
    /** All visible and spoken text, in the app's language (required). */
    labels: {
        /** Accessible name of the control, e.g. "Sprache der Seite". */
        label: string;
        /** Spoken with the counts, e.g. `(done, total) => \`${done} von ${total} ausgefüllt\``. The visible chip only shows "5/7". */
        progress: (done: number, total: number) => string;
    };
    /** Extra classes for the trigger button. */
    className?: string;
}

const isComplete = (language: LanguageSelectOption) => language.done >= language.total;

const percent = (language: LanguageSelectOption) =>
    language.total > 0 ? Math.min(100, Math.max(0, (language.done / language.total) * 100)) : 100;

function Flag({ language }: { language: LanguageSelectOption }) {
    return (
        <span
            aria-hidden="true"
            data-slot="language-select-flag"
            className="inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[3px] [&>img]:size-full [&>img]:object-cover [&>svg]:size-full"
        >
            {language.flag ?? (
                <span
                    data-slot="language-select-code"
                    className="flex size-full items-center justify-center bg-muted text-[10px] leading-none font-semibold text-muted-foreground uppercase"
                >
                    {language.code.toUpperCase()}
                </span>
            )}
        </span>
    );
}

function Chip({ language }: { language: LanguageSelectOption }) {
    const complete = isComplete(language);
    return (
        <span
            aria-hidden="true"
            data-slot="language-select-progress"
            data-complete={complete}
            className={cn(
                'shrink-0 rounded-full px-1.5 py-px text-xs font-medium tabular-nums',
                complete
                    ? 'bg-success/10 text-success-tint-foreground'
                    : 'bg-warning/10 text-warning-tint-foreground',
            )}
        >
            {language.done}/{language.total}
        </span>
    );
}

/**
 * A dropdown for choosing which language of a page you are editing, showing how complete each
 * language is. The trigger shows the current language's flag, name and a `done/total` chip
 * (green when complete, amber otherwise); the list shows every language the same way plus a thin
 * progress bar. Use it in the top bar of a page editor (course page, category page); for choosing
 * among plain options use `Select`. Screen readers hear the name followed by
 * `labels.progress(done, total)`, never a bare "5/7". Logical properties keep it right-to-left
 * safe. The app passes the languages, the flags and every string.
 *
 * @summary Language dropdown with flag, name and a done/total progress chip per language; built on Select.
 */
export function LanguageSelect({
    languages,
    value,
    onValueChange,
    labels,
    className,
}: LanguageSelectProps) {
    const current = languages.find((language) => language.code === value);

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger
                data-slot="language-select"
                aria-label={
                    current
                        ? `${labels.label}: ${current.label}, ${labels.progress(current.done, current.total)}`
                        : labels.label
                }
                className={cn('w-auto min-w-40 gap-2 px-2', className)}
            >
                <SelectValue>
                    {current ? (
                        <span className="flex items-center gap-2">
                            <Flag language={current} />
                            <span className="truncate">{current.label}</span>
                            <Chip language={current} />
                        </span>
                    ) : null}
                </SelectValue>
            </SelectTrigger>
            <SelectContent className="min-w-56">
                {languages.map((language) => {
                    const complete = isComplete(language);
                    return (
                        <SelectPrimitive.Item
                            key={language.code}
                            value={language.code}
                            data-slot="select-item"
                            data-complete={complete}
                            className="relative flex w-full cursor-default items-center rounded-sm py-1.5 ps-2 pe-8 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                            <SelectPrimitive.ItemText>
                                <span className="flex w-full flex-col gap-1">
                                    <span className="flex items-center gap-2">
                                        <Flag language={language} />
                                        <span className="flex-1 truncate">
                                            {language.label}
                                        </span>{' '}
                                        <span className="sr-only">
                                            {labels.progress(language.done, language.total)}
                                        </span>
                                        <Chip language={language} />
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        data-slot="language-select-bar"
                                        className="block h-1 w-full overflow-hidden rounded-full bg-muted"
                                    >
                                        <span
                                            className={cn(
                                                'block h-full rounded-full',
                                                complete ? 'bg-success' : 'bg-warning',
                                            )}
                                            style={{ width: `${percent(language)}%` }}
                                        />
                                    </span>
                                </span>
                            </SelectPrimitive.ItemText>
                            <span className="absolute end-2 top-2 flex size-4 items-center justify-center">
                                <SelectPrimitive.ItemIndicator>
                                    <Check className="size-4" aria-hidden="true" />
                                </SelectPrimitive.ItemIndicator>
                            </span>
                        </SelectPrimitive.Item>
                    );
                })}
            </SelectContent>
        </Select>
    );
}
