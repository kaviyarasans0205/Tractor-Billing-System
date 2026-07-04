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
