// Compiles src/tokens.json (the Kuha Ko brand guidelines' tokens) into:
//   dist/tokens.css  CSS custom properties, light theme by default, dark via
//                    prefers-color-scheme or [data-theme="dark"]
//   dist/index.js    the same values as a plain object
//   dist/index.d.ts  types for the object
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function compile(tokens) {
  const themes = tokens.color.themes.map((t) => t.id);
  const [first, ...rest] = themes;
  const colorValue = (token, theme) =>
    typeof token.value === 'string' ? token.value : token.value[theme] ?? token.value[first];

  const colorBlock = (theme) =>
    tokens.color.tokens.map((t) => `  --${t.name}: ${colorValue(t, theme)};`).join('\n');

  const lines = [];
  lines.push('/* Kuha Ko — generated from tokens.json. Edit src/tokens.json, not this file. */');
  lines.push(`:root,\n[data-theme="${first}"] {\n${colorBlock(first)}\n  color-scheme: light;\n}`);
  for (const theme of rest) {
    const block = colorBlock(theme);
    lines.push(
      `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="${first}"]) {\n${block
        .split('\n')
        .map((l) => '  ' + l)
        .join('\n')}\n    color-scheme: dark;\n  }\n}`,
    );
    lines.push(`[data-theme="${theme}"] {\n${block}\n  color-scheme: dark;\n}`);
  }

  const scalars = [];
  for (const t of tokens.spacing.tokens) scalars.push(`  --${t.name}: ${t.value};`);
  for (const t of tokens.radius.tokens) scalars.push(`  --${t.name}: ${t.value};`);
  for (const [key, stack] of Object.entries(tokens.type.families)) scalars.push(`  --font-${key}: ${stack};`);
  lines.push(`:root {\n${scalars.join('\n')}\n}`);

  for (const group of tokens.type.groups) {
    for (const s of group.styles) {
      const family = s.family ?? group.family;
      const decl = [
        `font-family: var(--font-${family});`,
        `font-size: ${s.fontSize};`,
        `line-height: ${s.lineHeight};`,
        `font-weight: ${s.fontWeight};`,
      ];
      if (s.letterSpacing) decl.push(`letter-spacing: ${s.letterSpacing};`);
      if (s.fontStyle) decl.push(`font-style: ${s.fontStyle};`);
      if (group.name === 'Labels' && s.name === 'label') decl.push('text-transform: uppercase;');
      lines.push(`.kk-type-${s.name} {\n  ${decl.join('\n  ')}\n}`);
    }
  }

  const object = {
    themes,
    color: Object.fromEntries(
      tokens.color.tokens.map((t) => [t.name, Object.fromEntries(themes.map((th) => [th, colorValue(t, th)]))]),
    ),
    spacing: Object.fromEntries(tokens.spacing.tokens.map((t) => [t.name, t.value])),
    radius: Object.fromEntries(tokens.radius.tokens.map((t) => [t.name, t.value])),
    fonts: tokens.type.families,
  };

  return { css: lines.join('\n\n') + '\n', object };
}

function typesFor(object) {
  const keys = (o) => Object.keys(o).map((k) => JSON.stringify(k)).join(' | ');
  return `export type ThemeId = ${object.themes.map((t) => JSON.stringify(t)).join(' | ')};
export type ColorToken = ${keys(object.color)};
export type SpacingToken = ${keys(object.spacing)};
export type RadiusToken = ${keys(object.radius)};
export interface KuhaKoTokens {
  themes: ThemeId[];
  color: Record<ColorToken, Record<ThemeId, string>>;
  spacing: Record<SpacingToken, string>;
  radius: Record<RadiusToken, string>;
  fonts: Record<${keys(object.fonts)}, string>;
}
export declare const tokens: KuhaKoTokens;
export default tokens;
`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const tokens = JSON.parse(readFileSync(join(root, 'src/tokens.json'), 'utf8'));
  const { css, object } = compile(tokens);
  mkdirSync(join(root, 'dist'), { recursive: true });
  writeFileSync(join(root, 'dist/tokens.css'), css);
  writeFileSync(
    join(root, 'dist/index.js'),
    `export const tokens = ${JSON.stringify(object, null, 2)};\nexport default tokens;\n`,
  );
  writeFileSync(join(root, 'dist/index.d.ts'), typesFor(object));
  console.log(`tokens: ${Object.keys(object.color).length} colours, ${object.themes.length} themes → dist/`);
}
