"use server";

import { requireUser } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { ICashRegisterRepository, ActionResult, TransactionItem, CashClosingRecord } from "@/lib/finances/domain/types";
import { CashRegisterCalculator } from "@/lib/finances/domain/calculator";
import { SupabaseCashRegisterRepository } from "@/lib/finances/infrastructure/repo";

const repository: ICashRegisterRepository = new SupabaseCashRegisterRepository();

export const getTransactionsV2 = async (): Promise<TransactionItem[]> => {
  try {
    return await repository.getTransactions();
  } catch {
    return [];
  }
};

export const getCashClosingsV2 = async (): Promise<CashClosingRecord[]> => {
  try {
    return await repository.getCashClosings();
  } catch {
    return [];
  }
};

export async function openCashSession(monto_inicial: number): Promise<ActionResult<{ id: number }>> {
  try {
    const profile = await requireUser();
    const existing = await repository.getActiveSession();
    if (existing) return { success: false, error: "Ya hay una caja abierta." };

    const result = await repository.createSession(profile.id_usuario, monto_inicial);
    revalidateTag("finanzas", "default");
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function closeDailyCashV2(monto_real: number): Promise<ActionResult<void>> {
  try {
    await requireUser();
    const session = await repository.getActiveSession();
    if (!session) return { success: false, error: "No hay una caja abierta." };

    const endTime = new Date().toISOString();
    const totals = await repository.getIntervalTotals(session.fechaApertura, endTime);
    const balance = CashRegisterCalculator.calculateBalance(session.montoInicial, totals.sales, totals.expenses, monto_real);

    await repository.closeSession(session.idCierre, {
      ...balance,
      saldo_final: monto_real,
      monto_real,
      fecha_cierre: endTime,
      estado: "Cerrada",
    });

    revalidateTag("finanzas", "default");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}