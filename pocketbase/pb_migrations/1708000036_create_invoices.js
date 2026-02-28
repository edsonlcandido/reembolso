/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Create invoices collection for PRO plan billing
 *
 * Stores one invoice per (company, billing cycle) with:
 *  - cycle_start / cycle_end  — ISO date strings defining the billing period
 *  - cycle_days               — total days in the cycle
 *  - total_user_days          — sum of active user-days across all users
 *  - amount_cents             — total amount in cents (BRL)
 *  - status                   — pending / paid / failed
 *  - breakdown_json           — JSON array with per-user billing detail
 *
 * Idempotency is guaranteed by a unique index on (company, cycle_start, cycle_end).
 */
migrate((app) => {
  const companiesCol = app.findCollectionByNameOrId("companies")

  const col = new Collection({
    type: "base",
    name: "invoices",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      {
        name: "company",
        type: "relation",
        required: true,
        collectionId: companiesCol.id,
        maxSelect: 1,
        cascadeDelete: true,
      },
      { name: "cycle_start", type: "date", required: true },
      { name: "cycle_end", type: "date", required: true },
      { name: "cycle_days", type: "number", required: false, min: 0 },
      { name: "total_user_days", type: "number", required: false, min: 0 },
      { name: "amount_cents", type: "number", required: false, min: 0 },
      {
        name: "status",
        type: "select",
        required: true,
        maxSelect: 1,
        values: ["pending", "paid", "failed"],
      },
      { name: "breakdown_json", type: "json", required: false },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_invoices_cycle ON invoices (company, cycle_start, cycle_end)",
    ],
  })

  app.save(col)
}, (app) => {
  try {
    const col = app.findCollectionByNameOrId("invoices")
    app.delete(col)
  } catch (_) {}
})
