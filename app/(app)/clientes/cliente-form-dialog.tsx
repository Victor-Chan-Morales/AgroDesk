import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client } from "./lib/types"

interface ClienteFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

/**
 * Formulario de creación/edición de cliente. No sabe cómo se guarda
 * (recibe onSubmit desde el hook) ni cómo se listan los clientes.
 */
export function ClienteFormDialog({ open, onOpenChange, client, isSubmitting, onSubmit }: ClienteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nombre">Nombre Completo</Label>
              <Input id="nombre" name="nombre" required defaultValue={client?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nit">NIT</Label>
              <Input
                id="nit"
                name="nit"
                defaultValue={client?.nit !== "C/F" ? client?.nit : ""}
                placeholder="C/F si esta vacio"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo_cliente">Tipo de Cliente</Label>
              <Select name="tipo_cliente" defaultValue={client?.type || "Minorista"}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Minorista">Minorista</SelectItem>
                  <SelectItem value="Mayorista">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Telefono</Label>
              <Input id="telefono" name="telefono" defaultValue={client?.phone !== "--" ? client?.phone : ""} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="direccion">Direccion</Label>
              <Input id="direccion" name="direccion" defaultValue={client?.address !== "--" ? client?.address : ""} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
