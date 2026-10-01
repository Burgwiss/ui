/**
 * Flag a physical-direction Tailwind class: `ml-2`, `pr-4`, `left-0`,
 * `text-left`, `border-r`, `rounded-bl-md`, `slide-in-from-left`…
 *
 * Every component must work right-to-left (AGENTS.md rule 8). A physical class
 * pins one side whatever the reading direction, so under `dir="rtl"` the gap,
 * the badge or the border lands on the wrong edge. Use the logical class —
 * `ms-2`, `pe-4`, `start-0`, `text-start`, `border-e`, `rounded-es-md`,
 * `slide-in-from-start` — which follows `dir`.
 *
 * Allowed: centring (`left-1/2` with a translate is symmetric), anything under
 * an explicit `rtl:` or `ltr:` variant, and — with an eslint-disable comment
 * saying why — an island that is deliberately left-to-right in every language
 * (a media timeline).
 */

const PHYSICAL =
    /^-?(?:(?:m|p|scroll-m|scroll-p)[lr]-|(?:left|right)-(?!1\/2$)(?=\d|\[|\(|px$|full$|auto$)|text-(?:left|right)$|border-[lr](?:$|-)|rounded-(?:[lr]|tl|tr|bl|br)(?:$|-)|(?:slide-in-from|slide-out-to)-(?:left|right)(?:$|-)|origin-(?:left|right)$|float-(?:left|right)$|clear-(?:left|right)$)/;

/** The utility after the last variant colon that sits outside brackets. */
function utility(token) {
    let depth = 0;
    let cut = 0;
    for (let i = 0; i < token.length; i++) {
        const c = token[i];
        if (c === '[' || c === '(') depth++;
        else if (c === ']' || c === ')') depth--;
        else if (c === ':' && depth === 0) cut = i + 1;
    }
    return { variants: token.slice(0, cut), base: token.slice(cut).replace(/^!/, '') };
}

function offending(text) {
    return text
        .split(/\s+/)
        .filter(Boolean)
        .filter((token) => {
            const { variants, base } = utility(token);
            if (/(^|:)(rtl|ltr):/.test(variants)) return false;
            return PHYSICAL.test(base);
        });
}

const LOGICAL = {
    ml: 'ms',
    mr: 'me',
    pl: 'ps',
    pr: 'pe',
    left: 'start',
    right: 'end',
};

export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Use logical (start/end) Tailwind classes, not left/right ones, so components work right-to-left.',
        },
        schema: [],
        messages: {
            physical:
                '`{{token}}` pins a physical side and breaks right-to-left. Use the logical class (ms/me, ps/pe, start/end, text-start, border-s/e, rounded-s/e/ss/se/es/ee, slide-*-start/end).',
        },
    },
    create(context) {
        function check(node, text) {
            for (const token of offending(text)) {
                context.report({ node, messageId: 'physical', data: { token } });
            }
        }
        return {
            Literal(node) {
                if (typeof node.value === 'string') check(node, node.value);
            },
            TemplateElement(node) {
                check(node, node.value.cooked ?? '');
            },
        };
    },
};

export { LOGICAL, offending };
