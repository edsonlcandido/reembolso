/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Simplify categories write rules
 *
 * The previous complex @collection.company_users filter on createRule/updateRule/deleteRule
 * caused PocketBase to return 404 ("sql: no rows in result set") when the
 * sub-query join produced no matching rows — even for valid company admins.
 *
 * Fix: relax the collection-level rule to "any authenticated user" and enforce
 * the admin-only restriction inside onRecordCreateRequest / onRecordUpdateRequest /
 * onRecordDeleteRequest hooks in main.pb.js.
 */
migrate((app) => {
  const anyAuth = '@request.auth.id != ""'

  try {
    const col = app.findCollectionByNameOrId("categories")
    col.createRule = anyAuth
    col.updateRule = anyAuth
    col.deleteRule = anyAuth
    app.save(col)
  } catch (e) {
    console.error("Failed to simplify categories rules:", e)
  }
}, (app) => {
  // Revert to the complex admin filter
  const adminOfCompany = '@collection.company_users.company = company && @collection.company_users.user = @request.auth.id && @collection.company_users.role = "admin"'

  try {
    const col = app.findCollectionByNameOrId("categories")
    col.createRule = adminOfCompany
    col.updateRule = adminOfCompany
    col.deleteRule = adminOfCompany
    app.save(col)
  } catch (e) {
    console.error("Failed to revert categories rules:", e)
  }
})
