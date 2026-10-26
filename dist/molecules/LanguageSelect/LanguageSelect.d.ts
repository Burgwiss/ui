import type { ReactNode } from 'react';
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
export declare function LanguageSelect({ languages, value, onValueChange, labels, className, }: LanguageSelectProps): import("react").JSX.Element;
