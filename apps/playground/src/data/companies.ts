// 640 fictional companies generated from a seeded mulberry32 PRNG so the
// playground's table data is stable across reloads without a backend.

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(360);

const legalSuffixes = ["Trading LLC", "Holding LLC", "General Trading", "FZ-LLC", "Fintech W.L.L.", "Group LLC"];
const tradingWords = [
  "Falcon", "Desert Rose", "Al Noor", "Palm", "Oryx", "Emirates", "Gulf", "Marina", "Dune", "Crescent",
  "Sapphire", "Horizon", "Pearl", "Zenith", "Orchid", "Amber", "Harbor", "Meridian", "Coral", "Vista",
];
const brandWords = ["Trade", "Works", "Labs", "Ventures", "Partners", "Solutions", "Hub", "Collective", "House", "Studio"];
const firstNames = ["Ahmed", "Fatima", "Omar", "Layla", "Yusuf", "Mariam", "Khalid", "Noura", "Saeed", "Aisha"];
const lastNames = ["Al Mansoori", "Al Suwaidi", "Al Qassimi", "Al Farsi", "Al Zaabi", "Al Hashimi"];

export type CompanyStatus =
  | "active"
  | "approved"
  | "pending"
  | "pending_kyb"
  | "in_review"
  | "signed_up"
  | "draft"
  | "rejected"
  | "declined"
  | "frozen"
  | "cancelled";

const statuses: CompanyStatus[] = [
  "active", "approved", "pending", "pending_kyb", "in_review", "signed_up", "draft", "rejected", "declined", "frozen", "cancelled",
];

export interface Company {
  id: string;
  businessLegalName: string;
  companyTradingName: string;
  name: string;
  status: CompanyStatus;
  acceptedTermsAt: string | null;
  activationTimestamp: string | null;
  annualTurnover: number;
  totalPurchases: number;
  totalPurchases30d: number;
  bankruptcyHistory: boolean;
  totalPurchases90d: number;
  brandName: string;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function randomDate(daysBack: number): string {
  const now = Date.now();
  const past = now - rand() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(past).toISOString();
}

function generateCompany(index: number): Company {
  const trading = `${pick(tradingWords)} ${pick(tradingWords)}`;
  const legal = `${trading} ${pick(legalSuffixes)}`;
  const person = `${pick(firstNames)} ${pick(lastNames)}`;
  const status = pick(statuses);
  const hasAccepted = rand() > 0.2;
  const isActivated = status === "active" || status === "approved";

  return {
    id: `co_${index.toString().padStart(4, "0")}`,
    businessLegalName: legal,
    companyTradingName: trading,
    name: person,
    status,
    acceptedTermsAt: hasAccepted ? randomDate(365) : null,
    activationTimestamp: isActivated ? randomDate(180) : null,
    annualTurnover: Math.round(rand() * 20_000_000),
    totalPurchases: Math.round(rand() * 5_000_000),
    totalPurchases30d: Math.round(rand() * 500_000),
    bankruptcyHistory: rand() > 0.93,
    totalPurchases90d: Math.round(rand() * 1_200_000),
    brandName: `${trading} ${pick(brandWords)}`,
  };
}

export const companies: Company[] = Array.from({ length: 640 }, (_, i) => generateCompany(i + 1));
