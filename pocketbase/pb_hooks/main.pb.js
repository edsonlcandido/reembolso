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
 * Hook: Criação de categorias padrão ao criar uma nova empresa
 *
 * Quando uma empresa é criada, as categorias padrão (Alimentação, Transporte,
 * Hospedagem, Material e Outros) são automaticamente inseridas no banco de dados.
 */
onRecordAfterCreateSuccess((e) => {
  const companyId = e.record.id

  const defaultCategories = [
    { name: "Alimentação", icon: "🍔", color: "#ef4444" },
    { name: "Transporte", icon: "🚗", color: "#3b82f6" },
    { name: "Hospedagem", icon: "🏨", color: "#8b5cf6" },
    { name: "Material", icon: "📦", color: "#eab308" },
    { name: "Kilometragem", icon: "🛣️", color: "#10b981" },
    { name: "Outros", icon: "📁", color: "#6b7280" },
  ]

  try {
    const categoriesCol = $app.findCollectionByNameOrId("categories")
    for (const cat of defaultCategories) {
      const record = new Record(categoriesCol)
      record.set("company", companyId)
      record.set("name", cat.name)
      record.set("icon", cat.icon)
      record.set("color", cat.color)
      record.set("active", true)
      $app.save(record)
    }
  } catch (err) {
    // Log error but do not fail company creation
    console.error("Erro ao criar categorias padrão:", err)
  }

  return e.next()
}, "companies")

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
 * Hook: Registrar envio do relatório para aprovação em approval_actions
 *
 * Quando um expense_report muda para status `submitted`, registra automaticamente
 * uma ação `forward` no histórico de aprovação apontando para `submitted_to`.
 */
onRecordUpdateRequest((e) => {
  const nextStatus = e.record.getString("status")

  // Só registra quando o status final for submitted
  if (nextStatus !== "submitted") {
    return e.next()
  }

  const reportId = e.record.id
  const previousReport = $app.findRecordById("expense_reports", reportId)
  const previousStatus = previousReport.getString("status")

  // Evita duplicação quando o relatório já está submetido e apenas outros campos mudam
  if (previousStatus === "submitted") {
    return e.next()
  }

  const response = e.next()

  try {
    const submittedTo = e.record.getString("submitted_to")
    const companyId = e.record.getString("company")
    const actorUserId = (e.auth && e.auth.id) ? e.auth.id : e.record.getString("user")

    if (!submittedTo || !companyId || !actorUserId) {
      throw new Error("Dados obrigatórios ausentes para registrar ação de envio")
    }

    const actionsCol = $app.findCollectionByNameOrId("approval_actions")
    const actionRecord = new Record(actionsCol)
    actionRecord.set("report", e.record.id)
    actionRecord.set("company", companyId)
    actionRecord.set("user", actorUserId)
    actionRecord.set("action", "forward")
    actionRecord.set("forwarded_to", submittedTo)
    actionRecord.set("notes", "Relatório enviado para aprovação")
    $app.save(actionRecord)
  } catch (err) {
    throw new BadRequestError("approval_actions", "Erro ao registrar envio para aprovação: " + String(err))
  }

  return response
}, "expense_reports")


/**
 * Hook: Validação de Approver ao Criar approval_actions
 *
 * onRecordCreateRequest é acionado em cada requisição HTTP de criação de record.
 * Regras:
 * - apenas approvers/admins podem criar ações de encaminhamento/pagamento;
 * - quem aprovou um relatório não pode registrar a ação de pagamento no mesmo relatório.
 */
onRecordCreateRequest((e) => {
  const action = e.record.get("action")

  // Não há validações adicionais para outros tipos de ação
  if (!["forward", "pay", "partially_pay"].includes(action)) {
    return e.next()
  }

  // Validar autenticação
  const auth = e.auth
  if (!auth || !auth.id) {
    throw new BadRequestError("auth", "Autenticação necessária")
  }

  const actorUserId = e.record.get("user")
  if (actorUserId && actorUserId !== auth.id) {
    throw new BadRequestError("user", "A ação deve ser registrada pelo próprio usuário autenticado")
  }

  // Validar empresa
  const companyId = e.record.get("company")
  if (!companyId) {
    throw new BadRequestError("company", `Empresa é obrigatória para action='${action}'`)
  }

  // Validar role do usuário
  try {
    const companyUsers = $app.findRecordsByFilter(
      "company_users",
      `user = "${auth.id}" && company = "${companyId}"`,
      "",
      1,
      0
    )

    if (!companyUsers || companyUsers.length === 0) {
      throw new BadRequestError(
        "permissions",
        "Você não está vinculado a esta empresa"
      )
    }

    const role = companyUsers[0].get("role")

    if (role !== "approver" && role !== "admin") {
      throw new BadRequestError(
        "permissions",
        `Apenas approvers podem executar '${action}'. Seu role: ${role}`
      )
    }
  } catch (err) {
    if (err instanceof BadRequestError) {
      throw err
    }
    throw new BadRequestError("permissions", "Erro ao validar permissões: " + String(err))
  }

  if (action === "pay" || action === "partially_pay") {
    const reportId = e.record.get("report")
    if (!reportId) {
      throw new BadRequestError("report", "Relatório é obrigatório para ação de pagamento")
    }

    try {
      const report = $app.findRecordById("expense_reports", reportId)
      const approvedBy = report.getString("approved_by")
      if (approvedBy && approvedBy === auth.id) {
        throw new BadRequestError(
          "permissions",
          "Quem aprova o relatório não pode efetuar o pagamento deste mesmo relatório"
        )
      }
    } catch (err) {
      if (err instanceof BadRequestError) {
        throw err
      }
      throw new BadRequestError("report", "Erro ao validar relatório para pagamento: " + String(err))
    }
  }

  return e.next()
}, "approval_actions")


