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

  // Link the authenticated creator as admin of the new company.
  // This runs server-side and bypasses the company_users createRule.
  const authRecord = e.requestInfo().auth
  if (authRecord) {
    try {
      const companyUsersCol = $app.findCollectionByNameOrId("company_users")
      const membership = new Record(companyUsersCol)
      membership.set("company", companyId)
      membership.set("user", authRecord.id)
      membership.set("role", "admin")
      membership.set("active", true)
      $app.save(membership)
    } catch (err) {
      console.error("Erro ao criar vínculo admin com empresa:", err)
    }
  }

  const defaultCategories = [
    { name: "Alimentação", icon: "🍔", color: "#ef4444" },
    { name: "Transporte", icon: "🚗", color: "#3b82f6" },
    { name: "Hospedagem", icon: "🏨", color: "#8b5cf6" },
    { name: "Material", icon: "📦", color: "#eab308" },
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
