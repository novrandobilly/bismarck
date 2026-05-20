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
    "maxSelect": 1,
    "minSelect": 0,
    "name": "preorder_session",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2382559930",
    "help": "",
    "hidden": false,
    "id": "relation3612661072",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "menu_item",
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
    "name": "preorder_session",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // update field
  collection.fields.addAt(2, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_2382559930",
    "help": "",
    "hidden": false,
    "id": "relation3612661072",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "menu_item",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
