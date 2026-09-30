import type { Meta, StoryObj } from '@storybook/react-vite';
import { BookOpen, CreditCard, House, Palette, Settings2, Users } from 'lucide-react';
import { useState } from 'react';

import { AppRail, AppRailItem, AppRailSpacer } from './AppRail';

const APPS = [
    { id: 'kurse', label: 'Kurse', icon: BookOpen },
    { id: 'nutzer', label: 'Nutzer', icon: Users },
    { id: 'zahlungen', label: 'Zahlungen', icon: CreditCard },
    { id: 'design', label: 'Design', icon: Palette },
];

function Logo() {
    return (
        <a
            href="#start"
            aria-label="Startseite"
            className="flex size-9 items-center justify-center rounded-lg bg-background text-sm font-bold text-foreground"
        >
            B
        </a>
    );
}

function Demo() {
    const [app, setApp] = useState('kurse');
    return (
        <div className="h-[560px]">
            <AppRail label="Apps" logo={<Logo />}>
                <AppRailItem icon={House} label="Start" href="#start" />
                {APPS.map((a) => (
                    <AppRailItem
                        key={a.id}
                        icon={a.icon}
                        label={a.label}
                        active={app === a.id}
                        onClick={() => setApp(a.id)}
                    />
                ))}
                <AppRailSpacer />
                <AppRailItem
                    icon={Settings2}
                    label="Betrieb"
                    active={app === 'betrieb'}
                    onClick={() => setApp('betrieb')}
                />
            </AppRail>
        </div>
    );
}

const meta: Meta<typeof AppRail> = {
    title: 'Organisms/AppRail',
    component: AppRail,
    parameters: { layout: 'fullscreen' },
};
export default meta;

/** Full rail with logo, a link, switching buttons and a bottom-pinned item: the shape to copy for an app shell. */
export const Standard: StoryObj<typeof AppRail> = { render: () => <Demo /> };
