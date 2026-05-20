/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  // is_fulfilled should not be required — new orders are always unfulfilled (false),
  // but PocketBase rejects required bool fields when the value is false.
  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "bool1321828781",
    "name": "is_fulfilled",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  collection.fields.addAt(7, new Field({
    "help": "",
    "hidden": false,
    "id": "bool1321828781",
    "name": "is_fulfilled",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "bool"
  }))

  return app.save(collection)
})
