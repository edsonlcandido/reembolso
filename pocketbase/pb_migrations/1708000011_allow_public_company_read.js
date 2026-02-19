/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const companies = app.findCollectionByNameOrId("companies")
  
  // Allow public read access to companies (for company auth flow)
  // But keep create/update/delete restricted to authenticated users
  companies.listRule = ""  // Public read access
  companies.viewRule = ""  // Public read access
  
  app.save(companies)
}, (app) => {
  const companies = app.findCollectionByNameOrId("companies")
  
  // Revert to authenticated-only access
  companies.listRule = '@request.auth.id != ""'
  companies.viewRule = '@request.auth.id != ""'
  
  app.save(companies)
})
