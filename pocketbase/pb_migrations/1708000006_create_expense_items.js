/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const reportsCol = app.findCollectionByNameOrId("expense_reports")

  const collection = new Collection({
    type: "base",
    name: "expense_items",
    fields: [
      {
        name: "report", type: "relation", required: true,
        collectionId: reportsCol.id, maxSelect: 1, cascadeDelete: true,
      },
      { name: "date", type: "date", required: false },
      {
        name: "category", type: "select", required: false,
        maxSelect: 1, values: ["food", "transport", "lodging", "supplies", "other"],
      },
      { name: "amount", type: "number", required: true, min: 0 },
      { name: "description", type: "text", required: false, max: 2000 },
      {
        name: "receipt_image", type: "file", required: false,
        maxSelect: 1, maxSize: 10485760,
        mimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
        thumbs: ["200x200", "400x400"],
      },
      { name: "merchant", type: "text", required: false, max: 200 },
      { name: "ocr_data", type: "json", required: false },
      { name: "ocr_confidence", type: "number", required: false, min: 0, max: 1 },
      { name: "ocr_processed", type: "bool" },
      { name: "notes", type: "text", required: false, max: 2000 },
    ],
    indexes: [
      "CREATE INDEX idx_expense_items_report ON expense_items (report)",
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("expense_items")
  app.delete(collection)
})
