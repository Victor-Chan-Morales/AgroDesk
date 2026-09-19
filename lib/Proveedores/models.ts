import { IProveedor, ProveedorData } from "./types";

export class ProveedorNacional implements IProveedor {
  protected data: ProveedorData;

  constructor(data: ProveedorData) {
    this.data = data;
  }

  protected calculatePending(): number {
    let pending = 0;
    if (this.data.compras && this.data.compras.length > 0) {
      this.data.compras.forEach((compra: any) => {
        const pagado = compra.pagos_proveedores
          ? compra.pagos_proveedores.reduce((sum: number, p: any) => sum + p.monto_pagado, 0)
          : 0;
        pending += compra.total - pagado;
      });
    }
    return pending;
  }

  protected getLastOrder(): string {
    if (!this.data.compras || this.data.compras.length === 0) return "--";
    return new Date(Math.max(...this.data.compras.map((c: any) => new Date(c.fecha).getTime())))
      .toISOString()
      .split("T")[0];
  }

  public formatForClient() {
    return {
      id: `PR${this.data.id_proveedor.toString().padStart(3, "0")}`,
      raw_id: this.data.id_proveedor,
      name: this.data.nombre,
      nit: this.data.nit || "--",
      contact: this.data.contacto || "--",
      phone: this.data.telefono || "--",
      address: this.data.direccion || "--",
      email: "--",
      products: 0,
      pending: this.calculatePending(),
      lastOrder: this.getLastOrder(),
      status: "Activo",
    };
  }
}

export class ProveedorInternacional extends ProveedorNacional {
  public formatForClient() {
    const baseFormat = super.formatForClient();
    // Sustituye el comportamiento del NIT por un Tax ID extranjero sin alterar la estructura base
    return {
      ...baseFormat,
      nit: this.data.tax_id ? `EXT-${this.data.tax_id}` : "Extranjero", 
    };
  }
}