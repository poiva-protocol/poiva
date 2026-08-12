# Poiva Protocol Specification

**Document:** 22 - Constraints

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **Constraint** describes a limit or boundary a Mission (Document 05) must respect — a budget
ceiling, a hard deadline, a regulatory rule, a technical restriction. Constraints are tracked as
their own first-class resource with an independent lifecycle, distinct from Requirements.

**Constraints vs. Requirements:** `Mission.requirements` (a plain `List<String>`, `05-mission.md`
§5, §10) already exists to describe what is *needed* for success — performance, compliance,
security, accessibility. Constraints describe *limits* the Mission must respect instead — a budget
ceiling, a deadline, a regulatory rule. The two are complementary: a Requirement says "the system
must support OAuth2"; a Constraint says "the budget must not exceed $10,000." Constraints do not
replace or extend `Mission.requirements`.

---

# 2. Design Goals

Constraints MUST:

* belong to exactly one Mission
* declare a `type`
* declare a `severity`
* expose a lifecycle state

`severity` follows RFC 2119-style hard/soft distinction: MUST constraints are non-negotiable; a
SHOULD constraint may be waived when justified.

---

# 3. Constraint Model

```text
Mission
?
??? requirements: ["OAuth2", "OWASP ASVS"]                 (inline, Mission.requirements)
?
??? Constraint: type=BUDGET, severity=MUST, state=ACTIVE     "Total cost must not exceed $10,000"
??? Constraint: type=TIME, severity=MUST, state=ACTIVE       "Must ship before 2026-09-01"
??? Constraint: type=REGULATORY, severity=SHOULD, state=WAIVED "GDPR data residency preferred"
```

---

# 4. Required Fields

| Field       | Type              | Description                                                                       |
| ----------- | ----------------- | ------------------------------------------------------------------------------------- |
| id          | UUID               | Global identifier                                                                       |
| mission     | Mission Reference  | Owning Mission                                                                            |
| type        | Enum               | BUDGET, TIME, REGULATORY, TECHNICAL, RESOURCE, ORGANIZATIONAL, or OTHER                  |
| description | String             | Human-readable statement of the constraint                                                |
| severity    | Enum               | MUST or SHOULD                                                                             |
| state       | Enum               | ACTIVE, SATISFIED, WAIVED, or VIOLATED                                                     |

## Optional Fields

None beyond the required fields above.

---

# 5. Lifecycle

```text
Active
    ?
    ??????????????????????
    ?          ?          ?
Satisfied   Waived    Violated
```

## States

| State     | Description                                    |
| --------- | ------------------------------------------------ |
| ACTIVE    | Constraint is currently in force                    |
| SATISFIED | Constraint has been met                             |
| WAIVED    | Constraint has been explicitly set aside              |
| VIOLATED  | Constraint has been breached                         |

---

# 6. State Transition Rules

The following transitions are valid:

* ACTIVE → SATISFIED
* ACTIVE → WAIVED
* ACTIVE → VIOLATED

SATISFIED, WAIVED, and VIOLATED are all terminal.

---

# 7. Relationships

## Mission (Document 05)

Every Constraint belongs to exactly one Mission and complements — never replaces —
`Mission.requirements` (`05-mission.md` §10).

## Policy (Document 23)

A Policy MAY encode the rule an implementation uses to evaluate whether a Constraint should be
considered SATISFIED or VIOLATED, without the protocol mandating an enforcement engine.

---

# 8. Events

* `constraint.created`
* `constraint.state_changed`
* `constraint.deleted`

---

# 9. Invariants

A compliant implementation MUST ensure:

* Every Constraint belongs to exactly one Mission.
* A Constraint's state transitions follow the graph in §6; SATISFIED, WAIVED, and VIOLATED are all
  terminal.
* A MUST-severity Constraint reaching VIOLATED MUST be surfaced to the Sponsor; the protocol does
  not mandate the enforcement mechanism, only that the fact is recorded and not silently dropped.
* Constraints MUST NOT be conflated with `Mission.requirements` — the two remain independent
  fields.

---

# 10. JSON Representation

```json
{
  "id": "constraint-9931aa",
  "missionId": "mission-8fd24c8d",
  "type": "BUDGET",
  "description": "Total mission cost must not exceed $10,000.",
  "severity": "MUST",
  "state": "ACTIVE"
}
```

---

# 11. REST Resources

```http
GET    /missions/{id}/constraints
POST   /missions/{id}/constraints
GET    /constraints/{id}
PATCH  /constraints/{id}/state
DELETE /constraints/{id}
```

---

# 12. Extension Points

Extensions MAY define additional `type` values for domain-specific boundaries (e.g. "SAFETY" for
construction, "LICENSING" for healthcare).

* Extensions MUST NOT redefine the ACTIVE/SATISFIED/WAIVED/VIOLATED lifecycle.
* Extensions MUST NOT redefine the MUST/SHOULD severity distinction.

---

# 13. Summary

Constraints give a Mission a first-class way to declare and track the limits it must respect —
budget, time, regulation, technology — as distinct from the Requirements describing what success
requires, with their own auditable lifecycle from ACTIVE through to SATISFIED, WAIVED, or
VIOLATED.
