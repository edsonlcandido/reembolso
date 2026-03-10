/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_items")

  col.fields.add(new Field({
    name: "original_currency",
    type: "text",
    required: false,
  }))

  col.fields.add(new Field({
    name: "original_amount",
    type: "number",
    required: false,
    min: 0,
  }))

  col.fields.add(new Field({
    name: "suggested_brl_amount",
    type: "number",
    required: false,
    min: 0,
  }))

  col.fields.add(new Field({
    name: "conversion_rate",
    type: "number",
    required: false,
    min: 0,
  }))

  col.fields.add(new Field({
    name: "currency_note",
    type: "text",
    required: false,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("expense_items")

  const fields = ["original_currency", "original_amount", "suggested_brl_amount", "conversion_rate", "currency_note"]
  for (const name of fields) {
    try {
      const f = col.fields.getByName(name)
      col.fields.remove(f)
    } catch (_) {}
  }

  app.save(col)
})
