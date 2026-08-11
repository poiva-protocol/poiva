# Poiva Protocol Specification

**Document:** 04 - Terminology

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

This document establishes the canonical terminology used throughout the Poiva Protocol.

Every implementation, SDK, API, extension and implementation guide MUST use these definitions consistently.

The objective of this document is to eliminate ambiguity and ensure that independent implementations interpret protocol concepts identically.

---

# 2. Normative Language

The keywords **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT**, **SHOULD**, **SHOULD NOT**, **RECOMMENDED**, **MAY**, and **OPTIONAL** are to be interpreted according to RFC 2119.

---

# 3. Fundamental Concepts

## Mission

A **Mission** is the highest-level unit of work defined by the protocol.

A Mission represents a desired outcome rather than a list of activities.

Examples:

* Develop a payment service
* Deliver a package
* Review a legal contract
* Inspect a building
* Design an electrical installation

A Mission MAY contain zero or more Activities.

A Mission MUST define an expected outcome.

---

## Activity

An **Activity** represents a unit of execution within a Mission.

Activities allow Missions to be decomposed into smaller, independently executable units.

Activities MAY:

* execute sequentially
* execute in parallel
* depend on other Activities
* create additional Activities

Activities MUST belong to exactly one Mission.

---

## Participant

A **Participant** is any entity capable of contributing to a Mission.

Participant categories include:

* Human
* Organization
* AI Agent
* Robot
* External System

The protocol intentionally avoids distinguishing between human and artificial participants during execution.

---

## Capability

A **Capability** represents a skill, competency or function that enables a Participant to perform Activities.

Examples include:

* Java Development
* Structural Engineering
* Translation
* Medical Coding
* Food Delivery
* Electrical Inspection

Capabilities are independent of organizational roles.

---

## Sponsor

The **Sponsor** is the entity requesting the Mission.

The Sponsor owns the desired outcome.

The Sponsor MAY:

* define requirements
* approve deliverables
* reject deliverables
* authorize settlement
* cancel a Mission

---

## Contributor

A **Contributor** is a Participant assigned to perform one or more Activities.

A Participant becomes a Contributor only after assignment.

---

## Reviewer

A **Reviewer** evaluates Deliverables and Evidence.

Reviewers MAY be:

* humans
* organizations
* AI systems
* automated validation engines

---

# 4. Planning Concepts

## Estimate

An **Estimate** predicts execution characteristics before work begins.

Typical estimate dimensions include:

* duration
* effort
* complexity
* cost
* required capabilities
* confidence

Multiple independent Estimates MAY exist for the same Mission.

---

## Planning Proposal

A **Planning Proposal** is a complete execution strategy submitted during the planning phase.

A Planning Proposal MAY include:

* Estimates
* Activity decomposition
* identified risks
* required capabilities
* execution strategy
* expected timeline

Only one Planning Proposal SHOULD become the active execution plan.

---

## Provisioning

**Provisioning** is the process of assigning Contributors to Activities.

Provisioning MAY be:

* manual
* automatic
* AI-assisted
* hybrid

Provisioning SHOULD be capability-driven.

---

# 5. Knowledge Concepts

## Knowledge Capsule

A **Knowledge Capsule** is an immutable collection of information attached to a Mission.

Knowledge Capsules provide execution context.

Examples:

* PDF documents
* Git repositories
* Images
* Videos
* Architecture diagrams
* Specifications
* URLs
* Regulations

Knowledge Capsules SHOULD be versioned.

Knowledge Capsules SHOULD remain immutable after publication.

---

## Requirement

A **Requirement** defines an expected property of the Mission.

Examples:

* Performance
* Security
* Functional behavior
* Compliance
* Delivery deadline

Requirements SHOULD be measurable whenever practical.

---

## Acceptance Criteria

Acceptance Criteria define the conditions under which a Deliverable is considered acceptable.

Acceptance Criteria SHOULD be objective.

Acceptance Criteria MAY reference Evidence requirements.

---

# 6. Execution Concepts

## Deliverable

A **Deliverable** is an artifact produced during execution.

Examples:

Software

* Source code
* Pull request
* Binary

Construction

* CAD drawing
* Inspection report

Legal

* Contract
* Legal opinion

Healthcare

* Medical report

Logistics

* Tracking number
* Delivery confirmation

Deliverables MAY be digital or physical.

---

## Artifact

