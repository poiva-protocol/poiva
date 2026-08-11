# Poiva Protocol Specification

**Document:** 02 - Design Principles

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

This document defines the architectural principles that guide every aspect of the Poiva Protocol.

These principles are intentionally stable and are expected to evolve far less frequently than the protocol itself.

Every future enhancement proposal (PEP), SDK, extension and implementation SHOULD be evaluated against these principles before being accepted into the ecosystem.

---

# 2. Philosophy

Poiva is not simply a workflow specification.

It is an execution protocol.

The protocol exists to answer one fundamental question:

> **How can independent systems coordinate work while remaining interoperable?**

Every design decision should contribute toward answering that question.

---

# 3. Principle 1 ? Outcome Over Activity

People and systems often measure work through activity.

Examples include:

* Hours worked
* Messages exchanged
* Meetings attended
* Lines of code
* Number of commits
* Tickets updated

These measurements rarely represent value.

Poiva models **outcomes**, not effort.

Examples of outcomes include:

* Feature implemented
* Contract signed
* Shipment delivered
* Inspection completed
* Medical opinion submitted

An implementation MAY record activity.

The protocol MUST model outcomes.

---

# 4. Principle 2 ? Evidence Over Trust

Trust is valuable.

Evidence is scalable.

Every significant outcome SHOULD be accompanied by evidence appropriate to its domain.

Examples include:

Software

* Passing automated tests
* Code review approval
* Successful deployment

Construction

* Engineer signature
* Site photographs
* Inspection report

Healthcare

* Clinical review
* Medical documentation
* Regulatory approval

Logistics

* GPS coordinates
* Delivery confirmation
* Customer signature

Evidence enables independent verification without relying solely on personal trust.

---

# 5. Principle 3 ? Capability Over Role

Traditional systems assign work to predefined roles.

Examples:

* Developer
* Lawyer
* Driver
* Architect
* Inspector

Roles differ between organizations.

Capabilities do not.

Capabilities describe what a participant can perform.

Examples:

* Java Development
* Electrical Inspection
* Translation
* CAD Design
* Structural Analysis
* Medical Coding

Participants SHOULD advertise capabilities.

Provisioning SHOULD select participants according to capabilities.

---

# 6. Principle 4 ? Humans and AI Are First-Class Participants

Poiva intentionally avoids distinguishing between humans and artificial agents at the protocol level.

A participant may be:

* a human
* an organization
* an AI model
* a software agent
* a robot
* an automated service

All participants may:

* estimate work
* perform activities
* submit deliverables
* produce evidence

Implementations remain free to define their own trust and verification policies.

---

# 7. Principle 5 ? Protocol Before Platform

Platforms evolve.

Protocols endure.

Poiva defines concepts.

Implementations provide functionality.

No implementation owns the protocol.

The protocol MUST remain useful even if every current implementation disappears.

---

# 8. Principle 6 ? Vendor Neutrality

The protocol belongs to its ecosystem.

No feature should require:

* Poiva Cloud
* CraftStack
* a particular SDK
* a specific database
* a specific programming language

Every implementation should compete on execution quality rather than protocol ownership.

---

# 9. Principle 7 ? Extensibility

The protocol intentionally remains small.

The core protocol models concepts that are universal across industries.

Industry-specific concepts belong in extensions.

Example:

Software

* Git repositories
* Pull Requests
* Branches

Healthcare

* FHIR resources
* Diagnoses
* Prescriptions

Construction

* Building permits
* BIM models
* Safety inspections

Extensions SHOULD compose naturally without changing the meaning of core protocol objects.

---

# 10. Principle 8 ? Event-Driven by Default

Every meaningful state transition SHOULD produce an immutable event.

Events provide:

* auditability
* synchronization
* notifications
* analytics
* replay
* integrations

The protocol favors append-only event histories over mutable state whenever practical.

---

# 11. Principle 9 ? Immutable History

Completed work should remain auditable.

Instead of overwriting historical information, implementations SHOULD preserve immutable records describing:

