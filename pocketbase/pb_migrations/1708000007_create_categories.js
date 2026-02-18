/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const companiesCol = app.findCollectionByNameOrId("companies")

  const collection = new Collection({
    type: "base",
    name: "categories",
    fields: [
      {
        name: "company", type: "relation", required: true,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: true,
      },
      { name: "name", type: "text", required: true, max: 100 },
      { name: "description", type: "text", required: false, max: 500 },
      { name: "icon", type: "text", required: false, max: 50 },
      { name: "color", type: "text", required: false, max: 20 },
      { name: "active", type: "bool" },
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("categories")
  app.delete(collection)
})
