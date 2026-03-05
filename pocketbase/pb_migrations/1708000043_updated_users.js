/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Olá,</p>\n<p>Obrigado por se juntar a nós no {APP_NAME}.</p>\n<p>Clique no botão abaixo para verificar seu endereço de e-mail.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verificar</a>\n</p>\n<p>\n  Obrigado,<br/>\n  Equipe {APP_NAME}\n</p>",
      "subject": "{APP_NAME} - Email de verificação"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "verificationTemplate": {
      "body": "<p>Hello,</p>\n<p>Thank you for joining us at {APP_NAME}.</p>\n<p>Click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
      "subject": "Verify your {APP_NAME} email"
    }
  }, collection)

  return app.save(collection)
})
