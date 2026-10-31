// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { splitSql } from './migrate';

describe('splitSql', () => {
  it('splits on semicolons and drops comments', () => {
    expect(splitSql('-- hi\nCREATE TABLE a (x int); -- trailing\nSELECT 1;\n')).toEqual(['CREATE TABLE a (x int)', 'SELECT 1']);
  });
  it('keeps function bodies whole', () => {
    const parts = splitSql(readFileSync(new URL('./migrations/002_orders.sql', import.meta.url), 'utf8'));
    expect(parts.filter((p) => p.startsWith('CREATE FUNCTION'))).toHaveLength(2);
    expect(parts.find((p) => p.includes('reserve_stock'))).toMatch(/END;\n\$\$$/);
    expect(parts).toHaveLength(7);
  });
});
