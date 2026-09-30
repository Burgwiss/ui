import * as React from 'react';

import { cn } from '../../lib/cn';

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
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                data-slot="textarea"
                className={cn(
                    'flex min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
                    className,
                )}
                {...props}
            />
        );
    },
);

Textarea.displayName = 'Textarea';

export { Textarea };
