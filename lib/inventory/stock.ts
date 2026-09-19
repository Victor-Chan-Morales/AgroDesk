export interface StockContext {
  readonly quantity: number
  readonly minimum: number
}

export interface StockStatus {
  readonly code: string
  readonly label: string
  readonly severity: "normal" | "warning" | "error"
  readonly needsRestock: boolean
}

export interface StockRule {
  readonly matches: (context: StockContext) => boolean
  readonly status: StockStatus
}

// The first matching rule wins; priority belongs to the rule registry.
export function evaluateStock(
  context: StockContext,
  rules: readonly StockRule[],
  fallback: StockStatus,
): StockStatus {
  return rules.find((rule) => rule.matches(context))?.status ?? fallback
}

export function totalStock(
  lots: readonly { stock_actual: number | null }[] | null | undefined,
): number {
  return lots?.reduce((total, lot) => total + (lot.stock_actual ?? 0), 0) ?? 0
}
