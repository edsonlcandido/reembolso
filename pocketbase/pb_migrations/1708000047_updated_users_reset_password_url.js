/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "resetPasswordTemplate": {
      "body": "<p>Olá,</p>\n<p>Clique no botão abaixo para redefinir sua senha.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/app/reset-password?token={TOKEN}\" target=\"_blank\" rel=\"noopener\">Redefinir senha</a>\n</p>\n<p><i>Se você não solicitou a redefinição de sua senha, pode ignorar este e-mail.</i></p>\n<p>\n  Obrigado,<br/>\n  Equipe {APP_NAME}\n</p>",
      "subject": "{APP_NAME} - Resetar a senha"
    }
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // update collection data
  unmarshal({
    "resetPasswordTemplate": {
      "body": "<p>Olá,</p>\n<p>Clique no botão abaixo para redefinir sua senha.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Redefinir senha</a>\n</p>\n<p><i>Se você não solicitou a redefinição de sua senha, pode ignorar este e-mail.</i></p>\n<p>\n  Obrigado,<br/>\n  Equipe {APP_NAME}\n</p>",
      "subject": "{APP_NAME} - Resetar a senha"
    }
  }, collection)

  return app.save(collection)
})
