# Clasificacion de inventario: principio abierto/cerrado

La consulta de inventario y el dashboard usan `classifyStock`. El evaluador
`evaluateStock` desconoce los estados particulares: recibe reglas, devuelve el
estado de la primera coincidencia y utiliza un estado de respaldo si no hay ninguna.

## Responsabilidades

- `lib/inventory/stock.ts`: contratos, evaluador y suma de existencias.
- `lib/inventory/stock-rules.ts`: registro ordenado de reglas y estado Normal.
- `components/stock-status-badge.tsx`: presentacion por severidad, sin condiciones por nombre.
- `types/inventory.ts`: contrato de los datos serializables enviados a la pantalla.

Cada regla entrega codigo, etiqueta, severidad y `needsRestock`. Inventario y
dashboard cuentan los estados con `needsRestock`; ahora ambos incluyen Agotado,
Critico y Bajo. Agotado y Critico se presentan como error; Bajo como advertencia.
La exportacion CSV utiliza la etiqueta del estado.

## Incorporar otra regla

Implementar `StockRule` y registrarla en `stockRules`, antes de cualquier regla
mas general que tambien pueda coincidir. Por ejemplo, una regla Sobrestock puede
usar severidad `warning` y `needsRestock: false`. No necesita cambios en el
evaluador, consultas, indicadores ni componente visual.

Sobrestock se demuestra en las pruebas, pero no se activa en produccion: el
umbral de sobrestock requiere una definicion del negocio. El registro de reglas
es el punto de composicion que cambia al extender el sistema. Nuevos datos de
entrada o nuevas severidades pueden requerir ampliar los contratos.

Ejecutar `npm run test:stock` para verificar limites, prioridad, respaldo,
serializacion y extension con una regla nueva. Ejecutar `npx tsc --noEmit
--incremental false` para verificar los tipos del proyecto completo.
