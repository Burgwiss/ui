/**
 * Flag <Button size="icon"> (or <IconButton>) that lacks an aria-label AND a
 * sibling <Tooltip>. Icon-only controls need an accessible name. CLAUDE.md →
 * "Tooltips on every actionable control".
 */

function getAttr(opening, name) {
    return opening.attributes.find(
        (a) => a.type === 'JSXAttribute' && a.name && a.name.name === name,
    );
}

function attrIsTruthyString(attr, value) {
    if (!attr || !attr.value) return false;
    if (attr.value.type === 'Literal') return attr.value.value === value;
    if (attr.value.type === 'JSXExpressionContainer') {
        const expr = attr.value.expression;
        if (expr.type === 'Literal') return expr.value === value;
        if (expr.type === 'TemplateLiteral' && expr.quasis.length === 1) {
            return expr.quasis[0].value.cooked === value;
        }
    }
    return false;
}

function getJsxName(opening) {
    const n = opening.name;
    if (!n) return null;
    if (n.type === 'JSXIdentifier') return n.name;
    if (n.type === 'JSXMemberExpression' && n.property.type === 'JSXIdentifier')
        return n.property.name;
    return null;
}

function isIconButton(opening) {
    const name = getJsxName(opening);
    if (!name) return false;
    if (name === 'IconButton') return true;
    if (name !== 'Button') return false;
    return attrIsTruthyString(getAttr(opening, 'size'), 'icon');
}

function hasTooltipSibling(element) {
    // Climb up until a JSXElement parent — look for a <Tooltip> wrapper or sibling.
    let p = element.parent;
    while (p) {
        if (p.type === 'JSXElement') {
            const name = getJsxName(p.openingElement);
            if (name === 'Tooltip' || name === 'TooltipTrigger' || name === 'TooltipContent')
                return true;
        }
        if (
            p.type === 'Program' ||
            p.type === 'FunctionDeclaration' ||
            p.type === 'ArrowFunctionExpression'
        )
            break;
        p = p.parent;
    }
    return false;
}

export default {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Icon-only buttons must have aria-label and a sibling Tooltip (CLAUDE.md → tooltips convention).',
        },
        schema: [],
        messages: {
            missingLabel:
                'Icon-only <{{name}}> needs an aria-label (and ideally a <Tooltip>) for accessible name. See CLAUDE.md.',
        },
    },
    create(context) {
        return {
            JSXOpeningElement(opening) {
                if (!isIconButton(opening)) return;
                const ariaLabel = getAttr(opening, 'aria-label');
                if (ariaLabel) return; // good
                // <IconButton label="…"> sets aria-label internally — treat as satisfied.
                const name = getJsxName(opening);
                if (name === 'IconButton' && getAttr(opening, 'label')) return;
                // Need at least aria-label OR a Tooltip wrapper.
                if (hasTooltipSibling(opening.parent)) return;
                context.report({
                    node: opening,
                    messageId: 'missingLabel',
                    data: { name: name || 'Button' },
                });
            },
        };
    },
};
