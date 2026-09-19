import type { Client, ClientStats } from "./types"

/**
 * Deriva las métricas de negocio a partir de la lista de clientes.
 * Función pura: sin estado, sin dependencias de React.
 */
export function computeClientStats(clients: Client[]): ClientStats {
  const totalClients = clients.length
  const inMora = clients.filter((c) => c.status === "Mora" || c.status === "Con Credito").length
  const totalDebt = clients.reduce((sum, c) => sum + c.balance, 0)
  const wholesaleClients = clients.filter((c) => c.type === "Mayorista").length

  return { totalClients, inMora, totalDebt, wholesaleClients }
}
