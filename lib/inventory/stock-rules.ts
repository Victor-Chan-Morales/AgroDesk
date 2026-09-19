import { evaluateStock, type StockContext, type StockRule, type StockStatus } from "./stock"

export const normalStockStatus: StockStatus = {
  code: "normal", label: "Normal", severity: "normal", needsRestock: false,
}

// Register new rules here, before any broader rule that could also match.
export const stockRules: readonly StockRule[] = [
  {
    matches: ({ quantity }) => quantity === 0,
    status: { code: "out-of-stock", label: "Agotado", severity: "error", needsRestock: true },
  },
  {
    matches: ({ quantity, minimum }) => quantity <= minimum,
    status: { code: "critical", label: "Critico", severity: "error", needsRestock: true },
  },
  {
    matches: ({ quantity, minimum }) => quantity <= minimum * 1.5,
    status: { code: "low", label: "Bajo", severity: "warning", needsRestock: true },
  },
]

export function classifyStock(context: StockContext): StockStatus {
  return evaluateStock(context, stockRules, normalStockStatus)
}
