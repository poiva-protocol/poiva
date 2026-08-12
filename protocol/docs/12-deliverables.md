# Poiva Protocol Specification

**Document:** 12 - Deliverables

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

A **Deliverable** is an artifact produced during execution — software, a CAD drawing, a contract,
a report, a tracking number, a photograph. Every Deliverable belongs to exactly one Mission
(Document 05) and, when produced by a specific unit of work, to one Activity (Document 06).
Deliverables are what Verification (Document 14) ultimately evaluates.

---

# 2. Design Goals

Deliverables MUST:

* belong to exactly one Mission
* expose a lifecycle state
* be attributable to the Participant that submitted them
* support one or more Artifacts and Evidence records

Deliverables SHOULD declare Acceptance Criteria (`04-terminology.md` §5) so that Verification has
an objective basis for its decision.

---

# 3. Deliverable Model

```text
Mission
?
??? Activity A
?   ?
?   ??? Deliverable: "OAuth backend PR"
?       ??? Artifacts
?       ?   ??? Artifact: pull-request URL
?       ??? Evidence
?       ?   ??? Evidence: CI run
?       ??? Verifications
?
??? Deliverable: "Final Report" (mission-level, no Activity)
```

A Deliverable's `activity` link is optional: a Deliverable MAY be produced directly at the Mission
level (e.g. a final report) rather than by a specific Activity.

---

# 4. Required Fields

| Field        | Type              | Description                                           |
| ------------ | ----------------- | -------------------------------------------------------- |
| id           | UUID               | Global identifier                                         |
| mission      | Mission Reference  | Owning Mission                                             |
| title        | String             | Human-readable title                                       |
| artifactType | String             | Free-text category of the produced artifact                |
| state        | Enum               | SUBMITTED, IN_REVIEW, ACCEPTED, or REJECTED                |

## Optional Fields

| Field              | Description |
| ------------------ | ----------- |
| activity            | Activity that produced this Deliverable, if any (Document 06) |
| submittedBy         | Participant that submitted the Deliverable |
| acceptanceCriteria  | List of free-text conditions the Deliverable must satisfy |
| artifacts           | Artifacts attached to this Deliverable (see §7 below) |
| evidence            | Evidence records supporting this Deliverable (Document 13) |

---

# 5. Lifecycle

```text
Submitted
    ?
    ??????????????
    ?             ?
In Review       (direct decision)
    ?             ?
    ??????????????
    ?
Accepted / Rejected
```

## States

| State     | Description                                    |
| --------- | ------------------------------------------------ |
| SUBMITTED | Deliverable has been produced and submitted        |
| IN_REVIEW | Under active review before a decision is recorded  |
| ACCEPTED  | Deliverable satisfies its Acceptance Criteria      |
| REJECTED  | Deliverable does not satisfy its Acceptance Criteria |

---

# 6. State Transition Rules

The following transitions are valid:

* SUBMITTED → IN_REVIEW
* SUBMITTED → ACCEPTED
* SUBMITTED → REJECTED
* IN_REVIEW → ACCEPTED
* IN_REVIEW → REJECTED

ACCEPTED and REJECTED are terminal — a Deliverable's decision is not reopened; a corrected
Deliverable MUST be submitted as a new Deliverable.

---

# 7. Artifacts

An **Artifact** is a file, object, or reference attached to a Deliverable — a pull request URL, a
document, a signed file, a physical-item reference. Artifacts are owned by exactly one Deliverable
and are immutable once created: there is no update or delete operation.

### Artifact Required Fields

| Field       | Type              | Description                          |
| ----------- | ----------------- | --------------------------------------- |
| id          | UUID               | Global identifier                        |
| deliverable | Deliverable Reference | Owning Deliverable                    |
| type        | String             | Free-text category (e.g. "pull_request", "file") |
| locator     | String             | Where the artifact lives (URL or path)    |

### Artifact Optional Fields

| Field    | Description |
| -------- | ----------- |
| checksum | Integrity hash of the artifact's content, where applicable |

---

# 8. Relationships

## Mission (Document 05)

Every Deliverable belongs to exactly one Mission for its entire lifetime (`05-mission.md` §15).

## Activity (Document 06)

An Activity MAY produce one or more Deliverables (`06-activity.md` §8); a Deliverable's `activity`
link is optional.

## Evidence (Document 13)

Evidence records are attached to a Deliverable to support Verification's decision.

## Verification (Document 14)

Verification evaluates whether a Deliverable's Evidence satisfies its Acceptance Criteria.

---

# 9. Events

* `deliverable.submitted`
* `deliverable.state_changed`
* `deliverable.deleted`

---

# 10. Invariants

A compliant implementation MUST ensure:

* Every Deliverable belongs to exactly one Mission.
* A Deliverable's state transitions follow the graph in §6; ACCEPTED and REJECTED are terminal.
* Deliverables remain accessible after their Mission completes (`05-mission.md` §20).
* Artifacts, once created, MUST NOT be modified or deleted.
* Deleting a Deliverable is a soft operation (status change) that MUST NOT remove its historical
  Artifacts, Evidence, or Verification records.

---

# 11. JSON Representation

```json
{
  "id": "deliverable-7a12f0",
  "missionId": "mission-8fd24c8d",
  "activityId": "activity-42",
  "title": "Implement OAuth backend",
  "artifactType": "pull_request",
  "state": "IN_REVIEW",
  "submittedBy": { "id": "participant-123" },
  "acceptanceCriteria": [
    "All unit tests pass",
    "Code review approved"
  ],
  "artifacts": [
    {
      "id": "artifact-91c2",
      "type": "pull_request",
      "locator": "https://github.com/example/repo/pull/482"
    }
  ]
}
```

---

# 12. REST Resources

```http
GET    /missions/{id}/deliverables
POST   /missions/{id}/deliverables
GET    /deliverables/{id}
PATCH  /deliverables/{id}/state
DELETE /deliverables/{id}

GET    /deliverables/{id}/artifacts
POST   /deliverables/{id}/artifacts
GET    /artifacts/{id}
```

---

# 13. Extension Points

Extensions MAY define industry-specific `artifactType` vocabularies (e.g. "cad_drawing",
"medical_opinion", "delivery_confirmation").

* Extensions MUST NOT redefine Deliverable state semantics.
* Extensions MUST NOT make Artifacts mutable.

---

# 14. Summary

Deliverables are the tangible output of execution — the thing Verification ultimately judges.
Keeping Artifacts immutable and Deliverable decisions terminal preserves the auditable history the
protocol requires end to end.
