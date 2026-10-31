import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compile } from './build.mjs';

const tokens = JSON.parse(readFileSync(new URL('../src/tokens.json', import.meta.url), 'utf8'));

test('every colour token becomes a CSS variable in both themes', () => {
  const { css } = compile(tokens);
  for (const t of tokens.color.tokens) {
    const matches = css.match(new RegExp(`--${t.name}:`, 'g')) ?? [];
    assert.ok(matches.length >= 3, `${t.name} should appear in light, dark media and dark attribute blocks`);
  }
});

function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

test('text colours meet 4.5:1 on their grounds in every theme', () => {
  const { object } = compile(tokens);
  const pairs = [
    ['espresso', 'linen'],
    ['espresso', 'paper'],
    ['ink-muted', 'linen'],
    ['rust', 'linen'],
    ['sage-ink', 'linen'],
    ['on-rust', 'rust'],
    ['on-board', 'board'],
    ['mustard', 'board'],
  ];
  for (const theme of object.themes) {
    for (const [fg, bg] of pairs) {
      const ratio = contrast(object.color[fg][theme], object.color[bg][theme]);
      assert.ok(ratio >= 4.5, `${fg} on ${bg} (${theme}) is ${ratio.toFixed(2)}:1`);
    }
  }
});
