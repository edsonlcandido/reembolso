/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const companiesCol = app.findCollectionByNameOrId("companies")
  const usersCol = app.findCollectionByNameOrId("_pb_users_auth_")

  const collection = new Collection({
    type: "base",
    name: "approvers",
    fields: [
      {
        name: "company", type: "relation", required: true,
        collectionId: companiesCol.id, maxSelect: 1, cascadeDelete: true,
      },
      {
        name: "user", type: "relation", required: true,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: true,
      },
      { name: "level", type: "number", required: false, min: 1, max: 10 },
      { name: "max_amount", type: "number", required: false, min: 0 },
      {
        name: "delegates_to", type: "relation", required: false,
        collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false,
      },
      { name: "active", type: "bool" },
    ],
  })

  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("approvers")
  app.delete(collection)
})
