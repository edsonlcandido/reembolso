#!/usr/bin/env node
/**
 * Backend Integration Tests — Expense Reimbursement Workflow
 *
 * Tests the full lifecycle of an expense report:
 *  1.  Create admin account
 *  2.  Create company (admin becomes company admin)
 *  3.  Create employee and link to company
 *  4.  Create expense report (as employee)
 *  4.1 Fetch company categories
 *  5.1 Test: Employee CANNOT forward approval
 *  5.2 Test: Invalid category validation
 *  5.  Add expense item to report
 *  6.  Create second employee (future approver)
 *  6.1 Admin promotes second employee to approver
 *  6.2 Test: Approver CAN forward approval
 *  7.  Employee submits report to approver
 *  8.  Approver returns report for revision
 *  9.  Employee adds a new expense item
 *  10. Employee edits an existing expense item amount
 *  11. Employee resubmits report to approver
 *  12. Create financial user and link to company
 *  13. Admin promotes financial user to approver
 *  14. Approver approves report and forwards to financial
 *  15. Test: approver who approved CANNOT register payment action
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
    body: { name, email, password, passwordConfirm: password, emailVisibility: true },
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

/** Fetch categories for a company */
async function getCompanyCategories(companyId, token) {
  const { status, data } = await api(
    `/api/collections/categories/records?filter=company="${companyId}"&sort=name`,
    { headers: bearer(token) }
  )
  if (status !== 200) throw new Error(`Failed to fetch categories: ${JSON.stringify(data)}`)
  return data.items || []
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

  // ── 2.1. Test company update permissions ──────────────────────────────────
  console.log("\n2.1. Testing company update permissions...")

  // Admin CAN update company
  const r2_1a = await api(`/api/collections/companies/records/${companyId}`, {
    method: "PATCH",
    headers: bearer(admin.token),
    body: { name: "Empresa Teste Atualizada" },
  })
  if (r2_1a.status !== 200) fail("Admin should be able to update company", r2_1a.data)
  ok("Admin CAN update company")

  // Non-admin (employee) CANNOT update company
  const r2_1b = await api(`/api/collections/companies/records/${companyId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { name: "Tentativa não autorizada" },
  })
  if (r2_1b.status === 200) fail("Employee should NOT be able to update company", r2_1b.data)
  ok(`Employee CANNOT update company (status=${r2_1b.status}, enforced by hook)`)

  // ── 2.2. Test category permissions ───────────────────────────────────────
  console.log("\n2.2. Testing category create/update/delete permissions...")

  // Non-admin (employee) CANNOT create category
  const r2_2a = await api("/api/collections/categories/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: { company: companyId, name: "Tentativa Não Autorizada", icon: "🚫" },
  })
  if (r2_2a.status === 200) fail("Employee should NOT be able to create category", r2_2a.data)
  if (r2_2a.status !== 403) fail("Employee category create should be rejected with 403", r2_2a.data)
  ok(`Employee CANNOT create category (status=${r2_2a.status}, enforced by hook)`)

  // Admin CAN create category
  const r2_2b = await api("/api/collections/categories/records", {
    method: "POST",
    headers: bearer(admin.token),
    body: { company: companyId, name: "Categoria Teste Admin", icon: "🧪" },
  })
  if (r2_2b.status !== 200) fail("Admin should be able to create category", r2_2b.data)
  const testCategoryId = r2_2b.data.id
  ok(`Admin CAN create category (id=${testCategoryId})`)

  // Admin CAN update category
  const r2_2c = await api(`/api/collections/categories/records/${testCategoryId}`, {
    method: "PATCH",
    headers: bearer(admin.token),
    body: { name: "Categoria Teste Admin Atualizada" },
  })
  if (r2_2c.status !== 200) fail("Admin should be able to update category", r2_2c.data)
  ok("Admin CAN update category")

  // Non-admin (employee) CANNOT update category
  const r2_2d = await api(`/api/collections/categories/records/${testCategoryId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { name: "Tentativa não autorizada" },
  })
  if (r2_2d.status === 200) fail("Employee should NOT be able to update category", r2_2d.data)
  if (r2_2d.status !== 403) fail("Employee category update should be rejected with 403", r2_2d.data)
  ok(`Employee CANNOT update category (status=${r2_2d.status}, enforced by hook)`)

  // Admin CAN delete category
  const r2_2e = await api(`/api/collections/categories/records/${testCategoryId}`, {
    method: "DELETE",
    headers: bearer(admin.token),
  })
  if (r2_2e.status !== 204) fail("Admin should be able to delete category", r2_2e.data)
  ok("Admin CAN delete category")

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

  // ── 4.1 Fetch company categories ──────────────────────────────────────────
  console.log("\n4.1. Fetching company categories...")
  const categories = await getCompanyCategories(companyId, emp.token)
  if (categories.length === 0) fail("No categories found for company")
  const foodCategoryId = categories.find(c => c.name === "Alimentação")?.id || categories[0].id
  const transportCategoryId = categories.find(c => c.name === "Transporte")?.id || categories[0].id
  ok(`Found ${categories.length} categories; using "${categories.find(c => c.id === foodCategoryId)?.name}" (id=${foodCategoryId})`)

  // ── 5. Add expense item ───────────────────────────────────────────────────
  console.log("\n5. Adding expense item...")
  const originalItemAmount = 50.0
  const r5 = await api("/api/collections/expense_items/records",
    {
      method: "POST",
      headers: bearer(emp.token),
      body: {
        report: reportId,
        amount: originalItemAmount,
        description: "Almoço de negócios",
        category: foodCategoryId  // ✅ Use actual category ID
      }
    })
  if (r5.status !== 200) fail("Expense item creation", r5.data)
  const itemId = r5.data.id
  ok(`Expense item added (id=${itemId}, amount=${originalItemAmount})`)

  // ── 5.km. Test km-based amount recalculation ──────────────────────────────
  console.log("\n5.km. Testing km-based expense item amount enforcement...")

  // Set company km_rate so we have a known value to verify against
  const kmRate = 0.65
  const rKmRate = await api(`/api/collections/companies/records/${companyId}`, {
    method: "PATCH",
    headers: bearer(admin.token),
    body: { km_rate: kmRate },
  })
  if (rKmRate.status !== 200) fail("Setting company km_rate", rKmRate.data)
  ok(`Company km_rate set to R$${kmRate}/km`)

  const kmCategoryId = categories.find(c => c.name === "Quilometragem")?.id || transportCategoryId

  // Client sends an inflated amount=9999; hook must override it with km × km_rate.
  // Backend stores amount in centavos for km-based items.
  const kmDistance = 100
  const expectedAmountInCents = Math.round(kmDistance * kmRate * 100)  // 6500 cents
  const rKmItem = await api("/api/collections/expense_items/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: {
      report: reportId,
      km: kmDistance,
      amount: 9999,  // inflated — must be ignored by server
      description: "Viagem 100km",
      category: kmCategoryId,
    },
  })
  if (rKmItem.status !== 200) fail("Km expense item creation", rKmItem.data)
  const serverAmount = rKmItem.data.amount
  if (serverAmount !== expectedAmountInCents) {
    fail(
      `Km amount should be recalculated server-side in cents: expected ${expectedAmountInCents}, got ${serverAmount}`,
      rKmItem.data
    )
  }
  const expectedAmountInReais = (expectedAmountInCents / 100).toFixed(2)
  ok(
    `Km item amount recalculated server-side: ${kmDistance}km × R$${kmRate} = R$${expectedAmountInReais} (${serverAmount} centavos; client sent 9999)`
  )

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


  // ── 5.1 Testing permission: employee cannot forward approval ───────────
  console.log("\n5.1. Testing permission: employee cannot forward approval...")
  const r5_1 = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: {
      report: reportId,
      company: companyId,      user: empId,      action: "forward",
      forwarded_to: empId,
    },
  })
  // ❌ Esperamos status 400 (ValidationError)
  if (r5_1.status === 200) {
    fail("Employee should NOT be able to forward approval", {
      status: r5_1.status,
      data: r5_1.data,
    })
  }
  ok(`✅ Permission enforced: employee cannot forward (${r5_1.data.message || "rejected"})`)

  // ── 5.2 Testing validation: invalid category ────────────────────────────
  console.log("\n5.2. Testing validation: invalid category...")
  const r5_2 = await api("/api/collections/expense_items/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: {
      report: reportId,
      amount: 50.0,
      description: "Test",
      category: "invalid_id_xyz", // ❌ categoria não existe
    },
  })
  if (r5_2.status === 200) fail("Should reject invalid category", r5_2.data)
  ok("✅ Validation enforced: category must exist")

  // ── 6. Admin promotes employee to approver ────────────────────────────────
  console.log("\n6. Admin promotes employee to approver...")
  const r6c = await api(`/api/collections/company_users/records/${approverMembershipId}`, {
    method: "PATCH",
    headers: bearer(admin.token),
    body: { role: "approver" },
  })
  if (r6c.status !== 200) fail("Promote to approver", r6c.data)
  ok("Employee role updated to approver")

  const approver = await login(approverEmail, approverPass)
  ok("Approver logged in")

  // ── 6.1 Testing permission: NOW approver CAN forward approval ─────────────
  console.log("\n6.1. Testing permission: approver CAN forward approval...")
  const r6_1 = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(approver.token),
    body: {
      report: reportId,
      company: companyId,
      user: approverId,
      action: "forward",
      forwarded_to: approverId,
    },
  })
  if (r6_1.status !== 200) {
    fail("Approver should be able to forward approval", r6_1.data)
  }
  ok(`✅ Permission granted: approver forwarded (id=${r6_1.data.id})`)

  // ── 7. Employee submits report to approver ────────────────────────────────
  console.log("\n7. Employee submits report...")
  const r7a = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { status: "submitted", submitted_to: approverId },
  })
  if (r7a.status !== 200) fail("Report submission", r7a.data)
  ok("Report status → submitted")

  const r7b = await api(`/api/collections/approval_actions/records?filter=report="${reportId}"&&action="forward"&&user="${empId}"&&forwarded_to="${approverId}"`, {
    headers: bearer(emp.token),
  })
  if (r7b.status !== 200 || (r7b.data.items || []).length === 0) {
    fail("Submission audit action created", r7b.data)
  }
  ok("Submission audit action recorded (forward)")

  // ── 8. Approver returns report for revision ───────────────────────────────
  console.log("\n8. Approver returns report for revision...")
  const r8a = await api("/api/collections/approval_actions/records", {
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
  if (r8a.status !== 200) fail("Approval action (return_for_revision)", r8a.data)
  ok("Approval action recorded (return_for_revision)")

  const r8b = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(approver.token),
    body: { status: "rejected", rejection_reason: "Por favor, adicione mais detalhes às despesas." },
  })
  if (r8b.status !== 200) fail("Report status update to rejected", r8b.data)
  ok("Report status → rejected (returned for revision)")

  // ── 9. Employee adds a new expense item ───────────────────────────────────
  console.log("\n9. Employee adds new expense item...")
  const r9 = await api("/api/collections/expense_items/records", {
    method: "POST",
    headers: bearer(emp.token),
    body: {
      report: reportId,
      amount: 30.0,
      description: "Táxi para reunião",
      category: transportCategoryId
    },
  })
  if (r9.status !== 200) fail("New expense item creation", r9.data)
  ok(`New expense item added (id=${r9.data.id}, amount=30.00)`)

  // ── 10. Employee edits an existing expense item ──────────────────────────
  console.log("\n10. Employee edits expense item amount...")
  const updatedItemAmount = 75.0
  const r10 = await api(`/api/collections/expense_items/records/${itemId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { amount: updatedItemAmount },
  })
  if (r10.status !== 200) fail("Expense item update", r10.data)
  ok(`Expense item updated (amount: ${originalItemAmount} → ${r10.data.amount})`)

  // ── 11. Employee resubmits report ─────────────────────────────────────────
  console.log("\n11. Employee resubmits report...")
  const r11 = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(emp.token),
    body: { status: "submitted", submitted_to: approverId },
  })
  if (r11.status !== 200) fail("Report resubmission", r11.data)
  ok("Report status → submitted (resubmitted)")

  const r11b = await api(`/api/collections/approval_actions/records?filter=report="${reportId}"&&action="forward"&&user="${empId}"&&forwarded_to="${approverId}"`, {
    headers: bearer(emp.token),
  })
  if (r11b.status !== 200 || (r11b.data.items || []).length < 2) {
    fail("Resubmission audit action created", r11b.data)
  }
  ok("Resubmission audit action recorded (forward)")

  // ── 12. Create financial user and link to company ─────────────────────────
  console.log("\n12. Creating financial user...")
  const finEmail = `financial_${id}@test.com`
  const finPass = "Financial1234!"
  const r12 = await register("Financial User", finEmail, finPass)
  if (r12.status !== 200) fail("Financial user registration", r12.data)
  const finId = r12.data.id
  ok(`Financial user registered: ${finEmail}`)

  const r12b = await api("/api/collections/company_users/records", {
    method: "POST",
    headers: bearer(admin.token),
    body: { company: companyId, user: finId, role: "employee", active: true },
  })
  if (r12b.status !== 200) fail("Financial user linked to company", r12b.data)
  const finMembershipId = r12b.data.id
  ok("Financial user linked to company")

  // ── 13. Admin promotes financial user to approver ────────────────────────
  console.log("\n13. Admin promotes financial user to approver...")
  const r13 = await api(`/api/collections/company_users/records/${finMembershipId}`, {
    method: "PATCH",
    headers: bearer(admin.token),
    body: { role: "approver" },
  })
  if (r13.status !== 200) fail("Promote financial user to approver", r13.data)
  ok("Financial user role updated to approver")

  const fin = await login(finEmail, finPass)
  ok("Financial user logged in")

  // ── 14. Approver approves report and forwards to financial ───────────────
  console.log("\n14. Approver approves report and forwards to financial...")
  const r14a = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(approver.token),
    body: {
      report: reportId,
      company: companyId,      user: approverId,      action: "forward",
      forwarded_to: finId,
    },
  })
  if (r14a.status !== 200) fail("Approval action (forward)", r14a.data)
  ok("Approval action recorded (forward to financial)")

  const r14b = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(approver.token),
    body: {
      status: "approved",
      approved_by: approverId,
      approved_at: new Date().toISOString(),
    },
  })
  if (r14b.status !== 200) fail("Report approval", r14b.data)
  ok("Report status → approved")

  // ── 15. Validate segregation-of-duties on payment action ──────────────────
  console.log("\n15. Validating payment segregation rule...")
  const r15 = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(approver.token),
    body: {
      report: reportId,
      company: companyId,
      user: approverId,
      action: "pay",
    },
  })
  if (r15.status === 200) fail("Approver who approved should NOT be able to create pay action", r15.data)
  if (r15.status !== 400) fail("Pay action should be rejected with 400", r15.data)
  ok("Approver who approved cannot create pay action (segregation rule enforced)")

  // ── 16. Financial marks report as paid ───────────────────────────────────
  console.log("\n16. Financial marks report as paid...")
  const r15a = await api("/api/collections/approval_actions/records", {
    method: "POST",
    headers: bearer(fin.token),
    body: {
      report: reportId,
      company: companyId,      user: finId,      action: "pay",
    },
  })
  if (r15a.status !== 200) fail("Approval action (pay)", r15a.data)
  ok("Approval action recorded (pay)")

  const r15b = await api(`/api/collections/expense_reports/records/${reportId}`, {
    method: "PATCH",
    headers: bearer(fin.token),
    body: { status: "paid" },
  })
  if (r15b.status !== 200) fail("Report marked as paid", r15b.data)
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
