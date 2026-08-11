# poiva-sdk (Java)

Java client for the [Poiva protocol](../../protocol) API, matching
[`../../protocol/openapi.yaml`](../../protocol/openapi.yaml). Standalone Maven module — it does
not depend on Spring or any particular server implementation. HTTP transport is `java.net.http`
(built into the JDK since 11); the only runtime dependency is Jackson, for JSON.

Requires Java 17+.

## Install

```xml
<dependency>
  <groupId>dev.poiva</groupId>
  <artifactId>poiva-sdk</artifactId>
  <version>0.1.0</version>
</dependency>
```

## Usage

```java
import com.poiva.sdk.PoivaClient;
import com.poiva.sdk.model.*;

// Authenticate with a session (bearer token)...
AuthResponse auth = new PoivaClient("https://api.getpoiva.com").login("you@example.com", "password");
PoivaClient client = PoivaClient.withAccessToken("https://api.getpoiva.com", auth.accessToken());

// ...or with an organization API key.
PoivaClient client2 = PoivaClient.withApiKey("https://api.getpoiva.com", "pk_live_<keyId>.<secret>");

Mission mission = client.missions.create(
        "Migrate billing to Stripe", "Replace the legacy billing provider without downtime.", "HIGH");
client.missions.updateState(mission.id(), "PLANNING");

Activity activity = client.activities.create(mission.id(), "Design new schema", null);
client.activities.updateState(activity.id(), "EXECUTING");

Deliverable deliverable = client.deliverables.create(
        mission.id(), "Schema migration PR", "pull-request", activity.id());
client.evidence.create(deliverable.id(), "pull-request", "https://github.com/acme/billing/pull/42");

Verification verification = client.verifications.create(deliverable.id(), "MANUAL", null);
client.verifications.updateOutcome(verification.id(), "PASSED");
```

Every request-making method declares `throws IOException, InterruptedException`, matching
`java.net.http.HttpClient`'s own checked exceptions — there's no wrapper exception hiding them.

## What's covered

Every endpoint in `protocol/openapi.yaml`: auth (`signup`, `login`, `logout`, `me`,
`organization`, `changePassword`, `deleteAccount`), the six typed workspace resources
(`missions`, `activities`, `deliverables`, `evidence`, `verifications`, `settlements` — each
exposing `list`/`create` plus a single state/outcome transition, by design — see the OpenAPI doc),
verification share links (`share.create`/`share.current`/`share.revoke`), and the unauthenticated
`publicVerify(token)`.

Errors surface as `PoivaApiException` (`status()`, `body()`) for any non-2xx response.

## Develop

```bash
mvn test
```
