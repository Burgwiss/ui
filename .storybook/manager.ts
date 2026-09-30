import { addons } from 'storybook/manager-api';
import { defaultConfig, type TagBadgeParameters } from 'storybook-addon-tag-badges/manager-helpers';

/**
 * Sidebar badges from story tags (storybook-addon-tag-badges). One badge per
 * entry; earlier entries win. Our own tags first, then the addon's defaults
 * (`new`, `beta`, `experimental`, `deprecated`, `outdated`, `danger`, …).
 *
 *   tags: ['prototype']   a Pages prototype — example content, not a component
 *   tags: ['new']         added recently; remove once it has settled
 *   tags: ['deprecated']  still exported, do not use in new code
 */
addons.setConfig({
    tagBadges: [
        {
            tags: 'prototype',
            badge: {
                text: 'Prototyp',
                style: 'purple',
                tooltip: 'Seiten-Prototyp mit Beispielinhalt — kein Baustein, nicht exportiert.',
            },
            display: {
                sidebar: [{ type: 'component', skipInherited: true }],
                toolbar: true,
                mdx: true,
            },
        },
        ...defaultConfig,
    ] satisfies TagBadgeParameters,
});
