import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Amount, formatAmount } from "../src/Amount";

describe("formatAmount", () => {
  it("formats a positive value with 2 decimals and AED by default", () => {
    expect(formatAmount(1234.5)).toMatch(/AED/);
    expect(formatAmount(1234.5)).toMatch(/1,234\.50/);
  });

  it("shows an em dash for null", () => {
    expect(formatAmount(null)).toBe("—");
  });

  it("shows an em dash for undefined", () => {
    expect(formatAmount(undefined)).toBe("—");
  });

  it("accepts a custom currency code", () => {
    expect(formatAmount(10, { currency: "SAR" })).toMatch(/SAR/);
  });
});

describe("Amount", () => {
  it("renders negative values in the danger color when signed", () => {
    render(<Amount value={-50} signed />);
    const el = screen.getByText(/50/);
    expect(el.className).toMatch(/text-danger/);
  });
});
