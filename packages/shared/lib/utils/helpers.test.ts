import { excludeValuesFromBaseArray, sleep } from './helpers.js';
import { describe, expect, it } from 'vitest';

describe('excludeValuesFromBaseArray', () => {
  it('removes values that appear in the exclude array', () => {
    const result = excludeValuesFromBaseArray(['a', 'b', 'c'] as const, ['b']);
    expect(result).toEqual(['a', 'c']);
  });

  it('returns the base array unchanged when exclude is empty', () => {
    const result = excludeValuesFromBaseArray(['x', 'y'] as const, []);
    expect(result).toEqual(['x', 'y']);
  });

  it('does not mutate the base array', () => {
    const base = ['a', 'b', 'c'];
    excludeValuesFromBaseArray(base, ['b']);
    expect(base).toEqual(['a', 'b', 'c']);
  });
});

describe('sleep', () => {
  it('resolves after the given delay (±slack)', async () => {
    const start = performance.now();
    await sleep(20);
    const elapsed = performance.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(15);
    expect(elapsed).toBeLessThan(200);
  });
});
