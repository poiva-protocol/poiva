"""
Types mirroring protocol/schema/*.schema.json and protocol/openapi.yaml. Keep these two files
and the schemas in sync by hand -- there is no codegen step yet.
"""

from __future__ import annotations

import dataclasses
from dataclasses import dataclass, field
from typing import Any, List, Optional, Type, TypeVar

T = TypeVar("T")

# Lifecycle states are intentionally plain strings, not Enums: a server may add a new state
# before this SDK is updated, and rejecting an unrecognized-but-valid value would be worse than
# passing it through as-is. protocol/schema/common.schema.json is the source of truth for the
# currently defined values.
MissionState = str
ActivityState = str
DeliverableState = str
VerificationMode = str
VerificationOutcome = str
SettlementState = str
SettlementType = str
Priority = str


def _from_dict(cls: Type[T], data: dict) -> T:
    """Build a dataclass from a dict, ignoring any fields the server added that this SDK
    version doesn't know about yet."""
    known = {f.name for f in dataclasses.fields(cls)}  # type: ignore[arg-type]
    return cls(**{k: v for k, v in data.items() if k in known})  # type: ignore[call-arg]


@dataclass
class Mission:
    id: str
    title: str
    description: str
    state: MissionState
    createdAt: str
    updatedAt: str
    priority: Optional[Priority] = None
    sponsorId: Optional[str] = None
    sponsorName: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Mission":
        return _from_dict(cls, data)


@dataclass
class Activity:
    id: str
    missionId: str
    title: str
    state: ActivityState
    createdAt: str

    @classmethod
    def from_dict(cls, data: dict) -> "Activity":
        return _from_dict(cls, data)


@dataclass
class Deliverable:
    id: str
    missionId: str
    title: str
    artifactType: str
    state: DeliverableState
    createdAt: str
    activityId: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Deliverable":
        return _from_dict(cls, data)


@dataclass
class Evidence:
    id: str
    deliverableId: str
    type: str
    locator: str
    createdAt: str

    @classmethod
    def from_dict(cls, data: dict) -> "Evidence":
        return _from_dict(cls, data)


@dataclass
class Verification:
    id: str
    deliverableId: str
    mode: VerificationMode
    outcome: VerificationOutcome
    createdAt: str
    policyCode: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Verification":
        return _from_dict(cls, data)


@dataclass
class Settlement:
    id: str
    missionId: str
    type: SettlementType
    state: SettlementState
    createdAt: str
    amount: Optional[float] = None
    currency: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "Settlement":
        return _from_dict(cls, data)


@dataclass
class MemberResponse:
    id: str
    email: str
    displayName: str
    role: str

    @classmethod
    def from_dict(cls, data: dict) -> "MemberResponse":
        return _from_dict(cls, data)


@dataclass
class OrganizationResponse:
    id: str
    name: str
    slug: str
    status: str
    createdAt: str
    memberCount: int
    members: List[MemberResponse] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> "OrganizationResponse":
        members = [MemberResponse.from_dict(m) for m in data.get("members", [])]
        return _from_dict(cls, {**data, "members": members})


@dataclass
class AuthResponse:
    organization: OrganizationResponse
    user: MemberResponse
    tokenType: str
    accessToken: str
    expiresAt: str

    @classmethod
    def from_dict(cls, data: dict) -> "AuthResponse":
        return cls(
            organization=OrganizationResponse.from_dict(data["organization"]),
            user=MemberResponse.from_dict(data["user"]),
            tokenType=data["tokenType"],
            accessToken=data["accessToken"],
            expiresAt=data["expiresAt"],
        )


@dataclass
class CurrentAccountResponse:
    organization: OrganizationResponse
    user: MemberResponse
    expiresAt: str

    @classmethod
    def from_dict(cls, data: dict) -> "CurrentAccountResponse":
        return cls(
            organization=OrganizationResponse.from_dict(data["organization"]),
            user=MemberResponse.from_dict(data["user"]),
            expiresAt=data["expiresAt"],
        )


@dataclass
class ShareResponse:
    token: str
    url: str
    resourceType: str
    resourceId: str
    createdAt: str
    revoked: bool

    @classmethod
    def from_dict(cls, data: dict) -> "ShareResponse":
        return _from_dict(cls, data)


@dataclass
class VerificationStep:
    resourceType: str
    resourceId: str
    action: str
    title: str
    status: str
    summary: str
    occurredAt: str
    stepHash: str

    @classmethod
    def from_dict(cls, data: dict) -> "VerificationStep":
        return _from_dict(cls, data)


@dataclass
class VerificationTimeline:
    organizationName: str
    resourceType: str
    resourceId: str
    title: str
    summary: str
    status: str
    createdAt: str
    updatedAt: str
    fingerprint: str
    timeline: List[VerificationStep] = field(default_factory=list)
    verifiedAt: Optional[str] = None
    shareUrl: Optional[str] = None

    @classmethod
    def from_dict(cls, data: dict) -> "VerificationTimeline":
        steps = [VerificationStep.from_dict(s) for s in data.get("timeline", [])]
        return _from_dict(cls, {**data, "timeline": steps})


class ApiError(Exception):
    """Raised for any non-2xx response. `body` is the parsed JSON body, or raw text."""

    def __init__(self, status: int, reason: str, body: Any):
        super().__init__(f"Poiva API request failed: {status} {reason}")
        self.status = status
        self.reason = reason
        self.body = body
