# Poiva Protocol Specification v1.0 (Draft)

> **Status:** Working Draft\
> **Version:** 1.0.0-draft

## Purpose

This document defines the Poiva Protocol: an open, vendor-neutral
specification for describing, planning, executing, verifying and
settling work performed by humans, AI agents, organizations and
automated systems.

The protocol intentionally separates **specification** from
**implementation**. It is designed to become the common language spoken
by marketplaces, enterprise systems, workflow engines, ERP platforms, AI
assistants and future execution engines.

This draft is intentionally comprehensive but is expected to evolve
through Poiva Enhancement Proposals (PEPs).

# Design Goals

The protocol is built around the following principles:

-   Outcome over activity.
-   Evidence over trust.
-   Capability over role.
-   Protocol before platform.
-   Vendor neutrality.
-   Human and AI parity.
-   API-first.
-   Event-driven architecture.
-   Extensible core.
-   Backwards compatibility.

The protocol intentionally does **not** prescribe databases, programming
languages, authentication providers, payment providers or UI
technologies.

# Architecture

    Applications
     ?? CraftStack
     ?? Enterprise Workforce
     ?? Government Systems
     ?? Logistics Platforms
     ?? Healthcare Platforms
     ?? AI Agents

            ?

    Poiva Cloud (optional reference implementation)

            ?

    SDKs / CLI / MCP

            ?

    Poiva Protocol

            ?

    REST / GraphQL / gRPC / Events

The protocol is the stable foundation. Every other layer is replaceable.

# Domain Model

## Mission

Represents a desired business outcome.

Examples:

-   Implement payment API
-   Deliver shipment
-   Review legal contract
-   Perform electrical inspection

### Mission Fields

-   identifier
-   title
-   description
-   objectives
-   priority
-   sponsor
-   lifecycle state
-   activities
-   deliverables
-   evidence requirements
-   settlement policy

------------------------------------------------------------------------

## Activity

A unit of execution belonging to a Mission.

Activities may execute sequentially or in parallel.

Activities may recursively contain child activities.

------------------------------------------------------------------------

## Participant

Represents any execution entity.

Participant types include:

-   Human
-   Organization
-   AI Agent
-   Robot
-   External System

------------------------------------------------------------------------

## Capability

Capabilities describe what a participant can perform.

Examples:

-   Java
-   Spring Boot
-   Medical Coding
-   Translation
-   Drone Inspection

------------------------------------------------------------------------

## Knowledge Capsule

Immutable context attached to a Mission.

Supported examples:

-   Documents
-   Images
-   Video
-   Git repositories
-   URLs
-   Architecture diagrams
-   Regulations
-   PDFs

------------------------------------------------------------------------

## Deliverable

Output produced by execution.

Examples:

-   Source code
-   Pull request
-   CAD drawing
-   Invoice
-   Contract
-   Tracking number
-   Inspection report

------------------------------------------------------------------------

## Evidence

Proof supporting a deliverable.

Evidence examples:

-   CI results
-   Photos
-   Digital signatures
-   GPS coordinates
-   Customer confirmation
-   AI evaluation reports

------------------------------------------------------------------------

## Verification

Determines whether evidence satisfies acceptance criteria.

Verification modes:

-   Automatic
-   Manual
-   Hybrid

------------------------------------------------------------------------

## Settlement

Represents commercial completion.

Examples:

-   Invoice
-   Payroll
-   Internal accounting
-   Purchase order completion

# Mission Lifecycle

    Draft
     ?
    Knowledge Collection
     ?
    Planning
     ?
    Estimation
     ?
    Review
     ?
    Provisioning
     ?
    Execution
     ?
    Deliverables
     ?
    Verification
     ?
    Approval
     ?
    Settlement
     ?
    Completed

Transitions should be represented through immutable protocol events.

# Planning & Estimation

Planning is intentionally separated from execution.

Multiple participants may independently estimate:

-   duration
-   complexity
-   cost
-   required capabilities
-   decomposition into activities
-   identified risks

The sponsor may compare planning proposals before selecting one.

# Provisioning

Provisioning assigns participants according to capability, availability,
trust score, budget constraints and execution policy.

Execution engines remain free to implement their own matching algorithms
while preserving the protocol semantics.

# Verification

Verification is a first-class concern.

Every deliverable SHOULD define:

-   acceptance criteria
-   required evidence
-   verification policy
-   reviewer requirements
-   approval workflow

Verification succeeds only when required evidence satisfies policy.

# Event Model

Every meaningful state transition emits an immutable event.

Core events include:

-   MissionCreated
-   MissionUpdated
-   KnowledgeAttached
-   EstimateRequested
-   EstimateSubmitted
-   EstimateAccepted
-   ActivityCreated
-   ParticipantAssigned
-   ExecutionStarted
-   DeliverableSubmitted
-   EvidenceAttached
-   VerificationPassed
-   VerificationFailed
-   MissionApproved
-   SettlementCreated
-   SettlementConfirmed
-   MissionCompleted

Events SHOULD be append-only and replayable.

# API Guidelines

Suggested REST resources:

-   /missions
-   /activities
-   /participants
-   /capabilities
-   /knowledge
-   /deliverables
-   /evidence
-   /verifications
-   /settlements
-   /events

Every resource SHOULD expose immutable identifiers and timestamps.

Long-running operations SHOULD be asynchronous.

# Extension Model

The protocol core intentionally remains small.

Industry-specific functionality is introduced through profiles.

Example profiles:

Software Development Healthcare Construction Legal Logistics
Manufacturing Education

Profiles MUST NOT redefine core semantics.

# Security Considerations

Identity is external to the protocol.

Recommended technologies include:

-   OAuth2
-   OpenID Connect
-   Mutual TLS
-   Enterprise SSO

Evidence integrity SHOULD be cryptographically verifiable where
practical.

Sensitive knowledge capsules SHOULD support encryption and access
policies.

# Conformance

An implementation claiming Poiva compatibility MUST:

-   Preserve core object semantics.
-   Implement lifecycle rules.
-   Produce compliant events.
-   Support protocol version negotiation.
-   Preserve immutable history.
-   Allow extensions without changing core definitions.

# Roadmap

Version 1.0

-   Core protocol
-   SDKs
-   CLI
-   MCP
-   REST specification

Version 1.1

-   Extension registry
-   Capability taxonomy
-   Trust model
-   Reference verification engine

Version 2.0

-   Cross-platform mission portability
-   Federated execution
-   Multi-engine orchestration

# Appendix A -- Example Software Mission

Mission: Implement OAuth login.

Knowledge: - Architecture document - OpenAPI specification - UI mockups

Activities: 1. Backend 2. Frontend 3. Testing 4. Documentation

Evidence: - PR merged - CI green - Coverage \>=80% - Security scan
passed

Verification: Automatic + human review.

Settlement: Invoice after sponsor approval.

# Appendix B -- Example Logistics Mission

Mission: Deliver package.

Knowledge: Destination, package metadata.

Activities: Pickup, transport, delivery.

Evidence: GPS, customer signature, delivery photo.

Settlement: Carrier invoice after successful verification.
