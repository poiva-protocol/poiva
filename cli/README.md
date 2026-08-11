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
poiva auth login --url https://getpoiva.com
poiva mission create --file mission.yaml
poiva mission list
poiva mission update mission-123 --state executing
```

Run `poiva --help` or `poiva <resource> --help` for the full command reference.

## What's wired to a real server, and what's local

The CLI's remote support only covers the six protocol resources with a typed server model:
**mission, activity, deliverable, evidence, verification, settlement** — see
`REMOTE_RESOURCE_DEFS` in `./poiva`. For these, `list`/`create` and the resource's single
state-transition endpoint (`update --state ...`) call the server directly; there is intentionally
no generic field update and no delete, matching the protocol API itself (see
[`../protocol/openapi.yaml`](../protocol/openapi.yaml) for why).

`participant`, `capability`, `knowledge`, `objective`, `constraint`, `policy`, and `event` have no
typed server endpoint yet, so those commands operate on a local JSON workspace under `.poiva/` in
the current directory — useful for drafting before a server-side model exists, but not synced to
any server.

## Sessions

The CLI supports multiple named sessions (different servers/orgs) via `poiva session`, with the
active one tracked in `~/.poiva/current-session.json`. `poiva auth login` is a shortcut for
creating and activating a session in one step.

## Configuration files

- `~/.poiva/sessions.json`, `~/.poiva/current-session.json` — global, machine-wide session store.
- `.poiva/` in the current directory — local workspace state for resources without a server model
  yet (see above). Not meant to be committed.
