# Poiva Protocol Specification

**Document:** 18 - Extension Model

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

The **Extension Model** lets every protocol object carry implementation- or industry-specific
fields without changing the core schema, per `02-design-principles.md` Principle 7
("Extensibility") and `04-terminology.md` §10 ("Extension" / "Profile"). Rather than each resource
chapter inventing its own metadata mechanism, every object extending the shared `ProtocolEntity`
base carries one uniform `extensions` collection.

---

# 2. Design Goals

The extension mechanism MUST:

* attach to any protocol object without modifying that object's core fields
* be safely ignorable by implementations that do not understand a given extension
* group related fields under a named profile

Metadata carried through extensions MUST NOT alter protocol semantics (`04-terminology.md` §9):
unknown metadata MUST be safely ignored by compliant implementations.

---

# 3. Extension Model

```text
ProtocolEntity (Mission, Activity, Deliverable, Evidence, Verification, Settlement, ...)
?
??? extensions: Set<ProtocolEntityExtension>
    ?
    ??? { profile: "healthcare", key: "diagnosisCode", value: "..." }
    ??? { profile: "healthcare", key: "clinicianLicense", value: "..." }
    ??? { profile: "construction", key: "permitNumber", value: "..." }
```

Every `ProtocolEntity` subclass — every typed resource described in Documents 05-15 and 21-23 —
owns its own `extensions` collection; there is no separate global extension table shared across
entity types.

---

# 4. Required Fields

`ProtocolEntityExtension`:

| Field | Type   | Description                            |
| ----- | ------ | ----------------------------------------- |
| id    | UUID   | Global identifier                          |
| key   | String | Extension field name                       |

## Optional Fields

| Field   | Description |
| ------- | ----------- |
| profile | Groups related extension fields under a named profile (e.g. "healthcare", "construction") |
| value   | The extension field's value, stored as text |

---

# 5. Relationships

## Every ProtocolEntity (Documents 05-15, 21-23)

Any typed protocol object may own extension rows; ownership is expressed only through the owning
entity's `extensions` collection, not by a foreign key on the extension row itself, since any
`ProtocolEntity` subclass may own one.

## Profile

A Profile (`04-terminology.md` §10) is the standardized grouping of Extensions for a particular
domain (e.g. a Software Development Profile, a Healthcare Profile). The `profile` field is how a
group of related extension key/value pairs on the same object are associated with one such
standardized grouping.

---

# 6. Events

Extension attachment does not have its own dedicated event type in the reference implementation;
it is captured as part of whichever resource-level event (Document 16) the mutating operation
produces.

---

# 7. Invariants

A compliant implementation MUST ensure:

* An extension attaches to exactly one owning entity.
* Unknown extension keys/profiles MUST be preserved and safely ignored by implementations that do
  not recognize them — never dropped or treated as an error.
* Extensions MUST NOT be usable to override or shadow a core field already defined on the owning
  entity's schema.

---

# 8. JSON Representation

```json
{
  "id": "deliverable-7a12f0",
  "title": "Site Inspection Report",
  "extensions": [
    {
      "profile": "construction",
      "key": "permitNumber",
      "value": "BP-2026-04471"
    },
    {
      "profile": "construction",
      "key": "inspectorLicense",
      "value": "EL-88213"
    }
  ]
}
```

---

# 9. REST Resources

Extensions are not exposed as an independent top-level resource; they are read and written as part
of their owning entity's own representation and REST endpoints (see each resource's own chapter,
Documents 05-15 and 21-23).

---

# 10. Extension Points

This document is itself the description of the protocol's extension mechanism. Profiles built on
top of it (Software Development, Healthcare, Construction, Legal, Logistics, Manufacturing,
Education, per `01-introduction.md` §6) SHOULD document their own reserved `profile` name and
`key` vocabulary.

* Extensions MUST NOT redefine the meaning of a core field on the entity they attach to.
* Extensions MUST NOT be required for baseline protocol conformance — an implementation supporting
  zero extensions is still fully compliant.

---

# 11. Summary

The extension model is what keeps the core protocol small (`02-design-principles.md` Principle 20:
"The Protocol Must Remain Boring") while still letting every industry attach the metadata it needs,
without forking the schema of Mission, Activity, Deliverable, or any other core object.
