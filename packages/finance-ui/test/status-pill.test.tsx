import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusPill } from "../src/StatusPill";

describe("StatusPill", () => {
  it("renders the mapped label for a known status", () => {
    render(<StatusPill status="pending_kyb" />);
    expect(screen.getByText("Pending KYB")).toBeInTheDocument();
  });

  it("falls back to the status name with underscores replaced for an unknown status", () => {
    render(<StatusPill status="some_new_status" />);
    expect(screen.getByText("some new status")).toBeInTheDocument();
  });
});
