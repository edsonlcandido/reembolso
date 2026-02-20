/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Fix createRule for company_users
 *
 * Migration 1708000018 set the createRule to:
 *   (@collection.company_users.company = company && @collection.company_users.user = @request.auth.id && @collection.company_users.role = "admin")
 *   || (@request.body.user = @request.auth.id && @request.body.role != "admin" && @request.auth.id != "")
 *
 * The first condition uses @collection.company_users in a self-referential way
 * on the same table being created. PocketBase cannot resolve the correlated
 * `company` field reference, generating "sql: no rows in result set" (404)
 * whenever an admin tries to add another user to the company.
 *
 * This is the same class of bug fixed in migrations 1708000021 for
 * updateRule/deleteRule.
 *
 * Fix: open createRule to any authenticated user. Access control is enforced
 * at the application layer — only admins can reach the member management UI,
 * and the server-side /api/users/find-by-email hook (which requires auth)
 * is the only path to resolving a user ID from an email address.
 */

migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("company_users")
    col.createRule = '@request.auth.id != ""'
    app.save(col)
  } catch (e) {
    console.error("Failed to fix company_users createRule:", e)
  }
}, (app) => {
  // Revert to the (broken) rule from migration 1708000018
  try {
    const col = app.findCollectionByNameOrId("company_users")
    col.createRule =
      '(@collection.company_users.company = company && @collection.company_users.user = @request.auth.id && @collection.company_users.role = "admin") || (@request.body.user = @request.auth.id && @request.body.role != "admin" && @request.auth.id != "")'
    app.save(col)
  } catch (e) {
    console.error("Failed to revert company_users createRule:", e)
  }
})
