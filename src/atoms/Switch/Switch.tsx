import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/**
 * An on/off toggle for a setting that takes effect immediately (e.g. "Course
 * published"). Use `Checkbox` instead when the value is only applied on submit
 * or when several options can be ticked from a list. Controlled with
 * `checked` + `onCheckedChange`, or uncontrolled with `defaultChecked`.
 * The trigger needs a label associated via `<label htmlFor={id}>` or
 * `aria-labelledby`. Always pair with an `id` prop.
 * Wrapper around `@radix-ui/react-switch`, theme-token styling only.
 *
 * @summary On/off toggle switch for an immediate setting; always pair with a Label and `id`.
 */
const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(function Switch({ className, ...props }, ref) {
    return (
        <SwitchPrimitive.Root
            ref={ref}
            data-slot="switch"
            className={cn(
                'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted',
                className,
            )}
            {...props}
        >
            <SwitchPrimitive.Thumb
                className={cn(
                    'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-md ring-0 transition-transform',
                    'data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
                )}
            />
        </SwitchPrimitive.Root>
    );
});
Switch.displayName = 'Switch';

export { Switch };
