import * as React from 'react';
import { Dialog as SheetPrimitive } from 'radix-ui';
/**
 * A slide-over panel anchored to an edge of the viewport (Radix Dialog root,
 * like `Dialog` but not centred). Use it for the mobile navigation drawer
 * (`side="left"`) or a mobile bottom sheet (`side="bottom"` with `showHandle`);
 * for a centred modal use `Dialog`.
 *
 * Compose it as `Sheet` > `SheetTrigger` + `SheetContent` (> `SheetTitle`,
 * optional `SheetDescription`, your content). Every `SheetContent` MUST contain
 * a `SheetTitle` (visually hidden is fine) so the dialog satisfies the Radix
 * accessible-name requirement.
 *
 * The corner close button needs a screen-reader name, so `closeLabel` is
 * required unless `showClose={false}` — the package carries no copy of its own.
 *
 * @summary Slide-over panel from a screen edge (nav drawer or bottom sheet) built on Radix Dialog.
 */
declare function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>): React.JSX.Element;
/** The element that opens the `Sheet`; use `asChild` to make your own button the trigger. */
declare const SheetTrigger: React.ForwardRefExoticComponent<Omit<SheetPrimitive.DialogTriggerProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** Closes the `Sheet` when clicked, e.g. a "Cancel" button inside the content (use `asChild`). */
declare const SheetClose: React.ForwardRefExoticComponent<Omit<SheetPrimitive.DialogCloseProps & React.RefAttributes<HTMLButtonElement>, "ref"> & React.RefAttributes<HTMLButtonElement>>;
/** Portals the sheet to the document body; `SheetContent` already includes it. */
declare function SheetPortal({ ...props }: React.ComponentProps<typeof SheetPrimitive.Portal>): React.JSX.Element;
/** The dimmed backdrop behind the sheet; `SheetContent` already renders one. */
declare const SheetOverlay: React.ForwardRefExoticComponent<Omit<SheetPrimitive.DialogOverlayProps & React.RefAttributes<HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
declare const SIDE_CLASSES: {
    readonly left: "inset-y-0 start-0 h-full w-72 max-w-[85vw] border-e data-[state=closed]:slide-out-to-start data-[state=open]:slide-in-from-start";
    readonly right: "inset-y-0 end-0 h-full w-72 max-w-[85vw] border-s data-[state=closed]:slide-out-to-end data-[state=open]:slide-in-from-end";
    readonly bottom: "inset-x-0 bottom-0 w-full max-h-[90vh] rounded-t-2xl border-t pb-[max(1rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom";
    readonly top: "inset-x-0 top-0 w-full max-h-[90vh] rounded-b-2xl border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top";
};
/** A small, decorative grab affordance for the bottom sheet (aria-hidden). */
declare function SheetHandle({ className }: {
    className?: string;
}): React.JSX.Element;
type SheetCloseProps = {
    /** Show the corner close button. Default true; then `closeLabel` is required. */
    showClose?: true;
    /** Accessible name of the corner close button, in the app's language. */
    closeLabel: string;
} | {
    /** Hides the corner close button (dismiss via Escape, the overlay or a `SheetClose`). */
    showClose: false;
    closeLabel?: string;
};
export type SheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    /** Which screen edge the panel slides from: `left` (default), `right`, `bottom` or `top`. `left`/`right` mean the start/end edge, so they swap in right-to-left. */
    side?: keyof typeof SIDE_CLASSES;
    /** Render a drag-handle affordance (typically with side="bottom"). */
    showHandle?: boolean;
} & SheetCloseProps;
/**
 * The panel itself: overlay, portal, edge-anchored surface and the corner close
 * button. Must contain a `SheetTitle`.
 */
declare const SheetContent: React.ForwardRefExoticComponent<SheetContentProps & React.RefAttributes<HTMLDivElement>>;
/** The sheet's accessible name (required in every `SheetContent`; may be visually hidden). */
declare const SheetTitle: React.ForwardRefExoticComponent<Omit<SheetPrimitive.DialogTitleProps & React.RefAttributes<HTMLHeadingElement>, "ref"> & React.RefAttributes<HTMLHeadingElement>>;
/** Optional secondary text that describes the sheet to screen readers. */
declare const SheetDescription: React.ForwardRefExoticComponent<Omit<SheetPrimitive.DialogDescriptionProps & React.RefAttributes<HTMLParagraphElement>, "ref"> & React.RefAttributes<HTMLParagraphElement>>;
export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent, SheetHandle, SheetTitle, SheetDescription, };
