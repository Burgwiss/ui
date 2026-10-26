import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Children,
    isValidElement,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from 'react';

import { Button } from '../../atoms/Button';
import { cn } from '../../lib/cn';
import { fitTileGrid, type TileGridOptions } from '../../lib/tileGrid';

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

const STRIP: TileGridOptions = { minTileWidth: 9, maxPerPage: 6 };

function useRemSize<T extends HTMLElement>() {
    const ref = useRef<T>(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;
        const measure = (width: number, height: number) => {
            const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            setSize({ width: width / rem, height: height / rem });
        };
        const rect = el.getBoundingClientRect();
        measure(rect.width, rect.height);
        const observer = new ResizeObserver(([entry]) => {
            if (entry) measure(entry.contentRect.width, entry.contentRect.height);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return [ref, size] as const;
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
export function VideoStage({
    children,
    featured,
    labels,
    page: pageProp,
    onPageChange,
    grid,
    className,
}: VideoStageProps) {
    const tiles = Children.toArray(children).filter(isValidElement) as ReactElement<{
        style?: CSSProperties;
    }>[];
    const [areaRef, area] = useRemSize<HTMLDivElement>();
    const [ownPage, setOwnPage] = useState(0);
    const options = featured ? { ...STRIP, ...grid } : grid;
    const measured = area.width > 0 && area.height > 0;
    // Before the first measurement (and in a DOM without layout) show one full page
    // unsized, rather than nothing.
    const perPage = options?.maxPerPage ?? 16;
    const fit = measured
        ? fitTileGrid(area.width, area.height, tiles.length, options)
        : {
              pageSize: perPage,
              pages: Math.max(1, Math.ceil(tiles.length / perPage)),
              tileWidth: 0,
              tileHeight: 0,
          };
    const page = Math.min(pageProp ?? ownPage, fit.pages - 1);
    const go = (next: number) => {
        setOwnPage(next);
        onPageChange?.(next);
    };
    const visible = tiles.slice(page * fit.pageSize, (page + 1) * fit.pageSize);

    const pager = fit.pages > 1 && (
        <div
            role="group"
            aria-label={labels.pages}
            className="flex shrink-0 items-center justify-center gap-1"
        >
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={labels.previous}
                disabled={page === 0}
                onClick={() => go(page - 1)}
            >
                <ChevronLeft aria-hidden="true" className="rtl:-scale-x-100" />
            </Button>
            <p
                role="status"
                className="min-w-24 text-center text-sm text-muted-foreground tabular-nums"
            >
                {labels.page(page + 1, fit.pages)}
            </p>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={labels.next}
                disabled={page >= fit.pages - 1}
                onClick={() => go(page + 1)}
            >
                <ChevronRight aria-hidden="true" className="rtl:-scale-x-100" />
            </Button>
        </div>
    );

    const tileArea = (
        <div
            ref={areaRef}
            className={cn(
                'relative flex min-h-0 min-w-0 flex-1 flex-wrap content-center justify-center gap-2',
                featured && 'content-start',
            )}
        >
            {tiles.length === 0 ? (
                <p className="self-center text-sm text-muted-foreground">{labels.empty}</p>
            ) : (
                visible.map((tile) => (
                    // The wrapper takes the size, so a tile need not forward `style`.
                    <div
                        key={tile.key}
                        className="flex [&>*]:size-full"
                        style={
                            measured
                                ? { width: `${fit.tileWidth}rem`, height: `${fit.tileHeight}rem` }
                                : { width: '20rem', aspectRatio: '16 / 9' }
                        }
                    >
                        {tile}
                    </div>
                ))
            )}
        </div>
    );

    return (
        <section
            aria-label={labels.stage}
            className={cn('@container flex h-full min-h-0 w-full flex-col gap-2', className)}
        >
            {pager}
            {featured ? (
                <div className="grid min-h-0 flex-1 grid-rows-[2fr_minmax(6rem,1fr)] gap-2 @5xl:grid-cols-[minmax(0,1fr)_20rem] @5xl:grid-rows-1">
                    <div className="relative min-h-0 min-w-0 overflow-hidden rounded-xl bg-video-surface">
                        {featured}
                    </div>
                    <div className="flex min-h-0 min-w-0">{tileArea}</div>
                </div>
            ) : (
                tileArea
            )}
        </section>
    );
}
