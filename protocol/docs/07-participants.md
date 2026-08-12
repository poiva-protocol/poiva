# Poiva Protocol Specification

**Document:** 07 - Participants

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **Participant** is any entity capable of contributing to a Mission: a human, an organization, an
AI agent, a robot, or an external automated system. Participants are the actors behind every
Sponsor, Contributor and Reviewer role described in `04-terminology.md` §3 — the protocol treats
all kinds identically during execution, per `02-design-principles.md` Principle 4 ("Humans and AI
Are First-Class Participants").

---

# 2. Design Goals

Participants MUST:

* possess a globally unique identifier
* declare exactly one `kind`
* be identifiable independent of any single Mission
* be selectable according to Capability rather than a fixed organizational role

Participants MUST NOT be treated differently by protocol semantics on the basis of `kind` — a
verification, assignment, or estimate produced by a human MUST be handled identically to one
produced by an AI agent.

Participants SHOULD advertise the Capabilities (Document 08) they can perform.

---

# 3. Participant Model

```text
Organization
?
??? Participant A (HUMAN)
?   ??? Capabilities
?
??? Participant B (AI_AGENT)
?   ??? Capabilities
?
??? Participant C (ORGANIZATION)
```

A Participant is scoped to an Organization, not to a single Mission — the same Participant may act
as Sponsor, Contributor or Reviewer across many Missions (Document 05).

---

# 4. Required Fields

| Field       | Type | Description                                                       |
| ----------- | ---- | ------------------------------------------------------------------ |
| id          | UUID | Global identifier                                                  |
| displayName | String | Human-readable name of the participant                           |
| kind        | Enum | HUMAN, ORGANIZATION, AI_AGENT, ROBOT, or EXTERNAL_SYSTEM            |

## Optional Fields

| Field       | Description |
| ----------- | ----------- |
| externalRef | Implementation-specific identity pointer (e.g. an account or user id); identity itself remains external to the protocol (`02-design-principles.md` Principle 16) |
| trustScore  | Implementation-defined confidence metric; the protocol does not define a scoring algorithm (`04-terminology.md` §7) |
| capabilities | Set of Capabilities (Document 08) the participant can perform |

---

# 5. Relationships

## Mission (Document 05)

A Participant acts as a Mission's Sponsor, or as a Contributor/Reviewer on its Activities and
Deliverables. A Participant is never owned by a single Mission.

## Capability (Document 08)

A Participant declares the Capabilities it can perform by attaching them; Provisioning (Document
11) and Activity assignment (`06-activity.md` §7) match a Participant's capabilities against an
Activity's `requiredCapabilities`.

## Activity (Document 06)

An Activity's Contributors are Participants attached through assignment. A Participant becomes a
Contributor only after assignment (`04-terminology.md` §3).

## Verification (Document 14)

A Verification's `reviewer` is a Participant. Reviewers may be human, organization, AI, or an
automated validation engine — the protocol does not distinguish between them.

---

# 6. Events

* `participant.created`
* `participant.updated`
* `participant.capability_attached`
* `participant.deactivated`

---

# 7. Invariants

A compliant implementation MUST ensure:

* Every Participant has a globally unique identifier.
* Every Participant declares exactly one `kind`.
* A Participant MAY act across multiple Missions within the same Organization.
* Deactivating a Participant MUST NOT delete its historical assignments, estimates, or
  verifications.
* trustScore, when present, MUST be treated as implementation-defined and MUST NOT be assumed to
  follow any particular scale across implementations.

---

# 8. JSON Representation

```json
{
  "id": "participant-9c21e4a1",
  "displayName": "Ada Verify Agent",
  "kind": "AI_AGENT",
  "externalRef": "cloud-user-8842",
  "trustScore": 0.94,
  "capabilities": [
    { "id": "capability-01", "code": "code-review" }
  ]
}
```

---

# 9. REST Resources

```http
GET    /participants
GET    /participants?capability={code}
POST   /participants
GET    /participants/{id}
POST   /participants/{id}/capabilities
DELETE /participants/{id}
```

---

# 10. Extension Points

Extensions MAY attach implementation- or industry-specific metadata to a Participant, such as
certification records, licensing information, or platform-specific reputation signals.

* Extensions MUST NOT redefine Participant semantics.
* Extensions MUST NOT introduce a new participant `kind` outside the enumerated set without a
  protocol version change.
* Extensions MUST NOT make protocol behavior conditional on `kind` (e.g. treating an AI_AGENT's
  Deliverable as inherently less trustworthy than a HUMAN's).

---

# 11. Security Considerations

Identity is external to the protocol (`02-design-principles.md` Principle 16): `externalRef`
points at an implementation-owned identity record (such as a user account or API key) rather than
carrying credentials itself. Implementations SHOULD scope Participant visibility to the owning
Organization and SHOULD apply their own authentication and authorization policy before allowing a
caller to act as a given Participant. trustScore, where exposed, SHOULD be treated as sensitive to
the extent it reveals performance history.