An **Artifact** is any file, object or reference associated with a Deliverable.

Artifacts include:

* files
* repositories
* URLs
* media
* physical references

Every Deliverable MAY contain one or more Artifacts.

---

## Evidence

**Evidence** supports claims regarding Deliverables.

Evidence examples include:

* automated tests
* digital signatures
* CI pipelines
* inspection reports
* photographs
* GPS records
* sensor measurements

Evidence SHOULD be independently verifiable whenever possible.

---

## Verification

**Verification** determines whether Evidence satisfies Acceptance Criteria.

Verification outcomes include:

* Passed
* Failed
* Inconclusive

Verification MAY be:

* automatic
* manual
* hybrid

---

## Validation

Validation determines whether the completed Mission satisfies the Sponsor's intended business outcome.

Verification answers:

> "Was it built correctly?"

Validation answers:

> "Was the correct thing built?"

The protocol distinguishes between the two.

---

# 7. Commercial Concepts

## Settlement

Settlement records commercial completion.

Settlement MAY represent:

* invoice
* salary
* internal accounting
* purchase order completion
* grant distribution

The protocol intentionally avoids specifying payment providers.

---

## Trust Score

A Trust Score represents an implementation-defined confidence metric associated with a Participant or Sponsor.

The protocol does not define:

* scoring algorithms
* score ranges
* weighting factors

Implementations MAY expose Trust Scores to influence provisioning decisions.

---

# 8. Lifecycle Concepts

## State

A State represents the current lifecycle position of an object.

Objects MAY transition between States according to protocol rules.

---

## Transition

A Transition represents a valid movement between two States.

Transitions SHOULD produce protocol Events.

---

## Event

An Event represents an immutable historical fact.

Events are append-only.

Events MUST NOT be modified after publication.

Examples:

* MissionCreated
* ParticipantAssigned
* DeliverableSubmitted
* VerificationPassed

---

# 9. Identity Concepts

## Identifier

Every protocol object MUST possess a globally unique identifier.

Identifiers MUST remain stable throughout the lifetime of the object.

Identifiers MUST NOT encode business meaning.

---

## Metadata

Metadata consists of implementation-specific information attached to protocol objects.

Metadata MUST NOT alter protocol semantics.

Unknown Metadata MUST be safely ignored by compliant implementations.

---

# 10. Extension Concepts

## Extension

An Extension introduces domain-specific functionality while preserving core protocol semantics.

Examples:

* Software Development Profile
* Healthcare Profile
* Logistics Profile
* Construction Profile

Extensions MUST NOT redefine core objects.

---

## Profile

A Profile is a standardized collection of Extensions for a particular domain.

Profiles enable interoperability within industries while remaining compatible with the core protocol.

---

# 11. Reserved Terms

The following terms have protocol-defined meanings and SHOULD NOT be redefined by implementations:

* Mission
* Activity
* Participant
* Capability
* Knowledge Capsule
* Deliverable
* Artifact
* Evidence
* Verification
* Validation
* Settlement
* Estimate
* Planning Proposal
* Event
* State
* Transition
* Profile
* Extension

---

# 12. Glossary Summary

| Term              | Definition                                          |
| ----------------- | --------------------------------------------------- |
| Mission           | Desired outcome                                     |
| Activity          | Executable unit of work                             |
| Participant       | Entity capable of contributing                      |
| Contributor       | Assigned Participant                                |
| Capability        | Executable skill or competency                      |
| Sponsor           | Requesting entity                                   |
| Knowledge Capsule | Immutable execution context                         |
| Deliverable       | Output produced during execution                    |
| Artifact          | File or object associated with a Deliverable        |
| Evidence          | Proof supporting a Deliverable                      |
| Verification      | Evaluation of Evidence                              |
| Validation        | Confirmation that the intended outcome was achieved |
| Estimate          | Prediction of execution characteristics             |
| Planning Proposal | Proposed execution strategy                         |
| Settlement        | Commercial completion                               |
| Event             | Immutable historical fact                           |
| State             | Lifecycle position                                  |
| Profile           | Industry-specific protocol extension                |

---

# 13. Future Evolution

New terminology SHOULD be introduced only when:

* existing concepts cannot express the required semantics;
* the concept is applicable across multiple domains; and
* introducing the term improves interoperability.

Maintaining a small, stable vocabulary is essential to the long-term success of the Poiva Protocol.
