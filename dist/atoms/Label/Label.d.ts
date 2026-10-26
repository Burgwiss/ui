import * as React from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
/**
 * The visible caption of a form control. Associate it with the control via
 * `htmlFor` + the control's `id`, so a click on the label focuses the control and
 * screen readers announce it. Dims automatically next to a disabled `peer` control.
 * For a caption that is not tied to a control (a heading, a group title), use
 * plain text instead. The text is a child prop: pass it in the app's language.
 *
 * @summary Caption for a form control, wired to it with `htmlFor` and the control's `id`.
 */
declare const Label: React.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React.RefAttributes<HTMLLabelElement>, "ref"> & React.RefAttributes<HTMLLabelElement>>;
export { Label };
