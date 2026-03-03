/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("expense_reports")

  // add field
  collection.fields.addAt(18, new Field({
    "hidden": false,
    "name": "created",
    "onCreate": true,
    "onUpdate": false,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "hidden": false,
    "name": "updated",
    "onCreate": true,
    "onUpdate": true,
    "presentable": false,
    "system": false,
    "type": "autodate"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("expense_reports")

  // remove field (find by name, remove by id)
  try {
    const createdField = collection.fields.getByName("created")
    collection.fields.removeById(createdField.id)
  } catch (_) {}

  // remove field (find by name, remove by id)
  try {
    const updatedField = collection.fields.getByName("updated")
    collection.fields.removeById(updatedField.id)
  } catch (_) {}

  return app.save(collection)
})
