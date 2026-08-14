// Small hand-written cron -> plain English helper. Covers the common
// patterns used by the seeded scheduled jobs without pulling in a heavy
// npm dependency. Falls back to echoing the raw expression if it can't
// confidently describe it.

function describeField(field: string, unit: string, names?: string[]): string | null {
  if (field === "*") return null;
  if (field.startsWith("*/")) return `every ${field.slice(2)} ${unit}(s)`;
  if (field.includes(",")) {
    const parts = field.split(",");
    const labelled = names ? parts.map((p) => names[Number(p)] ?? p) : parts;
    return `${unit} ${labelled.join(", ")}`;
  }
  if (field.includes("-")) {
    const [a, b] = field.split("-");
    const la = names ? names[Number(a)] ?? a : a;
    const lb = names ? names[Number(b)] ?? b : b;
    return `${unit} ${la} through ${lb}`;
  }
  const label = names ? names[Number(field)] ?? field : field;
  return `${unit} ${label}`;
}

const DOW_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function cronToEnglish(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return expr;
  const [min, hour, dom, month, dow] = parts;

  // Every N minutes
  if (min.startsWith("*/") && hour === "*" && dom === "*" && month === "*" && dow === "*") {
    return `Every ${min.slice(2)} minutes`;
  }

  // Every N hours
  if (min === "0" && hour.startsWith("*/") && dom === "*" && month === "*" && dow === "*") {
    return `Every ${hour.slice(2)} hours`;
  }

  // Daily at HH:MM
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && month === "*" && dow === "*") {
    return `Daily at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }

  // Weekly on day X at HH:MM
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && dom === "*" && month === "*" && /^\d+$/.test(dow)) {
    return `Weekly on ${DOW_NAMES[Number(dow)] ?? dow} at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }

  // Monthly on day D at HH:MM
  if (/^\d+$/.test(min) && /^\d+$/.test(hour) && /^\d+$/.test(dom) && month === "*" && dow === "*") {
    return `Monthly on day ${dom} at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }

  // Generic fallback: describe each non-wildcard field
  const bits = [
    describeField(min, "minute"),
    describeField(hour, "hour"),
    describeField(dom, "day-of-month"),
    describeField(month, "month"),
    describeField(dow, "weekday", DOW_NAMES),
  ].filter(Boolean);

  return bits.length ? bits.join(", ") : expr;
}
