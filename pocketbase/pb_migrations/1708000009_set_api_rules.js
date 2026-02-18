/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collections = ['companies', 'company_users', 'expense_reports', 'expense_items', 'categories', 'audit_logs', 'approvers']

  for (const name of collections) {
    try {
      const col = app.findCollectionByNameOrId(name)

      col.listRule = '@request.auth.id != ""'
      col.viewRule = '@request.auth.id != ""'
      col.createRule = '@request.auth.id != ""'
      col.updateRule = '@request.auth.id != ""'
      col.deleteRule = '@request.auth.id != ""'

      app.save(col)
    } catch (e) {
    }
  }
}, (app) => {
  const collections = ['companies', 'company_users', 'expense_reports', 'expense_items', 'categories', 'audit_logs', 'approvers']

  for (const name of collections) {
    try {
      const col = app.findCollectionByNameOrId(name)
      col.listRule = null
      col.viewRule = null
      col.createRule = null
      col.updateRule = null
      col.deleteRule = null
      app.save(col)
    } catch (e) {
    }
  }
})
