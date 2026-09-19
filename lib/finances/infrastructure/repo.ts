import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ICashRegisterRepository, TransactionItem, CashClosingRecord, CashSession, CashTotals } from "../domain/types";

export class SupabaseCashRegisterRepository implements ICashRegisterRepository {
  async getTransactions(): Promise<TransactionItem[]> {
    const supabase = createAdminClient();
    const [ventasRes, pagosRes] = await Promise.all([
      supabase.from("ventas").select("id_venta, fecha, total, estado, clientes ( nombre )"),
      supabase.from("pagos_proveedores").select("id_pago, fecha_pago, monto_pagado, metodo_pago, referencia, compras ( proveedores ( nombre ) )"),
    ]);

    const items: TransactionItem[] = [];

    ventasRes.data?.forEach((v: any) => {
      items.push({
        id: `TX-V${String(v.id_venta).padStart(4, "0")}`,
        date: new Date(v.fecha).toISOString().split("T")[0],
        type: "Ingreso",
        concept: `Venta V-${v.id_venta} - ${v.clientes?.nombre || "C/F"}`,
        amount: Number(v.total),
        method: "Efectivo",
        ref: `V-${v.id_venta}`,
        status: v.estado,
      });
    });

    pagosRes.data?.forEach((p: any) => {
      const prov = p.compras?.proveedores?.nombre || "Proveedor";
      items.push({
        id: `TX-P${String(p.id_pago).padStart(4, "0")}`,
        date: new Date(p.fecha_pago).toISOString().split("T")[0],
        type: "Egreso",
        concept: `Pago Proveedor ${prov}`,
        amount: Number(p.monto_pagado),
        method: p.metodo_pago,
        ref: p.referencia || `PG-${p.id_pago}`,
      });
    });

    return items;
  }

  async getCashClosings(): Promise<CashClosingRecord[]> {
    const supabase = createAdminClient();
    const { data } = await supabase.from("cierres_caja").select("*").order("fecha_cierre", { ascending: false });

    return (data || []).map((c: any) => ({
      id: c.id_cierre,
      fechaApertura: c.fecha_apertura,
      date: c.fecha_cierre,
      opening: c.monto_inicial || 0,
      sales: c.total_ventas || 0,
      expenses: c.total_egresos || 0,
      expected: c.monto_esperado || 0,
      real: c.monto_real || 0,
      difference: c.diferencia || 0,
      status: c.estado || "Cerrada",
    }));
  }

  async getActiveSession(): Promise<CashSession | null> {
    const supabase = await createClient();
    const { data } = await supabase.from("cierres_caja").select("*").eq("estado", "Abierta").limit(1);
    if (!data || data.length === 0) return null;

    return {
      idCierre: data[0].id_cierre,
      montoInicial: Number(data[0].monto_inicial),
      fechaApertura: data[0].fecha_apertura,
      estado: data[0].estado,
    };
  }

  async createSession(userId: string, initialAmount: number): Promise<{ id: number }> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("cierres_caja").insert([{
      monto_inicial: initialAmount,
      estado: "Abierta",
      id_usuario: userId,
    }]).select("id_cierre").single();

    if (error) throw error;
    return { id: data.id_cierre };
  }

async getIntervalTotals(startIso: string, endIso: string): Promise<CashTotals> {
    const supabase = await createClient();
    const [ventas, pagos] = await Promise.all([
      supabase.from("ventas").select("total").eq("estado", "Completada").gte("fecha", startIso).lte("fecha", endIso),
      supabase.from("pagos_proveedores").select("monto_pagado").eq("metodo_pago", "Efectivo").gte("fecha_pago", startIso).lte("fecha_pago", endIso),
    ]);

    return {
      sales: ventas.data?.reduce((acc: number, v: any) => acc + Number(v.total), 0) || 0,
      expenses: pagos.data?.reduce((acc: number, p: any) => acc + Number(p.monto_pagado), 0) || 0,
    };
  }

  async closeSession(idCierre: number, payload: any): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from("cierres_caja").update(payload).eq("id_cierre", idCierre);
    if (error) throw error;
  }
}