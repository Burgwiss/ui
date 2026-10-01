import type { ReactNode } from 'react';
/** The width the page is previewed at. */
export type PageEditorDevice = 'desktop' | 'phone';
export interface PageEditorProps {
    /** The bar across the top: language, save state, "Ansehen", "Veröffentlichen". */
    toolbar: ReactNode;
    /** The right-hand panel, e.g. a `CompletionChecklist` and what is not live yet. Omit for none. */
    aside?: ReactNode;
    /** The preview width (controlled). */
    device: PageEditorDevice;
    /** Called when the person picks another width in the floating toolbar. */
    onDeviceChange: (device: PageEditorDevice) => void;
    /** More buttons for the floating toolbar, after the width switch (e.g. undo). */
    previewTools?: ReactNode;
    /** Remember the aside's width under this name. */
    storageKey?: string;
    /** All visible text, in the app's language. */
    labels: {
        /** Name of the preview region, e.g. "Kursseite (Vorschau zum Bearbeiten)". */
        preview: string;
        /** Name of the floating toolbar, e.g. "Vorschau". */
        tools: string;
        /** The computer-width button, e.g. "Computer". */
        desktop: string;
        /** The phone-width button, e.g. "Handy". */
        phone: string;
        /** Name of the right-hand panel, e.g. "Seitenstatus". */
        aside: string;
        /** Name of the panel's resize handle. */
        resizeAside: string;
    };
    /** The page itself, built from `InlineText` and friends so it is edited where it stands. */
    children: ReactNode;
}
/**
 * The layout for editing a page in place (a course page, a category page):
 * a top bar, the page itself filling the middle edge to edge — shown as
 * visitors will see it, at computer or phone width — with a small toolbar floating at the bottom
 * of the preview (as in the design studio), and a resizable panel on the
 * right for completeness and publishing state. It fills its container; put
 * it inside `AdminLayout` next to the page's own sidebar.
 *
 * @summary In-place page editor layout: top bar, previewed page with a floating device toolbar, right panel.
 */
export declare function PageEditor({ toolbar, aside, device, onDeviceChange, previewTools, storageKey, labels, children, }: PageEditorProps): import("react").JSX.Element;
