/// <reference path="../pb_data/types.d.ts" />

/**
 * PocketBase Hook: SPA Routing para o Web App

 * 
 * Este hook garante que todas as rotas do SPA (Single Page Application)
 * sejam servidas com o index.html correto, permitindo que o
 * Vue Router gerencie as rotas do lado do cliente.
 * 
 * Usa $apis.static() com indexFallback=true para suporte a SPA.
 */

routerAdd("GET", "/app/{path...}", $apis.static("pb_public/app", true))

/**
 * Endpoint: Criação de empresa com vínculo do admin
 *
 * Cria a empresa e automaticamente vincula o usuário autenticado como
 * administrador da empresa em uma única operação server-side, evitando
 * a restrição da createRule da coleção company_users que exige que o
 * usuário já seja admin.
 *
 * Retorna o registro da empresa criada.
 */
routerAdd("POST", "/api/companies/create", (e) => {
  const body = e.requestInfo().body

  if (!body.name || !body.slug) {
    return e.json(400, { error: "Nome e slug são obrigatórios" })
  }

  let company
  try {
    // Create the company record (triggers onRecordAfterCreateSuccess for categories)
    const companiesCol = $app.findCollectionByNameOrId("companies")
    company = new Record(companiesCol)
    company.set("name", body.name)
    company.set("slug", body.slug)
    if (body.cnpj) company.set("cnpj", body.cnpj)
    if (body.email) company.set("email", body.email)
    if (body.phone) company.set("phone", body.phone)
    if (body.address) company.set("address", body.address)
    if (body.km_rate != null) company.set("km_rate", body.km_rate)
    company.set("active", true)
    $app.save(company)
  } catch (err) {
    return e.json(400, { error: "Erro ao criar empresa: " + String(err) })
  }

  try {
    // Link the creator as admin — done server-side to bypass the createRule
    const companyUsersCol = $app.findCollectionByNameOrId("company_users")
    const membership = new Record(companyUsersCol)
    membership.set("company", company.id)
    membership.set("user", e.auth.id)
    membership.set("role", "admin")
    membership.set("active", true)
    membership.set("activated_at", new Date().toISOString())
    $app.save(membership)
  } catch (err) {
    // Roll back the company creation so the user is not left with an
    // inaccessible company record.
    try {
      $app.delete(company)
    } catch (_) {}
    return e.json(500, { error: "Erro ao criar vínculo admin com empresa: " + String(err) })
  }

  return e.json(200, company)
}, $apis.requireAuth())

/**
 * Endpoint: Find user by email (server-side lookup)
 *
 * Searches for a user by email address server-side, bypassing PocketBase's
 * email field restrictions on the users auth collection that prevent
 * client-side filtering by email.
 *
 * Returns the user's id, name and email on success, or 404 if not found.
 */
routerAdd("POST", "/api/users/find-by-email", (e) => {
  const body = e.requestInfo().body
  const email = body.email

  if (!email) {
    return e.json(400, { error: "Email é obrigatório" })
  }

  try {
    const user = $app.findFirstRecordByData("users", "email", email)
    return e.json(200, { id: user.id, name: user.getString("name"), email: user.getString("email") })
  } catch (err) {
    return e.json(404, { error: "Usuário não encontrado com este e-mail." })
  }
}, $apis.requireAuth())

/**
 * Endpoint: Leitura de comprovante via IA (OpenRouter)
 *
 * Recebe uma imagem em base64, envia para a API do OpenRouter com um modelo
 * de visão e retorna os dados extraídos do comprovante (data, valor,
 * estabelecimento, categoria e descrição) para preencher o formulário.
 *
 * A chave OPENROUTER_API_KEY é lida da tabela system_variables no banco de dados.
 */
