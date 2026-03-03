/// <reference path="../pb_data/types.d.ts" />

/**
 * Hook: categories — enforce admin-only on create/update/delete
 *
 * The collection-level createRule/updateRule/deleteRule is simplified to
 * @request.auth.id != "" to avoid "sql: no rows in result set" 404 from
 * complex @collection joins. The admin check is enforced here instead.
 */
function requireCategoryAdmin(e) {
  const auth = e.auth
  if (!auth || !auth.id) {
    throw new ForbiddenError("Autenticação necessária")
  }

  const companyId = e.record.getString("company")
  if (!companyId) {
    throw new ForbiddenError("Categoria sem empresa associada")
  }

  try {
    // auth.id and companyId are PocketBase-generated alphanumeric IDs,
    // not user-supplied values, so string interpolation is safe here.
    const memberships = $app.findRecordsByFilter(
      "company_users",
      `user = "${auth.id}" && company = "${companyId}" && role = "admin"`,
      "",
      1,
      0
    )
    if (!memberships || memberships.length === 0) {
      throw new ForbiddenError("Apenas administradores da empresa podem gerenciar categorias")
    }
  } catch (err) {
    if (err instanceof ForbiddenError) throw err
    throw new ForbiddenError("Erro ao verificar permissões: " + String(err))
  }

  return e.next()
}

onRecordCreateRequest(requireCategoryAdmin, "categories")
onRecordUpdateRequest(requireCategoryAdmin, "categories")
onRecordDeleteRequest(requireCategoryAdmin, "categories")
