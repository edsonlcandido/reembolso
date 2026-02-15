/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "companies",
    fields: [
      { name: "name", type: "text", required: true, max: 200 },
      { name: "cnpj", type: "text", required: false, max: 18 },
      { name: "email", type: "email", required: false },
      { name: "phone", type: "text", required: false, max: 20 },
      { name: "address", type: "text", required: false, max: 500 },
      {
        name: "logo", type: "file", required: false,
        maxSelect: 1, maxSize: 5242880,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
        thumbs: ["100x100", "200x200"],
      },
      { name: "currency", type: "text", required: false, max: 3 },
      { name: "settings", type: "json", required: false },
      { name: "active", type: "bool" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_companies_cnpj ON companies (cnpj) WHERE cnpj != ''",
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("companies")
  app.delete(collection)
})
