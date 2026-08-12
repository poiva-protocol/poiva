# Poiva Protocol Specification

**Document:** 09 - Knowledge Capsules

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **Knowledge Capsule** is an immutable piece of execution context attached to a Mission (Document
05) — a document, image, video, repository, URL, specification, architecture diagram, regulation,
or contract that a Contributor needs to execute an Activity correctly. Knowledge Capsules exist to
give Missions a stable, versioned body of context that outlives any single conversation or
handoff.

---

# 2. Design Goals

Knowledge Capsules MUST:

* belong to exactly one Mission
* possess a globally unique identifier
* declare a `type`

Knowledge Capsules SHOULD remain immutable after publication (`05-mission.md` §11). Implementations
MUST NOT allow a Knowledge Capsule's `locator` or `type` to be edited in place; a new capsule with
an incremented `version` SHOULD be published instead.

---

# 3. Knowledge Capsule Model

```text
Mission
?
??? Knowledge Capsule: "Architecture Diagram" (v1)
??? Knowledge Capsule: "Architecture Diagram" (v2)
??? Knowledge Capsule: "OpenAPI Specification" (v1)
??? Knowledge Capsule: "Compliance Regulation" (v1)
```

---

# 4. Required Fields

| Field   | Type   | Description                                                                                                    |
| ------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| id      | UUID   | Global identifier                                                                                                 |
| mission | Mission Reference | Owning Mission                                                                                       |
| title   | String | Human-readable title                                                                                              |
| type    | Enum   | DOCUMENT, IMAGE, VIDEO, REPOSITORY, URL, SPECIFICATION, ARCHITECTURE_DIAGRAM, REGULATION, CONTRACT, or OTHER      |
| locator | String | Where the content lives (e.g. a URL or path)                                                                      |

## Optional Fields

| Field   | Description |
| ------- | ----------- |
| version | Integer, defaults to 1; incremented when a capsule is republished rather than edited |

---

# 5. Relationships

## Mission (Document 05)

Every Knowledge Capsule belongs to exactly one Mission and provides execution context for that
Mission's Activities. `05-mission.md` §11 describes Knowledge Capsules at the Mission level; this
document defines the object itself.

## Activity (Document 06)

Activities do not own Knowledge Capsules directly; Contributors executing an Activity consult the
capsules attached to the parent Mission.

## Security (Document 19)

Knowledge Capsules SHOULD inherit the Mission's visibility policy unless explicitly overridden
(`05-mission.md` §24).

---

# 6. Events

* `knowledge_capsule.attached`

---

# 7. Invariants

A compliant implementation MUST ensure:

* A Knowledge Capsule belongs to exactly one Mission for its entire lifetime.
* A Knowledge Capsule, once published, MUST NOT be mutated or deleted — a corrected or updated
  capsule MUST be published as a new capsule with an incremented `version`.
* `version` values for capsules sharing the same logical document SHOULD increase monotonically.

---

# 8. JSON Representation

```json
{
  "id": "knowledge-3f81c9",
  "missionId": "mission-8fd24c8d",
  "title": "OAuth Architecture Diagram",
  "type": "ARCHITECTURE_DIAGRAM",
  "locator": "https://cdn.example.com/missions/8fd24c8d/architecture-v2.png",
  "version": 2
}
```

---

# 9. REST Resources

```http
GET    /missions/{id}/knowledge
POST   /missions/{id}/knowledge
GET    /knowledge/{id}
```

---

# 10. Extension Points

Extensions MAY define additional `type` values for domain-specific artifacts (e.g. a healthcare
profile's "Clinical Guideline" or a construction profile's "BIM Model") by carrying them as
extension metadata alongside the closest matching core `type`.

* Extensions MUST NOT redefine the immutability guarantee of a published capsule.
* Extensions MUST NOT change the meaning of an existing core `type` value.

---

# 11. Summary

Knowledge Capsules give a Mission a durable, versioned record of the context Contributors need,
independent of any single tool, chat thread, or file system. Their immutability means that when a
Deliverable is later verified, reviewers can reconstruct exactly what information was available to
the Contributor at the time.
