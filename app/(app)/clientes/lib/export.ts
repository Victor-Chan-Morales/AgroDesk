import { exportCSV } from "@/lib/export-csv"
import type { Client } from "./types"

/**
 * Conoce el "shape" de columnas que debe llevar el CSV de clientes.
 * Si cambia el formato de exportación, solo se toca este archivo.
 */
export function exportClientsCSV(clients: Client[]) {
  exportCSV(
    "clientes",
    ["ID", "Cliente", "NIT", "Tipo", "Telefono", "Compras", "Saldo", "Ult. Compra", "Estado"],
    clients.map((c) => [c.id, c.name, c.nit, c.type, c.phone, c.purchases, c.balance, c.lastPurchase, c.status]),
  )
}
