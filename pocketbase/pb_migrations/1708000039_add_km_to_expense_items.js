/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add km field to expense_items
 *
 * km stores the number of kilometers driven for mileage expense items.
 * The item amount is calculated as km * company.km_rate (in cents).
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_items")

  col.fields.add(new Field({
    name: "km",
    type: "number",
    required: false,
    min: 0,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("expense_items")

  try {
    const f = col.fields.getByName("km")
    col.fields.remove(f)
  } catch (_) {}

  app.save(col)
})
