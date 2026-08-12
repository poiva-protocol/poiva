# Poiva Protocol Specification

**Document:** 15 - Settlement

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

**Settlement** records the commercial completion of a Mission (Document 05) — an invoice, a
payroll entry, a purchase order, internal accounting, or a grant distribution. Settlement is
intentionally optional at the protocol level (`02-design-principles.md` Principle 17): completion
of work does not necessarily imply financial compensation, and the protocol avoids specifying any
payment mechanism.

---

# 2. Design Goals

Settlements MUST:

* belong to exactly one Mission
* declare a `type`
* expose a lifecycle state

Settlement MUST NOT prescribe a payment provider, currency system, or accounting method — those
remain implementation details (`03-domain-model.md` §"Settlement").

---

# 3. Settlement Model

```text
Mission
?
??? Settlement #1 (type=INVOICE, state=CONFIRMED)
??? Settlement #2 (type=INTERNAL_ACCOUNTING, state=PENDING)
```

A Mission MAY have zero, one, or multiple Settlement records — for example, a partial invoice
followed by a final one.

---

# 4. Required Fields

| Field   | Type              | Description                                                              |
| ------- | ----------------- | --------------------------------------------------------------------------- |
| id      | UUID               | Global identifier                                                            |
| mission | Mission Reference  | Owning Mission                                                                |
| type    | Enum               | INVOICE, PAYROLL, INTERNAL_ACCOUNTING, PURCHASE_ORDER, or GRANT              |
| state   | Enum               | PENDING, CONFIRMED, or CANCELLED                                              |

## Optional Fields

| Field       | Description |
| ----------- | ----------- |
| amount      | Monetary amount |
| currency    | Currency code for `amount` |
| confirmedAt | Timestamp the settlement was confirmed |

---

# 5. Lifecycle

```text
Pending
    ?
    ??????????????
    ?             ?
Confirmed      Cancelled
```

## States

| State     | Description                              |
| --------- | ------------------------------------------- |
| PENDING   | Settlement has been recorded, not yet confirmed |
| CONFIRMED | Settlement has been completed                |
| CANCELLED | Settlement will not proceed                  |

---

# 6. State Transition Rules

The following transitions are valid:

* PENDING → CONFIRMED
* PENDING → CANCELLED

CONFIRMED and CANCELLED are both terminal.

---

# 7. Relationships

## Mission (Document 05)

Every Settlement belongs to exactly one Mission and typically follows successful Verification and
Approval (`05-mission.md` §7-8).

## Policy (Document 23)

A Policy with `appliesTo` SETTLEMENT MAY describe the rule a Settlement should follow (e.g. "invoice
only after all Deliverables ACCEPTED"), without the protocol mandating an enforcement mechanism.

---

# 8. Events

* `settlement.created`
* `settlement.confirmed`
* `settlement.state_changed`
* `settlement.deleted`

---

# 9. Invariants

A compliant implementation MUST ensure:

* Every Settlement belongs to exactly one Mission.
* A Settlement's state transitions follow the graph in §6; CONFIRMED and CANCELLED are terminal.
* `confirmedAt` is set when, and only when, a Settlement transitions to CONFIRMED.
* The protocol does not require Settlement records to sum to any particular total — that
  reconciliation remains implementation-defined.

---

# 10. JSON Representation

```json
{
  "id": "settlement-af3c10",
  "missionId": "mission-8fd24c8d",
  "type": "INVOICE",
  "state": "CONFIRMED",
  "amount": 6000.00,
  "currency": "USD",
  "confirmedAt": "2026-08-12T10:00:00Z"
}
```

---

# 11. REST Resources

```http
GET    /missions/{id}/settlements
POST   /missions/{id}/settlements
GET    /settlements/{id}
PATCH  /settlements/{id}/state
POST   /settlements/{id}/confirm
DELETE /settlements/{id}
```

---

# 12. Extension Points

Extensions MAY define additional settlement types (e.g. "volunteer_credit", "in_kind_exchange")
and MAY attach payment-provider-specific metadata (transaction ids, payout schedules) to a
Settlement record.

* Extensions MUST NOT require any specific payment provider or financial mechanism.
* Extensions MUST NOT redefine the PENDING/CONFIRMED/CANCELLED lifecycle.

---

# 13. Security Considerations

Settlement records MAY contain sensitive financial information (amounts, references). Implementations
SHOULD restrict Settlement visibility to the Mission's Sponsor and authorized finance roles, and
SHOULD apply encryption at rest consistent with the Mission's visibility policy (`05-mission.md`
§24). The protocol does not define authentication for payment execution; that remains an
implementation and payment-provider concern.