routerAdd("POST", "/api/ai/read-receipt", (e) => {
  const body = e.requestInfo().body
  const imageBase64 = body.imageBase64
  const mimeType = body.mimeType || "image/jpeg"
  const companyId = body.companyId || ""

  if (!imageBase64) {
    return e.json(400, { error: "Imagem não fornecida" })
  }

  // Read API key from the system_variables table
  let apiKey = ""
  try {
    const record = $app.findFirstRecordByData("system_variables", "key", "OPENROUTER_API_KEY")
    apiKey = record.getString("value")
  } catch (dbErr) {
    // Fall back to environment variable if table/record doesn't exist yet
    apiKey = $os.getenv("OPENROUTER_API_KEY")
  }

  if (!apiKey) {
    return e.json(500, { error: "Chave da API de IA não configurada. Configure em system_variables." })
  }

  // Build category list for the LLM prompt from the company's categories in the database.
  // Falls back to the hardcoded defaults if no companyId is provided or no categories are found.
  const defaultCategoryValues = "food, transport, lodging, supplies, other"
  let categorySequence = defaultCategoryValues
  if (companyId) {
    try {
      const catRecords = $app.findRecordsByFilter(
        "categories",
        `company = "${companyId}" && active = true`,
        "name",
        50,
        0,
      )
      if (catRecords && catRecords.length > 0) {
        categorySequence = catRecords.map((r) => r.getString("name")).join(", ")
      }
    } catch (catErr) {
      // If fetching categories fails, fall back to defaults
    }
  }

  let response
  try {
    response = $http.send({
      url: "https://openrouter.ai/api/v1/chat/completions",
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4.1-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analise este comprovante de despesa e extraia as informações. 
                Retorne APENAS um JSON válido com os campos: 
                date (formato YYYY-MM-DD ou null), 
                amount (valor total em reais como número decimal, ex: 45.90, ou null), 
                merchant (nome do estabelecimento ou null), 
                category (uma das seguintes categorias: ${categorySequence}, ou null), 
                description (descrição breve em português ou null). 
                Não inclua texto adicional, apenas o JSON.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: "data:" + mimeType + ";base64," + imageBase64,
                },
              },
            ],
          },
        ],
      }),
      timeout: 30,
    })
  } catch (err) {
    return e.json(500, { error: "Erro ao conectar com a API de IA" })
  }

  if (response.statusCode !== 200) {
    return e.json(500, { error: "Erro na API de IA: " + response.statusCode })
  }

  try {
    const result = JSON.parse(response.raw)
    const content = result.choices[0].message.content
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return e.json(500, { error: "Resposta da IA inválida" })
    }
    const data = JSON.parse(jsonMatch[0])
    return e.json(200, data)
  } catch (parseErr) {
    return e.json(500, { error: "Erro ao processar resposta da IA" })
  }
}, $apis.requireAuth())


/**
 * Endpoint: Close billing cycle for PRO companies
 *
 * Finds all PRO companies whose billing_anchor_day matches today (UTC) and
 * generates an invoice for the completed cycle. Idempotent — skips companies
 * that already have an invoice for the cycle.
 *
 * POST /api/billing/close-cycle
 * Requires superuser authentication.
 */
