import { Monitor, Smartphone } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '../../atoms/Button';
import { cn } from '../../lib/cn';
import { Sidebar, SidebarContent } from '../../organisms/Sidebar';

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
export function PageEditor({
    toolbar,
    aside,
    device,
    onDeviceChange,
    previewTools,
    storageKey,
    labels,
    children,
}: PageEditorProps) {
    const widths: { id: PageEditorDevice; label: string; icon: ReactNode }[] = [
        { id: 'desktop', label: labels.desktop, icon: <Monitor aria-hidden="true" /> },
        { id: 'phone', label: labels.phone, icon: <Smartphone aria-hidden="true" /> },
    ];
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
                {toolbar}
            </div>
            <div className="flex min-h-0 flex-1">
                <div className="relative min-w-0 flex-1">
                    {/* Edge to edge: the page fills the middle as visitors see it. The
                        width switch only narrows it to a phone column; the bottom
                        padding keeps the last section clear of the floating toolbar. */}
                    <div className="h-full overflow-auto bg-muted/50">
                        <section
                            aria-label={labels.preview}
                            data-device={device}
                            className={cn(
                                'mx-auto min-h-full overflow-hidden bg-card pb-24',
                                'transition-[max-width] duration-300 ease-out motion-reduce:transition-none',
                                device === 'desktop'
                                    ? 'max-w-full'
                                    : 'max-w-[390px] border-x border-border shadow-sm',
                            )}
                        >
                            {children}
                        </section>
                    </div>
                    <div
                        role="toolbar"
                        aria-label={labels.tools}
                        className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur"
                    >
                        {widths.map((w) => (
                            <Button
                                key={w.id}
                                variant="ghost"
                                size="icon"
                                aria-label={w.label}
                                aria-pressed={device === w.id}
                                onClick={() => onDeviceChange(w.id)}
                                className={cn(
                                    'text-muted-foreground',
                                    device === w.id && 'bg-muted text-foreground',
                                )}
                            >
                                {w.icon}
                            </Button>
                        ))}
                        {previewTools && (
                            <>
                                <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />
                                {previewTools}
                            </>
                        )}
                    </div>
                </div>
                {aside && (
                    <Sidebar
                        label={labels.aside}
                        side="right"
                        defaultWidth={264}
                        resize={{ label: labels.resizeAside, storageKey, minWidth: 220 }}
                    >
                        <SidebarContent className="gap-6 px-4 py-4">{aside}</SidebarContent>
                    </Sidebar>
                )}
            </div>
        </div>
    );
}
