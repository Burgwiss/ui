/**
 * Heuristic: flag raw English/German sentence-like text in JSX children.
 *
 * Use Laravel's translation keys via t('...') / useTranslation() — see
 * CLAUDE.md → "Translation keys, not strings".
 *
 * Heuristic (start as warn): a JSX text child whose trimmed value matches
 *   /^[A-ZÄÖÜ][a-zäöüß ,]{2,}/
 * (starts capitalised, looks like a phrase). We deliberately skip:
 *   - text inside <code>, <pre>, <kbd>, <samp>
 *   - text inside <Trans> or any element whose name suggests translation
 *   - single-word labels (require at least one space)
 *   - text containing dots between letters (likely a translation key passed
 *     verbatim) — those have their own runtime check
 */

const SENTENCE_PATTERN = /^[A-ZÄÖÜ][A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß' ,.!?-]{1,}$/;
const RAW_KEY_PATTERN = /\b[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*){2,}\b/; // looks like x.y.z

const SKIP_ELEMENTS = new Set([
    'code',
    'pre',
    'kbd',
    'samp',
    'script',
    'style',
    'Trans',
    'Translation',
]);

function getEnclosingJsxElementName(node) {
    let parent = node.parent;
    while (parent) {
        if (parent.type === 'JSXElement') {
            const opening = parent.openingElement;
            const nameNode = opening && opening.name;
            if (nameNode) {
                if (nameNode.type === 'JSXIdentifier') return nameNode.name;
                if (nameNode.type === 'JSXMemberExpression') {
                    let n = nameNode;
                    while (n.type === 'JSXMemberExpression') n = n.property;
                    if (n.type === 'JSXIdentifier') return n.name;
                }
            }
            return null;
        }
        parent = parent.parent;
    }
    return null;
}

export default {
    meta: {
        type: 'suggestion',
        docs: {
            description:
                'Flag raw English/German sentence-like text in JSX children. Use translation keys via t() / useTranslation().',
        },
        schema: [],
        messages: {
            untranslated:
                'Hardcoded user-facing string: "{{text}}". @burgwiss/ui components never carry their own copy — take the text as a prop (see AGENTS.md).',
        },
    },
    create(context) {
        return {
            JSXText(node) {
                const trimmed = node.value.replace(/\s+/g, ' ').trim();
                if (!trimmed) return;
                if (trimmed.length < 4) return;
                if (RAW_KEY_PATTERN.test(trimmed)) return;
                if (!SENTENCE_PATTERN.test(trimmed)) return;
                // Require at least one whitespace in original (i.e. multi-word) OR a punctuation mark.
                if (!/\s/.test(trimmed) && !/[!?.,]/.test(trimmed)) return;

                const enclosing = getEnclosingJsxElementName(node);
                if (enclosing && SKIP_ELEMENTS.has(enclosing)) return;

                context.report({
                    node,
                    messageId: 'untranslated',
                    data: { text: trimmed.slice(0, 60) },
                });
            },
        };
    },
};
