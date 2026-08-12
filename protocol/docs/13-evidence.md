# Poiva Protocol Specification

**Document:** 13 - Evidence

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

**Evidence** supports claims made about a Deliverable (Document 12) — a passing CI run, a
photograph, an inspection report, a GPS trace, a digital signature. Evidence exists so that
Verification (Document 14) can determine whether a Deliverable satisfies its Acceptance Criteria
without relying solely on personal trust, per `02-design-principles.md` Principle 2 ("Evidence
Over Trust").

---

# 2. Design Goals

Evidence MUST:

* belong to exactly one Deliverable
* possess a globally unique identifier
* declare a `type`

Evidence MUST NOT be modified or deleted once collected — Evidence is immutable
(`05-mission.md` §16). There is no update or delete operation.

---

# 3. Evidence Model

```text
Deliverable
?
??? Evidence: "CI pipeline run" (type=ci, collectedAt=...)
??? Evidence: "Site photograph" (type=photo, collectedAt=...)
??? Evidence: "Inspection signature" (type=signature, collectedAt=...)
```

---

# 4. Required Fields

| Field       | Type                  | Description                          |
| ----------- | --------------------- | --------------------------------------- |
| id          | UUID                   | Global identifier                        |
| deliverable | Deliverable Reference  | Owning Deliverable                        |
| type        | String                 | Free-text category (e.g. "ci", "photo", "gps", "signature") |
| locator     | String                 | Where the evidence content lives (URL or path) |

## Optional Fields

| Field       | Description |
| ----------- | ----------- |
| checksum    | Integrity hash of the evidence content |
| collectedAt | Timestamp the evidence was collected |

---

# 5. Relationships

## Deliverable (Document 12)

Every Evidence record belongs to exactly one Deliverable and contributes to the case that the
Deliverable satisfies its declared Acceptance Criteria.

## Verification (Document 14)

Verification examines a Deliverable's Evidence to determine an outcome. Evidence itself carries no
outcome — it is Verification that judges sufficiency.

## Activity (Document 06)

Evidence is attached to Activities indirectly, through the Deliverables an Activity produces
(`06-activity.md` §9).

---

# 6. Events

* `evidence.attached`

---

# 7. Invariants

A compliant implementation MUST ensure:

* Evidence belongs to exactly one Deliverable for its entire lifetime.
* Evidence, once created, MUST NOT be modified.
* Evidence, once created, MUST NOT be deleted.
* Evidence remains accessible after its Deliverable and Mission reach a terminal state.

---

# 8. JSON Representation

```json
{
  "id": "evidence-2c9f14",
  "deliverableId": "deliverable-7a12f0",
  "type": "ci",
  "locator": "https://ci.example.com/runs/48213",
  "checksum": "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
  "collectedAt": "2026-08-10T14:32:00Z"
}
```

---

# 9. REST Resources

```http
GET    /deliverables/{id}/evidence
POST   /deliverables/{id}/evidence
GET    /evidence/{id}
```

---

# 10. Extension Points

Extensions MAY define domain-specific evidence `type` vocabularies (e.g. "clinical-review" for
healthcare, "gps-trace" for logistics) and MAY attach additional verification metadata (such as a
cryptographic proof format) to an Evidence record.

* Extensions MUST NOT make Evidence mutable.
* Extensions MUST NOT permit deletion of Evidence under any circumstance.

---

# 11. Security Considerations

Evidence locators SHOULD point at content whose integrity can be independently verified — a
`checksum` allows a verifier to confirm the referenced content has not changed since collection.
Where Evidence contains sensitive information (e.g. medical records, personal photographs),
implementations SHOULD apply the same visibility and encryption-at-rest policies as the owning
Mission (`05-mission.md` §24) and MUST NOT weaken them merely because Evidence is immutable.
