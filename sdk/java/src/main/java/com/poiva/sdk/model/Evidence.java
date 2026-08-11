package com.poiva.sdk.model;

import java.time.Instant;
import java.util.UUID;

/** Proof supporting a deliverable's claimed completion (e.g. a commit, a signed document). */
public record Evidence(
        UUID id,
        UUID deliverableId,
        String type,
        String locator,
        Instant createdAt
) {
}
