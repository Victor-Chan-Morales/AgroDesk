"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateTag, unstable_cache } from "next/cache";
import { classifyStock } from "@/lib/inventory/stock-rules";
import { totalStock, type StockStatus } from "@/lib/inventory/stock";

interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  stock: number;
  min: number;
  status: StockStatus;
}

export const getDashboardData = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    const [productosResult, ventasResult] = await Promise.all([
      supabase.from("productos").select(`
        id_producto, nombre, precio_compra, stock_minimo,
        categorias (nombre),
        lotes (stock_actual)
      `),
      supabase.from("ventas").select(`
        id_venta, total, fecha, estado,
        clientes ( nombre ),
        detalle_ventas ( id_detalle_venta )
      `),
    ]);

    const { data: productos, error: errProd } = productosResult;
    const { data: ventas, error: errVentas } = ventasResult;

    if (errProd || errVentas) {
      console.error("Error fetching dashboard data", errProd, errVentas);
      return null;
    }

    let totalProducts = 0;
    let activeProducts = 0;
    let totalValue = 0;
    let lowStockProductsCount = 0;
    const lowStockList: LowStockProduct[] = [];

    productos?.forEach((p: any) => {
      totalProducts++;
      const stockTotal = totalStock(p.lotes);
      const status = classifyStock({ quantity: stockTotal, minimum: p.stock_minimo });
      if (stockTotal > 0) activeProducts++;
      totalValue += stockTotal * p.precio_compra;

      if (status.needsRestock) {
        lowStockProductsCount++;
        lowStockList.push({
          id: `P-${p.id_producto.toString().padStart(3, "0")}`,
          name: p.nombre || "Producto",
          category: p.categorias?.nombre || "Sin Categoria",
          stock: stockTotal,
          min: p.stock_minimo,
          status,
        });
      }
    });

    let salesToday = 0;
    let incomeMonth = 0;
    let accountsReceivable = 0;
    const clientsWithDebt = new Set<string>();
    const recentSalesList: any[] = [];

    const todayStr = todayStart.toISOString().split("T")[0];
    const sortedVentas = ventas
      ? [...ventas].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      : [];

    sortedVentas.forEach((v: any, index: number) => {
      const saleDateObj = new Date(v.fecha);
      const saleDateStr = saleDateObj.toISOString().split("T")[0];

      if (saleDateStr === todayStr) salesToday += v.total;
      if (saleDateObj >= firstDayOfMonth) incomeMonth += v.total;

      if (v.estado === "Pendiente" || v.estado === "Mora") {
        accountsReceivable += v.total;
        if (v.clientes?.nombre) clientsWithDebt.add(v.clientes.nombre);
      }

      if (index < 5) {
        recentSalesList.push({
          id: `V-${v.id_venta.toString().padStart(4, "0")}`,
          client: v.clientes?.nombre || "C/F",
          total: `Q${v.total.toLocaleString("en", { minimumFractionDigits: 2 })}`,
          items: v.detalle_ventas ? v.detalle_ventas.length : 0,
          date: saleDateStr,
          status: v.estado,
        });
      }
    });

    return {
      totalProducts,
      activeProducts,
      totalValue,
      lowStockProductsCount,
      lowStockList: lowStockList.slice(0, 5),
      salesToday,
      incomeMonth,
      accountsReceivable,
      clientsWithDebt: clientsWithDebt.size,
      recentSalesList,
    };
  },
  ["get-dashboard-data-stock-rules-v1"],
  { revalidate: 60, tags: ["dashboard"] }
);
