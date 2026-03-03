/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: remove audit_logs collection.
 *
 * The approval_actions collection already provides a full audit trail of every
 * action taken on a report. The audit_logs collection was never written to by
 * the application and is therefore redundant.
 */
migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("audit_logs")
    app.delete(col)
  } catch (_) {}
}, (app) => {
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")
  const companiesCol = app.findCollectionByNameOrId("companies")

  const collection = new Collection({
    type: "base",
    name: "audit_logs",
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: '@request.auth.id != ""',
    deleteRule: '@request.auth.id != ""',
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
})
