import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '../../src/atoms/Button';
import { Input } from '../../src/atoms/Input';
import { Badge } from '../../src/atoms/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../src/molecules/Card';
import { installThemeStyles, THEMES } from './themes';

// Docs pages do not run story decorators, so the preset CSS would be missing
// and every sheet would silently show the default theme's values.
if (typeof document !== 'undefined') installThemeStyles();

/* ---------- colour maths: OKLCH → sRGB → WCAG contrast ---------- */

function parseColour(value: string): [number, number, number, number] | null {
    const m = value.match(
        /oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+)(%?))?\s*\)/,
    );
    if (!m) return null;
    const l = Number(m[1]) / (m[2] ? 100 : 1);
    const alpha = m[5] === undefined ? 1 : Number(m[5]) / (m[6] ? 100 : 1);
    const c = Number(m[3]);
    const h = (Number(m[4]) * Math.PI) / 180;
    const a = c * Math.cos(h);
    const b = c * Math.sin(h);
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.291485548 * b;
    const [L, M, S] = [l_ ** 3, m_ ** 3, s_ ** 3];
    const clamp = (x: number) => Math.min(1, Math.max(0, x));
    return [
        clamp(4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S),
        clamp(-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S),
        clamp(-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S),
        alpha,
    ];
}

/** Contrast of two OKLCH colours (linear-light sRGB). Null when not computable (translucent, non-OKLCH). */
export function contrast(fg: string, bg: string): number | null {
    const a = parseColour(fg);
    const b = parseColour(bg);
    if (!a || !b || a[3] < 1 || b[3] < 1) return null;
    const lum = ([r, g, bl]: number[]) => 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
    const [x, y] = [lum(a), lum(b)];
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* ---------- reading a theme's resolved values ---------- */

const COLOUR_GROUPS: { title: string; tokens: string[] }[] = [
    {
        title: 'Flächen',
        tokens: ['background', 'card', 'popover', 'muted', 'secondary', 'border', 'input'],
    },
    {
        title: 'Text',
        tokens: ['foreground', 'card-foreground', 'muted-foreground', 'secondary-foreground'],
    },
    {
        title: 'Marke',
        tokens: [
            'primary',
            'primary-foreground',
            'accent',
            'accent-foreground',
            'accent-strong',
            'ring',
        ],
    },
    {
        title: 'Status',
        tokens: [
            'success',
            'success-tint-foreground',
            'warning',
            'warning-tint-foreground',
            'destructive',
            'destructive-tint-foreground',
        ],
    },
];

/** Text/background pairs a theme must keep readable (AA: 4.5:1 for body text). */
const PAIRS: [string, string, string][] = [
    ['Text auf Hintergrund', 'foreground', 'background'],
    ['Leiser Text auf Hintergrund', 'muted-foreground', 'background'],
    ['Leiser Text auf „muted"', 'muted-foreground', 'muted'],
    ['Knopftext auf Primärfarbe', 'primary-foreground', 'primary'],
    ['Text auf Akzent', 'accent-foreground', 'accent'],
    ['Text auf Rot', 'destructive-foreground', 'destructive'],
];

const OTHER = [
    'radius',
    'font-sans',
    'font-display',
    'font-heading',
    'font-serif',
    'font-mono',
    'heading-1-size',
    'heading-2-size',
    'heading-3-size',
    'heading-4-size',
    'heading-weight',
    'heading-tracking',
    'body-size',
    'section-py',
    'card-p',
    'motion-duration',
    'motion-ease',
];

function useResolved(ref: React.RefObject<HTMLElement | null>, names: string[], deps: unknown[]) {
    const [values, setValues] = useState<Record<string, string>>({});
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        // Fonts and late style sheets can land after first paint; read after a frame.
        const id = requestAnimationFrame(() => {
            const style = getComputedStyle(el);
            setValues(
                Object.fromEntries(names.map((n) => [n, style.getPropertyValue(`--${n}`).trim()])),
            );
        });
        return () => cancelAnimationFrame(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return values;
}

/** A box that wears one theme — light or dark — regardless of the toolbar. */
function Scoped({
    themeId,
    dark = false,
    children,
    className = '',
    innerRef,
}: {
    themeId: string;
    dark?: boolean;
    children: ReactNode;
    className?: string;
    innerRef?: React.Ref<HTMLDivElement>;
}) {
    const theme = THEMES.find((t) => t.id === themeId);
    return (
        <div
            ref={innerRef}
            className={`${theme?.scope ?? ''} theme-scope ${dark ? 'dark' : ''} bg-background text-foreground ${className}`}
            style={{ fontFamily: 'var(--font-sans)' }}
        >
            {children}
        </div>
    );
}

function Swatch({ name, value }: { name: string; value: string }) {
    return (
        <div className="flex items-center gap-3 py-1">
            <span
                className="size-9 shrink-0 rounded-md border border-border"
                style={{ background: `var(--${name})` }}
                aria-hidden="true"
            />
            <span className="min-w-0">
                <code className="block text-xs font-medium">--{name}</code>
                <code className="block truncate text-[11px] text-muted-foreground">
                    {value || '—'}
                </code>
            </span>
        </div>
    );
}

function Palette({ themeId, dark }: { themeId: string; dark: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const all = COLOUR_GROUPS.flatMap((g) => g.tokens);
    const values = useResolved(ref, all, [themeId, dark]);
    return (
        <Scoped
            themeId={themeId}
            dark={dark}
            innerRef={ref}
            className="rounded-xl border border-border p-5"
        >
            <p className="mb-3 text-sm font-semibold">{dark ? 'Dunkel' : 'Hell'}</p>
            <div className="grid gap-5 sm:grid-cols-2">
                {COLOUR_GROUPS.map((g) => (
                    <div key={g.title}>
                        <p className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                            {g.title}
                        </p>
                        {g.tokens.map((t) => (
                            <Swatch key={t} name={t} value={values[t] ?? ''} />
                        ))}
                    </div>
                ))}
            </div>
        </Scoped>
    );
}

function Contrast({ themeId, dark }: { themeId: string; dark: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const names = [...new Set(PAIRS.flatMap(([, a, b]) => [a, b]))];
    const v = useResolved(ref, names, [themeId, dark]);
    return (
        <Scoped
            themeId={themeId}
            dark={dark}
            innerRef={ref}
            className="rounded-xl border border-border p-5"
        >
            <p className="mb-3 text-sm font-semibold">{dark ? 'Dunkel' : 'Hell'}</p>
            <ul className="space-y-2">
                {PAIRS.map(([label, fg, bg]) => {
                    const ratio = v[fg] && v[bg] ? contrast(v[fg], v[bg]) : null;
                    const ok = ratio !== null && ratio >= 4.5;
                    return (
                        <li key={label} className="flex items-center gap-3 text-sm">
                            <span
                                className="flex h-8 w-14 shrink-0 items-center justify-center rounded-md border border-border text-xs font-semibold"
                                style={{ background: `var(--${bg})`, color: `var(--${fg})` }}
                            >
                                Aa
                            </span>
                            <span className="flex-1">{label}</span>
                            <span className="tabular-nums">
                                {ratio === null ? 'n. b.' : `${ratio.toFixed(2)}:1`}
                            </span>
                            <span
                                className={`w-10 text-right text-xs font-semibold ${ratio === null ? 'text-muted-foreground' : ok ? '' : 'text-destructive-tint-foreground'}`}
                            >
                                {ratio === null ? '' : ok ? 'AA' : 'zu wenig'}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </Scoped>
    );
}

function Specimen({ themeId, dark = false }: { themeId: string; dark?: boolean }) {
    return (
        <Scoped
            themeId={themeId}
            dark={dark}
            className="space-y-4 rounded-xl border border-border p-5"
        >
            <h2 className="text-2xl font-semibold">Arabisch für Anfänger</h2>
            <p className="text-muted-foreground">
                In zwölf Wochen liest und schreibst du die arabische Schrift.
            </p>
            <div className="flex flex-wrap items-center gap-2">
                <Button>Jetzt anmelden</Button>
                <Button variant="outline">Mehr erfahren</Button>
                <Badge>Neu</Badge>
            </div>
            <Input readOnly value="name@beispiel.de" aria-label="E-Mail" />
            <Card>
                <CardHeader>
                    <CardTitle>Nächste Stunde</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    Donnerstag, 18:00 · online
                </CardContent>
            </Card>
        </Scoped>
    );
}

function Settings({ themeId }: { themeId: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const v = useResolved(ref, OTHER, [themeId]);
    const row = (label: string, name: string, sample?: ReactNode) => (
        <tr key={name} className="border-b border-border">
            <td className="py-2 pr-4 text-sm">{label}</td>
            <td className="py-2 pr-4">
                <code className="text-xs">--{name}</code>
            </td>
            <td className="py-2 pr-4">
                <code className="text-xs text-muted-foreground">{v[name] || 'nicht gesetzt'}</code>
            </td>
            <td className="py-2">{sample}</td>
        </tr>
    );
    const font = (name: string) => (
        <span style={{ fontFamily: `var(--${name})` }} className="text-base">
            Lektion 3 · Alif bis Ta
        </span>
    );
    return (
        <Scoped
            themeId={themeId}
            innerRef={ref}
            className="overflow-x-auto rounded-xl border border-border p-5"
        >
            <table className="w-full text-left">
                <tbody>
                    {row(
                        'Rundung',
                        'radius',
                        <span className="flex gap-2">
                            {['rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl'].map((r) => (
                                <span
                                    key={r}
                                    className={`size-8 border-2 border-primary ${r}`}
                                    title={r}
                                />
                            ))}
                        </span>,
                    )}
                    {row('Fließtext', 'font-sans', font('font-sans'))}
                    {row('Überschriften', 'font-heading', font('font-heading'))}
                    {row('Serif', 'font-serif', font('font-serif'))}
                    {row('Monospace', 'font-mono', font('font-mono'))}
                    {[1, 2, 3, 4].map((n) =>
                        row(
                            `Überschrift ${n}`,
                            `heading-${n}-size`,
                            <span
                                style={{
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: `var(--heading-${n}-size)`,
                                    fontWeight: 'var(--heading-weight, 600)' as never,
                                }}
                            >
                                Überschrift {n}
                            </span>,
                        ),
                    )}
                    {row('Überschrift-Gewicht', 'heading-weight')}
                    {row('Überschrift-Laufweite', 'heading-tracking')}
                    {row('Textgröße', 'body-size')}
                    {row('Abschnitt-Abstand', 'section-py')}
                    {row('Karten-Innenabstand', 'card-p')}
                    {row('Bewegung: Dauer', 'motion-duration')}
                    {row('Bewegung: Kurve', 'motion-ease')}
                </tbody>
            </table>
        </Scoped>
    );
}

/** Everything about one theme on one page. */
export function ThemeSheet({ themeId }: { themeId: string }) {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return <p>Unbekanntes Theme: {themeId}</p>;
    return (
        <div className="sb-unstyled not-prose space-y-10">
            <p className="text-base">{theme.summary}</p>
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">So sieht es aus</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <Specimen themeId={themeId} />
                    <Specimen themeId={themeId} dark />
                </div>
            </section>
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Farben</h2>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Palette themeId={themeId} dark={false} />
                    <Palette themeId={themeId} dark />
                </div>
            </section>
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Kontrast</h2>
                <p className="text-sm text-muted-foreground">
                    Aus den tatsächlichen Werten berechnet. AA verlangt 4,5:1 für normalen Text. „n.
                    b." heißt: durchscheinende Farbe, so nicht berechenbar.
                </p>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Contrast themeId={themeId} dark={false} />
                    <Contrast themeId={themeId} dark />
                </div>
            </section>
            <section className="space-y-3">
                <h2 className="text-xl font-semibold">Rundung, Schriften, Größen, Bewegung</h2>
                <Settings themeId={themeId} />
            </section>
        </div>
    );
}

/** All themes side by side. */
export function ThemeOverview() {
    return (
        <div className="sb-unstyled not-prose grid gap-6 md:grid-cols-2">
            {THEMES.map((t) => (
                <div key={t.id} className="space-y-2">
                    <p className="font-semibold">{t.title}</p>
                    <p className="text-sm text-muted-foreground">{t.summary}</p>
                    <Specimen themeId={t.id} />
                </div>
            ))}
        </div>
    );
}
