import assert from "node:assert/strict"
import { test } from "node:test"
import { evaluateStock, totalStock, type StockRule } from "../lib/inventory/stock"
import { classifyStock, normalStockStatus, stockRules } from "../lib/inventory/stock-rules"

test("clasifica los limites de stock y prioriza agotado sobre critico", () => {
  const cases = [
    { quantity: 0, minimum: 0, code: "out-of-stock" },
    { quantity: 0, minimum: 10, code: "out-of-stock" },
    { quantity: 1, minimum: 10, code: "critical" },
    { quantity: 10, minimum: 10, code: "critical" },
    { quantity: 11, minimum: 10, code: "low" },
    { quantity: 15, minimum: 10, code: "low" },
    { quantity: 16, minimum: 10, code: "normal" },
    { quantity: 1, minimum: 0, code: "normal" },
  ]
  for (const { quantity, minimum, code } of cases) {
    assert.equal(classifyStock({ quantity, minimum }).code, code)
  }
})

test("inventario y dashboard pueden usar el mismo criterio de reabastecimiento", () => {
  const statuses = [0, 10, 15, 16].map((quantity) => classifyStock({ quantity, minimum: 10 }))
  assert.deepEqual(statuses.map((status) => status.needsRestock), [true, true, true, false])
  assert.deepEqual(statuses.map((status) => status.severity), ["error", "error", "warning", "normal"])
  assert.deepEqual(statuses.map((status) => status.label), ["Agotado", "Critico", "Bajo", "Normal"])
  assert.deepEqual(JSON.parse(JSON.stringify(statuses)), statuses)
})

test("permite extender con Sobrestock sin modificar el evaluador ni las reglas existentes", () => {
  const overstock: StockRule = {
    matches: ({ quantity, minimum }) => minimum > 0 && quantity > minimum * 3,
    status: { code: "overstock", label: "Sobrestock", severity: "warning", needsRestock: false },
  }
  const extendedRules = [overstock, ...stockRules]
  const context = { quantity: 31, minimum: 10 }
  const result = evaluateStock(context, extendedRules, normalStockStatus)
  assert.equal(result.label, "Sobrestock")
  assert.equal(result.severity, "warning")
  assert.equal(result.needsRestock, false)
  assert.equal(classifyStock(context).code, "normal")
  assert.equal(evaluateStock({ quantity: 10, minimum: 10 }, extendedRules, normalStockStatus).code, "critical")
})

test("respeta el orden de prioridad y el estado de respaldo", () => {
  const first: StockRule = { matches: () => true, status: { ...normalStockStatus, code: "first" } }
  const second: StockRule = { matches: () => true, status: { ...normalStockStatus, code: "second" } }
  const context = { quantity: 20, minimum: 10 }
  assert.equal(evaluateStock(context, [first, second], normalStockStatus).code, "first")
  assert.equal(evaluateStock(context, [], normalStockStatus), normalStockStatus)
  assert.equal(evaluateStock(context, [{ ...first, matches: () => false }], normalStockStatus), normalStockStatus)
})

test("suma existencias sin mutar lotes y admite productos sin lotes", () => {
  const lots = Object.freeze([Object.freeze({ stock_actual: 5 }), Object.freeze({ stock_actual: 7 }), Object.freeze({ stock_actual: null })])
  assert.equal(totalStock(lots), 12)
  assert.equal(totalStock([]), 0)
  assert.equal(totalStock(null), 0)
  assert.equal(totalStock(undefined), 0)
})
