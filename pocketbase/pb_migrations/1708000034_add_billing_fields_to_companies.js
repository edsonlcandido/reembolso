/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add billing/plan fields to companies
 *
 * Adds:
 *  - plan (FREE/PRO) — defaults to FREE when not set
 *  - billing_anchor_day (1..28) — day of month the billing cycle starts
 *  - billing_timezone (IANA tz string) — e.g. "America/Sao_Paulo"
 */
migrate((app) => {
  const col = app.findCollectionByNameOrId("companies")

  col.fields.add(new Field({
    name: "plan",
    type: "select",
    required: false,
    maxSelect: 1,
    values: ["FREE", "PRO"],
  }))

  col.fields.add(new Field({
    name: "billing_anchor_day",
    type: "number",
    required: false,
    min: 1,
    max: 28,
  }))

  col.fields.add(new Field({
    name: "billing_timezone",
    type: "text",
    required: false,
    max: 50,
  }))

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("companies")

  for (const fieldName of ["plan", "billing_anchor_day", "billing_timezone"]) {
    try {
      const f = col.fields.getByName(fieldName)
      col.fields.remove(f)
    } catch (_) {}
  }

  app.save(col)
})