/**
 * Hook: FREE plan — enforce 5-reports-per-cycle limit on expense_reports creation
 *
 * Runs before the record is persisted. Calculates the current billing cycle
 * based on the company's billing_anchor_day and counts existing reports.
 * Companies without a plan set are treated as FREE.
 */
onRecordCreateRequest((e) => {
  const companyId = e.record.getString("company")
  if (!companyId) return e.next()

  let company
  try {
    company = $app.findRecordById("companies", companyId)
  } catch (_) {
    return e.next()
  }

  const plan = company.getString("plan") || "FREE"
  if (plan !== "FREE") return e.next()

  // Determine the current billing cycle boundaries (UTC-based)
  const anchorDay = company.getInt("billing_anchor_day") || 1
  const now = new Date()
  const currentDay = now.getUTCDate()
  const currentMonth = now.getUTCMonth() // 0-indexed
  const currentYear = now.getUTCFullYear()

  let cycleStart
  if (currentDay >= anchorDay) {
    cycleStart = new Date(Date.UTC(currentYear, currentMonth, anchorDay))
  } else {
    cycleStart = new Date(Date.UTC(currentYear, currentMonth - 1, anchorDay))
  }

  const cycleStartStr = cycleStart.toISOString().slice(0, 10)

  // Count valid reports created in the current cycle (all statuses count —
  // deleted records are physically removed so they no longer appear here)
  const FREE_LIMIT = 5
  let count = 0
  try {
    const reports = $app.findRecordsByFilter(
      "expense_reports",
      `company = "${companyId}" && created >= "${cycleStartStr}"`,
      "",
      FREE_LIMIT + 1,
      0
    )
    count = reports ? reports.length : 0
  } catch (_) {
    return e.next()
  }

  if (count >= FREE_LIMIT) {
    // BadRequestError(field, message): the 'plan_limit' field key lets the
    // frontend detect this specific error via error.data.plan_limit.
    throw new BadRequestError(
      "plan_limit",
      `Limite do plano gratuito atingido: ${count}/${FREE_LIMIT} relatórios criados neste ciclo. Faça upgrade para o plano PRO para criar relatórios ilimitados.`
    )
  }

  return e.next()
}, "expense_reports")


/**
 * Hook: company_users — set activated_at on creation when active=true
 */
onRecordCreateRequest((e) => {
  if (e.record.getBool("active") && !e.record.getString("activated_at")) {
    e.record.set("activated_at", new Date().toISOString())
  }
  return e.next()
}, "company_users")


/**
 * Hook: company_users — maintain activated_at / deactivated_at on update
 */
onRecordUpdateRequest((e) => {
  const newActive = e.record.getBool("active")

  let prevActive = false
  try {
    const prev = $app.findRecordById("company_users", e.record.id)
    prevActive = prev.getBool("active")
  } catch (_) {}

  if (newActive && !prevActive && !e.record.getString("activated_at")) {
    e.record.set("activated_at", new Date().toISOString())
  }

  if (!newActive && prevActive) {
    e.record.set("deactivated_at", new Date().toISOString())
  }

  return e.next()
}, "company_users")


/**
 * Hook: companies — enforce admin-only on update/delete
 *
 * The collection-level updateRule/deleteRule is kept simple (@request.auth.id != "")
 * to avoid the "sql: no rows in result set" 404 caused by complex @collection joins.
 * The actual admin check is done here via a direct DB lookup.
 */
function requireCompanyAdmin(e) {
  const auth = e.auth
  if (!auth || !auth.id) {
    throw new ForbiddenError("Autenticação necessária")
  }

  const companyId = e.record.id
  try {
    // auth.id and e.record.id are PocketBase-generated alphanumeric IDs,
    // not user-supplied values, so string interpolation is safe here.
    const memberships = $app.findRecordsByFilter(
      "company_users",
      `user = "${auth.id}" && company = "${companyId}" && role = "admin"`,
      "",
      1,
      0
    )
    if (!memberships || memberships.length === 0) {
      throw new ForbiddenError("Apenas administradores da empresa podem realizar esta operação")
    }
  } catch (err) {
    if (err instanceof ForbiddenError) throw err
    throw new ForbiddenError("Erro ao verificar permissões: " + String(err))
  }

  return e.next()
}

onRecordUpdateRequest(requireCompanyAdmin, "companies")
onRecordDeleteRequest(requireCompanyAdmin, "companies")


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

