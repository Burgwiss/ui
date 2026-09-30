import * as React from 'react';

import { cn } from '../../lib/cn';

/**
 * A styled semantic HTML table (not a data grid): compose it as `Table` >
 * `TableHeader` / `TableBody` / `TableFooter` > `TableRow` > `TableHead` /
 * `TableCell`, with an optional `TableCaption`. It wraps the `<table>` in a
 * horizontally scrolling container, but has no sorting, selection state,
 * pagination or virtualisation of its own. Mark a row selected with
 * `data-state="selected"`. For a full-page list with actions use the grid
 * pieces (`GridActions`, `GridFooter`) around it.
 *
 * All parts take the props of their HTML element; `className` on `Table` goes to the `<table>`.
 *
 * @summary Styled, composable semantic table parts for static tabular data.
 */
function Table({ className, ...props }: React.ComponentProps<'table'>) {
    return (
        <div data-slot="table-container" className="relative w-full overflow-x-auto">
            <table
                data-slot="table"
                className={cn('w-full caption-bottom text-sm', className)}
                {...props}
            />
        </div>
    );
}

/** The `<thead>`: holds the header row of `TableHead` cells. */
function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return (
        <thead
            data-slot="table-header"
            className={cn('[&_tr]:border-b [&_tr]:border-border', className)}
            {...props}
        />
    );
}

/** The `<tbody>`: holds the data rows; the last row has no bottom border. */
function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot="table-body"
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
}

/** The `<tfoot>`: a muted, bold row for totals or summaries. */
function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot="table-footer"
            className={cn(
                'border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0',
                className,
            )}
            {...props}
        />
    );
}

/** A `<tr>` with a hover tint; set `data-state="selected"` for the selected style. */
function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot="table-row"
            className={cn(
                'border-b border-border transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
                className,
            )}
            {...props}
        />
    );
}

/** A `<th>` header cell: small uppercase muted text, left-aligned by default. */
function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
    return (
        <th
            data-slot="table-head"
            className={cn(
                'h-10 px-3 text-left align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase [&:has([role=checkbox])]:pr-0',
                className,
            )}
            {...props}
        />
    );
}

/** A `<td>` data cell. Add `className="text-right"` (or the matching `TableHead`) for numbers. */
function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    return (
        <td
            data-slot="table-cell"
            className={cn('p-3 align-middle [&:has([role=checkbox])]:pr-0', className)}
            {...props}
        />
    );
}

/** The table's `<caption>` (shown below the table): a visible description of what it lists. */
function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot="table-caption"
            className={cn('mt-4 text-sm text-muted-foreground', className)}
            {...props}
        />
    );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
