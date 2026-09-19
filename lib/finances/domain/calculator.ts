export class CashRegisterCalculator {
  static calculateBalance(montoInicial: number, ventas: number, egresos: number, montoReal: number) {
    const montoEsperado = Number(montoInicial) + ventas - egresos;
    const diferencia = montoReal - montoEsperado;

    return {
      totalVentas: ventas,
      totalEgresos: egresos,
      montoEsperado,
      diferencia,
    };
  }
}