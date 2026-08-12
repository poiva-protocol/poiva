# Poiva Protocol Specification

**Document:** 10 - Planning & Estimation

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

**Planning Proposals** and **Estimates** together let a Mission's Sponsor compare competing
execution strategies before committing to one, honoring `02-design-principles.md` Principle 10
("Separation of Planning and Execution"). A Planning Proposal is a complete execution strategy; an
Estimate predicts specific execution characteristics (duration, effort, cost, risk) for a Mission,
an Activity, or a proposal as a whole.

---

# 2. Design Goals

Planning Proposals and Estimates MUST:

* belong to exactly one Mission
* be independently comparable — multiple competing proposals and estimates MAY coexist for the
  same Mission
* be attributable to the Participant that submitted them

Estimates SHOULD express `confidence` without the protocol mandating any particular scoring
algorithm (`04-terminology.md` §7).

Only one Planning Proposal per Mission SHOULD ultimately be `accepted`.

---

# 3. Planning & Estimation Model

```text
Mission
?
??? Planning Proposal A (accepted=false)
?   ??? Estimate (activity=Backend, confidence=80)
?   ??? Estimate (activity=Frontend, confidence=65)
?
??? Planning Proposal B (accepted=true)
    ??? Estimate (activity=Backend, confidence=90)
    ??? Estimate (capability=translation, confidence=70)
```

A Mission may receive multiple competing Planning Proposals during its PLANNING state
(`05-mission.md` §7). Each Proposal may carry multiple Estimates — one per Activity, or scoped to
a required Capability rather than a specific Activity. Accepting a Proposal is a distinct step
from accepting an individual Estimate: a Sponsor may accept a Proposal's overall strategy while an
individual Estimate within it is separately accepted or superseded during Estimation.

---

# 4. Required Fields

## Planning Proposal

| Field       | Type               | Description                          |
| ----------- | ------------------ | -------------------------------------- |
| id          | UUID                | Global identifier                      |
| mission     | Mission Reference   | Owning Mission                         |
| accepted    | Boolean             | Whether this proposal is the active plan |

### Optional Fields

| Field            | Description |
| ---------------- | ----------- |
| submittedBy       | Participant that submitted the proposal |
| strategy          | Free-text description of the execution approach |
| expectedTimeline  | Timestamp the proposal targets for completion |
| estimates         | Estimates carried by this proposal |

## Estimate

| Field   | Type               | Description             |
| ------- | ------------------ | -------------------------- |
| id      | UUID                | Global identifier           |
| mission | Mission Reference   | Owning Mission               |
| accepted | Boolean            | Whether this estimate is accepted |

### Optional Fields

| Field                 | Description |
| --------------------- | ----------- |
| activity               | Activity this estimate targets, if scoped to one (Document 06) |
| planningProposal       | Planning Proposal this estimate belongs to, if any |
| submittedBy            | Participant that submitted the estimate |
| durationMinutes        | Predicted duration |
| effortHours            | Predicted effort |
| cost / currency        | Predicted cost |
| confidence             | 0-100, implementation-defined scoring; the protocol mandates no algorithm |
| requiredCapabilities   | Capabilities (Document 08) the estimated work would need |
| risks                  | List of free-text identified risks |

---

# 5. Relationships

## Mission (Document 05)

Both objects belong to exactly one Mission and are meaningful only during its PLANNING and
ESTIMATION states (`05-mission.md` §7).

## Activity (Document 06)

An Estimate MAY target a specific Activity rather than the whole Mission, allowing per-Activity
comparison of cost, duration, and risk before Provisioning.

## Capability (Document 08)

An Estimate's `requiredCapabilities` describes what the estimated work would need, feeding into
Provisioning's capability matching (Document 11).

## Participant (Document 07)

Both a Planning Proposal and an Estimate are attributable to the Participant (human or AI) that
submitted them.

---

# 6. Events

* `planning_proposal.submitted`
* `planning_proposal.accepted`
* `estimate.requested`
* `estimate.submitted`
* `estimate.accepted`

---

# 7. Invariants

A compliant implementation MUST ensure:

* A Planning Proposal and an Estimate each belong to exactly one Mission.
* Accepting a Planning Proposal MUST NOT implicitly accept every Estimate it carries.
* Multiple Planning Proposals and Estimates MAY coexist in a non-accepted state; implementations
  MUST NOT delete rejected ones, only mark them not accepted.
* `confidence`, where present, MUST be treated as implementation-defined and MUST NOT be assumed
  to follow a specific scale across implementations.

---

# 8. JSON Representation

```json
{
  "id": "proposal-71ac0e",
  "missionId": "mission-8fd24c8d",
  "submittedBy": { "id": "participant-123" },
  "strategy": "Decompose into backend, frontend and QA workstreams executed in parallel.",
  "expectedTimeline": "2026-09-01T00:00:00Z",
  "accepted": true,
  "estimates": [
    {
      "id": "estimate-4b12",
      "activityId": "activity-42",
      "durationMinutes": 2400,
      "effortHours": 40,
      "cost": 6000,
      "currency": "USD",
      "confidence": 80,
      "requiredCapabilities": ["java", "spring-boot", "oauth2"],
      "risks": ["Third-party OAuth provider rate limits"],
      "accepted": true
    }
  ]
}
```

---

# 9. REST Resources

```http
GET    /missions/{id}/planning-proposals
POST   /missions/{id}/planning-proposals
GET    /planning-proposals/{id}
POST   /planning-proposals/{id}/accept
DELETE /planning-proposals/{id}

GET    /missions/{id}/estimates
POST   /missions/{id}/estimates
GET    /estimates/{id}
POST   /estimates/{id}/accept
DELETE /estimates/{id}
```

---

# 10. Extension Points

Extensions MAY introduce domain-specific estimate dimensions (e.g. material cost for construction,
travel distance for logistics) as additional metadata alongside the core duration/effort/cost
fields.

* Extensions MUST NOT redefine what `accepted` means for either object.
* Extensions MUST NOT require a specific estimation algorithm or confidence scale.

---

# 11. Summary

Planning Proposals and Estimates give a Mission's Sponsor a structured way to compare competing
execution strategies — from multiple contributors, multiple organizations, or multiple AI planners
— before Provisioning begins, without the protocol mandating how those numbers are produced.
