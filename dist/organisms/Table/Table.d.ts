import * as React from 'react';
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
declare function Table({ className, ...props }: React.ComponentProps<'table'>): React.JSX.Element;
/** The `<thead>`: holds the header row of `TableHead` cells. */
declare function TableHeader({ className, ...props }: React.ComponentProps<'thead'>): React.JSX.Element;
/** The `<tbody>`: holds the data rows; the last row has no bottom border. */
declare function TableBody({ className, ...props }: React.ComponentProps<'tbody'>): React.JSX.Element;
/** The `<tfoot>`: a muted, bold row for totals or summaries. */
declare function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>): React.JSX.Element;
/** A `<tr>` with a hover tint; set `data-state="selected"` for the selected style. */
declare function TableRow({ className, ...props }: React.ComponentProps<'tr'>): React.JSX.Element;
/** A `<th>` header cell: small uppercase muted text, left-aligned by default. */
declare function TableHead({ className, ...props }: React.ComponentProps<'th'>): React.JSX.Element;
/** A `<td>` data cell. Add `className="text-right"` (or the matching `TableHead`) for numbers. */
declare function TableCell({ className, ...props }: React.ComponentProps<'td'>): React.JSX.Element;
/** The table's `<caption>` (shown below the table): a visible description of what it lists. */
declare function TableCaption({ className, ...props }: React.ComponentProps<'caption'>): React.JSX.Element;
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
