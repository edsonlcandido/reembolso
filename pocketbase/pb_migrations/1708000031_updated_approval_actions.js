/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("approval_actions")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("approval_actions")

  // remove field
  collection.fields.removeByName("created")

  return app.save(collection)
})
