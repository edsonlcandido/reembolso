/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Restrict write operations to company admins only
 *
 * - company_users: only company admins can create/update/delete memberships
 * - companies: only company admins can update/delete company records
 * - categories: only company admins can create/update/delete categories
 *
 * This prevents employees from escalating privileges (e.g. changing their own role).
 */

migrate((app) => {
  // Admin-only rule: the authenticated user must have an admin role in the same company
  const adminOfCompany = (companyField) =>
    `@collection.company_users.company = ${companyField} && @collection.company_users.user = @request.auth.id && @collection.company_users.role = "admin"`

  // company_users: restrict create/update/delete to company admins
  try {
    const col = app.findCollectionByNameOrId("company_users")
    col.createRule = adminOfCompany("company")
    col.updateRule = adminOfCompany("company")
    col.deleteRule = adminOfCompany("company")
    app.save(col)
  } catch (e) {
    console.error("Failed to update company_users rules:", e)
  }

  // companies: restrict update/delete to company admins
  try {
    const col = app.findCollectionByNameOrId("companies")
    col.updateRule = adminOfCompany("id")
    col.deleteRule = adminOfCompany("id")
    app.save(col)
  } catch (e) {
    console.error("Failed to update companies rules:", e)
  }

  // categories: restrict create/update/delete to company admins
  try {
    const col = app.findCollectionByNameOrId("categories")
    col.createRule = adminOfCompany("company")
    col.updateRule = adminOfCompany("company")
    col.deleteRule = adminOfCompany("company")
    app.save(col)
  } catch (e) {
    console.error("Failed to update categories rules:", e)
  }
}, (app) => {
  // Revert to "any authenticated user" rules
  const anyAuth = '@request.auth.id != ""'

  try {
    const col = app.findCollectionByNameOrId("company_users")
    col.createRule = anyAuth
    col.updateRule = anyAuth
    col.deleteRule = anyAuth
    app.save(col)
  } catch (e) {
    console.error("Failed to revert company_users rules:", e)
  }

  try {
    const col = app.findCollectionByNameOrId("companies")
    col.updateRule = anyAuth
    col.deleteRule = anyAuth
    app.save(col)
  } catch (e) {
    console.error("Failed to revert companies rules:", e)
  }

  try {
    const col = app.findCollectionByNameOrId("categories")
    col.createRule = anyAuth
    col.updateRule = anyAuth
    col.deleteRule = anyAuth
    app.save(col)
  } catch (e) {
    console.error("Failed to revert categories rules:", e)
  }
})
