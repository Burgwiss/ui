/**
 * How many video tiles fit, and how big. Pure maths behind `VideoStage`, exported so an
 * app can page or pre-fetch with the same numbers the stage uses.
 *
 * Every length is in the same unit — the stage measures in rem, so a reader who enlarges
 * the text gets fewer, larger tiles instead of unreadable name labels.
 *
 * The choice, in order: the most tiles per page, then the largest tiles, then the fewest
 * empty cells. Two people sit side by side whenever the width allows it, because a
 * conversation between two reads better as a pair than as a stack.
 */
export interface TileGridOptions {
    /** Narrowest a tile may get before a column is dropped. Default 20 (rem). */
    minTileWidth?: number;
    /** Width ÷ height of a tile. Default 16 / 9. */
    aspect?: number;
    /** Space between tiles. Default 0.5 (rem). */
    gap?: number;
    /** Most tiles on one page. Default 16. */
    maxPerPage?: number;
}

export interface TileGrid {
    columns: number;
    rows: number;
    /** Tiles on a full page; the last page may hold fewer, at the same size. */
    pageSize: number;
    /** Pages needed for every tile (at least 1). */
    pages: number;
    tileWidth: number;
    tileHeight: number;
}

const finite = (n: number) => (Number.isFinite(n) ? Math.max(0, n) : 0);

export function fitTileGrid(
    width: number,
    height: number,
    count: number,
    { minTileWidth = 20, aspect = 16 / 9, gap = 0.5, maxPerPage = 16 }: TileGridOptions = {},
): TileGrid {
    width = finite(width);
    height = finite(height);
    count = Math.floor(finite(count));
    const minWidth = Math.min(minTileWidth, width);

    // Fallback: one tile, as large as the box allows. Width wins over height, so a very
    // flat stage still shows one readable (if letterboxed) tile.
    let best = {
        columns: 1,
        rows: 1,
        pageSize: 1,
        tileWidth: Math.min(width, Math.max(minWidth, height * aspect)),
        tileHeight: Math.min(height, width / aspect),
    };
    let bestSpare = Infinity;

    const maxColumns = Math.min(
        count,
        maxPerPage,
        Math.max(1, Math.floor((width + gap) / (minTileWidth + gap))),
    );
    const maxRows = Math.floor((height + gap) / (minWidth / aspect + gap));

    for (let columns = 1; columns <= maxColumns; columns += 1) {
        const pageSize = Math.min(count, maxPerPage, columns * maxRows);
        if (pageSize < 1) continue;
        const rows = Math.ceil(pageSize / columns);
        const tileWidth = Math.min(
            (width - (columns - 1) * gap) / columns,
            ((height - (rows - 1) * gap) / rows) * aspect,
        );
        if (tileWidth <= 0) continue;
        const spare = columns * rows - pageSize;
        const better =
            pageSize > best.pageSize ||
            (pageSize === best.pageSize &&
                (tileWidth > best.tileWidth ||
                    (tileWidth === best.tileWidth && spare < bestSpare)));
        const pair = count === 2 && pageSize === 2 && columns === 2;
        if (better || pair) {
            best = { columns, rows, pageSize, tileWidth, tileHeight: tileWidth / aspect };
            bestSpare = spare;
        }
    }

    return { ...best, pages: Math.max(1, Math.ceil(count / best.pageSize)) };
}
