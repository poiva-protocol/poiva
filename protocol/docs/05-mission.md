# Poiva Protocol Specification

**Document:** 05 - Mission

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **Mission** is the primary object of the Poiva Protocol.

Every protocol interaction ultimately relates to a Mission.

A Mission represents a desired outcome rather than the work required to achieve it.

Activities, Participants, Deliverables, Evidence and Settlement all exist in relation to a Mission.

---

# 2. Definition

A Mission is a business objective submitted by a Sponsor.

Examples include:

* Develop a payment API
* Deliver a shipment
* Translate a contract
* Build a website
* Inspect a building
* Produce a marketing campaign
* Review a medical case
* Prepare financial statements

The protocol intentionally avoids software-specific terminology.

---

# 3. Design Principles

A Mission MUST:

* represent a single desired outcome
* possess a globally unique identifier
* define an owner (Sponsor)
* expose a lifecycle state
* maintain immutable history
* support verification
* support extension

A Mission MUST NOT:

* directly describe implementation details
* depend on programming language
* depend on industry-specific terminology

---

# 4. Mission Lifecycle

Every Mission progresses through a well-defined lifecycle.

```text
Draft
    ?
    ?
Knowledge Collection
    ?
    ?
Planning
    ?
    ?
Estimation
    ?
    ?
Planning Approved
    ?
    ?
Provisioning
    ?
    ?
Executing
    ?
    ?
Verification
    ?
    ?
Approval
    ?
    ?
Settlement
    ?
    ?
Completed
```

Implementations MAY introduce internal states but MUST preserve protocol semantics.

---

# 5. Mission Object

## Required Fields

| Field           | Type                  | Description                |
| --------------- | --------------------- | -------------------------- |
| id              | UUID                  | Global identifier          |
| title           | String                | Human-readable title       |
| description     | Markdown              | Mission description        |
| sponsor         | Participant Reference | Mission owner              |
| status          | Enum                  | Current lifecycle state    |
| createdAt       | Timestamp             | Creation timestamp         |
| protocolVersion | String                | Supported protocol version |

---

## Optional Fields

| Field              | Description |
| ------------------ | ----------- |
| priority           |             |
| deadline           |             |
| labels             |             |
| metadata           |             |
| estimatedBudget    |             |
| planningPolicy     |             |
| verificationPolicy |             |
| settlementPolicy   |             |
| visibility         |             |
| parentMission      |             |
| externalReferences |             |

---

# 6. Mission Relationships

A Mission may contain:

* Activities
* Knowledge Capsules
* Deliverables
* Evidence
* Participants
* Estimates
* Events
* Verification Records
* Settlement Records

Relationship diagram:

```text
Mission
?
??? Activities
??? Participants
??? Knowledge Capsules
??? Deliverables
??? Evidence
??? Estimates
??? Events
??? Verification
??? Settlement
```

---

# 7. Mission States

| State        | Description                            |
| ------------ | -------------------------------------- |
| DRAFT        | Mission being created                  |
| KNOWLEDGE    | Supporting information being collected |
| PLANNING     | Planning proposals accepted            |
| ESTIMATION   | Waiting for estimates                  |
| PROVISIONING | Contributors being selected            |
| EXECUTING    | Activities in progress                 |
| VERIFYING    | Deliverables under review              |
| APPROVAL     | Sponsor reviewing completion           |
| SETTLEMENT   | Commercial completion                  |
| COMPLETED    | Mission finished                       |
| CANCELLED    | Mission terminated                     |

---

# 8. State Transition Rules

The following transitions are valid:

```text
Draft
?

Knowledge

?

Planning

?

Estimation

?

Provisioning

?

Executing

?

Verifying

?

Approval

?

Settlement

?

Completed
```

Cancellation is permitted from any non-terminal state.

Completed Missions MUST NOT transition to another execution state.

---

# 9. Objectives

Every Mission MUST define one or more Objectives.

Objectives describe desired business outcomes.

Examples:

? Customers authenticate securely

? Shipment delivered within SLA

? Contract translated accurately

Objectives SHOULD be measurable.

---

# 10. Requirements

Requirements describe constraints.

Examples:

Performance

Compliance

Security

Accessibility

Budget

Technology

Deadlines

Requirements SHOULD be machine-readable whenever possible.

---

# 11. Knowledge Capsules

