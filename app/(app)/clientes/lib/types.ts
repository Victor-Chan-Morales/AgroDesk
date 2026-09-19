export interface Client {
  id: string
  raw_id: number
  name: string
  nit: string
  type: "Minorista" | "Mayorista"
  phone: string
  address?: string
  purchases: number
  balance: number
  lastPurchase: string
  status: "Activo" | "Mora" | "Con Credito" | string
}

export interface ClientStats {
  totalClients: number
  inMora: number
  totalDebt: number
  wholesaleClients: number
}

export interface ClientFiltersState {
  search: string
  dateFilter: string
}
