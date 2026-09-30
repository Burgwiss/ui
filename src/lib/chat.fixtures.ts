/**
 * German example labels and data for the chat components' stories. Not part of
 * the public API (nothing exports it from `src/index.ts`) — it exists so the
 * stories of the attachment, message, thread and page components tell one
 * consistent story instead of five slightly different ones.
 */
import type { AttachmentListItem, AttachmentListLabels } from '../molecules/AttachmentList';
import type { ChatComposerLabels } from '../organisms/ChatComposer';
import type { ConversationLabels } from '../organisms/Conversation';
import type { MessageListItem, MessageListLabels } from '../organisms/MessageList';
import type { ThreadListItem, ThreadListLabels } from '../organisms/ThreadList';
import type { ChatPageLabels } from '../templates/ChatPage';

export const formatTimeDe = (iso: string): string =>
    new Date(iso).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin',
    });

export const formatDateTimeDe = (iso: string): string =>
    new Date(iso).toLocaleString('de-DE', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Europe/Berlin',
    });

export const attachmentListLabelsDe: AttachmentListLabels = {
    empty: 'Noch keine Anhänge.',
    download: (name) => `Herunterladen: ${name}`,
    downloadShort: 'Herunterladen',
    remove: (name) => `${name} entfernen`,
    scan: {
        pending: 'Wird geprüft …',
        clean: 'Geprüft',
        infected: 'Infiziert, isoliert',
        error: 'Prüfung fehlgeschlagen',
    },
};

export const messageListLabelsDe: MessageListLabels = {
    log: 'Nachrichten',
    empty: 'Noch keine Nachrichten. Schreib die erste.',
    deleted: 'Diese Nachricht wurde gelöscht.',
    replyPreviewDeleted: 'Ursprüngliche Nachricht gelöscht',
    reply: 'Antworten',
    delete: 'Nachricht löschen',
    loadOlder: 'Ältere Nachrichten laden',
    attachments: attachmentListLabelsDe,
};

export const chatComposerLabelsDe: ChatComposerLabels = {
    message: 'Nachricht schreiben',
    placeholder: 'Nachricht schreiben …',
    send: 'Nachricht senden',
    attach: 'Datei anhängen',
    removeFile: (name) => `${name} entfernen`,
    replyingTo: (name) => `Antwort an ${name}`,
    cancelReply: 'Antwort abbrechen',
    fileTooLarge: (name, max) => `${name} ist größer als ${max} MB.`,
    tooManyFiles: (max) => `Mehr als ${max} Anhänge sind nicht möglich.`,
};

export const conversationLabelsDe: ConversationLabels = {
    messages: messageListLabelsDe,
    composer: chatComposerLabelsDe,
    back: 'Zurück zur Konversationsliste',
};

export const threadListLabelsDe: ThreadListLabels = {
    list: 'Konversationen',
    empty: 'Noch keine Konversationen.',
    unread: 'Ungelesen',
};

export const chatPageLabelsDe: ChatPageLabels = {
    threadList: 'Konversationsliste',
    resize: 'Konversationsliste verbreitern oder verschmälern',
    noConversationTitle: 'Keine Konversation geöffnet',
    noConversationDescription: 'Wähle links eine Konversation, um sie zu lesen und zu antworten.',
};

const worksheet: AttachmentListItem = {
    id: 1,
    name: 'Arbeitsblatt-Woche-3.pdf',
    sizeBytes: 482_304,
    mime: 'application/pdf',
    scanStatus: 'clean',
    downloadUrl: '#arbeitsblatt',
};

/** A conversation between a teacher (Frau Berger) and the reader (`own`). */
export const exampleMessagesDe: MessageListItem[] = [
    {
        id: 1,
        authorName: 'Frau Berger',
        authorBadge: 'Lehrkraft',
        body: 'Hallo Jonas, wie ist die zweite Aufgabe gelaufen?',
        sentAt: '2026-09-29T08:02:00Z',
    },
    {
        id: 2,
        authorName: 'Frau Berger',
        authorBadge: 'Lehrkraft',
        body: 'Falls etwas unklar war, schick mir gern deinen Rechenweg.',
        sentAt: '2026-09-29T08:03:00Z',
    },
    {
        id: 3,
        authorName: 'Jonas Weber',
        own: true,
        body: 'Guten Morgen! Bis zur Hälfte gut, danach bin ich hängen geblieben.',
        sentAt: '2026-09-29T08:20:00Z',
    },
    {
        id: 4,
        authorName: 'Frau Berger',
        authorBadge: 'Lehrkraft',
        body: 'Kein Problem. Hier ist das Arbeitsblatt mit den Lösungswegen.',
        sentAt: '2026-09-29T09:41:00Z',
        attachments: [worksheet],
    },
    {
        id: 5,
        authorName: 'Jonas Weber',
        own: true,
        body: 'Danke, das hilft!',
        sentAt: '2026-09-29T09:45:00Z',
        replyTo: {
            id: 4,
            authorName: 'Frau Berger',
            preview: 'Hier ist das Arbeitsblatt mit den Lösungswegen.',
        },
    },
    {
        id: 6,
        authorName: 'Frau Berger',
        authorBadge: 'Lehrkraft',
        sentAt: '2026-09-29T09:50:00Z',
        deleted: true,
    },
];

export const exampleThreadsDe: ThreadListItem[] = [
    {
        id: 'berger',
        title: 'Frau Berger',
        subtitle: 'Arabisch für Anfänger',
        preview: 'Danke, das hilft!',
        lastActivityAt: '2026-09-29T09:50:00Z',
        unread: true,
    },
    {
        id: 'yilmaz',
        title: 'Herr Yılmaz',
        subtitle: 'Tajweed Grundlagen',
        preview: 'Die Abgabe ist bis Freitag verlängert.',
        lastActivityAt: '2026-09-27T14:12:00Z',
    },
    {
        id: 'sekretariat',
        title: 'Sekretariat',
        preview: 'Deine Teilnahmebescheinigung ist fertig.',
        lastActivityAt: '2026-09-22T10:30:00Z',
    },
];
