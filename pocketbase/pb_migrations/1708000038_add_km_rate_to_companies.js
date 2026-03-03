/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add km_rate field to companies
 *
 * km_rate stores the company's reimbursement rate per kilometer (in BRL).
 * For example, 0.60 means R$0,60 per km.
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("companies")

  col.fields.add(new Field({
    name: "km_rate",
    type: "number",
    required: false,
    min: 0,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("companies")

  try {
    const f = col.fields.getByName("km_rate")
    col.fields.remove(f)
  } catch (_) {}

  app.save(col)
})