* decisions
* assignments
* approvals
* evidence
* settlement

Historical information SHOULD remain reproducible.

---

# 12. Principle 10 ? Separation of Planning and Execution

Planning is a distinct activity.

Execution is a distinct activity.

Poiva intentionally separates:

Mission Definition

?

Planning

?

Estimation

?

Provisioning

?

Execution

?

Verification

This separation allows different participants to specialize in different stages.

---

# 13. Principle 11 ? Verification Is Part of Execution

Verification is not an optional administrative task.

Verification determines whether execution produced the intended outcome.

Without verification, execution remains incomplete.

Every implementation SHOULD treat verification as a first-class protocol concept.

---

# 14. Principle 12 ? Portable Work

A Mission should not become permanently tied to one implementation.

Organizations SHOULD be capable of:

* exporting Missions
* importing Missions
* transferring execution
* continuing work elsewhere

Protocol compatibility enables portability.

---

# 15. Principle 13 ? API First

Every protocol capability SHOULD be accessible through stable APIs.

User interfaces consume APIs.

SDKs consume APIs.

CLI tools consume APIs.

AI agents consume APIs.

The API is not an implementation detail.

It is part of the protocol ecosystem.

---

# 16. Principle 14 ? Language Independence

The protocol MUST remain independent of programming language.

Official SDKs may exist for multiple languages.

Every SDK should expose equivalent protocol semantics.

No SDK may introduce concepts absent from the protocol.

---

# 17. Principle 15 ? Transport Independence

Poiva does not mandate transport mechanisms.

Compliant implementations MAY use:

* REST
* GraphQL
* gRPC
* Message Queues
* Event Streaming
* WebSockets

Transport selection remains implementation-specific.

---

# 18. Principle 16 ? Identity Is External

The protocol requires participants to be uniquely identifiable.

The protocol does not prescribe identity providers.

Implementations may integrate with:

* OAuth2
* OpenID Connect
* LDAP
* Enterprise SSO
* API Keys
* Mutual TLS

Identity is orthogonal to execution.

---

# 19. Principle 17 ? Settlement Is Optional

Completion of work does not necessarily imply financial compensation.

Settlement may represent:

* invoices
* salaries
* volunteer work
* internal accounting
* grants
* purchase orders

The protocol models settlement without prescribing financial mechanisms.

---

# 20. Principle 18 ? Backwards Compatibility

Protocol evolution should minimize disruption.

Breaking changes MUST be introduced only through major protocol versions.

Extensions SHOULD remain backwards compatible whenever practical.

Long-term stability takes precedence over rapid feature growth.

---

# 21. Principle 19 ? Open Governance

Protocol evolution should occur through public discussion.

Significant changes SHOULD be proposed through Poiva Enhancement Proposals (PEPs).

Implementations are encouraged to contribute practical experience back into the specification.

---

# 22. Principle 20 ? The Protocol Must Remain Boring

This principle is intentional.

The protocol should prioritize:

* predictability
* consistency
* interoperability
* stability

Novel ideas belong in implementations first.

Only proven concepts should become part of the protocol.

The protocol should evolve conservatively.

Implementations should innovate aggressively.

---

# 23. Design Review Checklist

Before introducing any new protocol feature, contributors SHOULD ask:

* Does this solve a universal problem?
* Can this be implemented across industries?
* Does it preserve interoperability?
* Does it require vendor-specific behavior?
* Can it be represented as an extension instead?
* Does it introduce unnecessary complexity?
* Does it improve verification?
* Does it preserve backwards compatibility?
* Would an independent implementation understand it?

If the answer to several of these questions is negative, the proposal should be reconsidered.

---

# 24. Summary

These principles define the long-term direction of the Poiva Protocol.

While implementations will evolve, technologies will change and industries will introduce new requirements, these principles provide the foundation upon which the protocol is built.

Every subsequent document in this specification derives from them.

When uncertainty arises, implementations SHOULD favor decisions that better uphold these principles rather than introducing protocol-specific exceptions.
