/**
 * Flag tint-on-tint text: a SOLID status token (`text-success`) used on the
 * matching tint background (`bg-success/10`) in the same className.
 *
 * The solid `text-{tone}` token is meant for a SOLID `bg-{tone}` fill. On a
 * `bg-{tone}/NN` tint it fails WCAG AA color-contrast — the status tones sit
 * at mid lightness, so the solid token on its own 10% tint lands around
 * 2.5–4:1 (e.g. the StatusBadge "Paid" pill was 2.58:1). jsdom/Vitest axe
 * cannot catch this (no layout → it skips color-contrast), so the bug ships
 * green. See CLAUDE.md → "Theme tokens, not colors".
 *
 * Fix: use the dedicated on-tint token `text-{tone}-tint-foreground`
 * (theme-aware, ≥4.5:1 on the tint in both light and dark).
 *
 * Scope is deliberately the three brand-INDEPENDENT status tones
 * (success / warning / destructive). primary / accent / secondary are
 * per-school themed at arbitrary lightness, so static analysis can't judge
 * their tint contrast — that is the per-theme runtime contrast check's job.
 *
 * Heuristic mirrors no-raw-tailwind-colors: inspect string + template-literal
 * nodes inside a className attribute or a clsx/cn/cva/twMerge call.
 */

const TONES = ['success', 'warning', 'destructive'];
const TONE_GROUP = TONES.join('|');

// `bg-success/10`, `dark:bg-warning/20`, `!bg-destructive/5` — tint background.
const TINT_BG = new RegExp(`^(?:[a-z-]+:)*!?bg-(${TONE_GROUP})\\/\\d+$`);
// `text-success`, `hover:text-warning`, `text-destructive/80` — SOLID token.
// `text-success-foreground` / `text-success-tint-foreground` do NOT match
// (the trailing `-foreground` segment breaks the anchored group).
const SOLID_TEXT = new RegExp(`^(?:[a-z-]+:)*!?text-(${TONE_GROUP})(?:\\/\\d+)?$`);

const CLASSNAME_HELPERS = new Set(['clsx', 'cn', 'cva', 'classnames', 'twMerge', 'tw']);

function checkString(context, node, raw) {
    if (typeof raw !== 'string') return;
    const tokens = raw.split(/\s+/).filter(Boolean);
    const tintTones = new Set();
    const textTones = new Set();
    for (const token of tokens) {
        const bg = TINT_BG.exec(token);
        if (bg) tintTones.add(bg[1]);
        const tx = SOLID_TEXT.exec(token);
        if (tx) textTones.add(tx[1]);
    }
    const offenders = [...textTones].filter((t) => tintTones.has(t));
    for (const tone of offenders) {
        context.report({
            node,
            messageId: 'tintOnTint',
            data: { tone },
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
                'Disallow the solid text-{tone} status token on the matching bg-{tone}/NN tint (fails WCAG AA contrast). Use text-{tone}-tint-foreground.',
        },
        schema: [],
        messages: {
            tintOnTint:
                'Tint-on-tint contrast risk: `text-{{tone}}` (solid fill token) on `bg-{{tone}}/NN` fails WCAG AA. Use `text-{{tone}}-tint-foreground` — see CLAUDE.md → "Theme tokens".',
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