Knowledge Capsules provide execution context.

Examples:

Architecture diagrams

Contracts

Videos

URLs

Specifications

Images

Repositories

Knowledge Capsules SHOULD remain immutable after publication.

---

# 12. Activities

Activities decompose Missions.

The protocol intentionally separates:

Mission

?

Outcome

Activity

?

Execution

Activities may be generated:

* manually
* automatically
* by AI
* by planners

---

# 13. Estimates

Multiple estimates may exist simultaneously.

Each estimate may contain:

* duration
* effort
* cost
* risks
* confidence
* proposed decomposition

Sponsors may compare estimates before selecting one.

---

# 14. Participants

Participants contribute to Missions through Activities.

Participant categories include:

Human

Organization

AI Agent

Robot

External System

Participants SHOULD be selected according to Capabilities.

---

# 15. Deliverables

Deliverables represent outputs.

Examples:

Software

CAD Drawings

Videos

Contracts

Reports

Tracking Numbers

Photographs

Every Deliverable belongs to exactly one Mission.

---

# 16. Evidence

Evidence supports Deliverables.

Examples:

CI/CD

Photographs

Inspection reports

GPS

Digital signatures

Evidence SHOULD be immutable.

---

# 17. Verification

Verification determines whether Deliverables satisfy Acceptance Criteria.

Verification may be:

Automatic

Manual

Hybrid

Successful verification SHOULD emit a protocol event.

---

# 18. Settlement

Settlement records commercial completion.

Settlement MAY represent:

Invoice

Payroll

Purchase Order

Internal Accounting

Grant Distribution

The protocol intentionally avoids payment implementation.

---

# 19. Events

The following events relate directly to Missions.

MissionCreated

MissionUpdated

MissionCancelled

MissionArchived

KnowledgeAttached

PlanningStarted

EstimateRequested

EstimateSubmitted

EstimateAccepted

ProvisioningStarted

ExecutionStarted

DeliverableSubmitted

EvidenceAttached

VerificationPassed

VerificationFailed

MissionApproved

SettlementCreated

MissionCompleted

---

# 20. Mission Invariants

Every compliant implementation MUST satisfy the following invariants.

A Mission:

* MUST have exactly one Sponsor.
* MUST have a globally unique identifier.
* MUST expose its current lifecycle state.
* MUST preserve immutable event history.
* MUST support versioning.
* MUST support metadata.
* MUST remain addressable after completion.
* MUST NOT lose historical Deliverables.
* MUST NOT delete Verification records.

---

# 21. JSON Representation

```json
{
  "id": "mission-8fd24c8d",
  "protocolVersion": "1.0",
  "title": "Implement OAuth Login",
  "description": "Add OAuth authentication using OpenID Connect.",
  "status": "PLANNING",
  "priority": "HIGH",
  "createdAt": "2026-08-04T12:00:00Z",
  "sponsor": {
    "id": "participant-123"
  },
  "objectives": [
    "Allow users to authenticate securely"
  ],
  "requirements": [
    "OAuth2",
    "OpenID Connect",
    "OWASP ASVS"
  ],
  "knowledgeCapsules": [],
  "activities": [],
  "deliverables": [],
  "verificationPolicy": {
    "mode": "HYBRID"
  }
}
```

---

# 22. REST Examples

Create Mission

```http
POST /missions
```

Retrieve Mission

```http
GET /missions/{missionId}
```

Update Mission

```http
PATCH /missions/{missionId}
```

Cancel Mission

```http
POST /missions/{missionId}/cancel
```

List Events

```http
GET /missions/{missionId}/events
```

---

# 23. Extension Points

Mission extensions MAY introduce:

Industry-specific metadata

Custom policies

Compliance information

Domain-specific lifecycle states

Extensions MUST NOT redefine Mission semantics.

---

# 24. Security Considerations

Mission visibility MAY be:

* Public
* Organization
* Team
* Private

Knowledge Capsules SHOULD inherit Mission access policies unless explicitly overridden.

Sensitive Missions SHOULD support encryption at rest.

---

# 25. Conformance

A Poiva-compatible implementation MUST implement Mission semantics exactly as defined by this specification.

Additional functionality MAY be introduced through extensions, provided that the meaning of a Mission remains unchanged.

The Mission object is the foundation of the Poiva Protocol and every subsequent protocol object derives its meaning from it.
