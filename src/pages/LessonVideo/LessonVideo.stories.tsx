import type { Meta, StoryObj } from '@storybook/react-vite';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { linkTo } from '@storybook/addon-links';
import { useState } from 'react';

import { Button } from '../../atoms/Button';
import { InitialsAvatar } from '../../atoms/InitialsAvatar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '../../molecules/Breadcrumb';
import { VideoPlayer } from '../../organisms/VideoPlayer';
import { VIDEO_LABELS_BY_LOCALE } from '../../organisms/VideoPlayer/VideoPlayer.fixtures';
import { useStoryText } from '../../../.storybook/locale';

/**
 * PAGE PROTOTYPE — the student's video lesson (`/my/courses/{course}/lessons/{lesson}`
 * in Burgwiss). Non-functional: example content, no data, no routes. It is here
 * to try designs quickly, built only from package components.
 */

type Progress = 'open' | 'done' | 'last-done';

/** Example copy per Storybook language (Language toolbar); German is the fallback. */
const TEXT = {
    myCourses: { de: 'Meine Kurse', en: 'My courses', ar: 'دوراتي', tr: 'Kurslarım' },
    course: {
        de: 'Arabisch für Anfänger',
        en: 'Arabic for Beginners',
        ar: 'العربية للمبتدئين',
        tr: 'Yeni Başlayanlar için Arapça',
    },
    section: {
        de: 'Woche 1 · Das Alphabet',
        en: 'Week 1 · The alphabet',
        ar: 'الأسبوع 1 · الحروف الهجائية',
        tr: '1. Hafta · Alfabe',
    },
    title: {
        de: 'Lektion 3: Die Buchstaben Alif bis Ta',
        en: 'Lesson 3: The letters Alif to Ta',
        ar: 'الدرس 3: الحروف من الألف إلى التاء',
        tr: "Ders 3: Elif'ten Te'ye harfler",
    },
    summary: {
        de: 'Du lernst die ersten vier Buchstaben, ihre Formen am Wort­anfang, in der Mitte und am Ende, und wie sie klingen.',
        en: 'You learn the first four letters, their forms at the start, middle and end of a word, and how they sound.',
        ar: 'تتعلّم الحروف الأربعة الأولى وأشكالها في أول الكلمة ووسطها وآخرها، وكيف تُنطق.',
        tr: 'İlk dört harfi, kelimenin başında, ortasında ve sonundaki biçimlerini ve nasıl okunduklarını öğreniyorsun.',
    },
    back: { de: 'Zurück zum Kurs', en: 'Back to course', ar: 'العودة إلى الدورة', tr: 'Kursa dön' },
    previous: {
        de: 'Vorherige Lektion',
        en: 'Previous lesson',
        ar: 'الدرس السابق',
        tr: 'Önceki ders',
    },
    markDone: {
        de: 'Als erledigt markieren',
        en: 'Mark as done',
        ar: 'تحديد كمكتمل',
        tr: 'Tamamlandı olarak işaretle',
    },
    next: { de: 'Nächste Lektion', en: 'Next lesson', ar: 'الدرس التالي', tr: 'Sonraki ders' },
    done: { de: 'Erledigt', en: 'Done', ar: 'مكتمل', tr: 'Tamamlandı' },
};

function TopBar() {
    const t = useStoryText();
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background px-4 sm:px-6">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                B
            </span>
            <Breadcrumb className="min-w-0 flex-1">
                <BreadcrumbList>
                    {/* On a phone only the current lesson fits; the path hides. */}
                    <BreadcrumbItem className="hidden sm:inline-flex">
                        <BreadcrumbLink href="#kurse">{t(TEXT.myCourses)}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden sm:inline-flex" />
                    <BreadcrumbItem className="hidden sm:inline-flex">
                        <BreadcrumbLink href="#kurs">{t(TEXT.course)}</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden sm:inline-flex" />
                    <BreadcrumbItem className="min-w-0">
                        <BreadcrumbPage className="truncate">{t(TEXT.title)}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            <InitialsAvatar name="Amina Kaya" size="sm" />
        </header>
    );
}

function ActionBar({ progress, onDone }: { progress: Progress; onDone: () => void }) {
    const t = useStoryText();
    return (
        <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 backdrop-blur">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <Button asChild variant="ghost">
                    <a href="#kurs">{t(TEXT.back)}</a>
                </Button>
                <div className="flex items-center gap-2">
                    {/* Prototype navigation: linkTo opens another story, here the
                        same page as it looks for the neighbouring lesson. */}
                    <Button
                        variant="outline"
                        size="icon"
                        aria-label={t(TEXT.previous)}
                        onClick={linkTo('Pages/Video-Lektion', 'Erledigt')}
                    >
                        <ChevronLeft aria-hidden="true" className="rtl:rotate-180" />
                    </Button>
                    {progress === 'open' && (
                        <Button type="button" onClick={onDone}>
                            <Check aria-hidden="true" />
                            {t(TEXT.markDone)}
                        </Button>
                    )}
                    {progress === 'done' && (
                        <Button onClick={linkTo('Pages/Video-Lektion', 'Noch nicht erledigt')}>
                            {t(TEXT.next)}
                            <ChevronRight aria-hidden="true" className="rtl:rotate-180" />
                        </Button>
                    )}
                    {progress === 'last-done' && (
                        <span
                            role="status"
                            className="inline-flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-sm font-semibold"
                        >
                            <Check aria-hidden="true" className="size-4 shrink-0" />
                            {t(TEXT.done)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function LessonVideoPage({
    initial = 'open',
    src = 'media/sample-lesson.mp4',
}: {
    initial?: Progress;
    src?: string;
}) {
    const [progress, setProgress] = useState<Progress>(initial);
    const t = useStoryText();
    return (
        <div className="flex min-h-svh flex-col bg-background text-foreground">
            <TopBar />
            <main className="flex-1 py-8">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    <header className="space-y-1">
                        <p className="text-sm text-muted-foreground">{t(TEXT.section)}</p>
                        <h1 className="text-3xl font-bold">{t(TEXT.title)}</h1>
                    </header>
                    <VideoPlayer
                        src={src}
                        title={t(TEXT.title)}
                        resumeKey="storybook-page-lesson-3"
                        labels={t(VIDEO_LABELS_BY_LOCALE)}
                    />
                    <p className="text-muted-foreground">{t(TEXT.summary)}</p>
                </div>
            </main>
            <ActionBar progress={progress} onDone={() => setProgress('done')} />
        </div>
    );
}

/**
 * The video lesson a student watches: breadcrumb, title, the player and one
 * action bar pinned to the bottom — back to the course, previous lesson, and
 * a primary that flips from "Als erledigt markieren" to "Nächste Lektion".
 * Click it: the prototype remembers within the story.
 */
const meta: Meta<typeof LessonVideoPage> = {
    title: 'Pages/Video-Lektion',
    component: LessonVideoPage,
    tags: ['prototype'],
    parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof LessonVideoPage>;

export const NichtErledigt: Story = {
    name: 'Noch nicht erledigt',
    render: () => <LessonVideoPage />,
};

export const Erledigt: Story = {
    render: () => <LessonVideoPage initial="done" />,
};

/** The course's last lesson, done: no next lesson, just the badge. */
export const LetzteLektion: Story = {
    name: 'Letzte Lektion, erledigt',
    render: () => <LessonVideoPage initial="last-done" />,
};

/** The signed video link expired before play. */
export const VideoLaedtNicht: Story = {
    name: 'Video lädt nicht',
    render: () => <LessonVideoPage src="media/gibt-es-nicht.mp4" />,
};
