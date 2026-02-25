/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: add paid tracking fields to expense_reports
 *
 * Stores who completed the report payment and when it happened.
 */
migrate((app) => {
  const reportsCol = app.findCollectionByNameOrId("expense_reports")
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")

  reportsCol.fields.add(new Field({
    name: "paid_by",
    type: "relation",
    required: false,
    collectionId: usersCol.id,
    maxSelect: 1,
    cascadeDelete: false,
  }))

  reportsCol.fields.add(new Field({
    name: "paid_at",
    type: "date",
    required: false,
  }))

  app.save(reportsCol)
}, (app) => {
  const reportsCol = app.findCollectionByNameOrId("expense_reports")

  for (const fieldName of ["paid_by", "paid_at"]) {
    try {
      const field = reportsCol.fields.getByName(fieldName)
      reportsCol.fields.remove(field)
    } catch (_) {}
  }

  app.save(reportsCol)
})
