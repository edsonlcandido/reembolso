/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const companiesCol = app.findCollectionByNameOrId("companies")

  const collection = new Collection({
    type: "base",
    name: "print_templates",
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
    indexes: [
      "CREATE UNIQUE INDEX idx_print_templates_company ON print_templates (company)",
    ],
    fields: [
      {
        name: "company", type: "relation", required: true,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: true,
      },
      { name: "doc_title", type: "text", required: false, max: 200 },
      { name: "intro_text", type: "text", required: false, max: 2000 },
      { name: "footer_text", type: "text", required: false, max: 2000 },
      { name: "signature_label_1", type: "text", required: false, max: 100 },
      { name: "signature_label_2", type: "text", required: false, max: 100 },
      { name: "signature_label_3", type: "text", required: false, max: 100 },
      { name: "include_receipts", type: "bool" },
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("print_templates")
  app.delete(collection)
})
