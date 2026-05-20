migrate((app) => {
  for (const name of ["order_items", "preorder_session_items"]) {
    const col = app.findCollectionByNameOrId(name)
    col.listRule = ""
    col.viewRule = ""
    app.save(col)
  }
}, (app) => {
  for (const name of ["order_items", "preorder_session_items"]) {
    const col = app.findCollectionByNameOrId(name)
    col.listRule = null
    col.viewRule = null
    app.save(col)
  }
})
