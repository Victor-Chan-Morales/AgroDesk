import { UserCheck, Users, AlertTriangle, DollarSign } from "lucide-react"
import { StatCard } from "@/components/stat-card"
import type { ClientStats } from "./lib/types"

/**
 * Solo pinta las 4 tarjetas de estadísticas. No sabe cómo se calculan
 * (eso vive en lib/stats.ts) ni de dónde vienen los datos.
 */
export function ClientesStats({ stats }: { stats: ClientStats }) {
  const { totalClients, wholesaleClients, totalDebt, inMora } = stats

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Clientes" value={totalClients.toString()} icon={Users} subtitle="Clientes registrados" />
      <StatCard
        title="Clientes Mayoristas"
        value={wholesaleClients.toString()}
        icon={UserCheck}
        subtitle="Con precio especial"
      />
      <StatCard
        title="Cuentas por Cobrar"
        value={`Q${totalDebt.toLocaleString("en", { minimumFractionDigits: 2 })}`}
        icon={DollarSign}
        subtitle="Total saldos pendientes"
      />
      <StatCard title="Clientes en Mora" value={inMora.toString()} icon={AlertTriangle} subtitle="Requieren seguimiento" />
    </div>
  )
}
