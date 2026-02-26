/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: add created/updated date fields to approval_actions
 * for environments where these fields are not available for API sorting.
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("approval_actions")

  try {
    col.fields.getByName("created")
  } catch (_) {
    col.fields.add(new Field({ name: "created", type: "date", required: false }))
  }

  try {
    col.fields.getByName("updated")
  } catch (_) {
    col.fields.add(new Field({ name: "updated", type: "date", required: false }))
  }

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("approval_actions")

  try {
    const createdField = col.fields.getByName("created")
    col.fields.remove(createdField)
  } catch (_) {}

  try {
    const updatedField = col.fields.getByName("updated")
    col.fields.remove(updatedField)
  } catch (_) {}

  app.save(col)
})
