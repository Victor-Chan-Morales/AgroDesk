"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addClient, updateClient, deleteClient } from "@/app/actions/clients"
import { computeClientStats } from "../lib/stats"
import { filterClients } from "../lib/filters"
import { exportClientsCSV } from "../lib/export"
import type { Client } from "../lib/types"

/**
 * Encapsula el estado del módulo de clientes y la orquestación de las
 * server actions (crear/editar/eliminar). El componente visual solo
 * consume lo que este hook expone, sin saber "cómo" se persiste nada.
 */
export function useClientes(initialClients: Client[]) {
  const router = useRouter()

  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clients = initialClients

  const stats = useMemo(() => computeClientStats(clients), [clients])

  const filteredClients = useMemo(
    () => filterClients(clients, { search, dateFilter }),
    [clients, search, dateFilter],
  )

  const handleOpenCreate = () => {
    setEditingClient(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteClient(id)
      if (result.success) {
        toast.success("Cliente eliminado")
        router.refresh()
      } else {
        toast.error(result.error || "Error al eliminar")
      }
    } catch {
      toast.error("Error inesperado")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = editingClient
        ? await updateClient(editingClient.raw_id, formData)
        : await addClient(formData)

      if (result.success) {
        toast.success(`Cliente ${editingClient ? "actualizado" : "creado"} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch {
      toast.error("Error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExport = () => exportClientsCSV(filteredClients)

  return {
    // datos derivados
    stats,
    filteredClients,
    // filtros
    search,
    setSearch,
    dateFilter,
    setDateFilter,
    // modal / formulario
    isModalOpen,
    setIsModalOpen,
    editingClient,
    isSubmitting,
    // acciones
    handleOpenCreate,
    handleOpenEdit,
    handleDelete,
    handleSubmit,
    handleExport,
  }
}
