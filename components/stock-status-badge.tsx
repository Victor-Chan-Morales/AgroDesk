import { Badge } from "@/components/ui/badge"
import type { StockStatus } from "@/lib/inventory/stock"

const severityVariants = {
  normal: "outline",
  warning: "secondary",
  error: "destructive",
} as const satisfies Record<StockStatus["severity"], string>

export function StockStatusBadge({ status }: { status: StockStatus }) {
  return <Badge variant={severityVariants[status.severity]}>{status.label}</Badge>
}
