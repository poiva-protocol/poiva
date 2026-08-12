# Poiva Protocol Specification

**Document:** 08 - Capabilities

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **Capability** represents a skill, competency or function that enables a Participant (Document
07) to perform Activities (Document 06). Capabilities exist so that Provisioning (Document 11) and
assignment can select Participants by what they can do rather than by organizational title, per
`02-design-principles.md` Principle 3 ("Capability Over Role").

---

# 2. Design Goals

Capabilities MUST:

* possess a globally unique identifier
* declare a `code` that is unique within its Organization
* be independent of organizational role or job title
* be reusable across Missions and Activities

Capabilities SHOULD be small and composable (e.g. "Electrical Inspection" rather than
"Senior Electrical Engineer").

---

# 3. Capability Model

```text
Organization
?
??? Capability: "code-review"
??? Capability: "electrical-inspection"
??? Capability: "translation-es-en"
    ?
    ??? referenced by Participant.capabilities
    ??? referenced by Activity.requiredCapabilities
    ??? referenced by Estimate.requiredCapabilities
```

A Capability is org-scoped: it is defined once per Organization and referenced by `code` wherever
a required or possessed skill needs to be expressed.

---

# 4. Required Fields

| Field   | Type   | Description                                              |
| ------- | ------ | ---------------------------------------------------------- |
| id      | UUID   | Global identifier                                          |
| code    | String | Unique identifier within the owning Organization           |
| display | String | Human-readable name                                        |

## Optional Fields

| Field       | Description |
| ----------- | ----------- |
| description | Free-text explanation of what the capability covers |

---

# 5. Relationships

## Participant (Document 07)

A Participant advertises the Capabilities it possesses via a many-to-many relationship. A single
Capability is typically held by many Participants.

## Activity (Document 06)

An Activity declares `requiredCapabilities` (`06-activity.md` §4). Assignment (`06-activity.md`
§7) SHOULD prefer Participants whose capabilities are a superset of the Activity's requirement.

## Estimate (Document 10)

An Estimate MAY declare `requiredCapabilities`, describing what would be needed to execute the
estimated work — this is distinct from, and precedes, an Activity's own declared requirement.

## Provisioning (Document 11)

Provisioning is the process that matches Participant capabilities against Activity requirements;
see Document 11 for the matching process itself.

---

# 6. Events

* `capability.created`
* `capability.updated`
* `capability.deleted`

---

# 7. Invariants

A compliant implementation MUST ensure:

* A Capability's `code` is unique within its Organization.
* A Capability's `code` is treated as its immutable identity — once other objects (Participants,
  Activities, Estimates) reference a `code`, an implementation MUST NOT silently repurpose that
  code to mean something else.
* Deleting a Capability MUST NOT retroactively alter the historical `requiredCapabilities` or
  `capabilities` snapshots already recorded in events.

---

# 8. JSON Representation

```json
{
  "id": "capability-4e7a1b2c",
  "code": "electrical-inspection",
  "display": "Electrical Inspection",
  "description": "Certified inspection of electrical installations against local code."
}
```

---

# 9. REST Resources

```http
GET    /capabilities
POST   /capabilities
GET    /capabilities/{id}
DELETE /capabilities/{id}
```

---

# 10. Extension Points

Extensions MAY define industry-specific capability taxonomies (e.g. a healthcare profile listing
clinical specialties, or a construction profile listing trade licenses) that implementations use
to pre-populate or validate `code` values.

* Extensions MUST NOT redefine the meaning of an existing Capability's `code`.
* Extensions MUST NOT make a Capability implicitly grant unrelated permissions.

---

# 11. Summary

Capabilities are the vocabulary Participants, Activities and Estimates use to describe what work
requires and who can perform it. By keeping Capabilities small, org-scoped, and independent of
role, the protocol lets Provisioning match work to whoever — human or AI — can actually do it.
