import { Eye, EyeOff } from 'lucide-react';
import { forwardRef, useState } from 'react';

import { IconButton } from '../../atoms/IconButton';
import { Input, type InputProps } from '../../atoms/Input';
import { cn } from '../../lib/cn';

export interface PasswordInputLabels {
    /** Accessible name + tooltip of the toggle while the password is hidden. */
    show: string;
    /** Accessible name + tooltip of the toggle while the password is visible. */
    hide: string;
}

export type PasswordInputProps = Omit<InputProps, 'type'> & {
    /** The show/hide toggle's accessible name and tooltip, in the app's language (required). */
    labels: PasswordInputLabels;
};

/**
 * A password field with a show/hide "eye" toggle. Use it for every password
 * input instead of `<Input type="password" />`; it is a drop-in for that, forwarding the
 * ref and every input prop except `type`. The app passes the toggle's text as `labels`.
 *
 * a11y: the toggle is an {@link IconButton} (`aria-label` + tooltip from `labels` +
 * 44px touch floor), keyboard-reachable, with `aria-pressed` reflecting
 * visibility. Toggling flips the input between `password` and `text`.
 *
 * @summary Password input with a show/hide toggle; a drop-in for Input type="password".
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    function PasswordInput({ className, labels, ...props }, ref) {
        const [visible, setVisible] = useState(false);

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    className={cn('pr-10', className)}
                    {...props}
                />
                <IconButton
                    label={visible ? labels.hide : labels.show}
                    aria-pressed={visible}
                    onClick={() => setVisible((v) => !v)}
                    icon={
                        visible ? (
                            <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                            <Eye className="size-4" aria-hidden="true" />
                        )
                    }
                    className="absolute inset-y-0 right-0 my-auto mr-1 h-7 w-7"
                />
            </div>
        );
    },
);
