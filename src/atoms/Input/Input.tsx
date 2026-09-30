import * as React from 'react';

import { cn } from '../../lib/cn';

export type InputProps = React.ComponentProps<'input'>;

/**
 * A single-line text field. Takes every native `<input>` prop, so set `type`
 * (`text`, `email`, `search`, `number`, ...), `placeholder`, `disabled` and so on as
 * usual. Pair it with a `Label` (`htmlFor` + `id`) or pass `aria-label`; a placeholder
 * is not a label. Mark a failed validation with `aria-invalid` (destructive border).
 * For passwords use `PasswordInput` (show/hide toggle), for whole numbers `IntegerInput`,
 * for several lines `Textarea`, and for a search box with a magnifier icon `SearchField`.
 *
 * @summary Single-line text input with theme-token styling; pair it with a Label.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                ref={ref}
                data-slot="input"
                className={cn(
                    'h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 pointer-coarse:min-h-11',
                    className,
                )}
                {...props}
            />
        );
    },
);

Input.displayName = 'Input';

export { Input };