routerAdd("POST", "/api/billing/close-cycle", (e) => {
  const MS_PER_DAY = 86400000
  const PRO_PLAN_MONTHLY_PRICE_CENTS = 1000 // R$10.00 per user per month

  const now = new Date()
  const today = now.getUTCDate()

  let proCompanies
  try {
    proCompanies = $app.findRecordsByFilter(
      "companies",
      `plan = "PRO" && billing_anchor_day = ${today}`,
      "",
      100,
      0
    )
  } catch (_) {
    proCompanies = []
  }

  if (!proCompanies || proCompanies.length === 0) {
    return e.json(200, { processed: 0, message: "Nenhuma empresa PRO com ciclo encerrando hoje" })
  }

  const results = []

  for (const company of proCompanies) {
    try {
      const companyId = company.id
      const anchorDay = company.getInt("billing_anchor_day") || 1

      // Cycle that ends today: started last month on anchor_day
      const cycleEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), anchorDay))
      const cycleStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, anchorDay))

      const cycleStartStr = cycleStart.toISOString().slice(0, 10)
      const cycleEndStr = cycleEnd.toISOString().slice(0, 10)

      // Idempotency check
      try {
        const existing = $app.findRecordsByFilter(
          "invoices",
          `company = "${companyId}" && cycle_start = "${cycleStartStr}" && cycle_end = "${cycleEndStr}"`,
          "",
          1,
          0
        )
        if (existing && existing.length > 0) {
          results.push({ company: companyId, status: "already_exists" })
          continue
        }
      } catch (_) {}

      // Load all company_users to compute pro-rata billing
      let companyUsers = []
      try {
        companyUsers = $app.findRecordsByFilter(
          "company_users",
          `company = "${companyId}"`,
          "",
          1000,
          0
        )
      } catch (_) {}

      const cycleDays = Math.round((cycleEnd.getTime() - cycleStart.getTime()) / MS_PER_DAY)
      let totalUserDays = 0
      const breakdown = []

      for (const cu of companyUsers) {
        const activatedAtStr = cu.getString("activated_at")
        if (!activatedAtStr) continue // Never activated

        const activatedAt = new Date(activatedAtStr)
        const deactivatedAtStr = cu.getString("deactivated_at")

        const userStart = activatedAt < cycleStart ? cycleStart : activatedAt
        const userEnd = deactivatedAtStr
          ? (new Date(deactivatedAtStr) < cycleEnd ? new Date(deactivatedAtStr) : cycleEnd)
          : cycleEnd

        if (userEnd <= userStart) continue // Not active in this cycle

        const activeDays = Math.ceil((userEnd.getTime() - userStart.getTime()) / MS_PER_DAY)
        const subtotalCents = Math.round(PRO_PLAN_MONTHLY_PRICE_CENTS * activeDays / cycleDays)

        totalUserDays += activeDays
        breakdown.push({
          userId: cu.getString("user"),
          active_days: activeDays,
          subtotal_cents: subtotalCents,
        })
      }

      const amountCents = Math.round(PRO_PLAN_MONTHLY_PRICE_CENTS * totalUserDays / cycleDays)

      // Create invoice
      const invoicesCol = $app.findCollectionByNameOrId("invoices")
      const invoice = new Record(invoicesCol)
      invoice.set("company", companyId)
      invoice.set("cycle_start", cycleStartStr)
      invoice.set("cycle_end", cycleEndStr)
      invoice.set("cycle_days", cycleDays)
      invoice.set("total_user_days", totalUserDays)
      invoice.set("amount_cents", amountCents)
      invoice.set("status", "pending")
      invoice.set("breakdown_json", breakdown)
      $app.save(invoice)

      results.push({ company: companyId, status: "created", amount_cents: amountCents })
    } catch (err) {
      results.push({ company: company.id, status: "error", error: String(err) })
    }
  }

  return e.json(200, { processed: results.length, results })
}, $apis.requireSuperuserAuth())


/**
 * Endpoint: Enviar convite de membro para e-mail
 *
 * Cria automaticamente um usuário se não existir, adiciona à empresa e
 * envia email de reset de senha para que o usuário configure sua senha.
 *
 * POST /api/memberships/send-invite
 * Body: { email, companyId, companyName, role }
 * Requires: auth
 */
routerAdd("POST", "/api/memberships/send-invite", (e) => {
  const body = e.requestInfo().body
  const email = body.email
  const companyId = body.companyId
  const companyName = body.companyName
  const role = body.role

  if (!email || !companyId || !companyName) {
    return e.json(400, { error: "Email, ID da empresa e nome da empresa são obrigatórios" })
  }

  try {
    // 1. Verificar se usuário já existe
    let user
    let userAlreadyExists = true
    
    try {
      user = $app.findFirstRecordByData("users", "email", email)
    } catch (notFoundErr) {
      // Usuário não existe, vamos criar
      userAlreadyExists = false
    }

    // 2. Se usuário não existe, criar com senha aleatória
    if (!userAlreadyExists) {
      try {
        const tempPassword = $security.randomString(20)
        const usersCol = $app.findCollectionByNameOrId("_pb_users_auth_")
        user = new Record(usersCol)
        user.set("email", email)
        user.set("password", tempPassword)
        user.set("passwordConfirm", tempPassword)
        user.set("name", email.split("@")[0])
        user.set("emailVisibility", true)
        user.set("verified", true)
        
        $app.save(user)
      } catch (createErr) {
        console.log("Erro ao criar usuário:", createErr)
        return e.json(500, { error: "Erro ao criar usuário: " + String(createErr) })
      }
    }

    // 3. Adicionar usuário à empresa
    try {
      const companyUsersCol = $app.findCollectionByNameOrId("company_users")
      const membership = new Record(companyUsersCol)
      membership.set("company", companyId)
      membership.set("user", user.id)
      membership.set("role", role)
      membership.set("active", true)
      
      $app.save(membership)
    } catch (membershipErr) {
      console.log("Erro ao adicionar membro:", membershipErr)
      return e.json(500, { error: "Erro ao adicionar membro à empresa: " + String(membershipErr) })
    }

    // 4. Enviar email de reset de senha (template nativo do PocketBase)
    try {
      $mails.sendRecordPasswordReset($app, user)
    } catch (mailErr) {
      console.log("Erro ao enviar email de reset:", mailErr)
      // Não bloquear o fluxo se email falhar
    }

    const message = userAlreadyExists 
      ? "Membro adicionado com sucesso! Email de configuração enviado."
      : "Usuário criado e adicionado à empresa. Email de configuração de senha enviado."

    return e.json(200, { 
      success: true, 
      message,
      userCreated: !userAlreadyExists 
    })
  } catch (err) {
    console.log("Erro no convite de membro:", err)
    return e.json(500, { error: "Erro ao processar convite: " + String(err) })
  }
}, $apis.requireAuth())

