/**
 * Hands text to the browser as a file download, e.g. a grid's CSV export.
 * Runs only in a browser; does nothing on a server.
 */
export declare function downloadText(text: string, filename: string, type?: string): void;
