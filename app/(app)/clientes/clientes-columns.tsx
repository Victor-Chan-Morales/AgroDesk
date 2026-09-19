"use client"

import { Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RowActions } from "@/components/row-actions"
import type { Column } from "@/components/data-table"
import type { Client } from "./lib/types"

interface GetClientColumnsParams {
  onEdit: (client: Client) => void
  onDelete: (id: number) => void
}

/**
 * Configuración de columnas de la tabla. Aislada del resto: si cambia
 * el diseño de una columna, solo se toca este archivo.
 */
export function getClientColumns({ onEdit, onDelete }: GetClientColumnsParams): Column<Client>[] {
  return [
    { key: "id", header: "ID", render: (r) => <span className="font-medium">{r.id}</span> },
    { key: "name", header: "Cliente", render: (r) => r.name },
    { key: "nit", header: "NIT", render: (r) => <span className="text-muted-foreground">{r.nit}</span> },
    {
      key: "type",
      header: "Tipo",
      render: (r) => <Badge variant={r.type === "Mayorista" ? "secondary" : "outline"}>{r.type}</Badge>,
    },
    { key: "phone", header: "Telefono", render: (r) => <span className="text-muted-foreground">{r.phone}</span> },
    { key: "purchases", header: "Compras", render: (r) => r.purchases },
    {
      key: "balance",
      header: "Saldo (Q)",
      render: (r) => (
        <span className="font-medium">Q{r.balance.toLocaleString("en", { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      key: "lastPurchase",
      header: "Ult. Compra",
      render: (r) => <span className="text-muted-foreground">{r.lastPurchase}</span>,
    },
    {
      key: "status",
      header: "Estado",
      render: (r) => (
        <Badge variant={r.status === "Mora" ? "destructive" : r.status === "Con Credito" ? "secondary" : "outline"}>
          {r.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <RowActions
          actions={[{ label: "Editar", icon: Pencil, onClick: () => onEdit(r) }]}
          deleteConfig={{
            title: "Eliminar cliente",
            description: "El cliente sera eliminado permanentemente. Esta accion no se puede deshacer.",
            onConfirm: () => onDelete(r.raw_id),
          }}
        />
      ),
    },
  ]
}
