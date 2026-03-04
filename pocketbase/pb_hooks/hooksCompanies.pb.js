/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook: Inicialização de empresa ao criar
 *
 * Quando uma empresa é criada:
 * 1. Define valores padrão de billing/plan (plan=FREE, timezone=America/Sao_Paulo, currency=R$)
 * 2. Define billing_anchor_day como o dia atual (1-28)
 * 
 * Usa onRecordBeforeCreate (não Request) para funcionar tanto com API direta
 * quanto com $app.save() dentro de endpoints customizados
 */
onRecordBeforeCreate((e) => {
  const record = e.record

  console.log("[hooksCompanies] Criando empresa - valores antes:", {
    plan: record.get("plan"),
    billing_timezone: record.get("billing_timezone"),
    currency: record.get("currency"),
    billing_anchor_day: record.get("billing_anchor_day")
  })

  // Define plan como FREE se não definido ou vazio
  const currentPlan = record.get("plan")
  if (!currentPlan || currentPlan === "" || currentPlan === null) {
    record.set("plan", "FREE")
  }

  // Define billing_timezone como America/Sao_Paulo se não definido ou vazio
  const currentTimezone = record.get("billing_timezone")
  if (!currentTimezone || currentTimezone === "" || currentTimezone === null) {
    record.set("billing_timezone", "America/Sao_Paulo")
  }

  // Define currency como R$ se não definido ou vazio
  const currentCurrency = record.get("currency")
  if (!currentCurrency || currentCurrency === "" || currentCurrency === null) {
    record.set("currency", "R$")
  }

  // Define billing_anchor_day como o dia atual (1-28) se não definido, 0 ou vazio
  const currentAnchorDay = record.get("billing_anchor_day")
  if (!currentAnchorDay || currentAnchorDay === 0 || currentAnchorDay === null) {
    const now = new Date()
    let day = now.getDate()
    // Limita entre 1 e 28
    if (day > 28) day = 28
    if (day < 1) day = 1
    record.set("billing_anchor_day", day)
  }

  console.log("[hooksCompanies] Criando empresa - valores depois:", {
    plan: record.get("plan"),
    billing_timezone: record.get("billing_timezone"),
    currency: record.get("currency"),
    billing_anchor_day: record.get("billing_anchor_day")
  })

  return e.next()
}, "companies")

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
    { name: "Quilometragem", icon: "🛣️", color: "#10b981" },
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
 * Hook: companies — enforce admin-only on update/delete
 *
 * The collection-level updateRule/deleteRule is kept simple (@request.auth.id != "")
 * to avoid the "sql: no rows in result set" 404 caused by complex @collection joins.
 * The actual admin check is done here via a direct DB lookup.
 * 
 * Superusers (_superusers) are allowed to bypass company admin check.
 */
function requireCompanyAdmin(e) {
  const auth = e.auth
  if (!auth || !auth.id) {
    throw new ForbiddenError("Autenticação necessária")
  }

  // Allow superusers to edit any company via Admin UI
  try {
    const superuser = $app.findRecordById("_superusers", auth.id)
    if (superuser) {
      return e.next()
    }
  } catch (_) {
    // Not a superuser, continue to check company admin permissions
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
