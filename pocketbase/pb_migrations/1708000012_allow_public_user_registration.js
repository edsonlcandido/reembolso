/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")
  
  // Allow public user registration (create)
  // Keep read/update/delete restricted to authenticated users
  users.createRule = ""  // Public can create (register)
  
  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")
  
  // Revert to default (no public registration)
  users.createRule = null
  
  app.save(users)
})
