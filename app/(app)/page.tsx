import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import {
  LayoutDashboard, Package, AlertTriangle, DollarSign, TrendingUp, ShoppingCart, RefreshCw,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { StockStatusBadge } from "@/components/stock-status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Empty, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { getDashboardData } from "@/app/actions/dashboard"
import Link from "next/link"



export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return (
      <>
        <PageHeader icon={LayoutDashboard} title="Dashboard de Inventario" />
        <div className="flex h-64 items-center justify-center">
          <Alert variant="destructive" className="max-w-md">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al cargar datos</AlertTitle>
            <AlertDescription className="mt-1">
              No se pudieron obtener los datos del dashboard.
              <Link href="/" className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4">
                <RefreshCw className="h-3.5 w-3.5" />
                Reintentar
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader icon={LayoutDashboard} title="Dashboard de Inventario" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Productos" value={data.totalProducts.toString()} icon={Package} subtitle="Productos registrados" />
        <StatCard title="Stock Bajo" value={data.lowStockProductsCount.toString()} icon={AlertTriangle} subtitle="Productos que requieren reabastecimiento" />
        <StatCard title="Valor Total" value={`Q${data.totalValue.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="Valor total del inventario" />
        <StatCard title="Productos Activos" value={data.activeProducts.toString()} icon={TrendingUp} subtitle={`${data.totalProducts > 0 ? Math.round((data.activeProducts / data.totalProducts) * 100) : 0}% del inventario`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatCard title="Ventas Hoy" value={`Q${data.salesToday.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={ShoppingCart} subtitle="En el dia actual" />
        <StatCard title="Ingresos del Mes" value={`Q${data.incomeMonth.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={DollarSign} subtitle="En el mes actual" />
        <StatCard title="Cuentas por Cobrar" value={`Q${data.accountsReceivable.toLocaleString("en", { minimumFractionDigits: 2 })}`} icon={TrendingUp} subtitle={`${data.clientsWithDebt} clientes con mora`} />
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Productos con Stock Bajo</CardTitle>
          <CardDescription>Productos que requieren reabastecimiento</CardDescription>
          <CardAction>
            <Link href="/inventario"><Button variant="default" size="sm">Ver Todos</Button></Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {data.lowStockList.length === 0 ? (
            <Empty className="py-8">
              <EmptyMedia variant="icon"><Package /></EmptyMedia>
              <EmptyTitle>No hay productos con stock bajo.</EmptyTitle>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Stock Actual</TableHead>
                  <TableHead>Stock Minimo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.lowStockList.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell className="text-muted-foreground">{product.category}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>{product.min}</TableCell>
                    <TableCell>
                      <StockStatusBadge status={product.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ventas Recientes</CardTitle>
          <CardDescription>Ultimas transacciones realizadas</CardDescription>
          <CardAction>
            <Link href="/ventas"><Button variant="default" size="sm">Ver Todas</Button></Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {data.recentSalesList.length === 0 ? (
            <Empty className="py-8">
              <EmptyMedia variant="icon"><ShoppingCart /></EmptyMedia>
              <EmptyTitle>No hay ventas registradas.</EmptyTitle>
            </Empty>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Venta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.recentSalesList.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">{sale.id}</TableCell>
                    <TableCell>{sale.client}</TableCell>
                    <TableCell className="font-medium">{sale.total}</TableCell>
                    <TableCell className="text-muted-foreground">{sale.items}</TableCell>
                    <TableCell className="text-muted-foreground">{sale.date}</TableCell>
                    <TableCell>
                      <Badge variant={sale.status === "Completada" ? "outline" : "secondary"}>{sale.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
