# @poiva/sdk

TypeScript/JavaScript client for the [Poiva protocol](../../protocol) API, matching
[`../../protocol/openapi.yaml`](../../protocol/openapi.yaml). Zero runtime dependencies — built on
the global `fetch` available in Node 18+ and all modern browsers.

## Install

```bash
npm install @poiva/sdk
```

## Usage

```ts
import { PoivaClient } from "@poiva/sdk";

// Authenticate with a session (bearer token)...
const auth = await new PoivaClient({ baseUrl: "https://api.getpoiva.com" }).login(
  "you@example.com",
  "password",
);
const client = new PoivaClient({
  baseUrl: "https://api.getpoiva.com",
  accessToken: auth.accessToken,
});

// ...or with an organization API key.
const client2 = new PoivaClient({
  baseUrl: "https://api.getpoiva.com",
  apiKey: "pk_live_<keyId>.<secret>",
});

const mission = await client.missions.create({
  title: "Migrate billing to Stripe",
  description: "Replace the legacy billing provider without downtime.",
  priority: "HIGH",
});

await client.missions.updateState(mission.id, "PLANNING");

const activity = await client.activities.create(mission.id, { title: "Design new schema" });
await client.activities.updateState(activity.id, "EXECUTING");

const deliverable = await client.deliverables.create(mission.id, {
  title: "Schema migration PR",
  artifactType: "pull-request",
  activityId: activity.id,
});
await client.evidence.create(deliverable.id, {
  type: "pull-request",
  locator: "https://github.com/acme/billing/pull/42",
});
const verification = await client.verifications.create(deliverable.id, { mode: "MANUAL" });
await client.verifications.updateOutcome(verification.id, "PASSED");
```

## What's covered

Every endpoint in `protocol/openapi.yaml`: auth (`signup`, `login`, `logout`, `me`, `organization`,
`changePassword`, `deleteAccount`), the six typed workspace resources (`missions`, `activities`,
`deliverables`, `evidence`, `verifications`, `settlements` — each exposing `list`/`create` plus a
single state/outcome transition, by design — see the OpenAPI doc), verification share links
(`share.create`/`share.current`/`share.revoke`), and the unauthenticated `publicVerify(token)`.

Errors surface as `PoivaApiError` (`status`, `body`) for any non-2xx response.

## Develop

```bash
npm install
npm run build   # compiles src/ -> dist/
npm test        # builds, then runs node's built-in test runner against dist/
```
