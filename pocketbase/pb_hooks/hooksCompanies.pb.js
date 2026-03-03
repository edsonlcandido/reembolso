/// <reference path="../pb_data/types.d.ts" />

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
