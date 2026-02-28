/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add user activation tracking to company_users
 *
 * Adds:
 *  - activated_at  — timestamp when the user was activated in the company
 *  - deactivated_at — timestamp when the user was deactivated
 *
 * These fields are maintained by hooks in pb_hooks/main.pb.js and are used
 * by the PRO plan billing to calculate pro-rata charges per active user.
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("company_users")

  col.fields.add(new Field({
    name: "activated_at",
    type: "date",
    required: false,
  }))

  col.fields.add(new Field({
    name: "deactivated_at",
    type: "date",
    required: false,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("company_users")

  for (const fieldName of ["activated_at", "deactivated_at"]) {
    try {
      const f = col.fields.getByName(fieldName)
      col.fields.remove(f)
    } catch (_) {}
  }

  app.save(col)
})
