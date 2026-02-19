/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    type: "base",
    name: "system_variables",
    // Only superusers can read/write system variables
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      { name: "key", type: "text", required: true, max: 200 },
      { name: "value", type: "text", required: false, max: 2000 },
      { name: "description", type: "text", required: false, max: 500 },
    ],
  })

  app.save(collection)

  // Seed the OPENROUTER_API_KEY row so it appears in the admin panel
  const record = new Record(collection)
  record.set("key", "OPENROUTER_API_KEY")
  record.set("value", "")
  record.set("description", "Chave de API do OpenRouter para leitura de comprovantes com IA")
  app.save(record)
}, (app) => {
  const collection = app.findCollectionByNameOrId("system_variables")
  app.delete(collection)
})
