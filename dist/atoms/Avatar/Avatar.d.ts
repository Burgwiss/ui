import * as React from 'react';
import { Avatar as AvatarPrimitive } from 'radix-ui';
/**
 * A person's picture with a fallback for when it is missing or slow. Compose `Avatar`
 * + `AvatarImage` + `AvatarFallback`: the fallback (initials, an icon) shows until
 * the image has loaded, and stays if it never does. `size` is `sm`, `default` or `lg`.
 * Wrap several in `AvatarGroup` for an overlapping stack (add `AvatarGroupCount` for
 * "+3"), and add `AvatarBadge` for a status dot. If you only have a name and no image,
 * use `InitialsAvatar`.
 *
 * @summary Person's picture with an initials fallback; compose with AvatarImage and AvatarFallback.
 */
declare const Avatar: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarProps & React.RefAttributes<HTMLSpanElement>, "ref"> & {
    /** Diameter: `sm` (24px), `default` (32px) or `lg` (40px). Sub-parts scale with it. */
    size?: "default" | "sm" | "lg";
} & React.RefAttributes<HTMLSpanElement>>;
/** The photo. Give it `src` and `alt`; while loading or on error the sibling `AvatarFallback` shows instead. */
declare const AvatarImage: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarImageProps & React.RefAttributes<HTMLImageElement>, "ref"> & React.RefAttributes<HTMLImageElement>>;
/** What shows until the image loads (usually 1-2 initials); the text is a child, in the app's language. */
declare const AvatarFallback: React.ForwardRefExoticComponent<Omit<AvatarPrimitive.AvatarFallbackProps & React.RefAttributes<HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
/** A small status dot pinned to the bottom-right corner of the `Avatar`; may hold a tiny icon (hidden on `sm`). */
declare const AvatarBadge: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>, "ref"> & React.RefAttributes<HTMLSpanElement>>;
/** Lays several `Avatar`s out in an overlapping row. */
declare const AvatarGroup: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
/** The trailing "+N" bubble of an `AvatarGroup`; pass the text as children. */
declare const AvatarGroupCount: React.ForwardRefExoticComponent<Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & React.RefAttributes<HTMLDivElement>>;
export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount };
