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
        model: "google/gemini-flash-1.5",
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
                category (uma de: food, transport, lodging, supplies, other, ou null), 
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
