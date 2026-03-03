/// <reference path="../pb_data/types.d.ts" />

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
