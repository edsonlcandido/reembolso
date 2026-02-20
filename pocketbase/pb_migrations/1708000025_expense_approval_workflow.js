/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Expense approval workflow enhancements
 *
 * 1. Adds `partially_paid` to expense_reports status values.
 * 2. Adds `paid`, `paid_by`, `paid_at` fields to expense_items so approvers
 *    can mark individual items as paid independently.
 * 3. Creates `approval_actions` collection to track the full audit trail of
 *    every action taken on a report (approve, reject, forward, pay).
 */
migrate((app) => {
  // ── 1. expense_reports: add `partially_paid` status ──────────────────────
  const reportsCol = app.findCollectionByNameOrId("expense_reports")
  const statusField = reportsCol.fields.getByName("status")
  statusField.values = ["draft", "submitted", "approved", "rejected", "paid", "partially_paid"]
  app.save(reportsCol)

  // ── 2. expense_items: add paid tracking fields ────────────────────────────
  const itemsCol = app.findCollectionByNameOrId("expense_items")
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")

  itemsCol.fields.add(new Field({ name: "paid", type: "bool", required: false, "defaultValue": false }))
  itemsCol.fields.add(new Field({
    name: "paid_by", type: "relation", required: false,
    collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false,
  }))
  itemsCol.fields.add(new Field({ name: "paid_at", type: "date", required: false }))

  app.save(itemsCol)

  // ── 3. approval_actions collection ───────────────────────────────────────
  const companiesCol = app.findCollectionByNameOrId("companies")
  const reportsColRef = app.findCollectionByNameOrId("expense_reports")

  const actionsCol = new Collection({
    type: "base",
    name: "approval_actions",
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.id != ""',
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "report", type: "relation", required: true,
        collectionId: reportsColRef.id, maxSelect: 1, cascadeDelete: true,
      },
      {
        name: "company", type: "relation", required: true,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: true,
      },
      {
        name: "user", type: "relation", required: true,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false,
      },
      {
        // approve | reject | forward | pay | partially_pay
        name: "action", type: "select", required: true,
        maxSelect: 1,
        values: ["approve", "reject", "forward", "pay", "partially_pay"],
      },
      { name: "notes", type: "text", required: false, max: 2000 },
      {
        // When forwarding, target approver
        name: "forwarded_to", type: "relation", required: false,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false,
      },
    ],
    indexes: [
      "CREATE INDEX idx_approval_actions_report ON approval_actions (report)",
    ],
  })

  app.save(actionsCol)
}, (app) => {
  // ── Reverse 3: delete approval_actions ────────────────────────────────────
  try {
    const actionsCol = app.findCollectionByNameOrId("approval_actions")
    app.delete(actionsCol)
  } catch (_) {}

  // ── Reverse 2: remove paid fields from expense_items ─────────────────────
  const itemsCol = app.findCollectionByNameOrId("expense_items")
  for (const fieldName of ["paid", "paid_by", "paid_at"]) {
    try {
      const f = itemsCol.fields.getByName(fieldName)
      itemsCol.fields.remove(f)
    } catch (_) {}
  }
  app.save(itemsCol)

  // ── Reverse 1: remove `partially_paid` from expense_reports status ────────
  const reportsCol = app.findCollectionByNameOrId("expense_reports")
  const statusField = reportsCol.fields.getByName("status")
  statusField.values = ["draft", "submitted", "approved", "rejected", "paid"]
  app.save(reportsCol)
})
