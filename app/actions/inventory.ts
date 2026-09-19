"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateTag, unstable_cache } from "next/cache";
import { classifyStock } from "@/lib/inventory/stock-rules";
import { totalStock } from "@/lib/inventory/stock";
import type { InventoryProduct } from "@/types/inventory";

// ─── Cached read (uses service-role client — no cookies, safe inside cache) ──
export const getProducts = unstable_cache(
  async (): Promise<InventoryProduct[]> => {
    const supabase = createAdminClient();

    const { data: productos, error } = await supabase
      .from("productos")
      .select(`
        *,
        categorias (nombre),
        lotes (id_lote, stock_actual, numero_lote, fecha_vencimiento)
      `);

    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }

    return productos.map((product: any) => {
      const quantity = totalStock(product.lotes);
      const status = classifyStock({ quantity, minimum: product.stock_minimo });

      return {
        no: product.id_producto,
        code: product.codigo,
        name: product.nombre,
        desc: product.categorias?.nombre || "--",
        supplier: "--",
        invoice: "--",
        qty: quantity,
        price: product.precio_compra,
        precio_venta: product.precio_venta,
        stock_minimo: product.stock_minimo,
        total: quantity * product.precio_compra,
        status,
        lotes: product.lotes || [],
      };
    });
  },
  ["get-products-stock-rules-v1"],
  { revalidate: 60, tags: ["inventario"] }
);

// ─── Mutations (use session-aware client — cookies OK here, not cached) ──────
export async function addProduct(formData: FormData) {
  const supabase = await createClient();

  const codigo = formData.get("codigo") as string;
  const nombre = formData.get("nombre") as string;
  const precio_compra = parseFloat(formData.get("precio_compra") as string);
  const precio_venta = parseFloat(formData.get("precio_venta") as string);
  const stock_minimo = parseInt(formData.get("stock_minimo") as string);

  const { data, error } = await supabase
    .from("productos")
    .insert([{ codigo, nombre, precio_compra, precio_venta, stock_minimo }])
    .select();

  if (error) {
    console.error("Error adding product:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("inventario", "default");
  revalidateTag("dashboard", "default");
  return { success: true, data };
}

export async function deleteProduct(id: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id_producto", id);

  if (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("inventario", "default");
  revalidateTag("dashboard", "default");
  return { success: true };
}

export async function updateProduct(id: number, formData: FormData) {
  const supabase = await createClient();

  const codigo = formData.get("codigo") as string;
  const nombre = formData.get("nombre") as string;
  const precio_compra = parseFloat(formData.get("precio_compra") as string);
  const precio_venta = parseFloat(formData.get("precio_venta") as string);
  const stock_minimo = parseInt(formData.get("stock_minimo") as string);

  const { data, error } = await supabase
    .from("productos")
    .update({ codigo, nombre, precio_compra, precio_venta, stock_minimo })
    .eq("id_producto", id)
    .select();

  if (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("inventario", "default");
  revalidateTag("dashboard", "default");
  return { success: true, data };
}

export async function adjustLoteStock(id_lote: number, new_stock: number) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("lotes")
    .update({ stock_actual: new_stock })
    .eq("id_lote", id_lote);

  if (error) {
    console.error("Error adjusting lote stock:", error);
    return { success: false, error: error.message };
  }

  revalidateTag("inventario", "default");
  revalidateTag("dashboard", "default");
  return { success: true };
}
