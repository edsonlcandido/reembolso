/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_items")
  const categoriesCol = app.findCollectionByNameOrId("categories")

  // Replace the select field with a relation field pointing to the categories collection
  col.fields.add(new RelationField({
    name: "category",
    required: false,
    collectionId: categoriesCol.id,
    maxSelect: 1,
    cascadeDelete: false,
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
