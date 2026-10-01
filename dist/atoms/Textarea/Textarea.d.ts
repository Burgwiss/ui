import * as React from 'react';
export type TextareaProps = React.ComponentProps<'textarea'>;
/**
 * A multi-line text field for free-form input (notes, descriptions, messages).
 * Takes every native `<textarea>` prop; it is at least 5rem tall and as wide as its
 * container. Pair it with a `Label` (`htmlFor` + `id`) or pass `aria-label`. Mark a
 * failed validation with `aria-invalid`, which turns the border destructive. For a
 * single line use `Input`; for a message composer with attachments use `ChatComposer`.
 *
 * @summary Multi-line text field with theme-token styling; pair it with a Label.
 */
declare const Textarea: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>, "ref"> & React.RefAttributes<HTMLTextAreaElement>>;
export { Textarea };
