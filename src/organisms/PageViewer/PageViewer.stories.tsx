import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { DEVICE_WIDTHS, type DeviceName } from '../../hooks/useFitScale';
import { PageViewer } from './PageViewer';

/** A small standalone page with its own breakpoint, so the device switch visibly changes it. */
const SAMPLE = `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Kursseite</title>
<style>
  body{margin:0;font:16px/1.5 system-ui,sans-serif;color:#1c1c1c}
  header{background:#1f6f8b;color:#fff;padding:48px 32px}
  h1{margin:0 0 8px;font-size:40px}
  main{display:grid;grid-template-columns:2fr 1fr;gap:32px;padding:32px}
  aside{background:#f2f4f5;border-radius:12px;padding:24px}
  a{display:inline-block;background:#1f6f8b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none}
  @media (max-width:700px){main{grid-template-columns:1fr}h1{font-size:28px}}
</style></head><body>
<header><h1>Arabisch für Anfänger</h1><p>12 Wochen · online · ab 1. Oktober</p></header>
<main><section><h2>Was du lernst</h2><p>Die arabische Schrift, Aussprache und einfache Gespräche.</p>
<p>Jede Woche eine Live-Stunde und Übungen für zwischendurch.</p></section>
<aside><p><strong>120 €</strong> für den ganzen Kurs</p><a href="#anmelden">Jetzt anmelden</a></aside></main>
</body></html>`;

const LABELS = {
    loading: 'Seite lädt …',
    failedTitle: 'Die Seite lädt nicht',
    failedBody: 'Sie hat nicht rechtzeitig geantwortet.',
    retry: 'Erneut versuchen',
};

function Demo() {
    const [device, setDevice] = useState<DeviceName>('desktop');
    return (
        <div className="flex h-[620px] flex-col gap-3 p-4">
            <div role="group" aria-label="Gerät" className="flex gap-1">
                {(Object.keys(DEVICE_WIDTHS) as DeviceName[]).map((d) => (
                    <button
                        key={d}
                        type="button"
                        aria-pressed={device === d}
                        onClick={() => setDevice(d)}
                        className="rounded-md border border-border px-3 py-1 text-sm aria-pressed:bg-muted"
                    >
                        {{ mobile: 'Handy', tablet: 'Tablet', desktop: 'Desktop' }[d]} ·{' '}
                        {DEVICE_WIDTHS[d]}px
                    </button>
                ))}
            </div>
            <PageViewer
                title="Vorschau: Kursseite"
                srcDoc={SAMPLE}
                deviceWidth={DEVICE_WIDTHS[device]}
                labels={LABELS}
                className={device === 'desktop' ? 'flex-1' : 'mx-auto w-[360px] flex-1'}
            />
        </div>
    );
}

const meta: Meta<typeof PageViewer> = {
    title: 'Organisms/PageViewer',
    component: PageViewer,
    parameters: { layout: 'fullscreen' },
};
export default meta;

/** Switch device width on one page: shows its breakpoints firing at phone, tablet and desktop widths. */
export const Geraete: StoryObj<typeof PageViewer> = {
    name: 'Geräte',
    render: () => <Demo />,
};

/** Three viewers side by side, the pattern for comparing a page across devices at a glance. */
export const Nebeneinander: StoryObj<typeof PageViewer> = {
    render: () => (
        <div className="grid h-[420px] grid-cols-3 gap-4 p-4">
            {(Object.keys(DEVICE_WIDTHS) as DeviceName[]).map((d) => (
                <PageViewer
                    key={d}
                    title={`Vorschau ${d}`}
                    srcDoc={SAMPLE}
                    deviceWidth={DEVICE_WIDTHS[d]}
                    labels={LABELS}
                />
            ))}
        </div>
    ),
};
