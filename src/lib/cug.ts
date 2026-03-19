export function buildCugCandidates(input: string): string[] {
  const raw = String(input ?? "").trim();
  if (!raw) return [];

  // Remove all Unicode whitespace characters (including NBSP) and common separators.
  const compact = raw.replace(/[\s\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, "");
  const digitsOnly = compact.replace(/[^0-9]/g, "");

  const candidates = new Set<string>();
  for (const c of [raw, compact, digitsOnly]) {
    if (!c) continue;
    candidates.add(c);
    // Some systems store identifiers without leading zeros.
    const noLeadingZeros = c.replace(/^0+/, "");
    if (noLeadingZeros) candidates.add(noLeadingZeros);
  }

  return Array.from(candidates);
}

