import { type ReactNode } from 'react';
import { type TileGridOptions } from '../../lib/tileGrid';
export interface VideoStageLabels {
    /** The stage's accessible name, e.g. "Meetingbühne". */
    stage: string;
    /** The pager group's name, e.g. "Rasterseiten". */
    pages: string;
    previous: string;
    next: string;
    /** "Seite 1 von 3". */
    page: (current: number, total: number) => string;
    /** Shown when there are no tiles at all. */
    empty: string;
}
export interface VideoStageProps {
    /** The tiles, usually `ParticipantTile`s with a `key` each — your own first. The stage sizes and pages them. */
    children: ReactNode;
    /** A large view that takes the stage: a shared screen. The tiles move to a strip beside it (wide) or below it (narrow). */
    featured?: ReactNode;
    /** Every visible and accessible string. */
    labels: VideoStageLabels;
    /** The page shown (0-based), if you want to control it. Out-of-range pages clamp to the last one. */
    page?: number;
    onPageChange?: (page: number) => void;
    /** Tile sizing, in rem. Defaults: 20rem minimum width, 16:9, 0.5rem gap, 16 per page. */
    grid?: TileGridOptions;
    className?: string;
}
/**
 * The stage of a meeting: lays out video tiles in the largest grid that fits, pages them
 * when there are more than fit (16 at most), and keeps every tile the same size — also on
 * a half-empty last page. Sizes are worked out in rem, so enlarged text gives fewer,
 * larger tiles. Two people sit side by side whenever the width allows.
 *
 * With `featured` (a shared screen) the stage gives that view the room and moves the tiles
 * into a strip: a column on the end side when the stage is at least 64rem wide, a row
 * below it when narrower.
 *
 * The tiles keep their order — nobody jumps around because they spoke. Put your own tile
 * first. The maths is `fitTileGrid`, exported for apps that need the same numbers.
 *
 * @summary Meeting stage: fits video tiles into the largest grid, pages them, and makes room for a shared screen.
 */
export declare function VideoStage({ children, featured, labels, page: pageProp, onPageChange, grid, className, }: VideoStageProps): import("react").JSX.Element;