/**
 * Endpoint: Notificar usuário da etapa atual de um relatório
 *
 * Envia um email para o usuário que está na etapa atual do fluxo de aprovação
 * (campo submitted_to do relatório), avisando que existe um relatório aguardando
 * sua ação.
 *
 * POST /api/expense-reports/notify
 * Body: { reportId }
 * Requires: auth
 */
routerAdd("POST", "/api/expense-reports/notify", (e) => {
  const body = e.requestInfo().body
  const reportId = body.reportId

  if (!reportId) {
    return e.json(400, { error: "ID do relatório é obrigatório" })
  }

  let report
  try {
    report = $app.findRecordById("expense_reports", reportId)
  } catch (err) {
    return e.json(404, { error: "Relatório não encontrado" })
  }

  const submittedToId = report.getString("submitted_to")
  if (!submittedToId) {
    return e.json(400, { error: "Não há usuário na etapa atual para notificar" })
  }

  // Only the report owner, or admins/approvers of the same company may trigger this
  const actorId = e.auth && e.auth.id ? e.auth.id : ""
  const reportUserId = report.getString("user")
  if (actorId !== reportUserId) {
    const companyId = report.getString("company")
    let isAdminOrApprover = false
    try {
      const membership = $app.findFirstRecordByFilter(
        "company_users",
        `company="${companyId}" && user="${actorId}" && (role="admin" || role="approver") && active=true`
      )
      if (membership) isAdminOrApprover = true
    } catch (_) {}
    if (!isAdminOrApprover) {
      return e.json(403, { error: "Sem permissão para notificar neste relatório" })
    }
  }

  let targetUser
  try {
    targetUser = $app.findRecordById("users", submittedToId)
  } catch (err) {
    return e.json(404, { error: "Usuário da etapa atual não encontrado" })
  }

  const targetEmail = targetUser.getString("email")
  const targetName = targetUser.getString("name") || targetEmail

  const reportTitle = report.getString("title")
  const reportStatus = report.getString("status")

  let senderName = "Sistema"
  try {
    const senderUser = $app.findRecordById("users", reportUserId)
    senderName = senderUser.getString("name") || senderUser.getString("email")
  } catch (_) {}

  // Sanitize user-supplied strings before embedding in HTML
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
  }

  const safeTargetName = escapeHtml(targetName)
  const safeReportTitle = escapeHtml(reportTitle)
  const safeSenderName = escapeHtml(senderName)
  const safeReportId = report.id.replace(/[^a-zA-Z0-9_-]/g, "")
  const statusLabel = reportStatus === "submitted" ? "aguardando aprovação" : "aguardando ação"
  const appURL = $app.settings().meta.appURL || ""

  try {
    const message = new MailerMessage({
      from: {
        address: $app.settings().meta.senderAddress,
        name: $app.settings().meta.senderName,
      },
      to: [{ address: targetEmail, name: targetName }],
      subject: `Relatório de reembolso aguardando sua ação: ${reportTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Relatório aguardando sua ação</h2>
          <p>Olá, <strong>${safeTargetName}</strong>!</p>
          <p>O relatório de reembolso <strong>"${safeReportTitle}"</strong> de <strong>${safeSenderName}</strong> está ${statusLabel} e precisa da sua atenção.</p>
          <p style="margin: 24px 0;">
            <a href="${appURL}/app/reports/${safeReportId}"
               style="background: linear-gradient(to right, #2563eb, #7c3aed); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              Ver Relatório
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">Se o botão não funcionar, acesse diretamente o sistema de reembolsos.</p>
        </div>
      `,
    })
    $app.newMailClient().send(message)
  } catch (mailErr) {
    console.log("Erro ao enviar email de notificação:", mailErr)
    return e.json(500, { error: "Erro ao enviar email de notificação: " + String(mailErr) })
  }

  return e.json(200, { success: true, message: "Notificação enviada para " + targetEmail })
}, $apis.requireAuth())
