export interface ProveedorData {
  id_proveedor: number;
  nombre: string;
  nit?: string;
  contacto?: string;
  telefono?: string;
  direccion?: string;
  tax_id?: string;
  tipo?: string;
  compras?: any[];
}

export interface IProveedor {
  formatForClient(): any; 
}

