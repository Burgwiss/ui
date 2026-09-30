/**
 * Hands text to the browser as a file download, e.g. a grid's CSV export.
 * Runs only in a browser; does nothing on a server.
 */
export function downloadText(
    text: string,
    filename: string,
    type = 'text/csv;charset=utf-8',
): void {
    if (typeof document === 'undefined') return;
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Give the browser a moment to start the download before the URL goes away.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
