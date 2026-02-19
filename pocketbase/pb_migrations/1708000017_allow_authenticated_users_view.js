/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Allow authenticated users to view other users' profiles
 *
 * By default, PocketBase auth collections restrict listRule and viewRule so
 * users can only see their own record. This prevents the `expand: 'user'`
 * query in the admin members view from returning data for other users,
 * causing "Sem nome" and "?" to appear for all members except the current user.
 *
 * This migration sets listRule and viewRule to allow any authenticated user
 * to view other users' profiles (name, email), which is required for the
 * company members admin panel to display member information correctly.
 */

migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")

  users.listRule = '@request.auth.id != ""'
  users.viewRule = '@request.auth.id != ""'

  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")

  // Revert to PocketBase defaults (only self-access)
  users.listRule = null
  users.viewRule = 'id = @request.auth.id'

  app.save(users)
})
