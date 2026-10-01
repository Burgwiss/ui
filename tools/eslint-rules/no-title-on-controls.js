/**
 * Flag a native `title` on a control — Burgwiss/burgwiss#1648, AGENTS.md rule 4.
 *
 * A native `title` is unstyled, opens after an OS delay, is announced
 * inconsistently, and never appears on touch. On a tablet a control explained
 * only by `title` is not explained at all — and the explanation is usually the
 * thing the user needs ("why can I not click this?"). Use the `tooltip` prop of
 * `Button` (a disabled Button with a tooltip stays focusable so it can say why)
 * or a `Tooltip`.
 *
 * Flagged: native interactive tags, the package's button-like components, and
 * any element given a click handler or an interactive role. Not flagged:
 * `<iframe title>` (its accessible name, required) and component props that
 * merely happen to be called `title` (a dialog's heading).
 */

const NATIVE = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary']);
const COMPONENTS = new Set(['Button', 'IconButton', 'IconToggle', 'CopyLinkButton', 'Chip']);
const ROLES = new Set([
    'button',
    'link',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'option',
    'tab',
    'switch',
    'checkbox',
    'radio',
]);

function getAttr(opening, name) {
    return opening.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name && a.name.name === name,
    );
}

function literal(attr) {
    if (!attr || !attr.value) return null;
    if (attr.value.type === 'Literal') return attr.value.value;
    if (attr.value.type === 'JSXExpressionContainer' && attr.value.expression.type === 'Literal')
        return attr.value.expression.value;
    return null;
}

function getJsxName(opening) {
    const n = opening.name;
    if (n.type === 'JSXIdentifier') return n.name;
    if (n.type === 'JSXMemberExpression' && n.property.type === 'JSXIdentifier')
        return n.property.name;
    return null;
}

function isControl(opening) {
    const name = getJsxName(opening);
    if (!name) return false;
    if (NATIVE.has(name) || COMPONENTS.has(name)) return true;
    if (ROLES.has(literal(getAttr(opening, 'role')))) return true;
    // A lower-case element with a click handler is acting as a control.
    return /^[a-z]/.test(name) && Boolean(getAttr(opening, 'onClick'));
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'No native `title` on a control: it never shows on touch. Use the Button `tooltip` prop or a Tooltip.',
        },
        schema: [],
        messages: {
            nativeTitle:
                '`title` on <{{name}}> never shows on touch and is announced inconsistently. Use the Button `tooltip` prop or a <Tooltip> (AGENTS.md rule 4).',
        },
    },
    create(context) {
        return {
            JSXOpeningElement(opening) {
                if (!getAttr(opening, 'title') || !isControl(opening)) return;
                context.report({
                    node: getAttr(opening, 'title'),
                    messageId: 'nativeTitle',
                    data: { name: getJsxName(opening) },
                });
            },
        };
    },
};
