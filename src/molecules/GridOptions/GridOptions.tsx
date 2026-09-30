import { Columns3, EllipsisVertical, RotateCcw } from 'lucide-react';

import { Button } from '../../atoms/Button';
import type { GridDensity, GridPreferencesApi } from '../../hooks';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '../DropdownMenu';

export interface GridOptionsColumn {
    /** Stable column id; the key under which visibility is stored and the argument to `preferences.isColumnVisible`. */
    id: string;
    /** Visible name of the column in the "Columns" submenu, already translated. */
    label: string;
    /** False for the column that names the row — a grid without it is unreadable. */
    hideable?: boolean;
}

export interface GridOptionsProps {
    /** `grid.preferences` from `useGrid`, or `useGridPreferences(id)` on its own. */
    preferences: GridPreferencesApi;
    /** The columns the person may show or hide, in menu order. */
    columns: GridOptionsColumn[];
    /** Offer the "select rows" switch. Pass `grid.allowedMode !== 'none'`. */
    canSelect?: boolean;
    /** All visible text of the menu, in the app's language (required). */
    labels: {
        /** The ⋮ button's name and tooltip, e.g. "Tabellenoptionen". */
        trigger: string;
        /** Label of the submenu that lists the column checkboxes, e.g. "Spalten". */
        columns: string;
        /** Heading above the row-height choices, e.g. "Zeilenhöhe". */
        density: string;
        /** Radio option for the roomier row height. */
        comfortable: string;
        /** Radio option for the tighter row height. */
        compact: string;
        /** e.g. "Zeilen auswählen". */
        selection: string;
        /** Menu entry that restores column, density and selection defaults; disabled when nothing differs. */
        reset: string;
    };
}

/**
 * The ⋮ menu at the right end of a grid toolbar: which columns show (a
 * submenu), how dense the rows are, whether rows can be selected, and a way
 * back to the defaults. Every choice is remembered per grid (in localStorage under
 * `burgwiss-ui:grid:<gridId>`, so it survives a reload). It holds no state of its
 * own: pass the `preferences` object from `useGrid` (or `useGridPreferences`). For a
 * generic actions menu use `DropdownMenu`.
 *
 * @summary Grid toolbar options menu for column visibility, row density, row selection and reset.
 */
export function GridOptions({ preferences, columns, canSelect = false, labels }: GridOptionsProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label={labels.trigger}
                    className="text-muted-foreground"
                >
                    <EllipsisVertical aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Columns3 className="size-4 text-muted-foreground" aria-hidden="true" />
                        {labels.columns}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-52">
                        {columns.map((column) => (
                            <DropdownMenuCheckboxItem
                                key={column.id}
                                checked={preferences.isColumnVisible(column.id)}
                                disabled={column.hideable === false}
                                onCheckedChange={(visible) =>
                                    preferences.setColumnVisible(column.id, visible === true)
                                }
                                // Keep the menu open: people hide several columns at once.
                                onSelect={(event) => event.preventDefault()}
                            >
                                {column.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{labels.density}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={preferences.values.density}
                    onValueChange={(value) => preferences.setDensity(value as GridDensity)}
                >
                    <DropdownMenuRadioItem value="comfortable">
                        {labels.comfortable}
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="compact">{labels.compact}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                {canSelect && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                            checked={preferences.values.selection}
                            onCheckedChange={(on) => preferences.setSelectionEnabled(on === true)}
                        >
                            {labels.selection}
                        </DropdownMenuCheckboxItem>
                    </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    disabled={preferences.isDefault}
                    onSelect={() => preferences.reset()}
                >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    {labels.reset}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
