/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_items")
  const categoriesCol = app.findCollectionByNameOrId("categories")

  // Remove the text field
  const textField = col.fields.find(f => f.name === "category")
  if (textField) {
    col.fields.removeById(textField.id)
  }

  // Add a relation field pointing to the categories collection
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

  // Remove the relation field
  const relField = col.fields.find(f => f.name === "category")
  if (relField) {
    col.fields.removeById(relField.id)
  }

  // Restore the text field
  col.fields.add(new TextField({
    name: "category",
    required: false,
    max: 100,
  }))

  app.save(col)
})
