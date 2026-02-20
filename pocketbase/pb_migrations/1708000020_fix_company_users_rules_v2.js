/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Fix updateRule and deleteRule for company_users (v2)
 *
 * Migration 1708000019 used @request.auth.record.company_users_via_user
 * which is not valid PocketBase filter syntax, causing "sql: no rows in
 * result set" (404) for all update and delete operations.
 *
 * The correct PocketBase syntax uses @collection.{name} to create an EXISTS
 * subquery. When multiple @collection.{same_name} conditions are joined with
 * &&, PocketBase combines them into a single subquery with all conditions,
 * correctly checking that a single row satisfies all three constraints.
 */

migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("company_users")

    // EXISTS (SELECT 1 FROM company_users WHERE user=<auth.id> AND company=<record.company> AND role='admin')
    const adminRule =
      '@collection.company_users.user = @request.auth.id && @collection.company_users.company = company && @collection.company_users.role = "admin"'

    col.updateRule = adminRule
    col.deleteRule = adminRule

    app.save(col)
  } catch (e) {
    console.error("Failed to fix company_users rules:", e)
  }
}, (app) => {
  // Revert to the broken @request.auth.record.company_users_via_user rule from 1708000019
  try {
    const col = app.findCollectionByNameOrId("company_users")

    const brokenRule =
      '@request.auth.record.company_users_via_user.company = company && @request.auth.record.company_users_via_user.role = "admin"'

    col.updateRule = brokenRule
    col.deleteRule = brokenRule

    app.save(col)
  } catch (e) {
    console.error("Failed to revert company_users rules:", e)
  }
})
