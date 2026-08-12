# Poiva Protocol Specification

**Document:** 14 - Verification

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

**Verification** determines whether a Deliverable's Evidence (Document 13) satisfies its
Acceptance Criteria. Verification is not an optional administrative step — per
`02-design-principles.md` Principle 11, execution is incomplete without it. Verification answers
"was it built correctly?", distinct from Validation, which answers "was the correct thing built?"
(`04-terminology.md` §6).

---

# 2. Design Goals

Verification MUST:

* belong to exactly one Deliverable
* declare a `mode`
* expose an `outcome`

Verification records MUST NOT be deleted once created (`05-mission.md` §20, `06-activity.md`
§14). An outcome, once recorded as PASSED, FAILED, or INCONCLUSIVE, is terminal.

---

# 3. Verification Model

```text
Deliverable
?
??? Verification #1 (mode=AUTOMATIC, outcome=PASSED)
??? Verification #2 (mode=MANUAL, outcome=PENDING)
```

Multiple Verification records MAY exist for the same Deliverable — for example, an automatic check
followed by a manual review.

---

# 4. Required Fields

| Field       | Type                  | Description                          |
| ----------- | --------------------- | --------------------------------------- |
| id          | UUID                   | Global identifier                        |
| deliverable | Deliverable Reference  | Owning Deliverable                        |
| mode        | Enum                   | AUTOMATIC, MANUAL, or HYBRID              |
| outcome     | Enum                   | PENDING, PASSED, FAILED, or INCONCLUSIVE  |

## Optional Fields

| Field       | Description |
| ----------- | ----------- |
| reviewer    | Participant that performed or is performing the verification (Document 07) — may be human, organization, AI, or an automated engine |
| policyCode  | Opaque code identifying the Policy (Document 23) this verification was evaluated against, if any |
| verifiedAt  | Timestamp the outcome was recorded |
| notes       | Free-text reviewer notes |

---

# 5. Lifecycle

```text
Pending
    ?
    ??????????????????????
    ?          ?          ?
 Passed      Failed   Inconclusive
```

## States

| State        | Description                                    |
| ------------ | ------------------------------------------------ |
| PENDING      | Verification has been requested, no outcome yet     |
| PASSED       | Evidence satisfies the Acceptance Criteria           |
| FAILED       | Evidence does not satisfy the Acceptance Criteria    |
| INCONCLUSIVE | Evidence is insufficient to reach a decision         |

---

# 6. State Transition Rules

The following transitions are valid:

* PENDING → PASSED
* PENDING → FAILED
* PENDING → INCONCLUSIVE

PASSED, FAILED, and INCONCLUSIVE are terminal. A new Verification record MUST be created to
re-evaluate a Deliverable; an existing outcome is never reopened.

---

# 7. Relationships

## Deliverable (Document 12)

Every Verification belongs to exactly one Deliverable and evaluates that Deliverable's Evidence
against its Acceptance Criteria.

## Evidence (Document 13)

Verification reads a Deliverable's Evidence records as the basis for its outcome; it does not own
or modify them.

## Participant (Document 07)

A Verification's `reviewer` is a Participant. The protocol does not distinguish between human,
organization, AI, or automated-engine reviewers (`04-terminology.md` §3).

## Policy (Document 23)

`policyCode` optionally resolves to a real Policy record whose `appliesTo` is VERIFICATION,
letting a Verification reference the rule it was evaluated against. `policyCode` predates the
Policy entity and remains a plain opaque string when no matching Policy exists — Documents 05 and
06 also carry a `verificationPolicyCode` field at the Mission and Activity level that this same
mechanism can resolve.

---

# 8. Events

* `verification.requested`
* `verification.passed`
* `verification.failed`
* `verification.inconclusive`

---

# 9. Invariants

A compliant implementation MUST ensure:

* Verification records MUST NOT be deleted once created.
* An outcome transitions at most once away from PENDING; PASSED, FAILED, and INCONCLUSIVE are
  terminal.
* A Deliverable MAY accumulate multiple Verification records over time; none may be retroactively
  altered.
* `policyCode`, when present, MUST be treated as opaque unless it resolves to a known Policy.

---

# 10. JSON Representation

```json
{
  "id": "verification-cc41a0",
  "deliverableId": "deliverable-7a12f0",
  "mode": "HYBRID",
  "outcome": "PASSED",
  "policyCode": "security-review-v1",
  "reviewer": { "id": "participant-556" },
  "verifiedAt": "2026-08-11T09:15:00Z",
  "notes": "CI green, manual code review approved."
}
```

---

# 11. REST Resources

```http
GET    /deliverables/{id}/verifications
POST   /deliverables/{id}/verifications
GET    /verifications/{id}
PATCH  /verifications/{id}/outcome
POST   /verifications/{id}/evaluate
```

---

# 12. Extension Points

Extensions MAY define additional evaluation metadata (e.g. a numeric score alongside PASSED/
FAILED, or a structured checklist result) attached to a Verification record.

* Extensions MUST NOT redefine the PENDING/PASSED/FAILED/INCONCLUSIVE outcome vocabulary.
* Extensions MUST NOT permit deletion or retroactive mutation of a recorded outcome.

---

# 13. Summary

Verification is the protocol's answer to "was it built correctly?" — an immutable, attributable
record that a Deliverable's Evidence was judged, by whom, under what mode, and against what
policy. Its permanence is what makes downstream Settlement and Mission completion auditable.
