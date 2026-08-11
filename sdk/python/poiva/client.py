"""HTTP client for the Poiva protocol API described in protocol/openapi.yaml.

Workspace resources (missions, activities, deliverables, evidence, verifications, settlements)
intentionally expose only list, create, and a single state/outcome transition -- there is no
get-by-id or delete. See protocol/openapi.yaml for why.
"""

from __future__ import annotations

import json
import urllib.error
import urllib.request
from typing import Any, List, Optional
from urllib.parse import quote

from .models import (
    Activity,
    ApiError,
    AuthResponse,
    CurrentAccountResponse,
    Deliverable,
    Evidence,
    Mission,
    OrganizationResponse,
    Settlement,
    ShareResponse,
    Verification,
    VerificationTimeline,
)


class _Requester:
    """Shared low-level HTTP concerns for both the top-level client and its resource namespaces."""

    def __init__(self, base_url: str, access_token: Optional[str], api_key: Optional[str], timeout: float):
        self.base_url = base_url.rstrip("/")
        self.access_token = access_token
        self.api_key = api_key
        self.timeout = timeout

    def request(
        self,
        method: str,
        path: str,
        body: Optional[dict] = None,
        anonymous: bool = False,
    ) -> Any:
        headers = {"Accept": "application/json"}
        if not anonymous:
            if self.access_token:
                headers["Authorization"] = f"Bearer {self.access_token}"
            elif self.api_key:
                headers["X-API-Key"] = self.api_key

        data = None
        if body is not None:
            data = json.dumps(body).encode("utf-8")
            headers["Content-Type"] = "application/json"

        request = urllib.request.Request(
            f"{self.base_url}{path}", data=data, headers=headers, method=method
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                raw = response.read()
                return _parse(raw)
        except urllib.error.HTTPError as error:
            raw = error.read()
            raise ApiError(error.code, error.reason, _parse(raw)) from None


def _parse(raw: bytes) -> Any:
    if not raw:
        return None
    text = raw.decode("utf-8")
    try:
        return json.loads(text)
    except ValueError:
        return text


class _Missions:
    def __init__(self, requester: _Requester):
        self._r = requester

    def list(self) -> List[Mission]:
        return [Mission.from_dict(m) for m in self._r.request("GET", "/api/cloud/workspace/missions")]

    def create(self, title: str, description: str, priority: Optional[str] = None) -> Mission:
        body = {"title": title, "description": description}
        if priority is not None:
            body["priority"] = priority
        return Mission.from_dict(self._r.request("POST", "/api/cloud/workspace/missions", body))

    def update_state(self, mission_id: str, state: str) -> Mission:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/state"
        return Mission.from_dict(self._r.request("PATCH", path, {"state": state}))


class _Activities:
    def __init__(self, requester: _Requester):
        self._r = requester

    def list(self, mission_id: str) -> List[Activity]:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/activities"
        return [Activity.from_dict(a) for a in self._r.request("GET", path)]

    def create(self, mission_id: str, title: str, description: Optional[str] = None) -> Activity:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/activities"
        body: dict = {"title": title}
        if description is not None:
            body["description"] = description
        return Activity.from_dict(self._r.request("POST", path, body))

    def update_state(self, activity_id: str, state: str) -> Activity:
        path = f"/api/cloud/workspace/activities/{quote(activity_id)}/state"
        return Activity.from_dict(self._r.request("PATCH", path, {"state": state}))


class _Deliverables:
    def __init__(self, requester: _Requester):
        self._r = requester

    def list(self, mission_id: str) -> List[Deliverable]:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/deliverables"
        return [Deliverable.from_dict(d) for d in self._r.request("GET", path)]

    def create(
        self,
        mission_id: str,
        title: str,
        artifact_type: str,
        activity_id: Optional[str] = None,
    ) -> Deliverable:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/deliverables"
        body: dict = {"title": title, "artifactType": artifact_type}
        if activity_id is not None:
            body["activityId"] = activity_id
        return Deliverable.from_dict(self._r.request("POST", path, body))

    def update_state(self, deliverable_id: str, state: str) -> Deliverable:
        path = f"/api/cloud/workspace/deliverables/{quote(deliverable_id)}/state"
        return Deliverable.from_dict(self._r.request("PATCH", path, {"state": state}))


class _Evidence:
    def __init__(self, requester: _Requester):
        self._r = requester

    def list(self, deliverable_id: str) -> List[Evidence]:
        path = f"/api/cloud/workspace/deliverables/{quote(deliverable_id)}/evidence"
        return [Evidence.from_dict(e) for e in self._r.request("GET", path)]

    def create(self, deliverable_id: str, type: str, locator: str) -> Evidence:
        path = f"/api/cloud/workspace/deliverables/{quote(deliverable_id)}/evidence"
        return Evidence.from_dict(self._r.request("POST", path, {"type": type, "locator": locator}))


class _Verifications:
    def __init__(self, requester: _Requester):
        self._r = requester

    def list(self, deliverable_id: str) -> List[Verification]:
        path = f"/api/cloud/workspace/deliverables/{quote(deliverable_id)}/verifications"
        return [Verification.from_dict(v) for v in self._r.request("GET", path)]

    def create(self, deliverable_id: str, mode: str, policy_code: Optional[str] = None) -> Verification:
        path = f"/api/cloud/workspace/deliverables/{quote(deliverable_id)}/verifications"
        body: dict = {"mode": mode}
        if policy_code is not None:
            body["policyCode"] = policy_code
        return Verification.from_dict(self._r.request("POST", path, body))

    def update_outcome(self, verification_id: str, outcome: str) -> Verification:
        path = f"/api/cloud/workspace/verifications/{quote(verification_id)}/outcome"
        return Verification.from_dict(self._r.request("PATCH", path, {"outcome": outcome}))


class _Settlements:
    def __init__(self, requester: _Requester):
        self._r = requester

    def list(self, mission_id: str) -> List[Settlement]:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/settlements"
        return [Settlement.from_dict(s) for s in self._r.request("GET", path)]

    def create(
        self,
        mission_id: str,
        type: str,
        amount: Optional[float] = None,
        currency: Optional[str] = None,
    ) -> Settlement:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/settlements"
        body: dict = {"type": type}
        if amount is not None:
            body["amount"] = amount
        if currency is not None:
            body["currency"] = currency
        return Settlement.from_dict(self._r.request("POST", path, body))

    def update_state(self, settlement_id: str, state: str) -> Settlement:
        path = f"/api/cloud/workspace/settlements/{quote(settlement_id)}/state"
        return Settlement.from_dict(self._r.request("PATCH", path, {"state": state}))


class _Share:
    def __init__(self, requester: _Requester):
        self._r = requester

    def create(self, mission_id: str) -> ShareResponse:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/share"
        return ShareResponse.from_dict(self._r.request("POST", path))

    def current(self, mission_id: str) -> ShareResponse:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/share"
        return ShareResponse.from_dict(self._r.request("GET", path))

    def revoke(self, mission_id: str) -> None:
        path = f"/api/cloud/workspace/missions/{quote(mission_id)}/share"
        self._r.request("DELETE", path)


class PoivaClient:
    """Client for a Poiva-conformant server. Authenticate with either `access_token`
    (a session bearer token from `login`/`signup`) or `api_key` (an organization API key of the
    form `pk_live_<keyId>.<secret>`)."""

    def __init__(
        self,
        base_url: str,
        access_token: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: float = 30.0,
    ):
        if not base_url:
            raise ValueError("PoivaClient requires a base_url")
        self._r = _Requester(base_url, access_token, api_key, timeout)

        self.missions = _Missions(self._r)
        self.activities = _Activities(self._r)
        self.deliverables = _Deliverables(self._r)
        self.evidence = _Evidence(self._r)
        self.verifications = _Verifications(self._r)
        self.settlements = _Settlements(self._r)
        self.share = _Share(self._r)

    def signup(
        self, organization_name: str, email: str, password: str, display_name: Optional[str] = None
    ) -> AuthResponse:
        """Create an organization and its first user. Does not authenticate this client instance --
        construct a new PoivaClient with the returned access_token to act as that user."""
        body: dict = {"organizationName": organization_name, "email": email, "password": password}
        if display_name is not None:
            body["displayName"] = display_name
        return AuthResponse.from_dict(self._r.request("POST", "/api/cloud/signup", body, anonymous=True))

    def login(self, email: str, password: str) -> AuthResponse:
        """Authenticate with email/password. Does not authenticate this client instance."""
        body = {"email": email, "password": password}
        return AuthResponse.from_dict(self._r.request("POST", "/api/cloud/login", body, anonymous=True))

    def logout(self) -> None:
        self._r.request("POST", "/api/cloud/logout")

    def me(self) -> CurrentAccountResponse:
        return CurrentAccountResponse.from_dict(self._r.request("GET", "/api/cloud/me"))

    def organization(self) -> OrganizationResponse:
        return OrganizationResponse.from_dict(self._r.request("GET", "/api/cloud/organization"))

    def change_password(self, new_password: str, current_password: Optional[str] = None) -> None:
        body = {"newPassword": new_password, "currentPassword": current_password}
        self._r.request("PATCH", "/api/cloud/me/password", body)

    def delete_account(self) -> None:
        self._r.request("DELETE", "/api/cloud/me")

    def public_verify(self, token: str) -> VerificationTimeline:
        """Fetch the verification timeline behind a public share token. Never sends credentials."""
        path = f"/api/public/verify/{quote(token)}"
        return VerificationTimeline.from_dict(self._r.request("GET", path, anonymous=True))
