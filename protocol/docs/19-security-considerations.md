# Poiva Protocol Specification

**Document:** 19 - Security Considerations

**Version:** 1.0.0-draft

**Status:** Draft

---

# 1. Purpose

This document collects the security-relevant conventions used across the protocol's reference
implementation: authentication, tenant isolation, and credential handling. Per
`02-design-principles.md` Principle 16 ("Identity Is External"), the protocol does not prescribe an
identity provider — this document describes what the reference implementation actually does, as one
valid approach, not a mandated one.

---

# 2. Design Goals

An implementation SHOULD:

* require every request to resolve to exactly one calling Participant and Organization before
  touching tenant data
* support more than one credential type where practical (interactive sessions vs. machine
  integrations)
* never store credentials in recoverable plaintext

An implementation MUST NOT allow a request authenticated for one Organization to read or mutate
another Organization's protocol resources.

---

# 3. Authentication

The reference implementation accepts either of two credential types on Cloud API requests:

* **Session bearer token** — `Authorization: Bearer <token>`, issued at login and backed by a
  server-side session record.
* **API key** — `X-API-Key` or `X-Poiva-Api-Key`, in the form `pk_live_<keyId>.<secret>`, intended
  for machine-to-machine and CLI integrations. The key's secret is hashed with SHA-256 before
  storage; only the hash is compared on lookup, so a stolen database dump does not expose usable
  keys.

A single access-resolution entry point resolves either credential type into a principal carrying
the resolved Organization, user, and which credential type was used, before any tenant-scoped
service method runs.

---

# 4. Tenant Isolation

Multi-tenancy is enforced by scoping nearly every entity and query to the caller's Organization,
not by a global tenant filter applied at a framework layer. Every service method that reads or
mutates a protocol resource resolves the calling principal's Organization first, and every
repository lookup is qualified by that Organization's id. A resource id belonging to a different
Organization is treated as not found (see Document 17 §7) rather than forbidden, so as not to leak
its existence to an unauthorized caller.

---

# 5. Credential Storage

Passwords are hashed with BCrypt before storage. There is no reversible encryption of credentials;
verification is always performed by re-hashing a supplied password and comparing hashes, never by
decrypting a stored value.

---

# 6. Relationships

## API Guidelines (Document 17)

Document 17 §4 and §7 describe the request-level shape (headers, error codes) this document's
authentication and isolation rules produce.

## Participant (Document 07)

A Participant's `externalRef` points at the implementation-owned identity record (a user account
or similar) that authentication resolves to — identity itself remains external to the protocol.

## Mission Visibility (Document 05 §24)

Mission-level visibility (Public/Organization/Team/Private) and Knowledge Capsule inheritance of
that policy are a complementary, coarser-grained access control layered on top of the
Organization-level isolation described here.

---

# 7. Events

Authentication and session events are implementation-internal and are not part of the protocol's
ProtocolEvent taxonomy (Document 16), which records mutations to protocol resources, not access
control decisions.

---

# 8. Invariants

A compliant implementation MUST ensure:

* Every tenant-scoped service method resolves a calling principal before executing.
* No protocol resource is readable or mutable by a principal outside its owning Organization.
* Stored credentials (passwords, API key secrets) are never recoverable in plaintext from storage.
* An API key's `pk_live_<keyId>.<secret>` secret component is never logged or echoed back after
  issuance.

---

# 9. Extension Points

Implementations MAY layer additional identity mechanisms (OAuth2, OpenID Connect, mutual TLS,
enterprise SSO) on top of, or instead of, the bearer-token/API-key model described here, per
`02-design-principles.md` Principle 16.

* Extensions MUST NOT weaken Organization-level tenant isolation.
* Extensions MUST NOT introduce a code path that resolves a request without an attributable
  principal.

---

# 10. Summary

The protocol leaves identity provisioning to implementations, but every implementation MUST still
answer "which Organization, and which Participant, is making this request" before touching any
protocol resource. The reference implementation answers that with dual bearer/API-key
authentication, BCrypt-hashed passwords, SHA-256-hashed API key secrets, and Organization-qualified
queries on every tenant-scoped lookup.
