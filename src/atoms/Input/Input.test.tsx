import { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from '../../atoms/Input';

/**
 * Pin the forwardRef contract on the Input component.
 *
 * If Input ever loses its forwardRef wrapping, any consumer using a ref
 * (e.g. useFocusOnMount, password-strength meters) will silently break.
 */
describe('Input — forwardRef contract', () => {
    it('forwards the ref to the underlying HTMLInputElement', () => {
        const ref = createRef<HTMLInputElement>();

        render(<Input ref={ref} type="text" />);

        expect(ref.current).not.toBeNull();
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('ref.current has tagName INPUT', () => {
        const ref = createRef<HTMLInputElement>();

        render(<Input ref={ref} />);

        expect(ref.current?.tagName).toBe('INPUT');
    });

    it('ref.current reflects the type attribute', () => {
        const ref = createRef<HTMLInputElement>();

        render(<Input ref={ref} type="email" />);

        expect(ref.current?.type).toBe('email');
    });

    it('ref.current is null before mounting', () => {
        const ref = createRef<HTMLInputElement>();

        expect(ref.current).toBeNull();
    });
});
