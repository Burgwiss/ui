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
export declare function InlineText({ value, onChange, label, placeholder, multiline, inverse, as: Tag, className, }: InlineTextProps): import("react").JSX.Element;
