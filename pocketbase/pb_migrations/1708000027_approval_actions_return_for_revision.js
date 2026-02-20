/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: add return_for_revision action to approval_actions
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("approval_actions")
  const actionField = col.fields.getByName("action")
  actionField.values = ["approve", "reject", "forward", "pay", "partially_pay", "return_for_revision"]
  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("approval_actions")
  const actionField = col.fields.getByName("action")
  actionField.values = ["approve", "reject", "forward", "pay", "partially_pay"]
  app.save(col)
})
