// Design-system lint rules, carried over from burgwiss/tools/eslint-rules.
import iconButtonNeedsLabel from './icon-button-needs-label.js';
import noPhysicalDirection from './no-physical-direction.js';
import noTitleOnControls from './no-title-on-controls.js';
import noRawTailwindColors from './no-raw-tailwind-colors.js';
import noTintOnTintForeground from './no-tint-on-tint-foreground.js';
import noUntranslatedJsxText from './no-untranslated-jsx-text.js';

export default {
    rules: {
        'icon-button-needs-label': iconButtonNeedsLabel,
        'no-physical-direction': noPhysicalDirection,
        'no-raw-tailwind-colors': noRawTailwindColors,
        'no-tint-on-tint-foreground': noTintOnTintForeground,
        'no-title-on-controls': noTitleOnControls,
        'no-untranslated-jsx-text': noUntranslatedJsxText,
    },
};
