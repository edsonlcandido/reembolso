/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")
  const companiesCol = app.findCollectionByNameOrId("companies")

  const collection = new Collection({
    type: "base",
    name: "audit_logs",
    fields: [
      {
        name: "user", type: "relation", required: false,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false,
      },
      {
        name: "company", type: "relation", required: false,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: false,
      },
      { name: "action", type: "text", required: true, max: 100 },
      { name: "entity_type", type: "text", required: false, max: 100 },
      { name: "entity_id", type: "text", required: false, max: 50 },
      { name: "changes", type: "json", required: false },
      { name: "ip_address", type: "text", required: false, max: 50 },
      { name: "user_agent", type: "text", required: false, max: 500 },
    ],
    indexes: [
      "CREATE INDEX idx_audit_logs_user ON audit_logs (user)",
      "CREATE INDEX idx_audit_logs_company ON audit_logs (company)",
      "CREATE INDEX idx_audit_logs_action ON audit_logs (action)",
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("audit_logs")
  app.delete(collection)
})
