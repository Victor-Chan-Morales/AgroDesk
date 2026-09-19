import type { StockStatus } from "@/lib/inventory/stock"

export interface InventoryLot {
  id_lote: number
  stock_actual: number
  numero_lote: string
  fecha_vencimiento: string | null
}

export interface InventoryProduct {
  no: number
  code: string
  name: string
  desc: string
  supplier: string
  invoice: string
  qty: number
  price: number
  precio_venta: number
  stock_minimo: number
  total: number
  status: StockStatus
  lotes: InventoryLot[]
}
