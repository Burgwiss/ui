import * as React from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Check } from 'lucide-react';

import { cn } from '../../lib/cn';

/**
 * A tick box for a yes/no value that is applied on submit, or for picking
 * several options from a list. Use `Switch` instead for a setting that takes
 * effect immediately, and `RadioGroup` when exactly one option may be chosen.
 * Controlled with `checked` + `onCheckedChange`, or uncontrolled with
 * `defaultChecked`; set `aria-invalid` to show an error border.
 * The trigger needs a label associated via `<label htmlFor={id}>` or
 * `aria-labelledby`. Always pair with an `id` prop.
 * Wrapper around `@radix-ui/react-checkbox`, theme-token styling only.
 *
 * @summary Tick box for a yes/no value or multi-select; always pair with a Label and `id`.
 */
const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
    return (
        <CheckboxPrimitive.Root
            ref={ref}
            data-slot="checkbox"
            className={cn(
                'peer inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-input bg-background text-primary shadow-sm transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
                className,
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                className={cn('flex items-center justify-center text-current')}
            >
                <Check className="h-3 w-3" aria-hidden="true" />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
