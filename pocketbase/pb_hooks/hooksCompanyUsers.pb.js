/// <reference path="../pb_data/types.d.ts" />

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
