# Poiva Protocol Specification

**Document:** 21 - Objectives

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

An **Objective** describes a desired business outcome within a Mission (Document 05), tracked as
its own first-class resource with an independent lifecycle and its own events. Every Mission MUST
define one or more objectives (`05-mission.md` §9); this chapter introduces the first-class
Objective resource for when an objective needs independent lifecycle tracking rather than being
expressed as a simple inline string.

---

# 2. Design Goals

Objectives MUST:

* belong to exactly one Mission
* expose a lifecycle state

Objectives SHOULD be measurable (`05-mission.md` §9), which the optional `targetMetric` field
exists to capture.

**Coexistence with `Mission.objectives`:** `Mission.objectives` (a plain `List<String>`,
`05-mission.md` §5) already exists as a lightweight inline field for simple missions that don't
need per-objective tracking. This Objective resource is the first-class version for when an
objective needs its own lifecycle and its own events. The two coexist — this chapter does not
deprecate the string list, and a Mission MAY use either, both, or neither.

---

# 3. Objective Model

```text
Mission
?
??? objectives: ["Allow users to authenticate securely"]   (inline, Mission.objectives)
?
??? Objective: "Reduce login failure rate below 1%"        (first-class, this document)
?   ??? state: ACTIVE
?
??? Objective: "Support SSO for enterprise customers"
    ??? state: PROPOSED
```

---

# 4. Required Fields

| Field   | Type              | Description                          |
| ------- | ----------------- | --------------------------------------- |
| id      | UUID               | Global identifier                        |
| mission | Mission Reference  | Owning Mission                            |
| title   | String             | Human-readable statement of the objective |
| state   | Enum               | PROPOSED, ACTIVE, ACHIEVED, or ABANDONED  |

## Optional Fields

| Field        | Description |
| ------------ | ----------- |
| description   | Extended free-text explanation |
| priority      | Reuses the shared Priority enum (LOW, MEDIUM, HIGH, CRITICAL) |
| targetMetric  | Free-text success signal (e.g. "95% test coverage") |

---

# 5. Lifecycle

```text
Proposed
    ?
  Active
    ?
    ??????????????
    ?             ?
Achieved       (Abandoned reachable from Proposed or Active)
```

## States

| State     | Description                                    |
| --------- | ------------------------------------------------ |
| PROPOSED  | Objective has been suggested, not yet committed to |
| ACTIVE    | Objective is being actively pursued                |
| ACHIEVED  | Objective has been met                             |
| ABANDONED | Objective will no longer be pursued                |

---

# 6. State Transition Rules

The following transitions are valid:

* PROPOSED → ACTIVE
* ACTIVE → ACHIEVED
* PROPOSED → ABANDONED
* ACTIVE → ABANDONED

ACHIEVED and ABANDONED are terminal.

---

# 7. Relationships

## Mission (Document 05)

Every Objective belongs to exactly one Mission. `Mission.objectives` remains available as a
simpler, non-lifecycle-tracked alternative for the same concept.

## Priority

`priority` reuses the same enum used elsewhere in the protocol (e.g. Mission and Activity
priority), rather than defining a separate scale.

---

# 8. Events

* `objective.created`
* `objective.state_changed`
* `objective.deleted`

---

# 9. Invariants

A compliant implementation MUST ensure:

* Every Objective belongs to exactly one Mission.
* An Objective's state transitions follow the graph in §6; ACHIEVED and ABANDONED are terminal.
* Introducing first-class Objectives MUST NOT require existing Missions using
  `Mission.objectives` to migrate.

---

# 10. JSON Representation

```json
{
  "id": "objective-1d44ab",
  "missionId": "mission-8fd24c8d",
  "title": "Reduce login failure rate below 1%",
  "description": "Post-launch measurement across the first 30 days.",
  "priority": "HIGH",
  "targetMetric": "Failure rate < 1% over rolling 30-day window",
  "state": "ACTIVE"
}
```

---

# 11. REST Resources

```http
GET    /missions/{id}/objectives
POST   /missions/{id}/objectives
GET    /objectives/{id}
PATCH  /objectives/{id}/state
DELETE /objectives/{id}
```

---

# 12. Extension Points

Extensions MAY attach domain-specific measurement metadata (e.g. a structured metric definition
instead of free-text `targetMetric`) to an Objective.

* Extensions MUST NOT redefine the PROPOSED/ACTIVE/ACHIEVED/ABANDONED lifecycle.
* Extensions MUST NOT require every Mission to use first-class Objectives instead of
  `Mission.objectives`.

---

# 13. Summary

First-class Objectives let a Mission track outcomes that need their own lifecycle and audit trail,
while `Mission.objectives` remains available for missions that just need a simple list. Neither
supersedes the other.
