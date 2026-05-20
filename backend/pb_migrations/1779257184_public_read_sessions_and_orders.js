/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  // preorder_sessions — public read so guests can view session detail and the order form
  const sessions = app.findCollectionByNameOrId("pbc_3016445096")
  sessions.listRule = ""
  sessions.viewRule = ""
  app.save(sessions)

  // orders — public read (for order count check) + public create (guests submit orders)
  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = ""
  orders.viewRule = ""
  orders.createRule = ""
  app.save(orders)
}, (app) => {
  const sessions = app.findCollectionByNameOrId("pbc_3016445096")
  sessions.listRule = null
  sessions.viewRule = null
  app.save(sessions)

  const orders = app.findCollectionByNameOrId("pbc_3527180448")
  orders.listRule = null
  orders.viewRule = null
  orders.createRule = null
  app.save(orders)
})
