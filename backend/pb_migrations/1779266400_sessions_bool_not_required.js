migrate((app) => {
  const collection = app.findCollectionByNameOrId("preorder_sessions")
  for (const field of collection.fields) {
    if (field.name === "allow_pickup" || field.name === "allow_delivery") {
      field.required = false
    }
  }
  app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("preorder_sessions")
  for (const field of collection.fields) {
    if (field.name === "allow_pickup" || field.name === "allow_delivery") {
      field.required = true
    }
  }
  app.save(collection)
})
