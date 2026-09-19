export interface TransactionItem {
  id: string;
  date: string;
  type: "Ingreso" | "Egreso";
  concept: string;
  amount: number;
  method: string;
  ref: string;
  status?: string;
}

export interface CashClosingRecord {
  id: number;
  fechaApertura: string;
  date: string;
  opening: number;
  sales: number;
  expenses: number;
  expected: number;
  real: number;
  difference: number;
  status: string;
}

export interface CashSession {
  idCierre: number;
  montoInicial: number;
  fechaApertura: string;
  estado: string;
}

export interface CashTotals {
  sales: number;
  expenses: number;
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ICashRegisterRepository {
  getTransactions(): Promise<TransactionItem[]>;
  getCashClosings(): Promise<CashClosingRecord[]>;
  getActiveSession(): Promise<CashSession | null>;
  createSession(userId: string, initialAmount: number): Promise<{ id: number }>;
  getIntervalTotals(startIso: string, endIso: string): Promise<CashTotals>;
  closeSession(idCierre: number, data: any): Promise<void>;
}