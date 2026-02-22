#!/usr/bin/env node
/**
 * Backend Integration Tests — Expense Reimbursement Workflow
 *
 * Tests the full lifecycle of an expense report:
 *  1.  Create admin account
 *  2.  Create company (admin becomes company admin)
 *  3.  Create employee and link to company
 *  4.  Create expense report (as employee)
 *  5.  Add expense item to report
 *  6.  Create second employee (future approver)
 *  7.  Admin promotes second employee to approver
 *  8.  Employee submits report to approver
 *  9.  Approver returns report for revision
 *  10. Employee adds a new expense item
 *  11. Employee edits an existing expense item amount
 *  12. Employee resubmits report to approver
 *  13. Create financial user and link to company
 *  14. Admin promotes financial user to approver
 *  15. Approver approves report and forwards to financial
 *  16. Financial marks report as paid
 *
 * Usage:
 *   POCKETBASE_URL=http://localhost:8090 node tests/backend-flow.test.mjs
 *
 * Requires a running PocketBase instance with the project migrations applied.
 * No external dependencies — uses native Node.js fetch (Node >= 18).
 */

const BASE_URL = (process.env.POCKETBASE_URL || "http://localhost:8090").replace(/\/$/, "")

let passed = 0
let failed = 0

/** Print a passing assertion */
function ok(label) {
  console.log(`  ✅ ${label}`)
  passed++
}

/** Print a failing assertion and stop the test run */
function fail(label, detail) {
  console.error(`  ❌ ${label}`)
  if (detail) console.error(`     ${JSON.stringify(detail)}`)
  failed++
  throw new Error(`Test failed: ${label}`)
}

/**
 * Thin fetch wrapper.
 * @param {string} path - API path (e.g. "/api/collections/users/records")
 * @param {object} opts - fetch options; `body` is auto-serialised to JSON
 * @returns {{ status: number, data: object }}
 */
async function api(path, opts = {}) {
  const { body, headers = {}, ...rest } = opts
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

/** Auth header object for a bearer token */
const bearer = (token) => ({ Authorization: `Bearer ${token}` })

/** Generate a unique string suffix to avoid collisions between test runs */
function uid() {
  return `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
}

/** Register a new user account */
async function register(name, email, password) {
  return api("/api/collections/users/records", {
    method: "POST",
    body: { name, email, password, passwordConfirm: password },
  })
}

/** Authenticate and return { token, id } */
async function login(email, password) {
  const { status, data } = await api("/api/collections/users/auth-with-password", {
    method: "POST",
    body: { identity: email, password },
  })
  if (status !== 200) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`)
  return { token: data.token, id: data.record.id }
}

// ─── Main test runner ────────────────────────────────────────────────────────

