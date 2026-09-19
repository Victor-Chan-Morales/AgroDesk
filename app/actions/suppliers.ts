"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateTag, unstable_cache } from "next/cache";
import { ProveedorFactory } from "@/lib/Proveedores/factory";
export const getSuppliers = unstable_cache(
  async () => {
    const supabase = createAdminClient();

    const { data: proveedores, error } = await supabase
      .from("proveedores")
      .select(`
        *,
        compras (
          id_compra, fecha, total,
          pagos_proveedores ( monto_pagado )
        )
      `);

    if (error) {
      console.error("Error fetching suppliers:", error);
      return [];
    }

    // El consumidor (getSuppliers) ahora ignora las reglas internas.
    // Liskov en acción: ejecuta formatForClient en cualquier clase derivada sin fallar.
    return proveedores.map((proveedorData: any) => {
      const proveedor = ProveedorFactory.crear(proveedorData);
      return proveedor.formatForClient();
    });
  },
  ["get-suppliers"],
  { revalidate: 120, tags: ["proveedores"] }
);