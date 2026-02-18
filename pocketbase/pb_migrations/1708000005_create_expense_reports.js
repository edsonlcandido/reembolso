/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const companiesCol = app.findCollectionByNameOrId("companies")
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")

  const collection = new Collection({
    type: "base",
    name: "expense_reports",
    fields: [
      {
        name: "company", type: "relation", required: true,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: false,
      },
      {
        name: "user", type: "relation", required: true,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false,
      },
      { name: "title", type: "text", required: true, max: 200 },
      { name: "period_start", type: "date", required: false },
      { name: "period_end", type: "date", required: false },
      { name: "cost_center", type: "text", required: false, max: 100 },
      { name: "project", type: "text", required: false, max: 200 },
      { name: "description", type: "text", required: false, max: 2000 },
      { name: "total_amount", type: "number", required: false, min: 0 },
      {
        name: "status", type: "select", required: true,
        maxSelect: 1, values: ["draft", "submitted", "approved", "rejected", "paid"],
      },
      { name: "submitted_at", type: "date", required: false },
      {
        name: "approved_by", type: "relation", required: false,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false,
      },
      { name: "approved_at", type: "date", required: false },
      { name: "rejection_reason", type: "text", required: false, max: 2000 },
    ],
    indexes: [
      "CREATE INDEX idx_expense_reports_user ON expense_reports (user)",
      "CREATE INDEX idx_expense_reports_company ON expense_reports (company)",
      "CREATE INDEX idx_expense_reports_status ON expense_reports (status)",
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("expense_reports")
  app.delete(collection)
})
