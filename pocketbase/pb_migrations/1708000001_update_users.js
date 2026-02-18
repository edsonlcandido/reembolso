/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")

  users.fields.addAt(users.fields.length, new Field({
    name: "name",
    type: "text",
    required: false,
    max: 200,
  }))

  users.fields.addAt(users.fields.length, new Field({
    name: "avatar",
    type: "file",
    required: false,
    maxSelect: 1,
    maxSize: 5242880,
    mimeTypes: ["image/jpeg", "image/png", "image/webp"],
    thumbs: ["100x100", "200x200"],
  }))

  app.save(users)
}, (app) => {
  const users = app.findCollectionByNameOrId("_pb_users_auth_")

  const nameField = users.fields.find(f => f.name === "name")
  if (nameField) users.fields.removeById(nameField.id)

  const avatarField = users.fields.find(f => f.name === "avatar")
  if (avatarField) users.fields.removeById(avatarField.id)

  app.save(users)
})
