import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination, pageRange, ELLIPSIS } from "../src/molecules/Pagination";

describe("pageRange", () => {
  it("returns every page when the total fits without ellipses", () => {
    expect(pageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("adds a right ellipsis when near the start", () => {
    expect(pageRange(1, 20)).toEqual([1, 2, ELLIPSIS, 20]);
  });

  it("adds a left ellipsis when near the end", () => {
    expect(pageRange(20, 20)).toEqual([1, ELLIPSIS, 19, 20]);
  });

  it("adds both ellipses when in the middle", () => {
    expect(pageRange(10, 20)).toEqual([1, ELLIPSIS, 9, 10, 11, ELLIPSIS, 20]);
  });

  it("returns an empty array for zero total pages", () => {
    expect(pageRange(1, 0)).toEqual([]);
  });
});

describe("Pagination", () => {
  it("calls onPageChange when a page number is clicked", async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
