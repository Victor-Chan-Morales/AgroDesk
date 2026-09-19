import { IProveedor, ProveedorData } from "./types";
import { ProveedorNacional, ProveedorInternacional } from "./models";

export class ProveedorFactory {
  static crear(data: ProveedorData): IProveedor {
    if (data.tipo === "internacional") {
      return new ProveedorInternacional(data);
    }
    return new ProveedorNacional(data);
  }
}