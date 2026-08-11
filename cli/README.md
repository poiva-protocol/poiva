# poiva

Command-line client for the [Poiva protocol](../protocol). Talks to any Poiva-conformant server
over the HTTP API described in [`../protocol/openapi.yaml`](../protocol/openapi.yaml) — session
tokens and API keys both work.

A single dependency-free Node.js script (`./poiva`), so it runs anywhere Node runs with no install
step beyond `npm install -g poiva` or `npx poiva`.

## Install

```bash
npm install -g poiva
```

or run without installing:

```bash
npx poiva --help
```

## Quick start

```bash
poiva auth signup --organization Acme --email vlad@acme.com --password s3cret123
poiva mission create --file mission.yaml
poiva mission list
poiva mission update mission-123 --state executing
poiva mission share create mission-123
poiva verify <token-from-share-link>
```

Run `poiva --help` or `poiva <resource> --help` for the full command reference.

## What's wired to a real server, and what's local

**Auth & account** (`poiva auth ...`) is fully server-backed: `signup` and `login --email/--password`
call `/api/cloud/signup` and `/api/cloud/login` to obtain a session token, `logout` invalidates the
token server-side, `whoami` reads `/api/cloud/me`, `password` calls `/api/cloud/me/password`, and
`delete-account` calls `DELETE /api/cloud/me` (destructive — requires `--yes` or typed confirmation).
`auth login --token ...` still works for pre-issued session tokens or organization API keys
(`pk_live_...`); account-management verbs (`password`, `delete-account`) require a session token,
not an API key.

**`poiva org current`/`describe`** read the real organization via `/api/cloud/organization` when a
session is active. `org list`/`org switch` stay local-workspace-only — the server model has no
multi-org membership to switch between.

The CLI's remote resource support covers the six protocol resources with a typed server model:
**mission, activity, deliverable, evidence, verification, settlement** — see
`REMOTE_RESOURCE_DEFS` in `./poiva`. `create`/`list` and each resource's single-item `get` call the
server directly; addressing a child resource (`activity`, `deliverable`, `settlement` under a
mission; `evidence`, `verification` under a deliverable) takes the parent id as a **positional**
argument, e.g. `poiva activity list mission-123`, not a flag.

Mission/Activity/Deliverable/Settlement also support `delete` (soft-delete: hidden from `list`, not
erased) and `poiva mission events <id>` / `poiva activity events <id>` (the protocol event log).
Evidence and Verification stay immutable once created per spec — no update or delete for either.

Beyond the generic `update --state ...` transition, some resources expose explicit lifecycle
actions that the server validates through the same transition graph: `mission cancel`,
`activity assign|submit|approve`, `verification evaluate --outcome ...`, `settlement confirm`.
`activity assign <id> [--participantId <uuid>]` defaults to self-assignment when the flag is
omitted — there's currently no endpoint to look up another participant's id.

**`poiva mission share create|get|revoke <missionId>`** manages a mission's public verification
link via `/api/cloud/workspace/missions/{id}/share` (requires a session). **`poiva verify <token>`**
fetches the verification timeline behind that link from `/api/public/verify/{token}` — unauthenticated,
works with no session at all (defaults to `https://getpoiva.com`, or pass `--url`).

**`participant` is still local-workspace-only** — the server has no participant create/list/get
endpoint. Participant, Capability, Knowledge Capsule, Estimate, and Planning Proposal have no
written protocol spec chapter yet, so the backend deliberately leaves them unmodeled for now
(each org member gets a participant record auto-provisioned on their first authenticated request
instead). `capability`, `knowledge`, `objective`, `constraint`, `policy`, and `event` are in the
same boat and operate on a local JSON workspace under `.poiva/` in the current directory — useful
for drafting before a server-side model exists, but not synced to any server.

## Sessions

The CLI supports multiple named sessions (different servers/orgs) via `poiva session`, with the
active one tracked in `~/.poiva/current-session.json`. `poiva auth login` is a shortcut for
creating and activating a session in one step.

## Configuration files

- `~/.poiva/sessions.json`, `~/.poiva/current-session.json` — global, machine-wide session store.
- `.poiva/` in the current directory — local workspace state for resources without a server model
  yet (see above). Not meant to be committed.
