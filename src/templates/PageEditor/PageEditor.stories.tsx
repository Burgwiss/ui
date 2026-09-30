import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from '../../atoms/Button';
import { CompletionChecklist } from '../../molecules/CompletionChecklist';
import { InlineText } from '../../molecules/InlineText';
import { PageEditor, type PageEditorDevice } from './PageEditor';

function Demo() {
    const [device, setDevice] = useState<PageEditorDevice>('desktop');
    const [title, setTitle] = useState('Arabisch für Anfänger');
    const [tagline, setTagline] = useState('');
    return (
        <div className="h-svh">
            <PageEditor
                device={device}
                onDeviceChange={setDevice}
                toolbar={
                    <>
                        <span className="flex-1 text-sm font-medium">Kursseite</span>
                        <Button size="sm">Veröffentlichen</Button>
                    </>
                }
                aside={
                    <CompletionChecklist
                        items={[
                            { id: 'title', label: 'Titel', done: !!title },
                            { id: 'tagline', label: 'Kurzbeschreibung', done: !!tagline },
                        ]}
                        labels={{
                            heading: 'Seite',
                            complete: 'alles Nötige da',
                            incomplete: 'Pflichtangaben fehlen',
                            optional: 'optional',
                            done: 'ausgefüllt',
                            missing: 'fehlt',
                        }}
                    />
                }
                labels={{
                    preview: 'Kursseite (Vorschau zum Bearbeiten)',
                    tools: 'Vorschau',
                    desktop: 'Computer',
                    phone: 'Handy',
                    aside: 'Seitenstatus',
                    resizeAside: 'Seitenleiste verbreitern oder verschmälern',
                }}
            >
                <div className="flex flex-col gap-3 p-8">
                    <InlineText
                        as="h1"
                        label="Titel"
                        placeholder="Wie heißt der Kurs?"
                        value={title}
                        onChange={setTitle}
                        className="text-3xl font-bold"
                    />
                    <InlineText
                        label="Kurzbeschreibung"
                        placeholder="Ein Satz für den Katalog"
                        value={tagline}
                        onChange={setTagline}
                    />
                </div>
            </PageEditor>
        </div>
    );
}

/**
 * Edit a page where it stands. The floating toolbar at the bottom switches
 * between computer and phone width; the right panel tracks completeness.
 */
const meta: Meta<typeof PageEditor> = {
    title: 'Templates/PageEditor',
    component: PageEditor,
    parameters: { layout: 'fullscreen' },
};
export default meta;

export const Kursseite: StoryObj<typeof PageEditor> = { render: () => <Demo /> };
