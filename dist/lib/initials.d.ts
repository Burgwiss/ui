/**
 * First + last initial of a name, upper-cased; falls back to `?` for an empty
 * name. Deterministic + SSR-safe. Shared by `InitialsAvatar` and
 * `TeacherAvatarGroup` (and any other "person disc" surface) so the initials
 * are computed one way everywhere.
 *
 * Examples: "Amira Haddad" → "AH", "Cher" → "C", "Mary Jane Watson" → "MW",
 * "" → "?".
 */
export declare function getInitials(name: string): string;
