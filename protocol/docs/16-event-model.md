# Poiva Protocol Specification

**Document:** 16 - Event Model

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **ProtocolEvent** is an immutable historical fact recording a mutation to a protocol object.
Every meaningful state transition across every resource — Mission, Activity, Deliverable, Evidence,
Verification, Settlement, and the org-scoped resources introduced in Documents 07-09 and 21-23 —
MUST append exactly one ProtocolEvent, per `02-design-principles.md` Principle 8 ("Event-Driven by
Default") and Principle 9 ("Immutable History"). Events are the audit and event-sourcing backbone
of the protocol: they are what the Cloud Console ledger and public verification pages read.

---

# 2. Design Goals

ProtocolEvents MUST:

* be append-only — never updated or deleted after creation
* belong to exactly one Organization
* carry a dot-separated `type` naming the mutation (e.g. `mission.created`)
* record when they occurred

ProtocolEvents MUST NOT carry a mutable "status" or "updatedAt" field — unlike other protocol
objects, an event has no lifecycle of its own.

---

# 3. Event Model

```text
Organization
?
??? ProtocolEvent (mission=mission-1, subjectType=mission, type=mission.created)
??? ProtocolEvent (mission=mission-1, subjectType=activity, type=activity.submitted)
??? ProtocolEvent (mission=null, subjectType=participant, type=participant.created)
??? ProtocolEvent (mission=null, subjectType=capability, type=capability.created)
```

A ProtocolEvent's `mission` link is optional: org-scoped resources such as Participant, Capability,
and Policy have no Mission to attach to, but their mutations MUST still be logged.

---

# 4. Required Fields

| Field            | Type                       | Description                                                       |
| ---------------- | -------------------------- | --------------------------------------------------------------------- |
| id               | UUID                        | Global identifier                                                       |
| organization     | Organization Reference      | Owning Organization                                                      |
| type             | String                      | Dot-separated event name (e.g. `mission.state_changed`)                 |
| occurredAt       | Timestamp                   | When the event was recorded (immutable, set once)                       |

## Optional Fields

| Field           | Description |
| --------------- | ----------- |
| mission          | Owning Mission, when the event relates to a Mission-scoped resource |
| subjectType      | Which nested object raised the event (e.g. "activity", "deliverable") |
| subjectId        | Identifier of that nested object |
| payloadJson      | Denormalized snapshot of relevant fields at the time of the event — not a live join |
| protocolVersion  | Protocol version the event was recorded under (Document 20) |

---

# 5. Canonical Event Taxonomy

The following event `type` strings are the ones actually emitted by the reference implementation
(`src/main/java/com/poiva/app/workspace/ProtocolWorkspaceService.java`):

| Event                        | Emitted when |
| ----------------------------- | -------------- |
| `mission.created`             | A Mission is created |
| `mission.state_changed`       | A Mission transitions to a new lifecycle state |
| `mission.deleted`             | A Mission is soft-deleted |
| `activity.created`            | An Activity is created |
| `activity.assigned`           | A Contributor is assigned to an already-assigned/executing Activity |
| `activity.state_changed`      | An Activity transitions to a lifecycle state with no more specific event below |
| `activity.submitted`          | An Activity transitions to SUBMITTED |
| `activity.approved`           | An Activity transitions to APPROVED |
| `activity.completed`          | An Activity transitions to COMPLETED |
| `activity.cancelled`          | An Activity transitions to CANCELLED |
| `activity.deleted`            | An Activity is soft-deleted |
| `deliverable.submitted`       | A Deliverable is created |
| `deliverable.state_changed`   | A Deliverable transitions to a new state |
| `deliverable.deleted`         | A Deliverable is soft-deleted |
| `evidence.attached`           | Evidence is recorded against a Deliverable |
| `verification.requested`      | A Verification is created (outcome PENDING) |
| `verification.passed`         | A Verification's outcome transitions to PASSED |
| `verification.failed`         | A Verification's outcome transitions to FAILED |
| `verification.inconclusive`   | A Verification's outcome transitions to INCONCLUSIVE |
| `settlement.created`          | A Settlement is created |
| `settlement.confirmed`        | A Settlement transitions to CONFIRMED |
| `settlement.state_changed`    | A Settlement transitions to a new state with no more specific event above |
| `settlement.deleted`          | A Settlement is soft-deleted |

Resources introduced in Documents 07-09 and 21-23 (Participant, Capability, Knowledge Capsule,
Objective, Constraint, Policy) follow the same `resource.action` naming convention (e.g.
`participant.created`, `objective.state_changed`) so that the taxonomy remains consistent as the
protocol model grows.

---

# 6. Relationships

## Mission (Document 05)

`GET /missions/{id}/events` returns the ordered event history for a Mission and everything nested
under it.

## Activity (Document 06)

Activity-specific events are additionally queryable by `subjectType`/`subjectId` via
`GET /activities/{id}/events`.

## Every other resource (Documents 07-15, 21-23)

Every mutating operation on every protocol resource — org-scoped or Mission-scoped — appends
exactly one ProtocolEvent, whether or not that resource exposes its own events endpoint.

---

# 7. Events

ProtocolEvent is itself the event mechanism; it does not emit events about itself.

---

# 8. Invariants

A compliant implementation MUST ensure:

* Every mutation across every resource appends exactly one ProtocolEvent.
* A ProtocolEvent, once created, MUST NOT be updated or deleted.
* `occurredAt` is set once, at creation, and never changes.
* `payloadJson` is a snapshot at the time of the event, not a live reference — reading it later
  MUST NOT reflect subsequent changes to the subject.
* Org-scoped resources with no Mission still produce events; `mission` being null MUST NOT be
  treated as an error.

---

# 9. JSON Representation

```json
{
  "id": "event-3fa2c1",
  "missionId": "mission-8fd24c8d",
  "subjectType": "verification",
  "subjectId": "verification-cc41a0",
  "type": "verification.passed",
  "payload": {
    "title": "Verification for Implement OAuth backend",
    "mode": "HYBRID",
    "outcome": "PASSED",
    "deliverableId": "deliverable-7a12f0",
    "deliverableTitle": "Implement OAuth backend"
  },
  "occurredAt": "2026-08-11T09:15:00Z"
}
```

---

# 10. REST Resources

```http
GET    /events
GET    /events?missionId={id}
GET    /events/{id}
```

---

# 11. Extension Points

Extensions MAY attach additional fields inside `payloadJson`'s snapshot for domain-specific
context, and MAY define additional `type` values following the `resource.action` convention for
resources introduced by a profile.

* Extensions MUST NOT make ProtocolEvent mutable.
* Extensions MUST NOT skip emitting an event for a mutation they introduce.
* Extensions MUST NOT redefine the meaning of an existing `type` string.

---

# 12. Summary

The event model is the protocol's guarantee of auditability: every mutation, on every resource,
across every Mission and every org-scoped catalog, is recorded once, permanently, and in order.
Everything the Cloud Console ledger, the public verification pages, and any future replay or
integration tooling need is derivable from this single append-only stream.
