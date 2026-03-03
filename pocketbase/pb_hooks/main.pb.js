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

