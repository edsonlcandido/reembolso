/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook: expense_items — enforce km-based amount on creation
 *
 * When an expense item is created with a km value (> 0), the client-supplied
 * amount is ignored and recalculated server-side as:
 *
 *   amount = km × company.km_rate
 *
 * This prevents users from sending inflated values for mileage expenses.
 * The company is looked up through the item's report relation.
 */
onRecordCreateRequest((e) => {
  const km = e.record.getFloat("km")
  if (!km || km <= 0) return e.next()

  const reportId = e.record.getString("report")
  if (!reportId) return e.next()

  let report
  try {
    report = $app.findRecordById("expense_reports", reportId)
  } catch (_) {
    return e.next()
  }

  const companyId = report.getString("company")
  if (!companyId) return e.next()

  let company
  try {
    company = $app.findRecordById("companies", companyId)
  } catch (_) {
    return e.next()
  }

  const kmRate = company.getFloat("km_rate") || 0
  const calculatedAmount = km * kmRate

  // Override whatever amount the client sent
  e.record.set("amount", calculatedAmount)

  return e.next()
}, "expense_items")
