# Poiva Protocol Specification

**Document:** 06 - Activities

**Version:** 1.0.0-draft

**Status:** Draft

------------------------------------------------------------------------

# 1. Purpose

Activities are the executable units of a Mission.

A Mission describes **what** outcome is desired.

Activities describe **how** that outcome is achieved.

Activities are intentionally independent, composable, assignable and
verifiable.

------------------------------------------------------------------------

# 2. Design Goals

Activities MUST:

-   Belong to exactly one Mission.
-   Be independently assignable.
-   Produce one or more Deliverables.
-   Maintain immutable history.
-   Support dependencies.
-   Support verification.
-   Support extension.

Activities SHOULD be small enough to be completed by a single
responsible participant or coordinated group.

------------------------------------------------------------------------

# 3. Activity Model

    Mission
    ?
    ??? Activity A
    ?   ??? Deliverables
    ?   ??? Evidence
    ?   ??? Events
    ?
    ??? Activity B
    ?
    ??? Activity C

Activities may themselves contain child Activities.

------------------------------------------------------------------------

# 4. Required Fields

Field       Description
  ----------- ----------------------------
id          Globally unique identifier
missionId   Parent Mission
title       Human readable name
state       Current lifecycle
createdAt   Timestamp
createdBy   Participant

Optional:

-   description
-   parentActivityId
-   estimatedDuration
-   estimatedCost
-   requiredCapabilities
-   priority
-   labels
-   metadata
-   dependencies
-   deadline

------------------------------------------------------------------------

# 5. Lifecycle

    Draft
     ?
    Ready
     ?
    Assigned
     ?
    Executing
     ?
    Submitted
     ?
    Verifying
     ?
    Approved
     ?
    Completed

Alternative terminal states:

-   Cancelled
-   Rejected
-   Archived

------------------------------------------------------------------------

# 6. Dependencies

Activities MAY depend on:

-   one Activity
-   multiple Activities
-   external events

Dependency types:

-   Finish-to-Start
-   Start-to-Start
-   Finish-to-Finish
-   Start-to-Finish

Execution engines determine scheduling while respecting declared
dependencies.

------------------------------------------------------------------------

# 7. Assignment

An Activity MAY have:

-   no Contributor
-   one Contributor
-   multiple Contributors

Assignment SHOULD be based on:

-   capabilities
-   availability
-   trust
-   policy
-   budget
-   locality (optional)

------------------------------------------------------------------------

# 8. Deliverables

Each Activity MAY produce one or more Deliverables.

Examples:

Software: - Pull Request - Documentation

Construction: - Inspection Report

Healthcare: - Medical Opinion

Logistics: - Delivery Confirmation

------------------------------------------------------------------------

# 9. Evidence

Evidence is attached to Activities through Deliverables.

Typical evidence:

-   CI pipeline
-   Digital signature
-   GPS
-   Photo
-   Test report
-   Human review

------------------------------------------------------------------------

# 10. Verification

Activities MUST define a verification policy.

Policies may be:

-   Automatic
-   Manual
-   Hybrid

Approval SHOULD only occur after successful verification.

------------------------------------------------------------------------

# 11. Events

Recommended events:

-   ActivityCreated
-   ActivityUpdated
-   ActivityAssigned
-   ActivityStarted
-   ActivityPaused
-   ActivityResumed
-   DeliverableSubmitted
-   EvidenceAttached
-   VerificationPassed
-   VerificationFailed
-   ActivityApproved
-   ActivityCompleted
-   ActivityCancelled

Events MUST be immutable.

------------------------------------------------------------------------

# 12. JSON Example

``` json
{
  "id":"activity-42",
  "missionId":"mission-1",
  "title":"Implement OAuth backend",
  "state":"READY",
  "requiredCapabilities":[
    "Java",
    "Spring Boot",
    "OAuth2"
  ],
  "dependencies":[
    "activity-10"
  ]
}
```

------------------------------------------------------------------------

# 13. REST Resources

    POST   /missions/{id}/activities
    GET    /activities/{id}
    PATCH  /activities/{id}
    POST   /activities/{id}/assign
    POST   /activities/{id}/submit
    POST   /activities/{id}/approve
    GET    /activities/{id}/events

------------------------------------------------------------------------

# 14. Invariants

A compliant implementation MUST ensure:

-   Every Activity belongs to exactly one Mission.
-   Every Activity has exactly one lifecycle state.
-   Completed Activities cannot return to Executing.
-   Immutable history is preserved.
-   Deliverables remain accessible after completion.
-   Verification records cannot be deleted.

------------------------------------------------------------------------

# 15. Extension Points

Profiles MAY introduce:

-   software-specific fields
-   healthcare metadata
-   construction inspections
-   logistics tracking
-   manufacturing operations

Extensions MUST NOT redefine Activity semantics.

------------------------------------------------------------------------

# 16. Summary

Activities are the fundamental execution units of the Poiva Protocol.

They isolate execution from business outcomes, enable distributed work
allocation, and provide the foundation for verification, auditing,
orchestration and automation across every industry.
