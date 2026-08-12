# Poiva Protocol Specification

**Document:** 11 - Provisioning

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

**Provisioning** is the process of selecting Participants (Document 07) to become Contributors on
a Mission's Activities (Document 06), after Planning and Estimation (Document 10) but before
Execution. Provisioning is not a new entity — it is the protocol's name for the PROVISIONING
Mission state (`05-mission.md` §7) and the Activity assignment mechanism it drives
(`06-activity.md` §7).

---

# 2. Principles

Provisioning MUST:

* occur after a Mission's Planning Proposal has been accepted and its Estimates settled, and
  before Activities begin Executing
* select Contributors according to Capability (`02-design-principles.md` Principle 3), not a
  predefined organizational role
* treat human, organization, AI agent, robot and external-system Participants identically as
  candidates (`02-design-principles.md` Principle 4)

Provisioning SHOULD additionally weigh, on top of Capability match:

* availability
* trust (see `07-participants.md` §4, `trustScore`)
* policy (Document 23)
* budget (the Mission's `estimatedBudget` and an Activity's `estimatedCost`)
* locality, where relevant (optional, implementation-defined)

Provisioning MAY be manual, automatic, AI-assisted, or hybrid (`04-terminology.md` §4). The
protocol does not mandate a particular matching algorithm.

---

# 3. What Provisioning Means

Provisioning is the bridge between planning and execution:

```text
Planning            Estimation            Provisioning            Executing
(strategy chosen)   (cost/time known)     (who does the work)     (work happens)
```

A Mission enters its PROVISIONING state once a Planning Proposal is accepted
(`10-planning-and-estimation.md` §3). During PROVISIONING, implementations select Contributors for
each Activity and record the assignment; the Mission then advances to EXECUTING
(`05-mission.md` §8).

---

# 4. Capability Matching

Provisioning compares an Activity's declared `requiredCapabilities` (`06-activity.md` §4) against
the `capabilities` a candidate Participant has attached (`07-participants.md` §4, `08-capabilities.md`
§5). A Participant is eligible for assignment when its capability set is a superset of the
Activity's requirement; implementations MAY apply additional ranking (trust, availability, budget)
among eligible candidates. The protocol does not mandate a specific ranking or matching algorithm
— only that eligibility is Capability-driven.

---

# 5. Assignment

Provisioning is realized through the existing Activity assignment action (`06-activity.md` §7,
§13):

```http
POST /activities/{id}/assign
```

Assignment MAY attach zero, one, or multiple Contributors to an Activity. The first assignment on
a DRAFT or READY Activity SHOULD move it to the ASSIGNED state.

---

# 6. Relationships

## Participant (Document 07)

Participants are the candidates Provisioning selects among; a selected Participant becomes an
Activity's Contributor.

## Capability (Document 08)

Capabilities are the vocabulary Provisioning uses to determine eligibility.

## Activity (Document 06)

Provisioning's output is one or more assignments recorded against an Activity, per `06-activity.md`
§7.

## Mission (Document 05)

Provisioning corresponds to the Mission's PROVISIONING lifecycle state (`05-mission.md` §7).

---

# 7. Events

* `activity.assigned`

---

# 8. Invariants

A compliant implementation MUST ensure:

* An Activity is only assigned Contributors while its Mission is in a state that permits
  assignment (PROVISIONING or later, up to submission — `06-activity.md` §7).
* Assignment eligibility is determined by Capability match, not by role or job title.
* Assigning a Contributor does not itself constitute Verification or approval of any Deliverable.

---

# 9. Extension Points

Extensions MAY define domain-specific matching signals (e.g. professional licensure for
construction, security clearance for government work) that feed into a Provisioning decision
alongside Capability.

* Extensions MUST NOT redefine what it means for a Participant to be "eligible" at the protocol
  level — Capability match remains the baseline.
* Extensions MUST NOT bypass the requirement that assignment is recorded as an event.

---

# 10. Summary

Provisioning has no schema of its own — it is the process, guided by Capability matching, that
turns an accepted plan into assigned Contributors, using the Participant, Capability and Activity
assignment mechanisms already defined in Documents 06, 07 and 08.
