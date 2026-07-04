# KPS கவர்பணை — Customer & Billing Enhancements

Extend the existing app without breaking any current feature (PhonePe QR, PDF, calculations, localStorage, UI).

## Data model changes (localStorage)

Keep the existing `BillEntry` fields intact and extend them:

```
BillEntry {
  id, name, plowingType, hours, amountPerHour, varavuAmount, totalAmount, date, paid,
  // NEW
  customerId?: string
  billingType?: string           // predefined or custom
  billNumber?: string            // KPS-B-000123
  invoiceNumber?: string         // KPS-INV-2026-000123
  payments?: { id, amount, date, method, note }[]
  createdAt?: number
}
```

`paid` becomes derived: `sum(payments) >= totalAmount`, but the existing `paid` flag stays synced for backward compatibility.

New store `src/lib/customers.ts` (extend existing):
```
Customer { id, name, mobile?, village?, createdAt, updatedAt }
```

One-time migration on app load:
- For every existing bill without `customerId`, find/create a `Customer` by name+mobile and attach `customerId`.
- Assign `billNumber` / `invoiceNumber` to legacy bills using a monotonic counter stored in localStorage.
- If `paid === true` and `payments` empty, seed a single payment for `totalAmount`.

## Billing type

New `src/lib/billing-types.ts`:
- Predefined list (Tamil): உழவு, ரோட்டேட்டர், கொக்கி கலப்பி, விதைப்பு, அறுவடை, போக்குவரத்து, மற்றவை.
- Custom types persisted to localStorage; combobox in bill form (select + free-text "மற்றவை").
- Every bill stores `billingType` (falls back to existing `plowingType` for legacy).

## Numbering

`src/lib/numbering.ts`:
- `nextBillNumber()` → `KPS-B-000001` (padded, per-workspace counter)
- `nextInvoiceNumber()` → `KPS-INV-<yyyy>-000001` (resets by year)
- Counters stored in localStorage; assigned when the bill is created.

## Customer selection (no duplicates)

`BillForm` gets a Customer combobox:
- Search existing customers by name or mobile.
- "Select existing" or "Create new" inline.
- Selected customer's name+mobile fills the bill; `customerId` is stored.
- Duplicate guard: same name+mobile → reuse existing customer.

## Multiple payments per bill

`src/components/PaymentsDialog.tsx`:
- List all payments on a bill, add new payment (amount, date, method: Cash/UPI/Other, note).
- Auto-computes remaining pending; marks `paid=true` when fully paid.
- Available from `BillTable`, `CustomerDetailPage`, and PDF button contexts.

## Customer profile enhancements

`CustomerDetailPage` gets a summary strip:
- Total Bills, Total Amount, Total Paid, Total Pending, Last Billing Date.
- Chronological bill list (newest first) with per-row: bill#, invoice#, billing type, total, paid, pending, actions (edit/delete/print/PDF/share/payments).

## Search & filters

New `src/components/BillFilters.tsx` used on `BillsPage`:
- Text search: name, mobile, invoice #, bill #.
- Selects: billing type, payment status (All / Paid / Partial / Pending).
- Date range (from/to).
- Filters applied client-side over `loadBills()` joined with customers.

## Dashboard

Update `Dashboard.tsx` to recompute on every mount from live localStorage:
- Total income (sum of payments), Total pending, Paid amount, Customer count, Bill count.
- Charts already exist — feed same source.

## Preservation

- `BillEntry` shape stays additive → existing PDF export, PhonePe QR, calculations keep working.
- `PaymentSection` reused; QR amount = current pending (already dynamic).
- No dependency changes; no build/runtime regressions.

## Files

Create:
- `src/lib/numbering.ts`
- `src/lib/billing-types.ts`
- `src/lib/payments.ts` (helpers: totals, add payment, migration)
- `src/lib/migrate.ts` (one-time migration, called from `App.tsx`)
- `src/components/CustomerCombobox.tsx`
- `src/components/BillingTypeCombobox.tsx`
- `src/components/PaymentsDialog.tsx`
- `src/components/BillFilters.tsx`
- `src/components/CustomerSummary.tsx`

Edit:
- `src/lib/billing-data.ts` (extend type, keep back-compat)
- `src/lib/customers.ts` (add id, mobile-based lookup)
- `src/components/BillForm.tsx` (customer combobox + billing type + numbering)
- `src/components/BillEditDialog.tsx` (billing type, payments trigger)
- `src/components/BillTable.tsx` (show bill#, invoice#, pending, payments action)
- `src/pages/BillsPage.tsx` (filters)
- `src/pages/CustomerDetailPage.tsx` (summary + full history + actions)
- `src/pages/Dashboard.tsx` (live totals)
- `src/App.tsx` (run migration once)

No deletions. No changes to PhonePe/QR/PDF core logic.
