/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1391958792")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3016445096",
    "help": "",
    "hidden": false,
    "id": "relation3494172116",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "preorder_session",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1391958792")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3016445096",
    "help": "",
    "hidden": false,
    "id": "relation3494172116",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "session",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
