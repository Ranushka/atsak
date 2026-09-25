import * as React from "react";
import { cn } from "@qashio/ui";

export interface FormatAmountOptions {
  currency?: string;
  numberingSystem?: "latn" | "arab";
  locale?: string;
  showCurrency?: boolean;
}

/** Formats a monetary amount with Intl, defaulting to 2-decimal AED. */
export function formatAmount(value: number | null | undefined, options: FormatAmountOptions = {}): string {
  if (value === null || value === undefined) return "—";
  const { currency = "AED", numberingSystem = "latn", locale = "en", showCurrency = true } = options;
  const formatter = new Intl.NumberFormat(`${locale}-u-nu-${numberingSystem}`, {
    style: showCurrency ? "currency" : "decimal",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(value);
}

export interface AmountProps extends FormatAmountOptions {
  value: number | null | undefined;
  signed?: boolean;
  className?: string;
}

/** Always LTR-isolated so digits and the currency symbol read correctly in RTL contexts. */
export function Amount({ value, signed, className, ...options }: AmountProps) {
  const text = formatAmount(value, options);
  const isNegative = signed && typeof value === "number" && value < 0;
  const isPositive = signed && typeof value === "number" && value > 0;

  return (
    <span
      dir="ltr"
      className={cn(
        "tabular-nums",
        isNegative && "text-danger",
        isPositive && "text-success",
        className
      )}
    >
      {text}
    </span>
  );
}

/* __DOC
<Finance.Amount value={125430.5} />
<Finance.Amount value={-4200} signed />
<Finance.Amount value={null} />
DOC__ */
