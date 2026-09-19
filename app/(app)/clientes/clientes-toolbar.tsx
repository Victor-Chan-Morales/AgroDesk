import { Search, Plus, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ClientesSearchBarProps {
  search: string
  setSearch: (value: string) => void
  dateFilter: string
  setDateFilter: (value: string) => void
}

/**
 * Input de búsqueda por texto + filtro por fecha de última compra.
 * Solo UI: recibe estado y setters, no sabe cómo se filtra.
 */
export function ClientesSearchBar({ search, setSearch, dateFilter, setDateFilter }: ClientesSearchBarProps) {
  return (
    <div className="mb-4 flex flex-col sm:flex-row gap-3">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, NIT..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="relative w-full sm:w-auto">
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full sm:w-[200px]"
          title="Filtrar por fecha de última compra"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-medium"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}

interface ClientesToolbarActionsProps {
  onExport: () => void
  onCreate: () => void
}

/**
 * Botones de acción del header de la tarjeta: exportar y crear.
 */
export function ClientesToolbarActions({ onExport, onCreate }: ClientesToolbarActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={onExport}>
        <FileDown className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      <Button size="sm" onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo Cliente
      </Button>
    </div>
  )
}
