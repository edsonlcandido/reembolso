/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: add submitted_to field to expense_reports
 *
 * Stores the approver the employee chose when submitting a report for approval.
 */
migrate((app) => {
  const reportsCol = app.findCollectionByNameOrId("expense_reports")
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")

  reportsCol.fields.add(new Field({
    name: "submitted_to",
    type: "relation",
    required: false,
    collectionId: usersCol.id,
    maxSelect: 1,
    cascadeDelete: false,
  }))

  app.save(reportsCol)
}, (app) => {
  const reportsCol = app.findCollectionByNameOrId("expense_reports")
  try {
    const f = reportsCol.fields.getByName("submitted_to")
    reportsCol.fields.remove(f)
    app.save(reportsCol)
  } catch (_) {}
})
