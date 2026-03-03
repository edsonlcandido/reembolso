/// <reference path="../pb_data/types.d.ts" />

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
