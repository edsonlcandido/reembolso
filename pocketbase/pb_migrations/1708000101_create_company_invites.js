/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const companiesCol = app.findCollectionByNameOrId("companies")

  const collection = new Collection({
    type: "base",
    name: "company_invites",
    fields: [
      {
        name: "company", type: "relation", required: true,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: true,
      },
      { name: "email", type: "email", required: true },
      { name: "role", type: "select", required: true, maxSelect: 1, values: ["admin", "approver", "employee"] },
      { name: "status", type: "select", required: true, maxSelect: 1, values: ["pending", "accepted", "expired"], defaultValue: "pending" },
      { name: "invited_at", type: "date", required: true },
      { name: "expires_at", type: "date", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_company_invites_unique ON company_invites (company, email)",
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("company_invites")
  app.delete(collection)
})
