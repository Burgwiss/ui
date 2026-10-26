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
export declare function fitTileGrid(width: number, height: number, count: number, { minTileWidth, aspect, gap, maxPerPage }?: TileGridOptions): TileGrid;
