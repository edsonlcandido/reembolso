/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Allow authenticated users to add themselves as non-admin members
 *
 * The previous createRule for company_users required the user to already be an
 * admin of the company, making it impossible to create the first membership
 * (company creator) and to join a company via invite link as an employee.
 *
 * The admin membership for a company creator is now handled server-side by the
 * onRecordAfterCreateSuccess hook in pb_hooks/main.pb.js.
 *
 * This migration extends the createRule to also allow an authenticated user to
 * add themselves as a non-admin member (employee/approver) of any company,
 * which is required for the invite-link registration flow.
 */

migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("company_users")

    // Allow create when:
    // 1. The authenticated user is already an admin of the target company (admin adding any member), OR
    // 2. The authenticated user is adding themselves with a non-admin role (invite-link self-registration)
    col.createRule =
      '(@collection.company_users.company = company && @collection.company_users.user = @request.auth.id && @collection.company_users.role = "admin") || (@request.body.user = @request.auth.id && @request.body.role != "admin" && @request.auth.id != "")'

    app.save(col)
  } catch (e) {
    console.error("Failed to update company_users createRule:", e)
  }
}, (app) => {
  // Revert to admin-only createRule
  try {
    const col = app.findCollectionByNameOrId("company_users")
    col.createRule =
      '@collection.company_users.company = company && @collection.company_users.user = @request.auth.id && @collection.company_users.role = "admin"'
    app.save(col)
  } catch (e) {
    console.error("Failed to revert company_users createRule:", e)
  }
})
