# poiva-sdk

Python client for the [Poiva protocol](../../protocol) API, matching
[`../../protocol/openapi.yaml`](../../protocol/openapi.yaml). No third-party dependencies —
built on `urllib` from the standard library.

## Install

```bash
pip install poiva-sdk
```

## Usage

```python
from poiva import PoivaClient

# Authenticate with a session (bearer token)...
auth = PoivaClient("https://getpoiva.com").login("you@example.com", "password")
client = PoivaClient("https://getpoiva.com", access_token=auth.accessToken)

# ...or with an organization API key.
client2 = PoivaClient("https://getpoiva.com", api_key="pk_live_<keyId>.<secret>")

mission = client.missions.create(
    title="Migrate billing to Stripe",
    description="Replace the legacy billing provider without downtime.",
    priority="HIGH",
)
client.missions.update_state(mission.id, "PLANNING")

activity = client.activities.create(mission.id, title="Design new schema")
client.activities.update_state(activity.id, "EXECUTING")

deliverable = client.deliverables.create(
    mission.id, title="Schema migration PR", artifact_type="pull-request", activity_id=activity.id
)
client.evidence.create(
    deliverable.id, type="pull-request", locator="https://github.com/acme/billing/pull/42"
)
verification = client.verifications.create(deliverable.id, mode="MANUAL")
client.verifications.update_outcome(verification.id, "PASSED")
```

## What's covered

Every endpoint in `protocol/openapi.yaml`: auth (`signup`, `login`, `logout`, `me`,
`organization`, `change_password`, `delete_account`), the six typed workspace resources
(`missions`, `activities`, `deliverables`, `evidence`, `verifications`, `settlements` — each
exposing `list`/`create` plus a single state/outcome transition, by design — see the OpenAPI doc),
verification share links (`share.create`/`share.current`/`share.revoke`), and the unauthenticated
`public_verify(token)`.

Errors surface as `poiva.ApiError` (`status`, `reason`, `body`) for any non-2xx response.

## Develop

```bash
python3 -m unittest discover -s tests -v
```
