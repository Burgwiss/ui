import * as React from 'react';
export type StatCardProps = {
    /** What is being counted, e.g. `Teilnehmende`; shown small above the value and used as the card's title. */
    label: string;
    /** The headline figure, large and tabular-aligned. A number or any node; format it (locale, units) before passing. */
    value: React.ReactNode;
    /** Small muted line under the value (e.g. "5 awaiting approval"). */
    hint?: string;
    /** Optional leading glyph, sized by the caller (e.g. `<Users className="size-4" />`). */
    icon?: React.ReactNode;
    /** Extra classes for the card, e.g. a grid placement or width. */
    className?: string;
};
/**
 * The canonical KPI tile: a label, a large value and an optional hint line. Use it for a
 * dashboard row of headline numbers; for general grouped content use `Card`. Built on the
 * `Card` panel surface so it shares radius + elevation with every other panel, and a fixed
 * internal rhythm so a row of them lines up in a grid. The icon is decorative
 * (`aria-hidden`); the app passes `label` and `hint` already translated.
 *
 * @summary KPI tile showing a label, a large value, an optional hint and an optional icon.
 */
export declare function StatCard({ label, value, hint, icon, className }: StatCardProps): React.JSX.Element;
