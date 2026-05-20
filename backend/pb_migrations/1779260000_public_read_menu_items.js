migrate((app) => {
  const collection = app.findCollectionByNameOrId("menu_items")
  collection.listRule = ""
  collection.viewRule = ""
  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("menu_items")
  collection.listRule = null
  collection.viewRule = null
  app.save(collection)
})
