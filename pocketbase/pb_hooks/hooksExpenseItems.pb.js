/// <reference path="../pb_data/types.d.ts" />

function recalcKmAmount(e) {
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
  const calculatedAmount = Math.round(km * kmRate * 100)

  e.record.set("amount", calculatedAmount)

  return e.next()
}

onRecordCreateRequest(recalcKmAmount, "expense_items")
onRecordUpdateRequest(recalcKmAmount, "expense_items")
