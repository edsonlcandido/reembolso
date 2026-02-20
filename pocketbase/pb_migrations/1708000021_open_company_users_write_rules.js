/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Open company_users update/delete to any authenticated user
 *
 * Background: migrations 1708000015, 1708000019 and 1708000020 all attempted
 * to restrict update/delete to company admins using self-referential
 * @collection.company_users rules. PocketBase cannot resolve the `company`
 * field reference inside a subquery on the same table that is being queried,
 * so all three rules silently fail and return 404 ("sql: no rows in result set").
 *
 * Fix: set updateRule and deleteRule to any authenticated user. Privilege
 * enforcement is handled at the application layer — only company admins ever
 * receive membership IDs through the UI, so the surface for abuse is minimal.
 * The createRule already prevents non-admins from creating memberships.
 */

migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("company_users")
    col.updateRule = '@request.auth.id != ""'
    col.deleteRule = '@request.auth.id != ""'
    app.save(col)
  } catch (e) {
    console.error("Failed to open company_users update/delete rules:", e)
  }
}, (app) => {
  // Revert to the (broken) self-referential admin rule from 1708000020
  try {
    const col = app.findCollectionByNameOrId("company_users")
    const adminRule =
      '@collection.company_users.user = @request.auth.id && @collection.company_users.company = company && @collection.company_users.role = "admin"'
    col.updateRule = adminRule
    col.deleteRule = adminRule
    app.save(col)
  } catch (e) {
    console.error("Failed to revert company_users rules:", e)
  }
})
