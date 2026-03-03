/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add advance_amount field to expense_reports
 *
 * advance_amount stores the cash advance (adiantamento) given to the employee
 * before the trip. Stored in cents, like total_amount.
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_reports")

  col.fields.add(new Field({
    name: "advance_amount",
    type: "number",
    required: false,
    min: 0,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("expense_reports")

  try {
    const f = col.fields.getByName("advance_amount")
    col.fields.remove(f)
  } catch (_) {}

  app.save(col)
})
