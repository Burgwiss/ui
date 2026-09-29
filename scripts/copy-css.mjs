// Ship the CSS as source: the consuming app's Tailwind compiles it together
// with the app's own classes (see src/styles.css for the @source line).
import { cpSync, mkdirSync } from 'node:fs';

mkdirSync('dist/tokens', { recursive: true });
cpSync('src/styles.css', 'dist/styles.css');
cpSync('src/tokens/theme.css', 'dist/tokens/theme.css');
console.log('copied styles.css + tokens/theme.css → dist/');
