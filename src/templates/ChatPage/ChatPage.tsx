import { MessagesSquare } from 'lucide-react';
import type { ReactNode } from 'react';

import { EmptyState } from '../../molecules/EmptyState';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '../../organisms/Sidebar';
import { SidebarLayout } from '../SidebarLayout';

export interface ChatPageLabels {
    /** Accessible name of the side panel with the list of conversations. */
    threadList: string;
    /** Name of the drag handle between the two panes, e.g. `Konversationsliste verbreitern oder verschmälern`. */
    resize: string;
    /** Heading of the empty state shown while no conversation is open. */
    noConversationTitle: string;
    /** One supporting sentence under it. */
    noConversationDescription?: string;
}

export interface ChatPageProps {
    /** The list of conversations — usually a `ThreadList`. It scrolls on its own. */
    threadList: ReactNode;
    /** Above the list: a heading, a search field, a "new conversation" button. */
    threadListHeader?: ReactNode;
    /** Below the list. */
    threadListFooter?: ReactNode;
    /**
     * The open conversation — usually a `Conversation`, keyed by its id. Leave
     * it out (or pass `null`) while none is open and the empty state shows.
     */
    conversation?: ReactNode;
    /** A next step in the empty state, e.g. a "start a conversation" button. */
    emptyAction?: ReactNode;
    /** All visible text of the page, in the app's language. */
    labels: ChatPageLabels;
    /** Remember the width of the list under this name, e.g. `'messages'`. */
    resizeStorageKey?: string;
    /** Starting width of the list in px. Default 320. */
    defaultThreadListWidth?: number;
    /** Extra classes merged onto the page root (it fills the height it is given). */
    className?: string;
}

/**
 * The page template for messaging: the list of conversations on the left in a
 * resizable side panel, the open conversation on the right, an empty state while none
 * is open. Pass a `ThreadList` as `threadList` and a `Conversation` as `conversation`.
 * It holds no data and no text of its own — the app hands in the list, the
 * conversation and the words (`labels`).
 *
 * It fills the height it is given. From `md` up both panes are side by side;
 * on a narrow screen they are two screens: the list until a conversation is
 * open, then the conversation alone (give `Conversation` an `onBack` to return).
 *
 * @summary Messaging page: resizable conversation list beside the open conversation, with an empty state.
 */
export function ChatPage({
    threadList,
    threadListHeader,
    threadListFooter,
    conversation,
    emptyAction,
    labels,
    resizeStorageKey,
    defaultThreadListWidth = 320,
    className,
}: ChatPageProps) {
    const open = conversation !== undefined && conversation !== null && conversation !== false;

    return (
        <SidebarLayout
            className={className}
            sidebar={
                <Sidebar
                    label={labels.threadList}
                    defaultWidth={defaultThreadListWidth}
                    resize={{ label: labels.resize, storageKey: resizeStorageKey, minWidth: 240 }}
                    // Narrow screens: the list is the whole screen, or hidden behind an open conversation.
                    className={open ? 'max-md:hidden' : 'max-md:w-full!'}
                >
                    {threadListHeader && <SidebarHeader>{threadListHeader}</SidebarHeader>}
                    <SidebarContent>{threadList}</SidebarContent>
                    {threadListFooter && <SidebarFooter>{threadListFooter}</SidebarFooter>}
                </Sidebar>
            }
        >
            {open ? (
                <div className="h-full min-h-0">{conversation}</div>
            ) : (
                <div className="flex h-full items-center justify-center p-6 max-md:hidden">
                    <EmptyState
                        icon={MessagesSquare}
                        title={labels.noConversationTitle}
                        description={labels.noConversationDescription}
                        action={emptyAction}
                        className="border-0 bg-transparent"
                    />
                </div>
            )}
        </SidebarLayout>
    );
}
