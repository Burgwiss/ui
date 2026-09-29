/**
 * Flag raw Tailwind colour utilities in Pages/** and Components/**.
 *
 * Use semantic theme tokens (bg-primary, text-accent, border-card, bg-warning,
 * bg-destructive, ...) instead of raw palette utilities (bg-red-500, text-gray-700).
 * See CLAUDE.md → "Theme tokens, not colors".
 *
 * Heuristic: looks at string + template literal nodes that occur inside a JSX
 * className attribute or a clsx()/cn()/cva()/classnames()/twMerge() call.
 */

const COLOR_NAMES = [
    'red',
    'blue',
    'green',
    'gray',
    'grey',
    'yellow',
    'indigo',
    'slate',
    'zinc',
    'neutral',
    'stone',
    'amber',
    'orange',
    'lime',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
].join('|');

const PREFIXES = [
    'bg',
    'text',
    'border',
    'ring',
    'outline',
    'placeholder',
    'from',
    'to',
    'via',
    'fill',
    'stroke',
    'divide',
    'accent',
    'caret',
    'shadow',
    'decoration',
].join('|');

// Matches the bare utility (bg-red-500) OR a variant (hover:bg-red-500, dark:text-gray-700, md:border-blue-200/40).
const PATTERN = new RegExp(
    `(?:^|\\s|:|\\!)(?:${PREFIXES})-(?:${COLOR_NAMES})-\\d{2,3}(?:\\/\\d+)?\\b`,
    'g',
);

const CLASSNAME_HELPERS = new Set(['clsx', 'cn', 'cva', 'classnames', 'twMerge', 'tw']);

function checkString(context, node, raw) {
    if (typeof raw !== 'string') return;
    PATTERN.lastIndex = 0;
    const hits = [];
    let m;
    while ((m = PATTERN.exec(raw)) !== null) {
        hits.push(m[0].trim());
    }
    if (hits.length > 0) {
        context.report({
            node,
            messageId: 'rawColor',
            data: { hits: hits.join(', ') },
        });
    }
}

function isClassNameAttribute(node) {
    let parent = node.parent;
    while (parent) {
        if (parent.type === 'JSXAttribute') {
            const name = parent.name && parent.name.name;
            return name === 'className' || name === 'class';
        }
        if (parent.type === 'CallExpression') {
            const callee = parent.callee;
            const calleeName =
                callee.type === 'Identifier'
                    ? callee.name
                    : callee.type === 'MemberExpression' && callee.property.type === 'Identifier'
                      ? callee.property.name
                      : null;
            if (calleeName && CLASSNAME_HELPERS.has(calleeName)) return true;
        }
        // Stop crawling once we leave the immediate JSX/call context.
        if (
            parent.type === 'BlockStatement' ||
            parent.type === 'Program' ||
            parent.type === 'FunctionDeclaration'
        ) {
            return false;
        }
        parent = parent.parent;
    }
    return false;
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow raw Tailwind palette utilities (bg-red-500, text-gray-700, ...) in Pages and Components. Use semantic theme tokens instead.',
        },
        schema: [],
        messages: {
            rawColor:
                'Raw Tailwind colour utility: {{hits}}. Use a semantic theme token (bg-primary, text-accent, bg-destructive, ...) — see CLAUDE.md.',
        },
    },
    create(context) {
        return {
            Literal(node) {
                if (typeof node.value !== 'string') return;
                if (!isClassNameAttribute(node)) return;
                checkString(context, node, node.value);
            },
            TemplateElement(node) {
                if (!isClassNameAttribute(node)) return;
                checkString(context, node, node.value && node.value.raw);
            },
        };
    },
};
