import type { Client, ClientFiltersState } from "./types"

/**
 * Filtra clientes por búsqueda (nombre, NIT, ID) y por fecha de última compra.
 * Función pura: fácil de testear con datos de ejemplo, sin renderizar nada.
 */
export function filterClients(clients: Client[], { search, dateFilter }: ClientFiltersState): Client[] {
  const normalizedSearch = search.toLowerCase()

  return clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(normalizedSearch) ||
      c.nit.toLowerCase().includes(normalizedSearch) ||
      c.id.toLowerCase().includes(normalizedSearch)

    const matchesDate = dateFilter ? Boolean(c.lastPurchase && c.lastPurchase.includes(dateFilter)) : true

    return matchesSearch && matchesDate
  })
}
