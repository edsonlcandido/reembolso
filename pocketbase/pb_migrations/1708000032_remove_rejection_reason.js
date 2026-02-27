/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: remove rejection_reason from expense_reports.
 *
 * The rejection reason is now exclusively stored in approval_actions.notes,
 * which provides a full audit trail of every action taken on a report.
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("expense_reports")
  const field = col.fields.getByName("rejection_reason")
  if (field) {
    col.fields.remove(field)
    app.save(col)
  }
}, (app) => {
  const col = app.findCollectionByNameOrId("expense_reports")
  col.fields.add(new Field({ name: "rejection_reason", type: "text", required: false, max: 2000 }))
  app.save(col)
})
