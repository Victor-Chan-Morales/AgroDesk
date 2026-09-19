"use client"

import { useState } from "react"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { DataTable, type Column } from "@/components/data-table"
import { RowActions } from "@/components/row-actions"
import { Package, DollarSign, AlertTriangle, Search, Plus, FileDown, FileSpreadsheet, Pencil } from "lucide-react"
import { StockStatusBadge } from "@/components/stock-status-badge"
import type { InventoryProduct, InventoryLot } from "@/types/inventory"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { addProduct, updateProduct, deleteProduct, adjustLoteStock } from "@/app/actions/inventory"
import { exportCSV } from "@/lib/export-csv"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function InventarioClient({ initialProducts }: { initialProducts: InventoryProduct[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Lotes state
  const [isLotesModalOpen, setIsLotesModalOpen] = useState(false)
  const [selectedProductLotes, setSelectedProductLotes] = useState<InventoryProduct | null>(null)
  const [lotes, setLotes] = useState<InventoryLot[]>([])

  const products = initialProducts
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + p.total, 0)
  const lowStock = products.filter((p) => p.status.needsRestock).length

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleOpenCreate = () => { setEditingProduct(null); setIsModalOpen(true) }
  const handleOpenEdit = (product: InventoryProduct) => { setEditingProduct(product); setIsModalOpen(true) }
  const handleOpenLotes = (product: InventoryProduct) => {
    setSelectedProductLotes(product);
    setLotes(product.lotes || []);
    setIsLotesModalOpen(true);
  }

  const handleDelete = async (id: number) => {
    try {
      const result = await deleteProduct(id)
      if (result.success) { toast.success("Producto eliminado"); router.refresh() }
      else toast.error(result.error || "Error al eliminar")
    } catch { toast.error("Error inesperado") }
  }

  const handleAdjustLote = async (id_lote: number, newStock: number) => {
    try {
      const result = await adjustLoteStock(id_lote, newStock)
      if (result.success) {
        toast.success("Stock actualizado")
        router.refresh()
      } else {
        toast.error(result.error || "Error al actualizar stock")
      }
    } catch { toast.error("Error inesperado") }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = editingProduct
        ? await updateProduct(editingProduct.no, formData)
        : await addProduct(formData)
      if (result.success) {
        toast.success(`Producto ${editingProduct ? "actualizado" : "creado"} exitosamente`)
        setIsModalOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch { toast.error("Error inesperado") }
    finally { setIsSubmitting(false) }
  }

  const handleExportCSV = () => {
    exportCSV("inventario", ["No", "Codigo", "Producto", "Proveedor", "Factura", "Cantidad", "Precio Compra", "Total", "Estado"],
      filteredProducts.map((p) => [p.no, p.code, p.name, p.supplier, p.invoice, p.qty, p.price, p.total, p.status.label]))
  }

  const columns: Column<InventoryProduct>[] = [
    { key: "no", header: "No.", render: (r) => r.no },
    { key: "code", header: "Codigo", render: (r) => <span className="font-medium">{r.code}</span> },
    {
      key: "name", header: "Producto", render: (r) => (
        <div>
          <p className="font-semibold">{r.name}</p>
          <p className="text-xs text-muted-foreground">{r.desc}</p>
          {r.lotes && r.lotes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {r.lotes.map((l, idx) => (
                <span key={idx} className="text-[10px] bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground border">
                  Lote: {l.numero_lote || "S/N"}
                </span>
              ))}
            </div>
          )}
        </div>
      )
    },
    { key: "supplier", header: "Proveedor", render: (r) => <span className="text-muted-foreground">{r.supplier}</span> },
    { key: "invoice", header: "No. Factura", render: (r) => r.invoice },
    { key: "qty", header: "Cantidad", render: (r) => r.qty },
    { key: "price", header: "Precio Compra (Q)", render: (r) => `Q${Number(r.price).toFixed(2)}` },
    { key: "precio_venta", header: "Precio Venta (Q)", render: (r) => <span className="text-primary font-medium">Q{Number(r.precio_venta || 0).toFixed(2)}</span> },
    { key: "total", header: "Total (Q)", render: (r) => <span className="font-medium">Q{Number(r.total).toFixed(2)}</span> },
    {
      key: "status", header: "Estado", render: (r) => (
        <StockStatusBadge status={r.status} />
      )
    },
    {
      key: "actions", header: "", render: (r) => (
        <RowActions
          actions={[
            { label: "Ver Lotes / Ajustar", icon: Package, onClick: () => handleOpenLotes(r) },
            { label: "Editar", icon: Pencil, onClick: () => handleOpenEdit(r) }
          ]}
          deleteConfig={{ title: "Eliminar producto", description: "Esta accion no se puede deshacer. El producto sera eliminado permanentemente.", onConfirm: () => handleDelete(r.no) }}
        />
      )
    },
  ]

  return (
    <>
      <PageHeader icon={Package} title="Gestion de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Productos" value={totalProducts.toString()} icon={Package} />
        <StatCard title="Valor Total" value={`Q${totalValue.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} />
        <StatCard title="Stock Bajo" value={lowStock.toString()} icon={AlertTriangle} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Productos en Inventario</CardTitle>
          <CardDescription>Gestiona tu inventario de productos</CardDescription>
          <CardAction>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button size="sm" onClick={() => router.push('/compras')}>
                <Plus className="mr-2 h-4 w-4" />
                Comprar / Ingresar Nuevo
              </Button>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={columns} data={filteredProducts} rowKey={(r) => r.no} emptyIcon={Package} emptyMessage="No se encontraron productos." />
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Codigo</Label>
                <Input id="codigo" name="codigo" required defaultValue={editingProduct?.code || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre del Producto</Label>
                <Input id="nombre" name="nombre" required defaultValue={editingProduct?.name || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_compra">Precio de Compra</Label>
                <Input id="precio_compra" name="precio_compra" type="number" step="0.01" required defaultValue={editingProduct?.price || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_venta">Precio de Venta</Label>
                <Input id="precio_venta" name="precio_venta" type="number" step="0.01" required defaultValue={editingProduct?.precio_venta || ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_minimo">Stock Minimo</Label>
                <Input id="stock_minimo" name="stock_minimo" type="number" required defaultValue={editingProduct?.stock_minimo || "0"} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : "Guardar"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Lotes */}
      <Dialog open={isLotesModalOpen} onOpenChange={setIsLotesModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lotes del Producto: {selectedProductLotes?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {lotes.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay lotes registrados para este producto.</p>
            ) : (
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Lote</th>
                      <th className="px-4 py-2 text-left font-medium">Vencimiento</th>
                      <th className="px-4 py-2 text-left font-medium">Stock Actual</th>
                      <th className="px-4 py-2 text-right font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lotes.map((lote, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-3">{lote.numero_lote}</td>
                        <td className="px-4 py-3">{lote.fecha_vencimiento || "N/A"}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            className="w-24"
                            defaultValue={lote.stock_actual}
                            onBlur={(e) => {
                              const newVal = parseInt(e.target.value);
                              if (!isNaN(newVal) && newVal !== lote.stock_actual) {
                                handleAdjustLote(lote.id_lote, newVal);
                                const newLotes = [...lotes];
                                newLotes[idx].stock_actual = newVal;
                                setLotes(newLotes);
                              }
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs text-muted-foreground">Editar para guardar</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLotesModalOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
