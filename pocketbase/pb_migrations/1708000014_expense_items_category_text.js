/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_items")

  // Replace the hardcoded select field with a text field to store category names
  col.fields.add(new TextField({
    name: "category",
    required: false,
    max: 100,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("expense_items")

  // Restore original select field
  col.fields.add(new SelectField({
    name: "category",
    required: false,
    maxSelect: 1,
    values: ["food", "transport", "lodging", "supplies", "other"],
  }))

  app.save(col)
})
