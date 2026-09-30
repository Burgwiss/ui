import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';

import { cn } from '../../lib/cn';

/**
 * The visible caption of a form control. Associate it with the control via
 * `htmlFor` + the control's `id`, so a click on the label focuses the control and
 * screen readers announce it. Dims automatically next to a disabled `peer` control.
 * For a caption that is not tied to a control (a heading, a group title), use
 * plain text instead. The text is a child prop: pass it in the app's language.
 *
 * @summary Caption for a form control, wired to it with `htmlFor` and the control's `id`.
 */
const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(function Label({ className, ...props }, ref) {
    return (
        <LabelPrimitive.Root
            ref={ref}
            data-slot="label"
            className={cn(
                'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                className,
            )}
            {...props}
        />
    );
});
Label.displayName = 'Label';

export { Label };
