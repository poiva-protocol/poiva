# Poiva Protocol Specification

**Document:** 17 - API Guidelines

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

This document collects the cross-cutting API conventions used throughout Documents 05-16 and
21-23. It does not introduce new resources. Per `02-design-principles.md` Principle 15 ("Transport
Independence"), Poiva does not mandate REST, GraphQL, gRPC, or any other transport — the
conventions below describe what a compliant HTTP binding SHOULD look like, informed by the
reference implementation, not the only valid one.

---

# 2. Design Goals

A compliant API SHOULD:

* expose resource-oriented URLs reflecting the domain model's nesting (e.g. a Mission's Activities
  live under that Mission)
* use narrow, single-purpose action verbs instead of generic field-update endpoints
* soft-delete wherever the underlying resource's history must be preserved
* return errors that map cleanly onto standard HTTP semantics

An API MUST NOT expose an operation that violates the invariants defined by the resource's own
chapter (e.g. deleting a Verification record, per Document 14 §9).

---

# 3. Resource-Oriented URLs

The reference implementation roots every protocol resource under `/api/cloud/workspace`, mirroring
the domain model's nesting:

```text
/api/cloud/workspace/missions
/api/cloud/workspace/missions/{id}/activities
/api/cloud/workspace/activities/{id}
/api/cloud/workspace/missions/{id}/deliverables
/api/cloud/workspace/deliverables/{id}/evidence
/api/cloud/workspace/deliverables/{id}/verifications
/api/cloud/workspace/missions/{id}/settlements
```

A resource that is created under a parent (e.g. an Activity under a Mission) is listed and created
via the parent's nested path, but read individually via its own top-level path
(`GET /activities/{id}`) once its identifier is known — avoiding the need for callers to know the
parent id for every subsequent lookup.

---

# 4. Authentication

The reference implementation accepts either of two credential types on every request:

* `Authorization: Bearer <token>` — a session token issued at login
* `X-Poiva-Api-Key` (or `X-API-Key`) — a long-lived API key in the form `pk_live_<keyId>.<secret>`,
  stored hashed

Both are implementation details (`02-design-principles.md` Principle 16: "Identity Is External")
rather than protocol requirements — implementations MAY use OAuth2, mutual TLS, or any other
identity mechanism, provided every request can be resolved to exactly one calling Participant and
Organization. See Document 19 for further detail.

---

# 5. Action Verbs Over Generic Updates

Rather than a single generic `PATCH` accepting arbitrary field edits, resources with a lifecycle
expose:

* a narrow `PATCH .../{id}/state` (or `/outcome`) that accepts only the target state and validates
  it against that resource's transition graph (Documents 05, 06, 12, 14, 15, 21, 22, 23)
* single-purpose `POST` actions for named operations that are more than a state change, e.g.
  `POST /activities/{id}/assign`, `POST /settlements/{id}/confirm`,
  `POST /verifications/{id}/evaluate`, `POST /planning-proposals/{id}/accept`

This keeps every mutation traceable to one well-defined operation, which in turn keeps the event
taxonomy (Document 16) small and meaningful — an implementation can always name the ProtocolEvent
`type` a request will produce before executing it.

---

# 6. Deletion

Deletion is soft wherever the resource's chapter requires history to survive: `DELETE` sets a
`status` field (e.g. to DELETED) rather than removing the row, preserving the record for event
history and downstream references. This applies to Mission, Activity, Deliverable, and Settlement.

Evidence and Verification records explicitly MUST NOT be deleted, soft or otherwise (Documents 13
§2, 14 §2) — no `DELETE` endpoint exists for them.

---

# 7. Error Semantics

| Status | Meaning |
| ------ | ------- |
| 400    | The request is malformed, or an enum value / required field is invalid |
| 404    | The referenced resource does not exist, or does not belong to the caller's Organization |
| 409    | The request conflicts with the resource's current state (e.g. an invalid state transition, or the resource has already been deleted) |

Scoping every lookup to the caller's Organization means a resource belonging to a different
Organization SHOULD return 404, not 403, so as not to confirm the resource's existence to an
unauthorized caller.

---

# 8. Relationships

## Event Model (Document 16)

Every mutation described by this document's conventions corresponds to exactly one ProtocolEvent.

## Security Considerations (Document 19)

Authentication and tenant-isolation details referenced in §4 are described fully in Document 19.

## Every resource chapter (Documents 05-15, 21-23)

Each resource's own "REST Resources" section is an instance of the conventions in this document.

---

# 9. Extension Points

Implementations MAY expose additional transports (GraphQL, gRPC, event streaming) alongside or
instead of REST, and MAY add implementation-specific query parameters (filtering, pagination,
sorting) not mandated here.

* Extensions MUST NOT bypass a resource's declared state-transition graph through an alternate
  transport.
* Extensions MUST NOT omit event emission for a mutation performed through an alternate transport.

---

# 10. Summary

These guidelines describe how the reference implementation exposes the protocol over HTTP:
resource-oriented URLs, dual bearer/API-key auth, narrow action verbs, soft deletion where history
must survive, and error codes that map directly onto tenant isolation and lifecycle rules.
Compliant implementations SHOULD follow this shape but, per Transport Independence, are not
required to use REST at all.
