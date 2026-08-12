# Poiva Protocol Specification

**Document:** 20 - Versioning & Compatibility

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

This document defines how the Poiva Protocol specification itself is versioned, and how the
`protocolVersion` field carried by every protocol object and event lets implementations reason
about compatibility as the specification evolves, per `01-introduction.md` §11 ("Versioning") and
`02-design-principles.md` Principle 18 ("Backwards Compatibility").

---

# 2. Design Goals

Protocol versioning MUST:

* follow Semantic Versioning at the specification level
* let every persisted object and event record which protocol version it was created under
* allow implementations to negotiate the highest protocol version they support

Breaking changes MUST be introduced only through a major version increment
(`02-design-principles.md` Principle 18).

---

# 3. Specification Versioning

The specification follows Semantic Versioning:

* **Major** versions introduce incompatible changes to existing normative semantics.
* **Minor** versions introduce backwards-compatible additions (e.g. a new optional field, a new
  chapter, a new event type).
* **Patch** versions clarify wording without altering protocol behavior.

Every document in this specification currently carries `**Version:** 1.0.0-draft` and
`**Status:** Draft` in its header — the whole specification versions as one unit, not chapter by
chapter.

---

# 4. The `protocolVersion` Field

Every object extending the shared `ProtocolEntity` base (Mission, Activity, Deliverable, Evidence,
Verification, Settlement, Participant, Capability, Knowledge Capsule, Estimate, Planning Proposal,
Objective, Constraint, Policy) and every ProtocolEvent carries a `protocolVersion` string, recorded
at creation time — currently `"1.0"` in the reference implementation.

`protocolVersion` exists so that, as the specification evolves, an implementation can:

* determine under which version of the semantics a historical object or event was created
* apply the correct interpretation when replaying or migrating older records
* refuse, warn on, or upgrade objects created under a version it no longer supports

`protocolVersion` is set once, at creation, and is not expected to change when an object is later
updated — an object's fields may evolve under later operations while still being interpreted
according to the semantics of the version it declares.

---

# 5. Relationships

## Event Model (Document 16)

Every ProtocolEvent carries its own `protocolVersion`, independent of the `protocolVersion` on the
resource it describes, since the two may diverge if a resource is read long after the version that
created it has been superseded.

## Every ProtocolEntity (Documents 05-15, 21-23)

`protocolVersion` is inherited from the shared `ProtocolEntity` base rather than redeclared per
resource chapter.

---

# 6. Events

Version negotiation and compatibility handling are implementation-internal concerns and do not
have dedicated ProtocolEvent types of their own.

---

# 7. Invariants

A compliant implementation MUST ensure:

* Every object extending `ProtocolEntity`, and every ProtocolEvent, records a `protocolVersion` at
  creation time.
* `protocolVersion` is never retroactively rewritten to a later value once set.
* A compliant implementation declares the highest protocol version it supports
  (`01-introduction.md` §11).
* Breaking changes to normative semantics are never introduced within the same major version.

---

# 8. JSON Representation

```json
{
  "id": "mission-8fd24c8d",
  "protocolVersion": "1.0",
  "title": "Implement OAuth Login",
  "status": "PLANNING"
}
```

---

# 9. Extension Points

Extensions and Profiles (Document 18) version independently of the core protocol; a Profile MAY
declare its own version scheme for the extension fields it defines, since those fields are
implementation- and industry-specific rather than core semantics.

* Extensions MUST NOT repurpose the core `protocolVersion` field to encode extension or profile
  versions.
* Extensions MUST NOT require a specific core `protocolVersion` as a precondition for being
  understood, beyond what the extension's own documented compatibility range states.

---

# 10. Summary

Versioning gives the specification room to grow without breaking what already exists: the document
set versions as a whole under Semantic Versioning, while every individual object and event carries
the `protocolVersion` it was created under, so implementations can always tell which era of
semantics a given record belongs to.
