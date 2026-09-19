"use client"

import { UserCheck, Users } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { DataTable } from "@/components/data-table"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"

import { useClientes } from "./hooks/use-clientes"
import { getClientColumns } from "./clientes-columns"
import { ClientesStats } from "./clientes-stats"
import { ClientesSearchBar, ClientesToolbarActions } from "./clientes-toolbar"
import { ClienteFormDialog } from "./cliente-form-dialog"
import type { Client } from "./lib/types"

/**
 * Componente orquestador: su única responsabilidad es componer las
 * piezas del módulo. No calcula estadísticas, no filtra, no exporta
 * CSV y no sabe cómo se persiste un cliente — todo eso vive en
 * hooks/use-clientes.ts y en lib/.
 */
export function ClientesClient({ initialClients }: { initialClients: Client[] }) {
  const {
    stats,
    filteredClients,
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    isModalOpen,
    setIsModalOpen,
    editingClient,
    isSubmitting,
    handleOpenCreate,
    handleOpenEdit,
    handleDelete,
    handleSubmit,
    handleExport,
  } = useClientes(initialClients)

  const columns = getClientColumns({ onEdit: handleOpenEdit, onDelete: handleDelete })

  return (
    <>
      <PageHeader icon={UserCheck} title="Gestion de Clientes" />

      <ClientesStats stats={stats} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Directorio de Clientes</CardTitle>
          <CardDescription>Registro, historial de compras y estado de cuenta</CardDescription>
          <CardAction>
            <ClientesToolbarActions onExport={handleExport} onCreate={handleOpenCreate} />
          </CardAction>
        </CardHeader>
        <CardContent>
          <ClientesSearchBar
            search={search}
            setSearch={setSearch}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />
          <DataTable
            columns={columns}
            data={filteredClients}
            rowKey={(r) => r.id}
            emptyIcon={Users}
            emptyMessage="No se encontraron clientes."
          />
        </CardContent>
      </Card>

      <ClienteFormDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        client={editingClient}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />
    </>
  )
}
