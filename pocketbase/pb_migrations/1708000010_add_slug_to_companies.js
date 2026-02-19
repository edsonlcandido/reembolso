/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("companies")
  
  // Add slug field
  collection.fields.addAt(2, new Field({
    name: "slug",
    type: "text",
    required: true,
    max: 100,
    pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$"
  }))

  // Add unique index for slug
  collection.indexes.push(
    "CREATE UNIQUE INDEX idx_companies_slug ON companies (slug)"
  )

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("companies")
  
  // Remove slug field
  const slugField = collection.fields.find(f => f.name === "slug")
  if (slugField) {
    collection.fields.removeById(slugField.id)
  }

  // Remove unique index
  collection.indexes = collection.indexes.filter(
    idx => !idx.includes("idx_companies_slug")
  )

  app.save(collection)
})
