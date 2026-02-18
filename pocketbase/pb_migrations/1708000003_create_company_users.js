/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const companiesCol = app.findCollectionByNameOrId("companies")
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")

  const collection = new Collection({
    type: "base",
    name: "company_users",
    fields: [
      {
        name: "company", type: "relation", required: true,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: true,
      },
      {
        name: "user", type: "relation", required: true,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: true,
      },
      {
        name: "role", type: "select", required: true,
        maxSelect: 1, values: ["admin", "approver", "employee"],
      },
      { name: "cost_center", type: "text", required: false, max: 100 },
      { name: "active", type: "bool" },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_company_users_unique ON company_users (company, user)",
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("company_users")
  app.delete(collection)
})
