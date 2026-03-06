/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Olá,</p>\n<p>Obrigado por se juntar a nós no {APP_NAME}.</p>\n<p>Clique no botão abaixo para verificar seu endereço de e-mail.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/app/verify-email?token={TOKEN}\" target=\"_blank\" rel=\"noopener\">Verificar e-mail</a>\n</p>\n<p>\n  Obrigado,<br/>\n  Equipe {APP_NAME}\n</p>",
      "subject": "{APP_NAME} - Email de verificação"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Olá,</p>\n<p>Obrigado por se juntar a nós no {APP_NAME}.</p>\n<p>Clique no botão abaixo para verificar seu endereço de e-mail.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verificar</a>\n</p>\n<p>\n  Obrigado,<br/>\n  Equipe {APP_NAME}\n</p>",
      "subject": "{APP_NAME} - Email de verificação"
    }
  }, collection)

  return app.save(collection)
})
