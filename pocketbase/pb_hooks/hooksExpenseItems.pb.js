/// <reference path="../pb_data/types.d.ts" />

const SUPPORTED_CURRENCIES = ["BRL", "CLP", "USD", "EUR"]

function validateCurrencyFields(e) {
  const currency = e.record.getString("original_currency") || "BRL"

  if (currency && SUPPORTED_CURRENCIES.indexOf(currency) === -1) {
    throw new BadRequestError(
      "Moeda não suportada: " + currency + ". Moedas válidas: " + SUPPORTED_CURRENCIES.join(", ")
    )
  }

  if (currency !== "BRL") {
    const originalAmount = e.record.getFloat("original_amount")
    const suggestedBrlAmount = e.record.getFloat("suggested_brl_amount")
    const conversionRate = e.record.getFloat("conversion_rate")

    if (!originalAmount || originalAmount <= 0) {
      throw new BadRequestError(
        "Valor na moeda original é obrigatório para lançamentos em moeda estrangeira"
      )
    }

    if (!suggestedBrlAmount || suggestedBrlAmount <= 0) {
      throw new BadRequestError(
        "Valor sugerido em BRL é obrigatório para lançamentos em moeda estrangeira"
      )
    }

    if (!conversionRate || conversionRate <= 0) {
      throw new BadRequestError(
        "Taxa de conversão é obrigatória para lançamentos em moeda estrangeira"
      )
    }
  } else {
    if (!e.record.get("original_amount")) {
      e.record.set("original_amount", 0)
    }
    if (!e.record.get("suggested_brl_amount")) {
      e.record.set("suggested_brl_amount", 0)
    }
    if (!e.record.get("conversion_rate")) {
      e.record.set("conversion_rate", 0)
    }
  }

  return e.next()
}

onRecordCreate(validateCurrencyFields, "expense_items")
onRecordUpdate(validateCurrencyFields, "expense_items")

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

onRecordCreate(recalcKmAmount, "expense_items")
onRecordUpdate(recalcKmAmount, "expense_items")
