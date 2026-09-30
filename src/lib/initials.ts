/**
 * First + last initial of a name, upper-cased; falls back to `?` for an empty
 * name. Deterministic + SSR-safe. Shared by `InitialsAvatar` and
 * `TeacherAvatarGroup` (and any other "person disc" surface) so the initials
 * are computed one way everywhere.
 *
 * Examples: "Amira Haddad" → "AH", "Cher" → "C", "Mary Jane Watson" → "MW",
 * "" → "?".
 */
export function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0];
    if (first === undefined) {
        return '?';
    }
    if (parts.length === 1) {
        return first.charAt(0).toUpperCase();
    }
    const last = parts[parts.length - 1] ?? first;
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
}
