# Poiva

> The open protocol for turning intentions into verified outcomes.

Poiva is an open, vendor-neutral protocol for defining, planning, executing, verifying, and
settling work across humans, AI agents, organizations, and machines. It models every unit of work
as a lifecycle:

```
Mission -> Activity -> Deliverable -> Evidence -> Verification -> Settlement
```

This repository holds the parts of Poiva meant to be public and reused by anyone: the protocol
specification, the reference client libraries (SDKs), and the command-line client. It does not
contain any particular server's implementation (storage, billing, multi-tenancy, UI) — those are
implementation details a Poiva-conformant server is free to choose for itself.

## Layout

| Path | What it is |
|---|---|
| [`protocol/`](protocol) | The protocol specification: prose docs, an OpenAPI 3.1 description of a Poiva HTTP API, and JSON Schema for every resource. |
| [`cli/`](cli) | `poiva`, a dependency-free Node.js command-line client. |
| [`sdk/typescript/`](sdk/typescript) | `@poiva/sdk` — TypeScript/JavaScript client. |
| [`sdk/python/`](sdk/python) | `poiva-sdk` — Python client. |
| [`sdk/java/`](sdk/java) | `dev.poiva:poiva-sdk` — Java client. |

## Start here

- **Reading the protocol?** Start at [`protocol/docs/01-introduction.md`](protocol/docs/01-introduction.md),
  then [`04-terminology.md`](protocol/docs/04-terminology.md) for the vocabulary every other doc assumes.
- **Implementing a server?** [`protocol/openapi.yaml`](protocol/openapi.yaml) and
  [`protocol/schema/`](protocol/schema) are the wire contract every SDK and the CLI are built
  against. Two design choices there are intentional, not omissions — see the spec's description
  for why.
- **Calling an existing server?** Pick an SDK (TypeScript, Python, or Java) or use the `poiva` CLI
  directly.

## The protocol is bigger than this repo's SDKs

The protocol docs describe a broader set of concepts (Participant, Capability, Knowledge Capsule,
Objective, Constraint, Policy, Event) than the six resources currently backed by a typed SDK/API
surface (Mission, Activity, Deliverable, Evidence, Verification, Settlement). SDKs and servers are
expected to grow to cover more of the protocol over time — see
[`protocol/docs/02-design-principles.md`](protocol/docs/02-design-principles.md) for the rules any
such extension must follow (no SDK may introduce a concept absent from the protocol, only the
reverse).

## License

MIT — see [LICENSE](LICENSE).
