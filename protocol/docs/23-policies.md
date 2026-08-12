# Poiva Protocol Specification

**Document:** 23 - Policies

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **Policy** is a named, org-scoped rule statement that other protocol objects can reference by
`code` — closing a gap left by several plain opaque policy-code strings that existed before this
entity did. `Mission.verificationPolicyCode` (`05-mission.md` §5), `Activity.verificationPolicyCode`
(`06-activity.md` §4), and `Verification.policyCode` (Document 14 §4) can now resolve to a real
Policy record by matching `code`, giving those fields something concrete to point at instead of an
uninterpreted string.

---

# 2. Design Goals

Policies MUST:

* be scoped to an Organization, not to a single Mission — a Policy is defined once and referenced
  by `code` across many Missions and Activities
* declare a `code` unique within their Organization
* declare which class of decision they apply to (`appliesTo`)
* expose a lifecycle state

The protocol does NOT mandate a rules engine or DSL for policy evaluation — `description` is a
human-readable rule statement, matching how `trustScore` and `confidence` are also left
implementation-defined (`04-terminology.md` §7).

---

# 3. Policy Model

```text
Organization
?
??? Policy: code="security-review-v1", appliesTo=VERIFICATION, state=ACTIVE
??? Policy: code="planning-two-estimates", appliesTo=PLANNING, state=ACTIVE
??? Policy: code="invoice-after-acceptance", appliesTo=SETTLEMENT, state=DRAFT
    ?
    ??? referenced by Mission.verificationPolicyCode
    ??? referenced by Activity.verificationPolicyCode
    ??? referenced by Verification.policyCode
```

---

# 4. Required Fields

| Field       | Type   | Description                                                                 |
| ----------- | ------ | ------------------------------------------------------------------------------- |
| id          | UUID   | Global identifier                                                                 |
| code        | String | Unique identifier within the owning Organization                                  |
| title       | String | Human-readable name                                                               |
| appliesTo   | Enum   | VERIFICATION, PLANNING, SETTLEMENT, or GENERAL                                    |
| description | String | Human-readable rule statement — the protocol does not mandate a rules engine or DSL |
| state       | Enum   | DRAFT, ACTIVE, or DEPRECATED                                                       |

## Optional Fields

None beyond the required fields above.

---

# 5. Lifecycle

```text
Draft
    ?
  Active
    ?
Deprecated
```

## States

| State      | Description                              |
| ---------- | ------------------------------------------- |
| DRAFT      | Policy is being authored, not yet enforceable |
| ACTIVE     | Policy is in force and may be referenced       |
| DEPRECATED | Policy is retired, kept for historical reference |

---

# 6. State Transition Rules

The following transitions are valid, linear, and one-way:

* DRAFT → ACTIVE
* ACTIVE → DEPRECATED

DEPRECATED is terminal. A Policy is never reactivated; a replacement Policy MUST be created under a
new `code` instead.

---

# 7. Relationships

## Mission (Document 05)

`Mission.verificationPolicyCode` is a plain string field that predates the Policy entity. It MAY
now resolve to a Policy whose `code` matches and whose `appliesTo` is VERIFICATION.

## Activity (Document 06)

`Activity.verificationPolicyCode` (`06-activity.md` §4) resolves the same way as the Mission-level
field, at the Activity's own scope.

## Verification (Document 14)

`Verification.policyCode` (Document 14 §4) records which Policy a specific Verification was
evaluated against. This is the closest, most concrete of the three policy-code fields: it names
the rule actually applied to one decision, rather than a default for a Mission or Activity.

## Settlement (Document 15)

A Policy with `appliesTo` SETTLEMENT MAY describe rules governing when a Settlement may be
confirmed, without the protocol mandating enforcement (Document 15 §7).

---

# 8. Events

* `policy.created`
* `policy.state_changed`
* `policy.deleted`

---

# 9. Invariants

A compliant implementation MUST ensure:

* A Policy's `code` is unique within its Organization.
* A Policy's state transitions follow the graph in §6: DRAFT → ACTIVE → DEPRECATED, each step
  one-way; DEPRECATED is terminal.
* `verificationPolicyCode`/`policyCode` fields on Mission, Activity, and Verification remain valid
  plain strings even when no matching Policy exists — resolution to a Policy is optional, not
  required, preserving compatibility with data created before this entity existed.
* A DEPRECATED Policy remains readable by `code` so that historical references to it stay
  resolvable.

---

# 10. JSON Representation

```json
{
  "id": "policy-6b30e1",
  "code": "security-review-v1",
  "title": "Security Review Required",
  "appliesTo": "VERIFICATION",
  "description": "Deliverables touching authentication or payment code require a manual security review in addition to automated checks before PASSED may be recorded.",
  "state": "ACTIVE"
}
```

---

# 11. REST Resources

```http
GET    /policies
POST   /policies
GET    /policies/{id}
PATCH  /policies/{id}/state
DELETE /policies/{id}
```

---

# 12. Extension Points

Extensions MAY layer a structured rules representation (a DSL, a decision table, a reference to an
external policy engine) alongside a Policy's free-text `description`, for implementations that want
machine-enforceable rules.

* Extensions MUST NOT require every implementation to support a rules engine — free-text
  `description` remains sufficient for baseline conformance.
* Extensions MUST NOT redefine the DRAFT/ACTIVE/DEPRECATED lifecycle.

---

# 13. Summary

Policies give the Organization a real, referenceable object behind what were previously opaque
policy-code strings on Mission, Activity, and Verification — without requiring any implementation
to build a rules engine. A `code` match is enough to connect a verification, planning, or
settlement decision to the human-readable rule that governed it.
