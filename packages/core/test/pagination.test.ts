import { describe, expect, it } from "vitest";
import { paginationState } from "../src/index";

describe("paginationState boundaries", () => {
  it.each([
    [1, 20, 1, [1, 2, 3, 4, 5, 6, 7]],
    [10, 20, 10, [7, 8, 9, 10, 11, 12, 13]],
    [20, 20, 20, [14, 15, 16, 17, 18, 19, 20]],
    [99, 3, 3, [1, 2, 3]],
    [-5, 3, 1, [1, 2, 3]],
    [2.9, 3.9, 2, [1, 2, 3]],
    [NaN, 3, 1, [1, 2, 3]],
    [Infinity, 3, 1, [1, 2, 3]],
    [1, 0, 0, []],
    [1, -1, 0, []],
    [1, NaN, 0, []],
    [1, Infinity, 0, []],
  ])("normalizes page %s / total %s", (page, total, current, pages) => {
    const state = paginationState(page as number, total as number);
    expect(state.page).toBe(current);
    expect(state.pages).toEqual(pages);
    expect(state.totalPages).toBe((pages as number[]).length ? Math.floor(total as number) : 0);
  });
  it("bounds huge totals without generating unbounded arrays", () => {
    const state = paginationState(Number.MAX_VALUE, Number.MAX_VALUE);
    expect(state.totalPages).toBe(Number.MAX_SAFE_INTEGER);
    expect(state.page).toBe(Number.MAX_SAFE_INTEGER);
    expect(state.pages).toHaveLength(7);
    expect(state.pages.at(-1)).toBe(state.page);
    expect(new Set(state.pages).size).toBe(7);
  });
});
