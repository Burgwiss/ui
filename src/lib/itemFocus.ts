/**
 * The keyboard focus indicator for an item inside a list widget (menu, command
 * list, combobox options) — issue Burgwiss/burgwiss#1558.
 *
 * The highlight these items always had is `bg-muted` (or `bg-accent`) on a
 * `bg-card` panel: about 1.1:1 against an unfocused item, so a keyboard user
 * could not see where they were (WCAG 2.4.7). The tint stays for the pointer;
 * this adds an inset ring in the `ring` token, which is held to 3:1 against
 * every surface it sits on (theme.css, and the school theme resolver).
 *
 * `real` is for items that take DOM focus (Radix menus). `:focus-visible`
 * keeps the ring to the keyboard: hovering a Radix item focuses it too, and a
 * ring under the mouse pointer is noise. `virtual` is for lists where focus
 * stays in an input and the active option is only marked by an attribute
 * (cmdk, Headless UI) — there is no focus-visible state to key on, so the
 * marker itself draws the ring.
 */
export const itemFocusRing = {
    real: 'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
    cmdk: 'data-[selected=true]:ring-2 data-[selected=true]:ring-ring data-[selected=true]:ring-inset',
    headless: 'data-[focus]:ring-2 data-[focus]:ring-ring data-[focus]:ring-inset',
} as const;
