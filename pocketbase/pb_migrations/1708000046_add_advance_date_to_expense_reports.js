/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add advance_date field to expense_reports
 *
 * advance_date stores the date on which the cash advance (adiantamento)
 * was given to the employee.
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_reports")

  col.fields.add(new Field({
    name: "advance_date",
    type: "date",
    required: false,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("expense_reports")

  try {
    const f = col.fields.getByName("advance_date")
    col.fields.remove(f)
  } catch (_) {}

  app.save(col)
})
