/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Fix updateRule and deleteRule for company_users
 *
 * The previous rules used a self-referential @collection.company_users filter
 * which caused 404 errors because PocketBase could not correctly resolve the
 * correlated subquery when the same collection was both the target and the
 * filter source.
 *
 * The new rules use @request.auth.record.company_users_via_user to traverse
 * from the authenticated user to their memberships, avoiding the self-referential
 * issue entirely. This allows direct PocketBase collection API calls to work.
 */

migrate((app) => {
  try {
    const col = app.findCollectionByNameOrId("company_users")

    // Check if the requesting user is an admin in the same company as the record
    // by traversing from the auth user's company_users back-relation.
    const adminRule =
      '@request.auth.record.company_users_via_user.company = company && @request.auth.record.company_users_via_user.role = "admin"'

    col.updateRule = adminRule
    col.deleteRule = adminRule

    app.save(col)
  } catch (e) {
    console.error("Failed to fix company_users rules:", e)
  }
}, (app) => {
  // Revert to the previous self-referential rule
  try {
    const col = app.findCollectionByNameOrId("company_users")

    const adminOfCompany =
      '@collection.company_users.company = company && @collection.company_users.user = @request.auth.id && @collection.company_users.role = "admin"'

    col.updateRule = adminOfCompany
    col.deleteRule = adminOfCompany

    app.save(col)
  } catch (e) {
    console.error("Failed to revert company_users rules:", e)
  }
})