async function run() {
  const id = uid()

  // ── 1. Create admin account ───────────────────────────────────────────────
  console.log("\n1. Creating admin account...")
  const adminEmail = `admin_${id}@test.com`
  const adminPass = "Admin1234!"
  const r1 = await register("Admin User", adminEmail, adminPass)
  if (r1.status !== 200) fail("Admin user registration", r1.data)
  ok(`Admin registered: ${adminEmail}`)

  const admin = await login(adminEmail, adminPass)
  ok("Admin logged in")

  // ── 2. Create company ─────────────────────────────────────────────────────
  console.log("\n2. Creating company...")
  const r2 = await api("/api/companies/create", {
    method: "POST",
    headers: bearer(admin.token),
    body: { name: "Empresa Teste", slug: `empresa-${id}`, email: `contact_${id}@empresa.com` },
  })
  if (r2.status !== 200) fail("Company creation", r2.data)
  const companyId = r2.data.id
  ok(`Company created (id=${companyId})`)

  // ── 3. Create employee and link to company ────────────────────────────────
  console.log("\n3. Creating employee...")
  const empEmail = `employee_${id}@test.com`
  const empPass = "Employee1234!"
  const r3 = await register("Employee User", empEmail, empPass)
  if (r3.status !== 200) fail("Employee registration", r3.data)
  const empId = r3.data.id
  ok(`Employee registered: ${empEmail}`)

  const r3b = await api("/api/collections/company_users/records", {
    method: "POST",
    headers: bearer(admin.token),
    body: { company: companyId, user: empId, role: "employee", active: true },
  })
  if (r3b.status !== 200) fail("Employee linked to company", r3b.data)
  ok("Employee linked to company")

  const emp = await login(empEmail, empPass)
  ok("Employee logged in")

  // ── 4. Create expense report ──────────────────────────────────────────────
  console.log("\n4. Creating expense report...")
  const r4 = await api("/api/collections/expense_reports/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: {
      company: companyId,
      user: empId,
      title: "Relatório de Testes",
      status: "draft",
    },
  })
  if (r4.status !== 200) fail("Expense report creation", r4.data)
  const reportId = r4.data.id
  ok(`Expense report created (id=${reportId})`)

  // ── 5. Add expense item ───────────────────────────────────────────────────
  console.log("\n5. Adding expense item...")
  const originalItemAmount = 50.0
  const r5 = await api("/api/collections/expense_items/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: { report: reportId, amount: originalItemAmount, description: "Almoço de negócios", category: "food" },
  })
  if (r5.status !== 200) fail("Expense item creation", r5.data)
  const itemId = r5.data.id
  ok(`Expense item added (id=${itemId}, amount=${originalItemAmount})`)

  // ── 6. Create approver employee ───────────────────────────────────────────
  console.log("\n6. Creating second employee (future approver)...")
  const approverEmail = `approver_${id}@test.com`
  const approverPass = "Approver1234!"
  const r6 = await register("Approver User", approverEmail, approverPass)
  if (r6.status !== 200) fail("Approver registration", r6.data)
  const approverId = r6.data.id
  ok(`Approver registered: ${approverEmail}`)

  const r6b = await api("/api/collections/company_users/records", {
    method: "POST",
    headers: bearer(admin.token),
    body: { company: companyId, user: approverId, role: "employee", active: true },
  })
  if (r6b.status !== 200) fail("Approver linked to company", r6b.data)
  const approverMembershipId = r6b.data.id
  ok("Approver linked to company as employee")

  // ── 7. Admin promotes employee to approver ────────────────────────────────
  console.log("\n7. Admin promotes employee to approver...")
  const r7 = await api(`/api/collections/company_users/records/${approverMembershipId}`, {
    method: "PATCH",
    headers: bearer(admin.token),
    body: { role: "approver" },
  })
  if (r7.status !== 200) fail("Promote to approver", r7.data)
  ok("Employee role updated to approver")

  const approver = await login(approverEmail, approverPass)
  ok("Approver logged in")

  // ── 8. Employee submits report to approver ────────────────────────────────
  console.log("\n8. Employee submits report...")
  const r8 = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { status: "submitted", submitted_to: approverId },
  })
  if (r8.status !== 200) fail("Report submission", r8.data)
  ok("Report status → submitted")

  // ── 9. Approver returns report for revision ───────────────────────────────
  console.log("\n9. Approver returns report for revision...")
  const r9a = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(approver.token),
    body: {
      report: reportId,
      company: companyId,
      user: approverId,
      action: "return_for_revision",
      notes: "Por favor, adicione mais detalhes às despesas.",
    },
  })
  if (r9a.status !== 200) fail("Approval action (return_for_revision)", r9a.data)
  ok("Approval action recorded (return_for_revision)")

  const r9b = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(approver.token),
    body: { status: "rejected", rejection_reason: "Por favor, adicione mais detalhes às despesas." },
  })
  if (r9b.status !== 200) fail("Report status update to rejected", r9b.data)
  ok("Report status → rejected (returned for revision)")

  // ── 10. Employee adds a new expense item ──────────────────────────────────
  console.log("\n10. Employee adds new expense item...")
  const r10 = await api("/api/collections/expense_items/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: { report: reportId, amount: 30.0, description: "Táxi para reunião", category: "transport" },
  })
  if (r10.status !== 200) fail("New expense item creation", r10.data)
  ok(`New expense item added (id=${r10.data.id}, amount=30.00)`)

  // ── 11. Employee edits an existing expense item ───────────────────────────
  console.log("\n11. Employee edits expense item amount...")
  const updatedItemAmount = 75.0
  const r11 = await api(`/api/collections/expense_items/records/${itemId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { amount: updatedItemAmount },
  })
  if (r11.status !== 200) fail("Expense item update", r11.data)
  ok(`Expense item updated (amount: ${originalItemAmount} → ${r11.data.amount})`)

  // ── 12. Employee resubmits report ─────────────────────────────────────────
  console.log("\n12. Employee resubmits report...")
  const r12 = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { status: "submitted", submitted_to: approverId },
  })
  if (r12.status !== 200) fail("Report resubmission", r12.data)
  ok("Report status → submitted (resubmitted)")

  // ── 13. Create financial user and link to company ─────────────────────────
  console.log("\n13. Creating financial user...")
  const finEmail = `financial_${id}@test.com`
  const finPass = "Financial1234!"
  const r13 = await register("Financial User", finEmail, finPass)
  if (r13.status !== 200) fail("Financial user registration", r13.data)
  const finId = r13.data.id
  ok(`Financial user registered: ${finEmail}`)

  const r13b = await api("/api/collections/company_users/records", {
    method: "POST",
    headers: bearer(admin.token),
    body: { company: companyId, user: finId, role: "employee", active: true },
  })
  if (r13b.status !== 200) fail("Financial user linked to company", r13b.data)
  const finMembershipId = r13b.data.id
  ok("Financial user linked to company")

  // ── 14. Admin promotes financial user to approver ─────────────────────────
  console.log("\n14. Admin promotes financial user to approver...")
  const r14 = await api(`/api/collections/company_users/records/${finMembershipId}`, {
    method: "PATCH",
    headers: bearer(admin.token),
    body: { role: "approver" },
  })
  if (r14.status !== 200) fail("Promote financial user to approver", r14.data)
  ok("Financial user role updated to approver")

  const fin = await login(finEmail, finPass)
  ok("Financial user logged in")

  // ── 15. Approver approves report and forwards to financial ────────────────
  console.log("\n15. Approver approves report and forwards to financial...")
  const r15a = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(approver.token),
    body: {
      report: reportId,
      company: companyId,
      user: approverId,
      action: "forward",
      forwarded_to: finId,
      notes: "Aprovado. Encaminhando para o financeiro.",
    },
  })
  if (r15a.status !== 200) fail("Approval action (forward)", r15a.data)
  ok("Approval action recorded (forward to financial)")

  const r15b = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(approver.token),
    body: {
      status: "approved",
      approved_by: approverId,
      approved_at: new Date().toISOString(),
    },
  })
  if (r15b.status !== 200) fail("Report approval", r15b.data)
  ok("Report status → approved")

  // ── 16. Financial marks report as paid ────────────────────────────────────
  console.log("\n16. Financial marks report as paid...")
  const r16a = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(fin.token),
    body: {
      report: reportId,
      company: companyId,
      user: finId,
      action: "pay",
      notes: "Pagamento processado.",
    },
  })
  if (r16a.status !== 200) fail("Approval action (pay)", r16a.data)
  ok("Approval action recorded (pay)")

  const r16b = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(fin.token),
    body: { status: "paid" },
  })
  if (r16b.status !== 200) fail("Report marked as paid", r16b.data)
  ok("Report status → paid")

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────────")
  console.log(`Results: ${passed} passed, ${failed} failed`)
}

run()
  .then(() => {
    console.log("\n✅ All tests passed!\n")
    process.exit(0)
  })
  .catch((err) => {
    console.error(`\n❌ Tests failed: ${err.message}\n`)
    console.log(`Results: ${passed} passed, ${failed} failed\n`)
    process.exit(1)
  })
